import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InvestmentService } from './investment.service';
import { CreateInvestmentDto } from './dto/investment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities';
import { createSuccessResponse } from '../../common/dto/api-response.dto';

@ApiTags('Investments')
@Controller('investments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Get('my')
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

  @Post(':id/confirm')
  async confirm(@Param('id') id: string, @CurrentUser() user: any) {
    const investment = await this.investmentService.confirm(id, user.sub);
    return createSuccessResponse(investment);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string, @Body() body: { reason?: string }, @CurrentUser() user: any) {
    const investment = await this.investmentService.reject(id, user.sub, body.reason);
    return createSuccessResponse(investment);
  }

  @Get(':id/history')
  async getHistory(@Param('id') id: string, @CurrentUser() user: any) {
    const history = await this.investmentService.getHistory(id, user.sub);
    return createSuccessResponse(history);
  }

  // Admin endpoints
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/pending')
  async getPendingInvestments() {
    const investments = await this.investmentService.getPendingInvestments();
    return createSuccessResponse(investments);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  async getAllInvestments() {
    const investments = await this.investmentService.getAllInvestments();
    return createSuccessResponse(investments);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/:id/approve')
  async approveInvestment(@Param('id') id: string) {
    const investment = await this.investmentService.approveInvestment(id);
    return createSuccessResponse(investment);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/:id/reject')
  async rejectInvestmentAdmin(@Param('id') id: string, @Body() body: { reason: string }) {
    const investment = await this.investmentService.rejectInvestmentAdmin(id, body.reason);
    return createSuccessResponse(investment);
  }
}
