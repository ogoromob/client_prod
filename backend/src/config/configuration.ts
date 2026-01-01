export default () => {
  // Validation des secrets en production
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    const requiredSecrets = [
      'JWT_ACCESS_SECRET',
      'JWT_REFRESH_SECRET',
      'MASTER_ENCRYPTION_KEY',
      'TRADING_API_KEY',
    ];
    
    const missing = requiredSecrets.filter(secret => !process.env[secret]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`);
    }
  }

  return {
    port: parseInt(process.env.PORT || '3000', 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || 'api/v1',
    
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
      credentials: true,
    },
    
    database: {
      type: (process.env.DATABASE_TYPE as any) || 'sqlite',
      database: process.env.DATABASE_NAME || ':memory:',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      synchronize: process.env.DATABASE_SYNC === 'true' && !isProduction, // Jamais en production
      logging: process.env.NODE_ENV === 'development',
    },
    
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET || (isProduction ? undefined : 'dev_access_secret'),
      refreshSecret: process.env.JWT_REFRESH_SECRET || (isProduction ? undefined : 'dev_refresh_secret'),
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    },
    
    encryption: {
      masterKey: process.env.MASTER_ENCRYPTION_KEY || (isProduction ? undefined : 'dev_encryption_key_32_chars!!'),
    },
    
    admin: {
      email: process.env.ADMIN_EMAIL || 'sesshomaru@admin.com',
      password: process.env.ADMIN_PASSWORD || (isProduction ? undefined : 'inyasha'),
      username: process.env.ADMIN_USERNAME || 'sesshomaru',
    },
    
    rateLimit: {
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10) || 60,
      limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10) || 100,
    },
    
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10) || 587,
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
      from: process.env.SMTP_FROM || 'noreply@tradingpool.com',
    },
    
    trading: {
      moduleUrl: process.env.TRADING_MODULE_URL || 'http://localhost:4000',
      apiKey: process.env.TRADING_API_KEY || (isProduction ? undefined : 'mock_trading_api_key'),
    },
  };
};
