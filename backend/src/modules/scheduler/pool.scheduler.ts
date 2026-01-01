import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { PoolEntity, PoolStatus } from '../../database/entities';

@Injectable()
export class PoolScheduler {
  private readonly logger = new Logger(PoolScheduler.name);

  constructor(
    @InjectRepository(PoolEntity)
    private poolRepository: Repository<PoolEntity>,
  ) {}

  // Vérifie toutes les minutes
  @Cron(CronExpression.EVERY_MINUTE)
  async handlePoolTransitions() {
    const now = new Date();

    // 1. Passer de PENDING (Ouvert aux dépôts) à ACTIVE (Trading commence)
    // Si la date de début est passée
    const poolsToActivate = await this.poolRepository.find({
      where: {
        status: PoolStatus.PENDING,
        startDate: LessThan(now),
      },
    });

    for (const pool of poolsToActivate) {
      pool.status = PoolStatus.ACTIVE;
      await this.poolRepository.save(pool);
      this.logger.log(
        `Pool ${pool.name} automatiquement activé (Start Date atteinte)`
      );
    }

    // 2. Passer de ACTIVE à CLOSED (Fin de session)
    const poolsToClose = await this.poolRepository.find({
      where: {
        status: PoolStatus.ACTIVE,
        endDate: LessThan(now),
      },
    });

    for (const pool of poolsToClose) {
      pool.status = PoolStatus.CLOSED;
      await this.poolRepository.save(pool);
      this.logger.log(
        `Pool ${pool.name} automatiquement fermé (End Date atteinte)`
      );
    }

    // 3. Passer de CLOSED à SETTLING (Règlement des positions)
    const poolsToSettle = await this.poolRepository.find({
      where: {
        status: PoolStatus.CLOSED,
        settleDate: LessThan(now),
      },
    });

    for (const pool of poolsToSettle) {
      pool.status = PoolStatus.SETTLING;
      await this.poolRepository.save(pool);
      this.logger.log(
        `Pool ${pool.name} en cours de règlement (Settle Date atteinte)`
      );
    }
  }
}
