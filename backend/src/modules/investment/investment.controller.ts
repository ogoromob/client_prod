import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InvestmentService } from './investment.service';
import { CreateInvestmentDto } from './dto/investment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { createSuccessResponse } from '../../common/dto/api-response.dto';

@ApiTags('Investments')
@Controller('investments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Get()
  async findMy(@CurrentUser() user: any) {
    const investments = await this.investmentService.findMyInvestments(user.sub);
    return createSuccessResponse(investments);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const investment = await this.investmentService.findOne(id, user.sub);
    return createSuccessResponse(investment);
  }

  @Post()
  async create(@Body() createDto: CreateInvestmentDto, @CurrentUser() user: any) {
    const investment = await this.investmentService.create(createDto, user.sub);
    return createSuccessResponse(investment);
  }

  @Get(':id/history')
  async getHistory(@Param('id') id: string, @CurrentUser() user: any) {
    const history = await this.investmentService.getHistory(id, user.sub);
    return createSuccessResponse(history);
  }
}
