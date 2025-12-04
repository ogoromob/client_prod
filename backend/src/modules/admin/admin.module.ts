import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserEntity, PoolEntity, InvestmentEntity, WithdrawalEntity } from '../../database/entities';
import { PoolModule } from '../pool/pool.module';
import { WithdrawalModule } from '../withdrawal/withdrawal.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, PoolEntity, InvestmentEntity, WithdrawalEntity]),
    PoolModule,
    WithdrawalModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
