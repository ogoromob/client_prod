import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities';
import { AuditService } from './audit.service';

@Controller('api/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get('logs')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
  ) {
    return this.auditService.getLogs(page, limit, action as any, userId);
  }

  @Get('logs/recent')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getRecentLogs(@Query('limit') limit: number = 10) {
    return this.auditService.getRecentLogs(limit);
  }

  @Get('statistics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getStatistics() {
    return this.auditService.getStatistics();
  }

  @Get('user-logs')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getUserLogs(
    @Query('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.auditService.getLogsByUser(userId, page, limit);
  }
}
