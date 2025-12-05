import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Headers,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { ModelWebhookDto } from './dto/webhook.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities';
import { createSuccessResponse } from '../../common/dto/api-response.dto';

@ApiTags('Webhook')
@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  /**
   * Receive webhook from trading model
   * This endpoint should be called by your Python trading model
   */
  @Public()
  @Post('model')
  @ApiOperation({
    summary: 'Receive webhook from trading model',
    description: `
      This endpoint receives real-time updates from your trading model.
      
      **Security**: Include a signature in the header for verification.
      
      **Event Types**:
      - trade_executed: A trade was executed
      - position_update: Positions changed
      - pnl_update: P&L was updated
      - pool_update: General pool state update
      
      **Example Payload**:
      \`\`\`json
      {
        "poolId": "uuid-here",
        "timestamp": "2024-12-05T10:30:00Z",
        "event": "trade_executed",
        "data": {
          "symbol": "BTC/USDT",
          "side": "buy",
          "quantity": 0.5,
          "price": 45000,
          "commission": 22.5
        },
        "signature": "hmac_sha256_signature"
      }
      \`\`\`
    `,
  })
  @ApiHeader({
    name: 'X-Webhook-Signature',
    description: 'HMAC SHA256 signature of the payload',
    required: false,
  })
  async receiveModelWebhook(
    @Body() webhookDto: ModelWebhookDto,
    @Headers('x-webhook-signature') signature?: string,
  ) {
    this.logger.log(`Received webhook: ${webhookDto.event} for pool ${webhookDto.poolId}`);

    // Verify signature if provided
    if (signature || webhookDto.signature) {
      const payloadString = JSON.stringify(webhookDto);
      const sig = signature || webhookDto.signature;
      
      const isValid = this.webhookService.verifySignature(payloadString, sig!);
      
      if (!isValid) {
        this.logger.warn('Invalid webhook signature');
        throw new BadRequestException('Invalid signature');
      }
    } else {
      this.logger.warn('Webhook received without signature (development mode?)');
    }

    // Process webhook
    const result = await this.webhookService.processWebhook(webhookDto);

    return createSuccessResponse(result);
  }

  /**
   * Get webhook logs (Admin only)
   */
  @Get('logs')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get webhook logs',
    description: 'Retrieve webhook logs for monitoring and debugging',
  })
  async getWebhookLogs(
    @Query('poolId') poolId?: string,
    @Query('limit') limit: number = 50,
  ) {
    const logs = await this.webhookService.getWebhookLogs(poolId, limit);
    return createSuccessResponse(logs);
  }

  /**
   * Test webhook endpoint (for development)
   */
  @Public()
  @Post('test')
  @ApiOperation({
    summary: 'Test webhook endpoint',
    description: 'Send a test webhook to verify integration (no signature required)',
  })
  async testWebhook(@Body() webhookDto: ModelWebhookDto) {
    this.logger.log(`TEST webhook received: ${webhookDto.event}`);

    const result = await this.webhookService.processWebhook(webhookDto);

    return createSuccessResponse({
      ...result,
      note: 'This is a test webhook call',
    });
  }
}
