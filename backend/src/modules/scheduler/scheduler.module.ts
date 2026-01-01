import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { PoolEntity } from '../../database/entities';
import { PoolScheduler } from './pool.scheduler';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([PoolEntity])],
  providers: [PoolScheduler],
})
export class SchedulerModule {}
