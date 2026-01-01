import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, PoolEntity, InvestmentEntity, UserRole, KycStatus, PoolStatus } from '../../database/entities';

@Injectable()
export class InvestmentValidationService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(PoolEntity)
    private poolRepository: Repository<PoolEntity>,
    @InjectRepository(InvestmentEntity)
    private investmentRepository: Repository<InvestmentEntity>,
  ) {}

  async validateInvestment(
    userId: string,
    poolId: string,
    amount: number,
  ): Promise<{ valid: boolean; reason?: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const pool = await this.poolRepository.findOne({ where: { id: poolId } });

    if (!user || !pool) {
      return { valid: false, reason: 'Utilisateur ou pool non trouvé' };
    }

    if (amount > 1000 && user.kycStatus !== KycStatus.APPROVED) {
      return {
        valid: false,
        reason: 'KYC requis pour les investissements supérieurs à 1000 USDT',
      };
    }

    if (!user.hasActiveSubscription) {
      return {
        valid: false,
        reason: 'Abonnement requis (2 USDT/mois)',
      };
    }

    if (user.isBlocked) {
      return {
        valid: false,
        reason: 'Compte utilisateur bloqué',
      };
    }

    const limitCheck = await this.checkRoleLimits(user, pool, amount);
    if (!limitCheck.valid) {
      return limitCheck;
    }

    const poolCheck = await this.checkPoolLimits(pool, amount);
    if (!poolCheck.valid) {
      return poolCheck;
    }

    if (amount < pool.minInvestment) {
      return {
        valid: false,
        reason: `Investissement minimum: ${pool.minInvestment} USDT`,
      };
    }

    return { valid: true };
  }

  private async checkRoleLimits(
    user: UserEntity,
    pool: PoolEntity,
    amount: number,
  ): Promise<{ valid: boolean; reason?: string }> {
    const currentInvestment = await this.investmentRepository
      .createQueryBuilder('investment')
      .where('investment.userId = :userId', { userId: user.id })
      .andWhere('investment.poolId = :poolId', { poolId: pool.id })
      .andWhere('investment.status IN (:...statuses)', {
        statuses: ['CONFIRMED', 'ACTIVE', 'LOCKED'],
      })
      .select('SUM(investment.initialAmount)', 'total')
      .getRawOne();

    const currentAmount = parseFloat(currentInvestment?.total || '0');
    const newTotal = currentAmount + amount;

    switch (user.role) {
      case UserRole.INVESTOR:
        if (newTotal > pool.maxInvestmentPerUser) {
          return {
            valid: false,
            reason: `Limite dépassée. Max: ${pool.maxInvestmentPerUser} USDT par pool`,
          };
        }
        break;

      case UserRole.ADMIN:
      case UserRole.MANAGER:
        if (newTotal > pool.maxInvestmentPerAdmin) {
          return {
            valid: false,
            reason: `Limite admin dépassée. Max: ${pool.maxInvestmentPerAdmin} USDT par pool`,
          };
        }
        break;

      case UserRole.SUPER_ADMIN:
        if (user.mfaRequired && !user.mfaEnabled) {
          return {
            valid: false,
            reason: 'MFA requis pour les Super Admins',
          };
        }
        break;
    }

    return { valid: true };
  }

  private async checkPoolLimits(
    pool: PoolEntity,
    amount: number,
  ): Promise<{ valid: boolean; reason?: string }> {
    if (pool.status !== PoolStatus.PENDING && pool.status !== PoolStatus.ACTIVE) {
      return {
        valid: false,
        reason: 'Pool fermé aux nouveaux investissements',
      };
    }

    const newTotal = pool.currentAmount + amount;
    if (newTotal > pool.poolHardCap) {
      return {
        valid: false,
        reason: `Capacité du pool dépassée. Max: ${pool.poolHardCap} USDT`,
      };
    }

    return { valid: true };
  }

  async getUserInvestmentStats(userId: string): Promise<{
    totalInvested: number;
    activeInvestments: number;
    completedInvestments: number;
    totalPnL: number;
  }> {
    const stats = await this.investmentRepository
      .createQueryBuilder('investment')
      .where('investment.userId = :userId', { userId })
      .select([
        'SUM(CASE WHEN investment.status IN (\'CONFIRMED\', \'ACTIVE\', \'LOCKED\') THEN investment.initialAmount ELSE 0 END) as totalInvested',
        'COUNT(CASE WHEN investment.status IN (\'CONFIRMED\', \'ACTIVE\', \'LOCKED\') THEN 1 END) as activeInvestments',
        'COUNT(CASE WHEN investment.status IN (\'COMPLETED\', \'WITHDRAWN\') THEN 1 END) as completedInvestments',
        'SUM(investment.pnl) as totalPnL',
      ])
      .getRawOne();

    return {
      totalInvested: parseFloat(stats?.totalInvested || '0'),
      activeInvestments: parseInt(stats?.activeInvestments || '0'),
      completedInvestments: parseInt(stats?.completedInvestments || '0'),
      totalPnL: parseFloat(stats?.totalPnL || '0'),
    };
  }

  async validateSensitiveAction(
    userId: string,
    action: string,
  ): Promise<{ valid: boolean; reason?: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return { valid: false, reason: 'Utilisateur non trouvé' };
    }

    const superAdminActions = [
      'modify_pool_limits',
      'modify_fees',
      'emergency_stop',
      'modify_duration',
      'force_settlement',
    ];

    if (superAdminActions.includes(action)) {
      if (user.role !== UserRole.SUPER_ADMIN) {
        return {
          valid: false,
          reason: 'Action réservée aux Super Admins',
        };
      }

      if (user.mfaRequired && !user.mfaEnabled) {
        return {
          valid: false,
          reason: 'MFA requis pour cette action',
        };
      }
    }

    return { valid: true };
  }
}
