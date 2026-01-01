import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  targetId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  createdAt: Date;
}

export interface AuditResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const auditService = {
  async getLogs(page: number = 1, limit: number = 20, action?: string, userId?: string): Promise<AuditResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (action) params.append('action', action);
      if (userId) params.append('userId', userId);

      const response = await axios.get(`${API_BASE_URL}/audit/logs?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  },

  async getRecentLogs(limit: number = 10): Promise<AuditLog[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/audit/logs/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent logs:', error);
      throw error;
    }
  },

  async getStatistics() {
    try {
      const response = await axios.get(`${API_BASE_URL}/audit/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit statistics:', error);
      throw error;
    }
  },

  async getUserLogs(userId: string, page: number = 1, limit: number = 20): Promise<AuditResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/audit/user-logs?userId=${userId}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user logs:', error);
      throw error;
    }
  },
};
