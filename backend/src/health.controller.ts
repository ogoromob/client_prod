import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Public } from './common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Public()
  @Get()
  health() {
    return { status: 'ok', service: 'tradingpool-backend', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('db')
  async healthDb() {
    try {
      if (!this.dataSource.isInitialized) {
        return { 
          success: false, 
          error: 'Database connection not initialized',
          timestamp: new Date().toISOString() 
        };
      }

      const result = await this.dataSource.query('SELECT 1');
      return {
        success: true,
        message: 'Database connection is healthy',
        details: {
          isConnected: this.dataSource.isInitialized,
          testQuery: result ? 'OK' : 'Failed'
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DB_ERROR',
          message: error.message
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}
