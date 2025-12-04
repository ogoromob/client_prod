import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { InvestmentEntity } from './investment.entity';

export enum PoolStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  SETTLEMENT = 'settlement',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived',
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
