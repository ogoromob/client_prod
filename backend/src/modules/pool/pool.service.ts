import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PoolEntity, PoolStatus, InvestmentEntity } from '../../database/entities';
import { CreatePoolDto, UpdatePoolDto } from './dto/pool.dto';

@Injectable()
export class PoolService {
  constructor(
    @InjectRepository(PoolEntity)
    private poolRepository: Repository<PoolEntity>,
    @InjectRepository(InvestmentEntity)
    private investmentRepository: Repository<InvestmentEntity>,
  ) {}

  async findAll(filters?: any): Promise<PoolEntity[]> {
    const query = this.poolRepository.createQueryBuilder('pool');

    // Filter by status
    if (filters?.status && filters.status.length > 0) {
      query.andWhere('pool.status IN (:...statuses)', { statuses: filters.status });
    }

    // Filter by risk level
    if (filters?.riskLevel && filters.riskLevel.length > 0) {
      query.andWhere('pool.riskLevel IN (:...riskLevels)', { riskLevels: filters.riskLevel });
    }

    // Search by name
    if (filters?.search) {
      query.andWhere('pool.name LIKE :search', { search: `%${filters.search}%` });
    }

    query.orderBy('pool.createdAt', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<PoolEntity> {
    const pool = await this.poolRepository.findOne({
      where: { id },
      relations: ['manager'],
    });

    if (!pool) {
      throw new NotFoundException('Pool non trouvé');
    }

    return pool;
  }

  async create(createPoolDto: CreatePoolDto, managerId: string): Promise<PoolEntity> {
    const pool = this.poolRepository.create({
      ...createPoolDto,
      managerId,
      status: PoolStatus.DRAFT,
      currentAmount: 0,
      totalInvested: 0,
      totalPnL: 0,
      metadata: {
        exchanges: createPoolDto.exchanges,
        pairs: createPoolDto.pairs,
        maxLeverage: createPoolDto.maxLeverage,
        stopLoss: createPoolDto.stopLoss,
        takeProfit: createPoolDto.takeProfit,
      },
    });

    return await this.poolRepository.save(pool);
  }

  async update(id: string, updatePoolDto: UpdatePoolDto, userId: string, userRole: string): Promise<PoolEntity> {
    const pool = await this.findOne(id);

    // Check permissions
    if (userRole !== 'admin' && pool.managerId !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier ce pool');
    }

    // Can't update if pool is active or beyond
    if (pool.status !== PoolStatus.DRAFT && pool.status !== PoolStatus.PENDING) {
      throw new BadRequestException('Impossible de modifier un pool actif');
    }

    Object.assign(pool, updatePoolDto);

    return await this.poolRepository.save(pool);
  }

  async delete(id: string, userId: string, userRole: string): Promise<void> {
    const pool = await this.findOne(id);

    if (userRole !== 'admin' && pool.managerId !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer ce pool');
    }

    if (pool.status !== PoolStatus.DRAFT) {
      throw new BadRequestException('Seuls les pools en brouillon peuvent être supprimés');
    }

    await this.poolRepository.remove(pool);
  }

  async publish(id: string, userId: string, userRole: string): Promise<PoolEntity> {
    const pool = await this.findOne(id);

    if (userRole !== 'admin' && pool.managerId !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à publier ce pool');
    }

    if (pool.status !== PoolStatus.DRAFT) {
      throw new BadRequestException('Seuls les pools en brouillon peuvent être publiés');
    }

    pool.status = PoolStatus.PENDING;
    return await this.poolRepository.save(pool);
  }

  async pause(id: string): Promise<PoolEntity> {
    const pool = await this.findOne(id);

    if (pool.status !== PoolStatus.ACTIVE) {
      throw new BadRequestException('Seuls les pools actifs peuvent être mis en pause');
    }

    // In real implementation, would pause trading via trading adapter
    return pool;
  }

  async resume(id: string): Promise<PoolEntity> {
    const pool = await this.findOne(id);

    if (pool.status !== PoolStatus.ACTIVE) {
      throw new BadRequestException('Le pool n\'est pas en pause');
    }

    // In real implementation, would resume trading via trading adapter
    return pool;
  }

  async getPerformance(id: string) {
    const pool = await this.findOne(id);

    // Mock performance data
    return {
      poolId: id,
      timestamp: new Date().toISOString(),
      totalValue: Number(pool.currentAmount),
      pnl: Number(pool.totalPnL),
      pnlPercentage: pool.totalInvested > 0 
        ? (Number(pool.totalPnL) / Number(pool.totalInvested)) * 100 
        : 0,
      openPositions: 0,
      totalTrades: 0,
      winRate: 0,
      drawdown: 0,
      sharpeRatio: 0,
      volatility: 0,
    };
  }

  async getPositions(id: string) {
    await this.findOne(id);

    // Mock positions - in real implementation, fetch from trading adapter
    return [];
  }

  async getInvestors(id: string) {
    const pool = await this.findOne(id);

    const investments = await this.investmentRepository.find({
      where: { poolId: id },
      relations: ['user'],
    });

    return investments;
  }

  async getPerformanceHistory(id: string) {
    await this.findOne(id);

    // Mock performance history
    const history: Array<{timestamp: string, value: number, pnl: number, pnlPercentage: number}> = [];
    const now = new Date();

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      history.push({
        timestamp: date.toISOString(),
        value: 10000 + Math.random() * 2000,
        pnl: Math.random() * 1000 - 500,
        pnlPercentage: (Math.random() * 20) - 10,
      });
    }

    return history;
  }
}
