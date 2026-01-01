import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface SystemSettings {
  fees: {
    platformFee: number;
    withdrawalFee: number;
    managementFee: number;
  };
  limits: {
    minInvestment: number;
    maxInvestment: number;
    dailyWithdrawalLimit: number;
  };
  features: {
    autoReinvestment: boolean;
    mfaRequired: boolean;
    kycRequired: boolean;
  };
}

export interface Statistics {
  totalUsers: number;
  activeInvestments: number;
  totalInvested: number;
  totalWithdrawn: number;
  averageReturn: number;
  platformUptime: number;
}

export interface HealthStatus {
  database: string;
  api: string;
  cache: string;
  queue: string;
  timestamp: Date;
}

export const settingsService = {
  async getSettings(): Promise<SystemSettings> {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      const response = await axios.put(`${API_BASE_URL}/settings`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  async updateFees(fees: Partial<SystemSettings['fees']>): Promise<SystemSettings> {
    try {
      const response = await axios.put(`${API_BASE_URL}/settings/fees`, fees);
      return response.data;
    } catch (error) {
      console.error('Error updating fees:', error);
      throw error;
    }
  },

  async updateLimits(limits: Partial<SystemSettings['limits']>): Promise<SystemSettings> {
    try {
      const response = await axios.put(`${API_BASE_URL}/settings/limits`, limits);
      return response.data;
    } catch (error) {
      console.error('Error updating limits:', error);
      throw error;
    }
  },

  async updateFeatures(features: Partial<SystemSettings['features']>): Promise<SystemSettings> {
    try {
      const response = await axios.put(`${API_BASE_URL}/settings/features`, features);
      return response.data;
    } catch (error) {
      console.error('Error updating features:', error);
      throw error;
    }
  },

  async getStatistics(): Promise<Statistics> {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  async getHealthStatus(): Promise<HealthStatus> {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings/health`);
      return response.data;
    } catch (error) {
      console.error('Error fetching health status:', error);
      throw error;
    }
  },
};
