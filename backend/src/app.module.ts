import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import configuration from './config/configuration';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { UserEntity, PoolEntity, InvestmentEntity, WithdrawalEntity } from './database/entities';
import { AuthModule } from './modules/auth/auth.module';
import { PoolModule } from './modules/pool/pool.module';
import { InvestmentModule } from './modules/investment/investment.module';
import { WithdrawalModule } from './modules/withdrawal/withdrawal.module';
import { AdminModule } from './modules/admin/admin.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { AuthService } from './modules/auth/auth.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite' as const,
        database: configService.get<string>('database.database') || './data/tradingpool.db',
        entities: [UserEntity, PoolEntity, InvestmentEntity, WithdrawalEntity],
        synchronize: configService.get<boolean>('database.synchronize') !== false,
        logging: configService.get<boolean>('database.logging') || false,
      }),
    }),

    // Rate Limiting
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
  ],
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
    this.logger.log('🔧 Initialisation de l\'application...');
    
    // Seed admin user (non-blocking avec timeout)
    try {
      const seedPromise = this.authService.seedAdminUser();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Seed timeout')), 5000)
      );
      
      await Promise.race([seedPromise, timeoutPromise]);
      this.logger.log('✅ Admin user vérifié/créé avec succès');
    } catch (error) {
      this.logger.warn('⚠️ Seed admin timeout ou erreur (continuera en arrière-plan):', error.message);
      // Continue startup même si le seed échoue
    }
  }
}
