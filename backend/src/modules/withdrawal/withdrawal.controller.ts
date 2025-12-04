import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WithdrawalService } from './withdrawal.service';
import { CreateWithdrawalDto } from './dto/withdrawal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { createSuccessResponse } from '../../common/dto/api-response.dto';

@ApiTags('Withdrawals')
@Controller('withdrawals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Get()
  async findMy(@CurrentUser() user: any) {
    const withdrawals = await this.withdrawalService.findMyWithdrawals(user.sub);
    return createSuccessResponse(withdrawals);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const withdrawal = await this.withdrawalService.findOne(id, user.sub);
    return createSuccessResponse(withdrawal);
  }

  @Post()
  async create(@Body() createDto: CreateWithdrawalDto, @CurrentUser() user: any) {
    const withdrawal = await this.withdrawalService.create(createDto, user.sub);
    return createSuccessResponse(withdrawal);
  }

  @Post('calculate-fees')
  async calculateFees(@Body() body: { investmentId: string; amount: number }) {
    const fees = await this.withdrawalService.calculateFees(body.investmentId, body.amount);
    return createSuccessResponse(fees);
  }
}
