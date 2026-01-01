import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentController } from './investment.controller';
import { InvestmentService } from './investment.service';
import { InvestmentEntity, PoolEntity, UserEntity } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([InvestmentEntity, PoolEntity, UserEntity])],
  controllers: [InvestmentController],
  providers: [InvestmentService],
  exports: [InvestmentService],
})
export class InvestmentModule {}
