import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoolController } from './pool.controller';
import { PoolService } from './pool.service';
import { PoolEntity, InvestmentEntity } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([PoolEntity, InvestmentEntity])],
  controllers: [PoolController],
  providers: [PoolService],
  exports: [PoolService],
})
export class PoolModule {}
