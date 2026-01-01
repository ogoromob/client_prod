import { Controller, Get, Put, UseGuards, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities';
import { SettingsService, SystemSettings } from './settings.service';

@Controller('api/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  @Roles(UserRole.SUPER_ADMIN)
  updateSettings(@Body() settings: Partial<SystemSettings>) {
    return this.settingsService.updateSettings(settings);
  }

  @Put('fees')
  @Roles(UserRole.SUPER_ADMIN)
  updateFees(@Body() fees: Partial<SystemSettings['fees']>) {
    return this.settingsService.updateFees(fees);
  }

  @Put('limits')
  @Roles(UserRole.SUPER_ADMIN)
  updateLimits(@Body() limits: Partial<SystemSettings['limits']>) {
    return this.settingsService.updateLimits(limits);
  }

  @Put('features')
  @Roles(UserRole.SUPER_ADMIN)
  updateFeatures(@Body() features: Partial<SystemSettings['features']>) {
    return this.settingsService.updateFeatures(features);
  }

  @Get('statistics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getStatistics() {
    return this.settingsService.getStatistics();
  }

  @Get('health')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getHealthStatus() {
    return this.settingsService.getHealthStatus();
  }
}
