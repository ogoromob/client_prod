import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import {
  UserEntity,
  PoolEntity,
  InvestmentEntity,
  InvestmentStatus,
  PoolStatus,
  ModelType,
  UserRole,
} from '../../database/entities';
import { EventsGateway } from '../events/events.gateway';

interface ReinvestmentOption {
  poolId: string;
  poolName: string;
  modelType: ModelType;
  riskLevel: string;
  expectedReturn: number;
  availableCapacity: number;
}

@Injectable()
export class AutoReinvestmentService {
  private readonly logger = new Logger(AutoReinvestmentService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(PoolEntity)
    private poolRepository: Repository<PoolEntity>,
    @InjectRepository(InvestmentEntity)
    private investmentRepository: Repository<InvestmentEntity>,
    private eventsGateway: EventsGateway,
  ) {}

  @Cron('0 2 * * *')
  async processAutoReinvestments(): Promise<void> {
    this.logger.log('Processing auto-reinvestments...');

    const completedInvestments = await this.investmentRepository.find({
      where: { status: InvestmentStatus.COMPLETED },
      relations: ['user', 'pool'],
    });

    for (const investment of completedInvestments) {
      try {
        if (investment.user.autoReinvest) {
          await this.processUserReinvestment(investment);
        } else {
          investment.status = InvestmentStatus.WITHDRAWABLE;
          await this.investmentRepository.save(investment);
          
          this.eventsGateway.notifyUser(investment.userId, {
            type: 'FUNDS_READY_FOR_WITHDRAWAL',
            message: `Funds from pool ${investment.pool.name} ready for withdrawal`,
            amount: investment.currentValue,
          });
        }
      } catch (error) {
        this.logger.error(
          `Error processing reinvestment for ${investment.id}:`,
          error,
        );
      }
    }
  }

  private async processUserReinvestment(investment: InvestmentEntity): Promise<void> {
    const user = investment.user;
    const originalPool = investment.pool;
    const availableAmount = investment.currentValue;

    this.logger.log(
      `Processing reinvestment for ${user.email}: ${availableAmount} USDT`,
    );

    const options = await this.findReinvestmentOptions(user, originalPool, availableAmount);

    if (options.length === 0) {
      investment.status = InvestmentStatus.WITHDRAWABLE;
      await this.investmentRepository.save(investment);
      
      this.eventsGateway.notifyUser(user.id, {
        type: 'NO_REINVESTMENT_OPTIONS',
        message: 'No reinvestment options available',
        amount: availableAmount,
      });
      return;
    }

    const selectedOption = this.selectBestReinvestmentOption(options, originalPool);
    await this.createReinvestment(investment, selectedOption, availableAmount);
  }

  private async findReinvestmentOptions(
    user: UserEntity,
    originalPool: PoolEntity,
    amount: number,
  ): Promise<ReinvestmentOption[]> {
    const availablePools = await this.poolRepository.find({
      where: { status: PoolStatus.PENDING },
    });

    const options: ReinvestmentOption[] = [];

    for (const pool of availablePools) {
      const availableCapacity = pool.poolHardCap - pool.currentAmount;
      const userLimit = this.getUserLimitForPool(user, pool);
      const maxInvestment = Math.min(availableCapacity, userLimit, amount);

      if (maxInvestment >= pool.minInvestment) {
        options.push({
          poolId: pool.id,
          poolName: pool.name,
          modelType: pool.modelType,
          riskLevel: pool.riskLevel,
          expectedReturn: this.calculateExpectedReturn(pool),
          availableCapacity: maxInvestment,
        });
      }
    }

    return options;
  }

  private selectBestReinvestmentOption(
    options: ReinvestmentOption[],
    originalPool: PoolEntity,
  ): ReinvestmentOption {
    const sameType = options.find(opt => opt.modelType === originalPool.modelType);
    if (sameType) {
      this.logger.log(`Reinvesting in same type: ${sameType.poolName}`);
      return sameType;
    }

    const adanPool = options.find(opt => opt.modelType === ModelType.ADAN_FUSION);
    if (adanPool) {
      this.logger.log(`Reinvesting in ADAN: ${adanPool.poolName}`);
      return adanPool;
    }

    const bestOption = options.reduce((best, current) => {
      const currentScore = this.calculatePoolScore(current);
      const bestScore = this.calculatePoolScore(best);
      return currentScore > bestScore ? current : best;
    });

    this.logger.log(`Reinvesting in best pool: ${bestOption.poolName}`);
    return bestOption;
  }

