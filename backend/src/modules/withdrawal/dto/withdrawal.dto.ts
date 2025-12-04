import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WithdrawalMethod {
  BANK_TRANSFER = 'bank_transfer',
  CRYPTO = 'crypto',
}

export class CreateWithdrawalDto {
  @ApiProperty()
  @IsString()
  investmentId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ enum: WithdrawalMethod })
  @IsEnum(WithdrawalMethod)
  withdrawalMethod: WithdrawalMethod;

  @ApiProperty()
  @IsString()
  destinationAddress: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mfaCode?: string;
}
