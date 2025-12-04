import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, PoolEntity, InvestmentEntity, WithdrawalEntity, PoolStatus, WithdrawalStatus } from '../../database/entities';
import { PoolService } from '../pool/pool.service';
import { WithdrawalService } from '../withdrawal/withdrawal.service';
import { CreatePoolDto, UpdatePoolDto } from '../pool/dto/pool.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(PoolEntity)
    private poolRepository: Repository<PoolEntity>,
    @InjectRepository(InvestmentEntity)
    private investmentRepository: Repository<InvestmentEntity>,
    @InjectRepository(WithdrawalEntity)
    private withdrawalRepository: Repository<WithdrawalEntity>,
    private poolService: PoolService,
    private withdrawalService: WithdrawalService,
  ) {}

  async getDashboardMetrics() {
    const [pools, investments, withdrawals, users] = await Promise.all([
      this.poolRepository.find(),
      this.investmentRepository.find(),
      this.withdrawalRepository.find(),
      this.userRepository.find(),
    ]);

    const totalAUM = pools.reduce((sum, p) => sum + Number(p.currentAmount), 0);
    const totalPnL = pools.reduce((sum, p) => sum + Number(p.totalPnL), 0);
    const activePools = pools.filter(p => p.status === PoolStatus.ACTIVE).length;
    const pendingWithdrawals = withdrawals.filter(w => w.status === WithdrawalStatus.PENDING).length;
    const pendingKYC = users.filter(u => u.kycStatus === 'pending').length;

    return {
      totalAUM,
      totalPools: pools.length,
      activePools,
      totalInvestors: users.filter(u => u.role === 'investor').length,
      totalPnL,
      pendingWithdrawals,
      pendingKYC,
      recentAlerts: [],
    };
  }

  async createPool(createDto: CreatePoolDto, managerId: string) {
    return await this.poolService.create(createDto, managerId);
  }

  async updatePool(id: string, updateDto: UpdatePoolDto) {
    const pool = await this.poolRepository.findOne({ where: { id } });
    if (!pool) throw new Error('Pool not found');
    Object.assign(pool, updateDto);
    return await this.poolRepository.save(pool);
  }

  async deletePool(id: string) {
    const pool = await this.poolRepository.findOne({ where: { id } });
    if (!pool) throw new Error('Pool not found');
    await this.poolRepository.remove(pool);
  }

  async publishPool(id: string) {
    const pool = await this.poolRepository.findOne({ where: { id } });
    if (!pool) throw new Error('Pool not found');
    pool.status = PoolStatus.PENDING;
    return await this.poolRepository.save(pool);
  }

  async pausePool(id: string) {
    return await this.poolService.pause(id);
  }

  async resumePool(id: string) {
    return await this.poolService.resume(id);
  }

  async forceSettlement(id: string) {
    // Placeholder for settlement logic
    const pool = await this.poolRepository.findOne({ where: { id } });
    if (!pool) throw new Error('Pool not found');
    pool.status = PoolStatus.SETTLEMENT;
    await this.poolRepository.save(pool);
  }

  async emergencyStop(id: string) {
    const pool = await this.poolRepository.findOne({ where: { id } });
    if (!pool) throw new Error('Pool not found');
    pool.status = PoolStatus.CLOSED;
    await this.poolRepository.save(pool);
  }

  async getAllUsers(filters?: any) {
    return await this.userRepository.find();
  }

  async getUserById(id: string) {
    return await this.userRepository.findOne({ where: { id } });
  }

  async updateUserKycStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new Error('User not found');
    user.kycStatus = status as any;
    return await this.userRepository.save(user);
  }

  async blockUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new Error('User not found');
    user.isBlocked = true;
    await this.userRepository.save(user);
  }

  async unblockUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new Error('User not found');
    user.isBlocked = false;
    await this.userRepository.save(user);
  }

  async getAllWithdrawals(filters?: any) {
    return await this.withdrawalService.findAllPending();
  }

  async approveWithdrawal(id: string) {
    return await this.withdrawalService.approve(id);
  }

  async rejectWithdrawal(id: string, reason: string) {
    return await this.withdrawalService.reject(id, reason);
  }

  async getAuditLogs(filters?: any) {
    // Mock audit logs
    return [];
  }

  async getConfig() {
    return {
      minInvestment: 100,
      maxInvestment: 100000,
      defaultManagerFee: 15,
      supportedExchanges: ['Binance', 'Bybit', 'KuCoin'],
      supportedPaymentMethods: ['bank_transfer', 'crypto', 'card'],
    };
  }

  async updateConfig(config: any) {
    // Placeholder for config update
  }

  async triggerBackup() {
    // Placeholder for backup
  }
}
