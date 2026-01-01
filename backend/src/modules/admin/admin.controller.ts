import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../database/entities';
import { createSuccessResponse } from '../../common/dto/api-response.dto';
import { CreatePoolDto, UpdatePoolDto } from '../pool/dto/pool.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    const metrics = await this.adminService.getDashboardMetrics();
    return createSuccessResponse(metrics);
  }

  @Get('pools')
  async getPools() {
    const pools = await this.adminService.getPools();
    return createSuccessResponse(pools);
  }

  @Post('pools')
  async createPool(@Body() createDto: CreatePoolDto, @CurrentUser() user: any) {
    const pool = await this.adminService.createPool(createDto, user.sub);
    return createSuccessResponse(pool);
  }

  @Put('pools/:id')
  async updatePool(@Param('id') id: string, @Body() updateDto: UpdatePoolDto) {
    const pool = await this.adminService.updatePool(id, updateDto);
    return createSuccessResponse(pool);
  }

  @Delete('pools/:id')
  async deletePool(@Param('id') id: string) {
    await this.adminService.deletePool(id);
    return createSuccessResponse({ message: 'Pool supprimé' });
  }

  @Post('pools/:id/publish')
  async publishPool(@Param('id') id: string) {
    const pool = await this.adminService.publishPool(id);
    return createSuccessResponse(pool);
  }

  @Post('pools/:id/pause')
  async pausePool(@Param('id') id: string) {
    const pool = await this.adminService.pausePool(id);
    return createSuccessResponse(pool);
  }

  @Post('pools/:id/resume')
  async resumePool(@Param('id') id: string) {
    const pool = await this.adminService.resumePool(id);
    return createSuccessResponse(pool);
  }

  @Post('pools/:id/force-settlement')
  async forceSettlement(@Param('id') id: string) {
    await this.adminService.forceSettlement(id);
    return createSuccessResponse({ message: 'Settlement lancé' });
  }

  @Post('pools/:id/emergency-stop')
  async emergencyStop(@Param('id') id: string) {
    await this.adminService.emergencyStop(id);
    return createSuccessResponse({ message: 'Arrêt d\'urgence effectué' });
  }

  @Get('users')
  async getUsers(@Query() filters: any) {
    const users = await this.adminService.getAllUsers(filters);
    return createSuccessResponse(users);
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    const user = await this.adminService.getUserById(id);
    return createSuccessResponse(user);
  }

  @Put('users/:id/kyc-status')
  async updateKycStatus(@Param('id') id: string, @Body() body: { status: any }) {
    const user = await this.adminService.updateUserKycStatus(id, body.status);
    return createSuccessResponse(user);
  }

  @Post('users/:id/block')
  async blockUser(@Param('id') id: string) {
    await this.adminService.blockUser(id);
    return createSuccessResponse({ message: 'Utilisateur bloqué' });
  }

  @Post('users/:id/unblock')
  async unblockUser(@Param('id') id: string) {
    await this.adminService.unblockUser(id);
    return createSuccessResponse({ message: 'Utilisateur débloqué' });
  }

  @Get('withdrawals')
  async getWithdrawals(@Query() filters: any) {
    const withdrawals = await this.adminService.getAllWithdrawals(filters);
    return createSuccessResponse(withdrawals);
  }

  @Put('withdrawals/:id/approve')
  async approveWithdrawal(@Param('id') id: string) {
    const withdrawal = await this.adminService.approveWithdrawal(id);
    return createSuccessResponse(withdrawal);
  }

  @Put('withdrawals/:id/reject')
  async rejectWithdrawal(@Param('id') id: string, @Body() body: { reason: string }) {
    const withdrawal = await this.adminService.rejectWithdrawal(id, body.reason);
    return createSuccessResponse(withdrawal);
  }

  @Get('audit-logs')
  async getAuditLogs(@Query() filters: any) {
    const logs = await this.adminService.getAuditLogs(filters);
    return createSuccessResponse(logs);
  }

  @Get('config')
  async getConfig() {
    const config = await this.adminService.getConfig();
    return createSuccessResponse(config);
  }

  @Put('config')
  async updateConfig(@Body() config: any) {
    await this.adminService.updateConfig(config);
    return createSuccessResponse({ message: 'Configuration mise à jour' });
  }

  @Post('backup')
  async triggerBackup() {
    await this.adminService.triggerBackup();
    return createSuccessResponse({ message: 'Backup lancé' });
  }
}
