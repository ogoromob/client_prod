import { api } from '../lib/axios';
import type { User, LoginCredentials, RegisterData, AuthTokens, ApiResponse } from '../types';
import { mockUsers } from '../mocks/data';

// Mode mock pour développement sans backend
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    if (MOCK_MODE) {
      // Simulation délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Admin check
      if (credentials.email === 'sesshomaru@admin.com' && credentials.password === 'inyasha') {
        const adminUser = mockUsers.find(u => u.role === 'admin')!;
        return {
          user: adminUser,
          tokens: {
            accessToken: 'mock-admin-access-token',
            refreshToken: 'mock-admin-refresh-token',
          },
        };
      }
      
      // User check
      if (credentials.email === 'investor@example.com' && credentials.password === 'Password123!') {
        const investorUser = mockUsers.find(u => u.role === 'investor')!;
        return {
          user: investorUser,
          tokens: {
            accessToken: 'mock-investor-access-token',
            refreshToken: 'mock-investor-refresh-token',
          },
        };
      }
      
      throw new Error('Email ou mot de passe incorrect');
    }
    
    const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/login', credentials);
    return response.data!;
  },
  
  // Register
  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: data.email,
        role: 'investor',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        kycStatus: 'pending',
      };
      
      return {
        user: newUser,
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      };
    }
    
    const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/register', data);
    return response.data!;
  },
  
  // Logout
  async logout(): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }
    
    await api.post('/auth/logout');
  },
  
  // Refresh token
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        accessToken: 'mock-refreshed-access-token',
        refreshToken: 'mock-refreshed-refresh-token',
      };
    }
    
    const response = await api.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken });
    return response.data!;
  },
  
  // Get current user
  async getCurrentUser(): Promise<User> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const token = localStorage.getItem('accessToken');
      
      if (token?.includes('admin')) {
        return mockUsers.find(u => u.role === 'admin')!;
      }
      
      return mockUsers.find(u => u.role === 'investor')!;
    }
    
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data!;
  },
  
  // Setup MFA
  async setupMFA(): Promise<{ secret: string; qrCode: string }> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        secret: 'MOCK_SECRET_KEY_12345',
        qrCode: 'data:image/png;base64,mock-qr-code',
      };
    }
    
    const response = await api.post<ApiResponse<{ secret: string; qrCode: string }>>('/auth/mfa/setup');
    return response.data!;
  },
  
  // Verify MFA
  async verifyMFA(code: string): Promise<{ verified: boolean }> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { verified: code === '123456' };
    }
    
    const response = await api.post<ApiResponse<{ verified: boolean }>>('/auth/mfa/verify', { code });
    return response.data!;
  },
  
  // Disable MFA
  async disableMFA(code: string): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (code !== '123456') {
        throw new Error('Code MFA invalide');
      }
      return;
    }
    
    await api.post('/auth/mfa/disable', { code });
  },
  
  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return;
    }
    
    await api.post('/auth/forgot-password', { email });
  },
  
  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return;
    }
    
    await api.post('/auth/reset-password', { token, newPassword });
  },
};
