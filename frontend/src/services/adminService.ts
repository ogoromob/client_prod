import { api } from '../lib/axios';
import type { 
  Pool,
  User,
  AdminDashboardMetrics,
  PoolFormData,
  ApiResponse 
} from '../types';
import { mockAdminMetrics, mockPools, mockUsers } from '../mocks/data';

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

export const adminService = {
  // Get dashboard metrics
  async getDashboardMetrics(): Promise<AdminDashboardMetrics> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockAdminMetrics;
    }
    
    const response = await api.get<ApiResponse<AdminDashboardMetrics>>('/admin/dashboard');
    return response.data!;
  },
  
  // Pool Management
  async createPool(data: PoolFormData): Promise<Pool> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPool: Pool = {
        id: `pool-${Date.now()}`,
        name: data.name,
        description: data.description,
        status: 'draft' as any,
        managerId: 'admin-1',
        managerName: 'Admin',
        targetAmount: data.targetAmount,
        currentAmount: 0,
        totalInvested: 0,
        totalPnL: 0,
        managerFeePercentage: data.managerFeePercentage,
        startDate: data.startDate,
        endDate: data.endDate,
        minInvestment: data.minInvestment,
        maxInvestors: data.maxInvestors,
        currentInvestors: 0,
        tradingStrategy: data.tradingStrategy,
        riskLevel: data.riskLevel,
        metadata: {
          exchanges: data.exchanges,
          pairs: data.pairs,
          maxLeverage: data.maxLeverage,
          stopLoss: data.stopLoss,
          takeProfit: data.takeProfit,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return newPool;
    }
    
    const response = await api.post<ApiResponse<Pool>>('/admin/pools', data);
    return response.data!;
  },
  
  async updatePool(poolId: string, data: Partial<PoolFormData>): Promise<Pool> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const pool = mockPools.find(p => p.id === poolId);
      if (!pool) throw new Error('Pool not found');
      
      return {
        ...pool,
        ...data,
        updatedAt: new Date().toISOString(),
      };
    }
    
    const response = await api.put<ApiResponse<Pool>>(`/admin/pools/${poolId}`, data);
    return response.data!;
  },
  
  async deletePool(poolId: string): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }
    
    await api.delete(`/admin/pools/${poolId}`);
  },
  
  async publishPool(poolId: string): Promise<Pool> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const pool = mockPools.find(p => p.id === poolId);
      if (!pool) throw new Error('Pool not found');
      
      return {
        ...pool,
        status: 'pending' as any,
        updatedAt: new Date().toISOString(),
      };
    }
    
    const response = await api.post<ApiResponse<Pool>>(`/admin/pools/${poolId}/publish`);
    return response.data!;
  },
  
  async pausePool(poolId: string): Promise<Pool> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const pool = mockPools.find(p => p.id === poolId);
      if (!pool) throw new Error('Pool not found');
      
      return {
        ...pool,
        updatedAt: new Date().toISOString(),
      };
    }
    
    const response = await api.post<ApiResponse<Pool>>(`/admin/pools/${poolId}/pause`);
    return response.data!;
  },
  
  async resumePool(poolId: string): Promise<Pool> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const pool = mockPools.find(p => p.id === poolId);
      if (!pool) throw new Error('Pool not found');
      
      return {
        ...pool,
        updatedAt: new Date().toISOString(),
      };
    }
    
    const response = await api.post<ApiResponse<Pool>>(`/admin/pools/${poolId}/resume`);
    return response.data!;
  },
  
  async forceSettlement(poolId: string): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return;
    }
    
    await api.post(`/admin/pools/${poolId}/force-settlement`);
  },
  
  async emergencyStop(poolId: string): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return;
    }
    
    await api.post(`/admin/pools/${poolId}/emergency-stop`);
  },
  
  // User Management
  async getAllUsers(filters?: any): Promise<User[]> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockUsers;
    }
    
    const response = await api.get<ApiResponse<User[]>>('/admin/users', { params: filters });
    return response.data!;
  },
  
  async getUserById(userId: string): Promise<User> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const user = mockUsers.find(u => u.id === userId);
      if (!user) throw new Error('User not found');
      
      return user;
    }
    
    const response = await api.get<ApiResponse<User>>(`/admin/users/${userId}`);
    return response.data!;
  },
  
  async updateUserKycStatus(userId: string, status: 'pending' | 'approved' | 'rejected'): Promise<User> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const user = mockUsers.find(u => u.id === userId);
      if (!user) throw new Error('User not found');
      
      return {
        ...user,
        kycStatus: status,
      };
    }
    
    const response = await api.put<ApiResponse<User>>(`/admin/users/${userId}/kyc-status`, { status });
    return response.data!;
  },
  
  async blockUser(userId: string): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 600));
      return;
    }
    
    await api.post(`/admin/users/${userId}/block`);
  },
  
  async unblockUser(userId: string): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 600));
      return;
    }
    
    await api.post(`/admin/users/${userId}/unblock`);
  },
  
  // Audit Logs
  async getAuditLogs(filters?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    action?: string;
  }): Promise<any[]> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 700));
      return [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          userId: '1',
          action: 'CREATE_INVESTMENT',
          resourceType: 'investment',
          resourceId: 'inv-1',
          ipAddress: '192.168.1.1',
          metadata: {},
        },
      ];
    }
    
    const response = await api.get<ApiResponse<any[]>>('/admin/audit-logs', { params: filters });
    return response.data!;
  },
  
  // Configuration
  async getConfig(): Promise<any> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        minInvestment: 100,
        maxInvestment: 100000,
        defaultManagerFee: 15,
        supportedExchanges: ['Binance', 'Bybit', 'KuCoin'],
        supportedPaymentMethods: ['bank_transfer', 'crypto', 'card'],
      };
    }
    
    const response = await api.get<ApiResponse<any>>('/admin/config');
    return response.data!;
  },
  
  async updateConfig(config: any): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return;
    }
    
    await api.put('/admin/config', config);
  },
  
  // Backup
  async triggerBackup(): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return;
    }
    
    await api.post('/admin/backup');
  },
};
