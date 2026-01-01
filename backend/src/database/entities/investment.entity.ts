import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';
import { PoolEntity } from './pool.entity';
import { WithdrawalEntity } from './withdrawal.entity';

export enum InvestmentStatus {
  PENDING_VERIFICATION = 'pending_verification',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  LOCKED = 'locked',
  COMPLETED = 'completed',
  WITHDRAWABLE = 'withdrawable',
  WITHDRAWAL_PENDING = 'withdrawal_pending',
  WITHDRAWN = 'withdrawn',
  REINVESTED = 'reinvested',
}

@Entity('investments')
export class InvestmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  poolId: string;

  @ManyToOne(() => PoolEntity, pool => pool.investments)
  @JoinColumn({ name: 'poolId' })
  pool: PoolEntity;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, user => user.investments)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  // Montants
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  initialAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  currentValue: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  pnl: number;

  @Column({ type: 'decimal', precision: 8, scale: 4, default: 0 })
  pnlPercentage: number;

  // Statut
  @Column({
    type: 'simple-enum',
    enum: InvestmentStatus,
    default: InvestmentStatus.PENDING_VERIFICATION,
  })
  status: InvestmentStatus;

  // Preuve de Dépôt (Zéro Trust - Blockchain)
  @Column({ unique: true, nullable: true })
  depositTxHash: string; // Le TxID fourni par l'utilisateur

  @Column({ nullable: true })
  depositWalletAddress: string; // Adresse de destination (notre wallet)

  @Column({ default: 0 })
  confirmations: number; // Confirmations blockchain

  @Column({ nullable: true })
  depositReference: string; // Référence unique pour tracer le dépôt

  // Dates
  @Column()
  investedAt: Date;

  @Column({ nullable: true })
  confirmedAt: Date;

  @Column({ nullable: true })
  rejectedAt: Date;

  @Column({ nullable: true })
  lockedUntil: Date;

  @Column({ nullable: true })
  withdrawnAt: Date;

  @Column({ nullable: true })
  rejectionReason: string | null;

  // Payment info
  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  transactionHash: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => WithdrawalEntity, withdrawal => withdrawal.investment)
  withdrawals: WithdrawalEntity[];
}
