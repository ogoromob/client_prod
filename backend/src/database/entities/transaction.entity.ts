import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { UserEntity } from './user.entity';
import { PoolEntity } from './pool.entity';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  SUBSCRIPTION_FEE = 'subscription_fee',
  MANAGER_FEE = 'manager_fee',
}

export enum TransactionStatus {
  PENDING_VERIFICATION = 'pending_verification',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('transactions')
@Index(['userId', 'status'])
@Index(['txHash'], { unique: true })
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ nullable: true })
  poolId: string;

  @ManyToOne(() => PoolEntity, { nullable: true })
  @JoinColumn({ name: 'poolId' })
  pool: PoolEntity;

  @Column({
    type: 'simple-enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'simple-enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING_VERIFICATION,
  })
  status: TransactionStatus;

  // Montant
  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: number;

  @Column()
  currency: string; // USDT, BTC, ETH, etc.

  // Blockchain Info
  @Column({ unique: true })
  @Index()
  txHash: string; // Hash de transaction unique

  @Column({ nullable: true })
  fromAddress: string; // Adresse source

  @Column({ nullable: true })
  toAddress: string; // Adresse destination (notre wallet)

  @Column({ default: 0 })
  confirmations: number; // Nombre de confirmations blockchain

  // Référence utilisateur
  @Column({ nullable: true })
  depositReference: string; // Référence fournie par l'utilisateur

  // Metadata
  @Column({ type: 'simple-json', nullable: true })
  metadata: {
    blockNumber?: number;
    gasUsed?: string;
    gasPrice?: string;
    network?: string; // mainnet, testnet, etc.
    chain?: string; // ethereum, tron, bsc, etc.
    errorMessage?: string; // Si rejeté
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
