import { Controller, Get, Post, Delete, UseGuards, Req, Param, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities';
import { SecurityService } from './security.service';

@Controller('api/security')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SecurityController {
  constructor(private securityService: SecurityService) {}

  @Get('mfa-status')
  async getMFAStatus(@Req() req: any) {
    return this.securityService.getMFAStatus(req.user.id);
  }

  @Post('mfa/enable')
  async enableMFA(@Req() req: any) {
    return this.securityService.enableMFA(req.user.id);
  }

  @Post('mfa/disable')
  async disableMFA(@Req() req: any) {
    return this.securityService.disableMFA(req.user.id);
  }

  @Get('api-keys')
  async getApiKeys(@Req() req: any) {
    return this.securityService.getApiKeys(req.user.id);
  }

  @Post('api-keys')
  async createApiKey(@Req() req: any, @Body() body: { name: string }) {
    return this.securityService.createApiKey(req.user.id, body.name);
  }

  @Delete('api-keys/:keyId')
  async revokeApiKey(@Param('keyId') keyId: string) {
    return { success: this.securityService.revokeApiKey(keyId) };
  }

  @Get('alerts')
  async getSecurityAlerts(@Req() req: any) {
    return this.securityService.getSecurityAlerts(req.user.id);
  }

  @Get('recommendations')
  async getSecurityRecommendations(@Req() req: any) {
    return this.securityService.getSecurityRecommendations(req.user.id);
  }

  @Get('system-status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getSystemStatus() {
    return this.securityService.getSystemStatus();
  }

  @Get('login-history')
  async getLoginHistory(@Req() req: any, @Query('limit') limit: number = 10) {
    return this.securityService.getLoginHistory(req.user.id, limit);
  }
}

import { Query } from '@nestjs/common';
