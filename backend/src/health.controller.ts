import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() {
    return {
      status: 'ok',
      timestamp: Date.now(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('api/v1/health')
  @ApiOperation({ summary: 'API health check endpoint' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  apiHealth() {
    return {
      status: 'ok',
      timestamp: Date.now(),
      api_version: 'v1',
      uptime: process.uptime(),
    };
  }
}
