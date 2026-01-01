import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../database/entities';
import * as crypto from 'crypto';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed?: Date;
  isActive: boolean;
}

@Injectable()
export class SecurityService {
  private apiKeys: Map<string, ApiKey> = new Map();

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  // MFA Management
  async getMFAStatus(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return {
      mfaEnabled: user?.mfaEnabled || false,
      mfaRequired: user?.mfaRequired || false,
    };
  }

  async enableMFA(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.mfaEnabled = true;
      await this.userRepository.save(user);
    }
    return { mfaEnabled: true };
  }

  async disableMFA(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.mfaEnabled = false;
      user.mfaSecret = '';
      await this.userRepository.save(user);
    }
    return { mfaEnabled: false };
  }

  // API Keys Management
  generateApiKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  createApiKey(userId: string, name: string): ApiKey {
    const id = crypto.randomUUID();
    const key = this.generateApiKey();
    const apiKey: ApiKey = {
      id,
      name,
      key,
      createdAt: new Date(),
      isActive: true,
    };

    this.apiKeys.set(id, apiKey);
    return apiKey;
  }

  getApiKeys(userId: string): ApiKey[] {
    return Array.from(this.apiKeys.values()).map(key => ({
      ...key,
      key: key.key.substring(0, 8) + '...' + key.key.substring(key.key.length - 4),
    }));
  }

  revokeApiKey(keyId: string): boolean {
    const key = this.apiKeys.get(keyId);
    if (key) {
      key.isActive = false;
      return true;
    }
    return false;
  }

  // Security Alerts
  async getSecurityAlerts(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    const alerts: any[] = [];

    if (!user?.mfaEnabled) {
      alerts.push({
        id: '1',
        type: 'warning',
        title: 'MFA non activée',
        message: 'Activez l\'authentification à deux facteurs pour sécuriser votre compte',
        severity: 'high',
        createdAt: new Date(),
      });
    }

    if (user?.lastLogin && new Date().getTime() - new Date(user.lastLogin).getTime() > 30 * 24 * 60 * 60 * 1000) {
      alerts.push({
        id: '2',
        type: 'info',
        title: 'Connexion inactive',
        message: 'Vous n\'avez pas accédé à votre compte depuis plus de 30 jours',
        severity: 'low',
        createdAt: new Date(),
      });
    }

    return alerts;
  }

  // System Status
  async getSystemStatus() {
    return {
      status: 'operational',
      uptime: process.uptime(),
      timestamp: new Date(),
      services: {
        database: 'operational',
        authentication: 'operational',
        api: 'operational',
      },
    };
  }

  // Security Recommendations
  async getSecurityRecommendations(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    const recommendations: any[] = [];

    if (!user?.mfaEnabled) {
      recommendations.push({
        id: '1',
        priority: 'high',
        title: 'Activer MFA',
        description: 'L\'authentification à deux facteurs ajoute une couche de sécurité supplémentaire',
        action: 'Aller aux paramètres de sécurité',
      });
    }

    if (user?.role === 'super_admin' && !user?.mfaRequired) {
      recommendations.push({
        id: '2',
        priority: 'critical',
        title: 'MFA obligatoire pour Super Admin',
        description: 'Les super administrateurs doivent avoir MFA activé',
        action: 'Activer MFA maintenant',
      });
    }

    recommendations.push({
      id: '3',
      priority: 'medium',
      title: 'Vérifier les clés API',
      description: 'Révoquez les clés API inutilisées',
      action: 'Gérer les clés API',
    });

    return recommendations;
  }

  // Login History
  async getLoginHistory(userId: string, limit: number = 10) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    // Mock login history
    const history: any[] = [];
    for (let i = 0; i < limit; i++) {
      history.push({
        id: `login-${i}`,
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        status: 'success',
      });
    }

    return history;
  }
}
