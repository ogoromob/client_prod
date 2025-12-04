import { IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CRYPTO = 'crypto',
  CARD = 'card',
}

export class CreateInvestmentDto {
  @ApiProperty()
  @IsString()
  poolId: string;

  @ApiProperty()
  @IsNumber()
  @Min(10)
  amount: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
