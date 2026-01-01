import { IsString, IsNumber, IsEnum, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CRYPTO = 'crypto',
  CARD = 'card',
}

export class CreateInvestmentDto {
  @ApiProperty({ description: 'Pool ID (UUID)' })
  @IsUUID('4', { message: 'poolId must be a valid UUID' })
  poolId: string;

  @ApiProperty({ description: 'Investment amount in EUR', minimum: 10, maximum: 1000000 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount must be a number with max 2 decimal places' })
  @Min(10, { message: 'Minimum investment is 10€' })
  @Max(1000000, { message: 'Maximum investment is 1,000,000€' })
  amount: number;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  @IsEnum(PaymentMethod, { message: `paymentMethod must be one of: ${Object.values(PaymentMethod).join(', ')}` })
  paymentMethod: PaymentMethod;
}

