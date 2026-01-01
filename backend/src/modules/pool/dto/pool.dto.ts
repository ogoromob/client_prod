import { IsString, IsNumber, IsOptional, IsEnum, IsArray, Min, Max, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RiskLevel, ModelType } from '../../../database/entities';

export class CreatePoolDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @Min(1000)
  targetAmount: number;

  @ApiProperty()
  @IsNumber()
  @Min(10)
  minInvestment: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  maxInvestors: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(50)
  managerFeePercentage: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tradingStrategy?: string;

  @ApiProperty({ enum: RiskLevel })
  @IsEnum(RiskLevel)
  riskLevel: RiskLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  exchanges?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  pairs?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxLeverage?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  stopLoss?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  takeProfit?: number;

  @ApiProperty({ enum: ModelType })
  @IsEnum(ModelType)
  modelType: ModelType;

  @ApiProperty()
  @IsNumber()
  @Min(100)
  maxInvestmentPerUser: number;

  @ApiProperty()
  @IsNumber()
  @Min(1000)
  maxInvestmentPerAdmin: number;

  @ApiProperty()
  @IsNumber()
  @Min(10000)
  poolHardCap: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(365)
  durationDays: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(50)
  maxDailyDrawdown: number;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  isReinvestDefault?: boolean;

  @ApiProperty({ default: 2 })
  @IsOptional()
  @IsNumber()
  subscriptionFee?: number;
}

export class UpdatePoolDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  targetAmount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minInvestment?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxInvestors?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  managerFeePercentage?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tradingStrategy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(100)
  maxInvestmentPerUser?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  maxInvestmentPerAdmin?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(10000)
  poolHardCap?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  durationDays?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  maxDailyDrawdown?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isReinvestDefault?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  subscriptionFee?: number;
}
