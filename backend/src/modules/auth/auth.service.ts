import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { UserEntity, UserRole, KycStatus } from '../../database/entities';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, confirmPassword } = registerDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    // Check if user exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Un compte existe déjà avec cet email');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = this.userRepository.create({
      email,
      passwordHash,
      role: UserRole.INVESTOR,
      kycStatus: KycStatus.PENDING,
      mfaEnabled: false,
    });

    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password, mfaCode } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Check if user is blocked
    if (user.isBlocked) {
      throw new UnauthorizedException('Votre compte a été bloqué');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Check MFA if enabled
    if (user.mfaEnabled) {
      if (!mfaCode) {
        throw new UnauthorizedException('Code MFA requis');
      }

      const isMfaValid = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: mfaCode,
        window: 2,
      });

      if (!isMfaValid) {
        throw new UnauthorizedException('Code MFA invalide');
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async validateUser(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.isBlocked) {
      throw new UnauthorizedException('Utilisateur invalide');
    }
    return user;
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const user = await this.validateUser(payload.sub);

      return await this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Token de rafraîchissement invalide');
    }
  }

  async setupMFA(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    // Generate MFA secret
    const secret = speakeasy.generateSecret({
      name: `TradingPool (${user.email})`,
      issuer: 'TradingPool',
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url || '');

    // Save secret (not enabled yet)
    user.mfaSecret = secret.base32;
    await this.userRepository.save(user);

    return {
      secret: secret.base32,
      qrCode,
    };
  }

  async verifyMFA(userId: string, code: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.mfaSecret) {
      throw new BadRequestException('MFA non configuré');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!isValid) {
      throw new BadRequestException('Code MFA invalide');
    }

    // Enable MFA
    user.mfaEnabled = true;
    await this.userRepository.save(user);

    return { verified: true };
  }

  async disableMFA(userId: string, code: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.mfaEnabled) {
      throw new BadRequestException('MFA non activé');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!isValid) {
      throw new BadRequestException('Code MFA invalide');
    }

    user.mfaEnabled = false;
    user.mfaSecret = '';
    await this.userRepository.save(user);
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    return this.sanitizeUser(user);
  }

  private async generateTokens(user: UserEntity) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.accessSecret'),
        expiresIn: this.configService.get('jwt.accessExpiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: UserEntity) {
    const { passwordHash, mfaSecret, ...sanitized } = user;
    return sanitized;
  }

  // Seed test users on startup
  async seedAdminUser() {
    try {
      // Create Super Admin
      const superAdminEmail = 'admin@tradingpool.com';
      const superAdminPassword = 'SuperAdmin@2024';
      
      const existingSuperAdmin = await this.userRepository.findOne({
        where: { email: superAdminEmail },
      });

      if (!existingSuperAdmin) {
        const passwordHash = await bcrypt.hash(superAdminPassword, 12);
        const superAdmin = this.userRepository.create({
          email: superAdminEmail,
          passwordHash,
          role: UserRole.SUPER_ADMIN,
          mfaEnabled: false,
          kycStatus: KycStatus.APPROVED,
          hasActiveSubscription: true,
          subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          totalInvestedAmount: 0,
        });
        await this.userRepository.save(superAdmin);
        console.log('✅ Super Admin created: admin@tradingpool.com / SuperAdmin@2024');
      }

      // Create Regular User
      const userEmail = 'investor@tradingpool.com';
      const userPassword = 'Investor@2024';
      
      const existingUser = await this.userRepository.findOne({
        where: { email: userEmail },
      });

      if (!existingUser) {
        const passwordHash = await bcrypt.hash(userPassword, 12);
        const user = this.userRepository.create({
          email: userEmail,
          passwordHash,
          role: UserRole.INVESTOR,
          mfaEnabled: false,
          kycStatus: KycStatus.APPROVED,
          hasActiveSubscription: true,
          subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          totalInvestedAmount: 0,
        });
        await this.userRepository.save(user);
        console.log('✅ Investor created: investor@tradingpool.com / Investor@2024');
      }

      return { 
        message: 'Test users seeded successfully',
        accounts: [
          { email: superAdminEmail, password: superAdminPassword, role: 'SUPER_ADMIN' },
          { email: userEmail, password: userPassword, role: 'INVESTOR' }
        ]
      };
    } catch (error) {
      console.error('❌ Error seeding users:', error);
      throw error;
    }
  }
}
