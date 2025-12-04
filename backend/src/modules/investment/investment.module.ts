import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentController } from './investment.controller';
import { InvestmentService } from './investment.service';
import { InvestmentEntity, PoolEntity } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([InvestmentEntity, PoolEntity])],
  controllers: [InvestmentController],
  providers: [InvestmentService],
  exports: [InvestmentService],
})
export class InvestmentModule {}
