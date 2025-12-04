import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PoolService } from './pool.service';
import { CreatePoolDto, UpdatePoolDto } from './dto/pool.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../database/entities';
import { createSuccessResponse } from '../../common/dto/api-response.dto';

@ApiTags('Pools')
@Controller('pools')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PoolController {
  constructor(private readonly poolService: PoolService) {}

  @Get()
  @ApiOperation({ summary: 'Get all pools' })
  async findAll(@Query() filters: any) {
    const pools = await this.poolService.findAll(filters);
    return createSuccessResponse(pools);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pool by ID' })
  async findOne(@Param('id') id: string) {
    const pool = await this.poolService.findOne(id);
    return createSuccessResponse(pool);
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'Get pool performance metrics' })
  async getPerformance(@Param('id') id: string) {
    const performance = await this.poolService.getPerformance(id);
    return createSuccessResponse(performance);
  }

  @Get(':id/positions')
  @ApiOperation({ summary: 'Get pool positions' })
  async getPositions(@Param('id') id: string) {
    const positions = await this.poolService.getPositions(id);
    return createSuccessResponse(positions);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get pool performance history' })
  async getHistory(@Param('id') id: string) {
    const history = await this.poolService.getPerformanceHistory(id);
    return createSuccessResponse(history);
  }

  @Get(':id/investors')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get pool investors' })
  async getInvestors(@Param('id') id: string) {
    const investors = await this.poolService.getInvestors(id);
    return createSuccessResponse(investors);
  }
}
