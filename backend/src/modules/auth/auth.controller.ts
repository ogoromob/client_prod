import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, VerifyMfaDto } from './dto/auth.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { createSuccessResponse } from '../../common/dto/api-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return createSuccessResponse(result);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return createSuccessResponse(result);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const tokens = await this.authService.refreshToken(refreshTokenDto.refreshToken);
    return createSuccessResponse(tokens);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (client-side token removal)' })
  async logout() {
    // Logout is handled client-side by removing tokens
    // In production, you might want to blacklist tokens
    return createSuccessResponse({ message: 'Déconnexion réussie' });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getCurrentUser(@CurrentUser() user: any) {
    const currentUser = await this.authService.getCurrentUser(user.sub);
    return createSuccessResponse(currentUser);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/setup')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup MFA for user account' })
  async setupMFA(@CurrentUser() user: any) {
    const mfaData = await this.authService.setupMFA(user.sub);
    return createSuccessResponse(mfaData);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify and enable MFA' })
  async verifyMFA(@CurrentUser() user: any, @Body() verifyDto: VerifyMfaDto) {
    const result = await this.authService.verifyMFA(user.sub, verifyDto.code);
    return createSuccessResponse(result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/disable')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable MFA' })
  async disableMFA(@CurrentUser() user: any, @Body() verifyDto: VerifyMfaDto) {
    await this.authService.disableMFA(user.sub, verifyDto.code);
    return createSuccessResponse({ message: 'MFA désactivé avec succès' });
  }
}
