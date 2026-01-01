import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface MFAStatus {
  mfaEnabled: boolean;
  mfaRequired: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed?: Date;
  isActive: boolean;
}

export interface SecurityAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
}

export interface SecurityRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action: string;
}

export interface LoginHistory {
  id: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
}

export const securityService = {
  async getMFAStatus(): Promise<MFAStatus> {
    try {
      const response = await axios.get(`${API_BASE_URL}/security/mfa-status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching MFA status:', error);
      throw error;
    }
  },

  async enableMFA() {
    try {
      const response = await axios.post(`${API_BASE_URL}/security/mfa/enable`);
      return response.data;
    } catch (error) {
      console.error('Error enabling MFA:', error);
      throw error;
    }
  },

  async disableMFA() {
    try {
      const response = await axios.post(`${API_BASE_URL}/security/mfa/disable`);
      return response.data;
    } catch (error) {
      console.error('Error disabling MFA:', error);
      throw error;
    }
  },

  async getApiKeys(): Promise<ApiKey[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/security/api-keys`);
      return response.data;
    } catch (error) {
      console.error('Error fetching API keys:', error);
      throw error;
    }
  },

  async createApiKey(name: string): Promise<ApiKey> {
    try {
      const response = await axios.post(`${API_BASE_URL}/security/api-keys`, { name });
      return response.data;
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
  },

  async revokeApiKey(keyId: string) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/security/api-keys/${keyId}`);
      return response.data;
    } catch (error) {
      console.error('Error revoking API key:', error);
      throw error;
    }
  },

  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/security/alerts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      throw error;
    }
  },

  async getSecurityRecommendations(): Promise<SecurityRecommendation[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/security/recommendations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching security recommendations:', error);
      throw error;
    }
  },

  async getSystemStatus() {
    try {
      const response = await axios.get(`${API_BASE_URL}/security/system-status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching system status:', error);
      throw error;
    }
  },

  async getLoginHistory(limit: number = 10): Promise<LoginHistory[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/security/login-history?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching login history:', error);
      throw error;
    }
  },
};
