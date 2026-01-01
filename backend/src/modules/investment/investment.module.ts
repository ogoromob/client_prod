import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentController } from './investment.controller';
import { InvestmentService } from './investment.service';
import { InvestmentValidationService } from './investment-validation.service';
import { AutoReinvestmentService } from './auto-reinvestment.service';
import { InvestmentEntity, PoolEntity, UserEntity } from '../../database/entities';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvestmentEntity, PoolEntity, UserEntity]),
    EventsModule,
  ],
  controllers: [InvestmentController],
  providers: [
    InvestmentService,
    InvestmentValidationService,
    AutoReinvestmentService,
  ],
  exports: [
    InvestmentService,
    InvestmentValidationService,
    AutoReinvestmentService,
  ],
})
export class InvestmentModule {}
