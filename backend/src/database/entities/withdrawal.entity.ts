import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { InvestmentEntity } from './investment.entity';

export enum WithdrawalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

@Entity('withdrawals')
export class WithdrawalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  investmentId: string;

  @ManyToOne(() => InvestmentEntity, investment => investment.withdrawals)
  @JoinColumn({ name: 'investmentId' })
  investment: InvestmentEntity;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, user => user.withdrawals)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  // Montants
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  managerFee: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  netAmount: number;

  // Statut
  @Column({
    type: 'simple-enum',
    enum: WithdrawalStatus,
    default: WithdrawalStatus.PENDING,
  })
  status: WithdrawalStatus;

  // Dates
  @CreateDateColumn()
  requestedAt: Date;

  @Column({ nullable: true })
  processedAt: Date;

  // Withdrawal info
  @Column({ nullable: true })
  withdrawalMethod: string;

  @Column({ nullable: true })
  destinationAddress: string;

  @Column({ nullable: true })
  transactionHash: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;
}
