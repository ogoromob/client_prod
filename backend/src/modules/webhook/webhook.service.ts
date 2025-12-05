import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { ModelWebhookDto, WebhookEventType } from './dto/webhook.dto';
import { PoolEntity } from '../../database/entities';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectRepository(PoolEntity)
    private poolRepository: Repository<PoolEntity>,
    private configService: ConfigService,
  ) {}

  /**
   * Verify HMAC signature for webhook security
   */
  verifySignature(payload: string, signature: string): boolean {
    const secret = this.configService.get<string>('trading.apiKey') || 'mock_trading_api_key';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Process incoming webhook from trading model
   */
  async processWebhook(webhookDto: ModelWebhookDto): Promise<any> {
    this.logger.log(`Processing webhook: ${webhookDto.event} for pool ${webhookDto.poolId}`);

    // Verify pool exists
    const pool = await this.poolRepository.findOne({
      where: { id: webhookDto.poolId },
    });

    if (!pool) {
      throw new BadRequestException(`Pool ${webhookDto.poolId} not found`);
    }

    // Process based on event type
    switch (webhookDto.event) {
      case WebhookEventType.TRADE_EXECUTED:
        return this.handleTradeExecuted(pool, webhookDto);

      case WebhookEventType.POSITION_UPDATE:
        return this.handlePositionUpdate(pool, webhookDto);

      case WebhookEventType.PNL_UPDATE:
        return this.handlePnLUpdate(pool, webhookDto);

      case WebhookEventType.POOL_UPDATE:
        return this.handlePoolUpdate(pool, webhookDto);

      default:
        throw new BadRequestException(`Unknown event type: ${webhookDto.event}`);
    }
  }

  /**
   * Handle trade executed event
   */
  private async handleTradeExecuted(pool: PoolEntity, webhookDto: ModelWebhookDto) {
    const tradeData = webhookDto.data;

    this.logger.log(
      `Trade executed for pool ${pool.id}: ${tradeData.side} ${tradeData.quantity} ${tradeData.symbol} @ ${tradeData.price}`
    );

    // TODO: Store trade in database (create Trade entity if needed)
    // TODO: Broadcast to connected WebSocket clients

    return {
      success: true,
      message: 'Trade executed event processed',
      poolId: pool.id,
      tradeData,
    };
  }

  /**
   * Handle position update event
   */
  private async handlePositionUpdate(pool: PoolEntity, webhookDto: ModelWebhookDto) {
    const positions = webhookDto.data;

    this.logger.log(`Position update for pool ${pool.id}: ${JSON.stringify(positions).substring(0, 100)}...`);

    // Update pool metadata with current positions
    const metadata = pool.metadata || {};
    (metadata as any).positions = positions;
    (metadata as any).lastPositionUpdate = new Date().toISOString();
    
    pool.metadata = metadata;
    await this.poolRepository.save(pool);

    // TODO: Broadcast to connected WebSocket clients

    return {
      success: true,
      message: 'Position update processed',
      poolId: pool.id,
      positionCount: Array.isArray(positions) ? positions.length : 0,
    };
  }

  /**
   * Handle P&L update event
   */
  private async handlePnLUpdate(pool: PoolEntity, webhookDto: ModelWebhookDto) {
    const pnlData = webhookDto.data;

    this.logger.log(`P&L update for pool ${pool.id}: Total=${pnlData.totalPnl}, Realized=${pnlData.realizedPnl}`);

    // Update pool P&L
    pool.totalPnL = pnlData.totalPnl;
    pool.currentAmount = pnlData.totalValue;
    await this.poolRepository.save(pool);

    // TODO: Update investor investments P&L
    // TODO: Broadcast to connected WebSocket clients

    return {
      success: true,
      message: 'P&L update processed',
      poolId: pool.id,
      pnlData,
    };
  }

  /**
   * Handle pool update event (generic pool state update)
   */
  private async handlePoolUpdate(pool: PoolEntity, webhookDto: ModelWebhookDto) {
    this.logger.log(`Pool update for ${pool.id}`);

    const updateData = webhookDto.data;

    // Update pool fields based on data received
    if (updateData.currentValue !== undefined) {
      pool.currentAmount = updateData.currentValue;
    }
    if (updateData.totalPnl !== undefined) {
      pool.totalPnL = updateData.totalPnl;
    }

    await this.poolRepository.save(pool);

    // TODO: Broadcast to connected WebSocket clients

    return {
      success: true,
      message: 'Pool update processed',
      poolId: pool.id,
    };
  }

  /**
   * Get webhook logs (for debugging/monitoring)
   */
  async getWebhookLogs(poolId?: string, limit: number = 50) {
    // TODO: Implement webhook logging to database
    // For now, return empty array
    this.logger.log(`Getting webhook logs${poolId ? ` for pool ${poolId}` : ''}`);
    
    return {
      logs: [],
      total: 0,
      message: 'Webhook logging not yet implemented',
    };
  }
}
