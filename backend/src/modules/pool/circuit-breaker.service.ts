import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PoolEntity, PoolStatus } from '../../database/entities';
import { EventsGateway } from '../events/events.gateway';

interface PoolHealthMetrics {
  poolId: string;
  currentPnL: number;
  dailyPnL: number;
  drawdownPercentage: number;
  isHealthy: boolean;
  alerts: string[];
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);

  constructor(
    @InjectRepository(PoolEntity)
    private poolRepository: Repository<PoolEntity>,
    private eventsGateway: EventsGateway,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkAllPoolsHealth(): Promise<void> {
    this.logger.log('Checking pool health...');

    const activePools = await this.poolRepository.find({
      where: { status: PoolStatus.ACTIVE },
    });

    for (const pool of activePools) {
      try {
        const health = await this.checkPoolHealth(pool.id);
        
        if (!health.isHealthy) {
          await this.triggerCircuitBreaker(pool, health);
        }

        this.eventsGateway.broadcastPoolHealth(health);
      } catch (error) {
        this.logger.error(`Error checking pool ${pool.id}:`, error);
      }
    }
  }

  async checkPoolHealth(poolId: string): Promise<PoolHealthMetrics> {
    const pool = await this.poolRepository.findOne({ where: { id: poolId } });
    
    if (!pool) {
      throw new Error(`Pool ${poolId} not found`);
    }

    const currentPnL = pool.totalPnL;
    const dailyPnL = this.calculateDailyPnL(pool);
    const drawdownPercentage = this.calculateDrawdown(pool);

    const alerts: string[] = [];
    let isHealthy = true;

    if (drawdownPercentage > pool.maxDailyDrawdown) {
      alerts.push(`Drawdown critical: ${drawdownPercentage.toFixed(2)}% > ${pool.maxDailyDrawdown}%`);
      isHealthy = false;
    }

    if (dailyPnL < -pool.currentAmount * 0.05) {
      alerts.push(`Daily loss: ${dailyPnL.toFixed(2)} USDT`);
      isHealthy = false;
    }

    return {
      poolId,
      currentPnL,
      dailyPnL,
      drawdownPercentage,
      isHealthy,
      alerts,
    };
  }

  private async triggerCircuitBreaker(
    pool: PoolEntity,
    health: PoolHealthMetrics,
  ): Promise<void> {
    this.logger.warn(`Circuit Breaker triggered for pool ${pool.name}`);

    pool.status = PoolStatus.PAUSED;
    await this.poolRepository.save(pool);

    const alert = {
      type: 'CIRCUIT_BREAKER',
      severity: 'CRITICAL' as const,
      poolId: pool.id,
      poolName: pool.name,
      message: `Circuit breaker activated: ${health.alerts.join(', ')}`,
      drawdown: health.drawdownPercentage,
      timestamp: new Date(),
    };

    this.eventsGateway.broadcastAlert(alert);
  }

  private calculateDailyPnL(pool: PoolEntity): number {
    const baseReturn = pool.currentAmount * 0.001;
    const volatility = Math.random() * 0.02 - 0.01;
    return baseReturn + (pool.currentAmount * volatility);
  }

  private calculateDrawdown(pool: PoolEntity): number {
    const totalReturn = pool.totalPnL / pool.currentAmount;
    const maxReturn = totalReturn + 0.05;
    const drawdown = ((maxReturn - totalReturn) / (1 + maxReturn)) * 100;
    return Math.max(0, drawdown);
  }

  async resumePool(poolId: string, adminId: string): Promise<void> {
    const pool = await this.poolRepository.findOne({ where: { id: poolId } });
    
    if (!pool) {
      throw new Error('Pool not found');
    }

    if (pool.status !== PoolStatus.PAUSED) {
      throw new Error('Pool is not paused');
    }

    const health = await this.checkPoolHealth(poolId);
    
    if (!health.isHealthy) {
      throw new Error(`Pool still unhealthy: ${health.alerts.join(', ')}`);
    }

    pool.status = PoolStatus.ACTIVE;
    await this.poolRepository.save(pool);

    this.logger.log(`Pool ${pool.name} resumed by admin ${adminId}`);

    this.eventsGateway.broadcastAlert({
      type: 'POOL_RESUMED',
      severity: 'INFO' as const,
      poolId: pool.id,
      poolName: pool.name,
      message: 'Pool manually resumed',
      timestamp: new Date(),
    });
  }

  async emergencyStopAll(adminId: string): Promise<void> {
    this.logger.error(`EMERGENCY STOP triggered by ${adminId}`);

    const activePools = await this.poolRepository.find({
      where: { status: PoolStatus.ACTIVE },
    });

    for (const pool of activePools) {
      pool.status = PoolStatus.PAUSED;
      await this.poolRepository.save(pool);
    }

    this.eventsGateway.broadcastAlert({
      type: 'EMERGENCY_STOP',
      severity: 'CRITICAL' as const,
      message: `Emergency stop - ${activePools.length} pools paused`,
      timestamp: new Date(),
    });
  }
}
