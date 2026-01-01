import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoolController } from './pool.controller';
import { PoolService } from './pool.service';
import { CircuitBreakerService } from './circuit-breaker.service';
import { PoolEntity, InvestmentEntity } from '../../database/entities';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PoolEntity, InvestmentEntity]),
    EventsModule,
  ],
  controllers: [PoolController],
  providers: [PoolService, CircuitBreakerService],
  exports: [PoolService, CircuitBreakerService],
})
export class PoolModule {}
