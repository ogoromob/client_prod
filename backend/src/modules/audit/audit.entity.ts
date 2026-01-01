import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '../../database/entities';

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREATE_POOL = 'CREATE_POOL',
  UPDATE_POOL = 'UPDATE_POOL',
  DELETE_POOL = 'DELETE_POOL',
  CREATE_INVESTMENT = 'CREATE_INVESTMENT',
  APPROVE_WITHDRAWAL = 'APPROVE_WITHDRAWAL',
  REJECT_WITHDRAWAL = 'REJECT_WITHDRAWAL',
  UPDATE_USER = 'UPDATE_USER',
  BLOCK_USER = 'BLOCK_USER',
  UNBLOCK_USER = 'UNBLOCK_USER',
  CHANGE_SETTINGS = 'CHANGE_SETTINGS',
}

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'simple-enum', enum: AuditAction })
  action: AuditAction;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @Column({ nullable: true })
  targetId: string;

  @Column({ type: 'simple-json', nullable: true })
  details: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ default: 'success' })
  status: 'success' | 'failure';

  @CreateDateColumn()
  createdAt: Date;
}
