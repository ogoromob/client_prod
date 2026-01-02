import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import configuration from './config/configuration';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { UserEntity, PoolEntity, InvestmentEntity, WithdrawalEntity, TransactionEntity } from './database/entities';
import { AuditLogEntity } from './modules/audit/audit.entity';
import { AuthModule } from './modules/auth/auth.module';
import { PoolModule } from './modules/pool/pool.module';
import { InvestmentModule } from './modules/investment/investment.module';
import { WithdrawalModule } from './modules/withdrawal/withdrawal.module';
import { AdminModule } from './modules/admin/admin.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { EventsModule } from './modules/events/events.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { AuditModule } from './modules/audit/audit.module';
import { SecurityModule } from './modules/security/security.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AuthService } from './modules/auth/auth.service';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Database - Production ready with non-blocking init
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'sqlite' as const,
        database: process.env.DATABASE_NAME || './data/tradingpool.db',
        entities: [UserEntity, PoolEntity, InvestmentEntity, WithdrawalEntity, TransactionEntity, AuditLogEntity],
        synchronize: true, // OK for development/production with SQLite
        logging: false,
      }),
    }),

    // Rate Limiting - Production ready
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // Feature Modules
    AuthModule,
    PoolModule,
    InvestmentModule,
    WithdrawalModule,
    AdminModule,
    WebhookModule,
    EventsModule,
    SchedulerModule,
    AuditModule,
    SecurityModule,
    SettingsModule,
  ],
  controllers: [HealthController],
  providers: [
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Global JWT Auth Guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Roles Guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger('AppModule');
  
  constructor(private authService: AuthService) {}

  async onModuleInit() {
    this.logger.log('🔧 Application initialization...');
    
    // Seed admin user - Non-blocking background task
    setTimeout(async () => {
      try {
        await this.authService.seedAdminUser();
        this.logger.log('✅ Admin user seeded successfully');
      } catch (error) {
        this.logger.warn('⚠️ Admin seed skipped (may already exist)');
      }
    }, 0);
    
    this.logger.log('✅ Application ready');
  }
}
