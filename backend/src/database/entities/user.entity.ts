import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { InvestmentEntity } from './investment.entity';
import { WithdrawalEntity } from './withdrawal.entity';

export enum UserRole {
  INVESTOR = 'investor',
  ADMIN = 'admin',
  MANAGER = 'manager',
  SUPER_ADMIN = 'super_admin',
}

export enum KycStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({
    type: 'simple-enum',
    enum: UserRole,
    default: UserRole.INVESTOR,
  })
  role: UserRole;

  @Column({ default: false })
  mfaEnabled: boolean;

  @Column({ nullable: true })
  mfaSecret: string;

  @Column({
    type: 'simple-enum',
    enum: KycStatus,
    default: KycStatus.PENDING,
    nullable: true,
  })
  kycStatus: KycStatus;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  lastLogin: Date;

  @Column({ default: false })
  isBlocked: boolean;

  @Column({ nullable: true })
  subscriptionExpiresAt: Date;

  @Column({ default: false })
  hasActiveSubscription: boolean;

  @Column({ default: true })
  autoReinvest: boolean; // Réinvestissement automatique par défaut

  @Column({ nullable: true })
  depositReference: string; // Référence unique pour les dépôts crypto

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalInvestedAmount: number; // Tracking total investi (pour limites admin)

  @Column({ default: false })
  mfaRequired: boolean; // MFA forcé pour Super Admin

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => InvestmentEntity, investment => investment.user)
  investments: InvestmentEntity[];

  @OneToMany(() => WithdrawalEntity, withdrawal => withdrawal.user)
  withdrawals: WithdrawalEntity[];

  // Getter pour vérifier si l'abonnement est actif
  get isSubscriptionActive(): boolean {
    if (!this.subscriptionExpiresAt) return false;
    return new Date(this.subscriptionExpiresAt) > new Date();
  }
}
