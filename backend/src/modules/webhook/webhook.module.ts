import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { PoolEntity } from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([PoolEntity]),
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhookModule {}
