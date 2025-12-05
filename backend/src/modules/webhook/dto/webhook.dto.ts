import { IsString, IsUUID, IsEnum, IsNumber, IsArray, ValidateNested, IsOptional, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum WebhookEventType {
  TRADE_EXECUTED = 'trade_executed',
  POSITION_UPDATE = 'position_update',
  PNL_UPDATE = 'pnl_update',
  POOL_UPDATE = 'pool_update',
}

export class TradeData {
  @ApiProperty()
  @IsString()
  symbol: string;

  @ApiProperty()
  @IsEnum(['buy', 'sell'])
  side: 'buy' | 'sell';

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  commission?: number;
}

export class PositionData {
  @ApiProperty()
  @IsString()
  symbol: string;

  @ApiProperty()
  @IsEnum(['long', 'short'])
  side: 'long' | 'short';

  @ApiProperty()
  @IsNumber()
  size: number;

  @ApiProperty()
  @IsNumber()
  entryPrice: number;

  @ApiProperty()
  @IsNumber()
  currentPrice: number;

  @ApiProperty()
  @IsNumber()
  unrealizedPnl: number;

  @ApiProperty()
  @IsNumber()
  margin: number;
}

export class PnLData {
  @ApiProperty()
  @IsNumber()
  totalPnl: number;

  @ApiProperty()
  @IsNumber()
  realizedPnl: number;

  @ApiProperty()
  @IsNumber()
  unrealizedPnl: number;

  @ApiProperty()
  @IsNumber()
  totalValue: number;
}

export class ModelWebhookDto {
  @ApiProperty({ description: 'Pool ID' })
  @IsUUID()
  poolId: string;

  @ApiProperty({ description: 'Event timestamp' })
  @IsString()
  timestamp: string;

  @ApiProperty({ enum: WebhookEventType, description: 'Event type' })
  @IsEnum(WebhookEventType)
  event: WebhookEventType;

  @ApiProperty({ description: 'Event data' })
  @IsObject()
  data: TradeData | PositionData[] | PnLData | any;

  @ApiProperty({ description: 'HMAC signature for security', required: false })
  @IsString()
  @IsOptional()
  signature?: string;
}
