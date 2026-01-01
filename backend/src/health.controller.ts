import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Public } from './common/decorators/public.decorator';
import { UserEntity } from './database/entities';

@Controller()
export class HealthController {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'tradingpool-backend', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('api/v1/health/db')
  async healthDb() {
    try {
      const userCount = await this.userRepository.count();
      return { 
        status: 'ok', 
        database: 'connected',
        userCount,
        timestamp: new Date().toISOString() 
      };
    } catch (error) {
      return { 
        status: 'error', 
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString() 
      };
    }
  }
}
