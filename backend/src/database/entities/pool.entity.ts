import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { InvestmentEntity } from './investment.entity';

export enum PoolStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  SETTLEMENT = 'settlement',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived',
}

export enum ModelType {
  WORKER_ALPHA = 'worker_alpha',
  WORKER_BETA = 'worker_beta',
  WORKER_GAMMA = 'worker_gamma',
  WORKER_DELTA = 'worker_delta',
  ADAN_FUSION = 'adan_fusion',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

@Entity('pools')
export class PoolEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'simple-enum',
    enum: ModelType,
    default: ModelType.ADAN_FUSION,
  })
  modelType: ModelType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'simple-enum',
    enum: PoolStatus,
    default: PoolStatus.DRAFT,
  })
  status: PoolStatus;

  @Column()
  managerId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'managerId' })
  manager: UserEntity;

  // Montants
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  targetAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  currentAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalInvested: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalPnL: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 15.0 })
  managerFeePercentage: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 2 })
  subscriptionFee: number; // 2 USDT par défaut

  // Limites de Sécurité (Plafonds)
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 15000 })
  maxInvestmentPerUser: number; // 10k - 15k USDT

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 20000 })
  maxInvestmentPerAdmin: number; // 20k USDT max pour admins

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 500000 })
  poolHardCap: number; // Plafond global du pool

  // Durée
  @Column({ default: 30 })
  durationDays: number; // Durée en jours (configurable par Super Admin)

  // Circuit Breaker
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10 })
  maxDailyDrawdown: number; // 10% max de drawdown quotidien

  @Column({ default: false })
  isReinvestDefault: boolean; // Auto-réinvestissement par défaut

  // Dates
  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  settlementDate: Date;

  // Configuration
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 100 })
  minInvestment: number;

  @Column({ default: 100 })
  maxInvestors: number;

  @Column({ type: 'text', nullable: true })
  tradingStrategy: string;

  @Column({
    type: 'simple-enum',
    enum: RiskLevel,
    default: RiskLevel.MEDIUM,
  })
  riskLevel: RiskLevel;

  @Column({ type: 'simple-json', nullable: true })
  metadata: {
    exchanges?: string[];
    pairs?: string[];
    strategyId?: string;
    maxLeverage?: number;
    stopLoss?: number;
    takeProfit?: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => InvestmentEntity, investment => investment.pool)
  investments: InvestmentEntity[];
}