  private calculatePoolScore(option: ReinvestmentOption): number {
    const riskMultiplier = {
      low: 1.0,
      medium: 0.8,
      high: 0.6,
      very_high: 0.4,
    }[option.riskLevel] || 0.5;

    return option.expectedReturn * riskMultiplier;
  }

  private async createReinvestment(
    originalInvestment: InvestmentEntity,
    option: ReinvestmentOption,
    amount: number,
  ): Promise<void> {
    const targetPool = await this.poolRepository.findOne({ where: { id: option.poolId } });
    
    if (!targetPool) {
      throw new Error(`Target pool ${option.poolId} not found`);
    }

    const newInvestment = this.investmentRepository.create({
      userId: originalInvestment.userId,
      poolId: targetPool.id,
      initialAmount: amount,
      currentValue: amount,
      status: InvestmentStatus.CONFIRMED,
      investedAt: new Date(),
    });

    await this.investmentRepository.save(newInvestment);

    originalInvestment.status = InvestmentStatus.REINVESTED;
    await this.investmentRepository.save(originalInvestment);

    targetPool.currentAmount += amount;
    targetPool.totalInvested += amount;
    await this.poolRepository.save(targetPool);

    this.logger.log(
      `Reinvestment created: ${amount} USDT from ${originalInvestment.pool.name} to ${targetPool.name}`,
    );

    this.eventsGateway.notifyUser(originalInvestment.userId, {
      type: 'AUTO_REINVESTMENT_COMPLETED',
      message: `Auto-reinvestment: ${amount} USDT in ${targetPool.name}`,
      originalPool: originalInvestment.pool.name,
      newPool: targetPool.name,
      amount,
    });
  }

  private calculateExpectedReturn(pool: PoolEntity): number {
    const baseReturns = {
      [ModelType.WORKER_ALPHA]: 0.15,
      [ModelType.WORKER_BETA]: 0.12,
      [ModelType.WORKER_GAMMA]: 0.10,
      [ModelType.WORKER_DELTA]: 0.08,
      [ModelType.ADAN_FUSION]: 0.11,
    };

    return baseReturns[pool.modelType] || 0.10;
  }

  private getUserLimitForPool(user: UserEntity, pool: PoolEntity): number {
    switch (user.role) {
      case UserRole.ADMIN:
      case UserRole.MANAGER:
        return pool.maxInvestmentPerAdmin;
      case UserRole.SUPER_ADMIN:
        return pool.poolHardCap;
      default:
        return pool.maxInvestmentPerUser;
    }
  }

  async updateReinvestmentPreference(
    userId: string,
    autoReinvest: boolean,
  ): Promise<void> {
    await this.userRepository.update(userId, { autoReinvest });
    this.logger.log(
      `Reinvestment preference updated for ${userId}: ${autoReinvest}`,
    );
  }

  async getReinvestmentStats(): Promise<{
    totalReinvestments: number;
    totalAmount: number;
    byModelType: Record<string, { count: number; amount: number }>;
  }> {
    const reinvestments = await this.investmentRepository.find({
      where: { status: InvestmentStatus.REINVESTED },
      relations: ['pool'],
    });

    const stats = {
      totalReinvestments: reinvestments.length,
      totalAmount: reinvestments.reduce((sum, inv) => sum + inv.currentValue, 0),
      byModelType: {} as Record<string, { count: number; amount: number }>,
    };

    for (const investment of reinvestments) {
      const modelType = investment.pool.modelType;
      if (!stats.byModelType[modelType]) {
        stats.byModelType[modelType] = { count: 0, amount: 0 };
      }
      stats.byModelType[modelType].count++;
      stats.byModelType[modelType].amount += investment.currentValue;
    }

    return stats;
  }
}
