import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity, AuditAction } from './audit.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private auditRepository: Repository<AuditLogEntity>,
  ) {}

  async log(
    action: AuditAction,
    userId: string,
    targetId?: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const auditLog = this.auditRepository.create({
      action,
      userId,
      targetId,
      details,
      ipAddress,
      userAgent,
      status: 'success',
    });

    return this.auditRepository.save(auditLog);
  }

  async getLogs(
    page: number = 1,
    limit: number = 20,
    action?: AuditAction,
    userId?: string,
  ) {
    const query = this.auditRepository.createQueryBuilder('log');

    if (action) {
      query.where('log.action = :action', { action });
    }

    if (userId) {
      query.andWhere('log.userId = :userId', { userId });
    }

    const [logs, total] = await query
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      logs,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getLogsByUser(userId: string, page: number = 1, limit: number = 20) {
    return this.getLogs(page, limit, undefined, userId);
  }

  async getLogsByAction(action: AuditAction, page: number = 1, limit: number = 20) {
    return this.getLogs(page, limit, action);
  }

  async getRecentLogs(limit: number = 10) {
    return this.auditRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getStatistics() {
    const totalLogs = await this.auditRepository.count();
    
    const actionCounts = await this.auditRepository
      .createQueryBuilder('log')
      .select('log.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.action')
      .getRawMany();

    const userCounts = await this.auditRepository
      .createQueryBuilder('log')
      .select('log.userId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.userId')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalLogs,
      actionCounts,
      topUsers: userCounts,
    };
  }
}
