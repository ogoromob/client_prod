import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WithdrawalController } from './withdrawal.controller';
import { WithdrawalService } from './withdrawal.service';
import { WithdrawalEntity, InvestmentEntity } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([WithdrawalEntity, InvestmentEntity])],
  controllers: [WithdrawalController],
  providers: [WithdrawalService],
  exports: [WithdrawalService],
})
export class WithdrawalModule {}
