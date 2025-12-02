import { api } from '../lib/axios';
import type { 
  Pool, 
  Investment, 
  PoolMetrics, 
  Position, 
  PerformanceHistory,
  InvestmentFormData,
  ApiResponse,
  PaginatedResponse
} from '../types';
import { 
  mockPools, 
  mockInvestments, 
  mockPositions, 
  mockPoolMetrics,
  mockPerformanceHistory 
} from '../mocks/data';

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

export const poolService = {
  // Get all pools
  async getPools(filters?: any): Promise<Pool[]> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let pools = [...mockPools];
      
      // Apply filters if any
      if (filters?.status) {
        pools = pools.filter(p => filters.status.includes(p.status));
      }
      
      if (filters?.riskLevel) {
        pools = pools.filter(p => filters.riskLevel.includes(p.riskLevel));
      }
      
      return pools;
    }
    
    const response = await api.get<ApiResponse<Pool[]>>('/pools', { params: filters });
    return response.data!;
  },
  
  // Get pool by ID
  async getPoolById(id: string): Promise<Pool> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const pool = mockPools.find(p => p.id === id);
      if (!pool) throw new Error('Pool not found');
      
      return pool;
    }
    
    const response = await api.get<ApiResponse<Pool>>(`/pools/${id}`);
    return response.data!;
  },
  
  // Get pool metrics
  async getPoolMetrics(poolId: string): Promise<PoolMetrics> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const metrics = mockPoolMetrics[poolId];
      if (!metrics) throw new Error('Metrics not found');
      
      return metrics;
    }
    
    const response = await api.get<ApiResponse<PoolMetrics>>(`/pools/${poolId}/performance`);
    return response.data!;
  },
  
  // Get pool performance history
  async getPoolPerformance(poolId: string): Promise<PerformanceHistory[]> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockPerformanceHistory(poolId);
    }
    
    const response = await api.get<ApiResponse<PerformanceHistory[]>>(`/pools/${poolId}/history`);
    return response.data!;
  },
  
  // Get pool positions
  async getPoolPositions(poolId: string): Promise<Position[]> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockPositions.filter(p => p.poolId === poolId);
    }
    
    const response = await api.get<ApiResponse<Position[]>>(`/pools/${poolId}/positions`);
    return response.data!;
  },
  
  // Get pool investors (admin only)
  async getPoolInvestors(poolId: string): Promise<Investment[]> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockInvestments.filter(i => i.poolId === poolId);
    }
    
    const response = await api.get<ApiResponse<Investment[]>>(`/pools/${poolId}/investors`);
    return response.data!;
  },
};

export const investmentService = {
  // Get my investments
  async getMyInvestments(): Promise<Investment[]> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockInvestments;
    }
    
    const response = await api.get<ApiResponse<Investment[]>>('/investments');
    return response.data!;
  },
  
  // Get investment by ID
  async getInvestmentById(id: string): Promise<Investment> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const investment = mockInvestments.find(i => i.id === id);
      if (!investment) throw new Error('Investment not found');
      
      return investment;
    }
    
    const response = await api.get<ApiResponse<Investment>>(`/investments/${id}`);
    return response.data!;
  },
  
  // Create investment
  async createInvestment(data: InvestmentFormData): Promise<Investment> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pool = mockPools.find(p => p.id === data.poolId);
      if (!pool) throw new Error('Pool not found');
      
      const newInvestment: Investment = {
        id: `inv-${Date.now()}`,
        poolId: data.poolId,
        poolName: pool.name,
        userId: '1',
        initialAmount: data.amount,
        currentValue: data.amount,
        pnl: 0,
        pnlPercentage: 0,
        status: 'pending' as any,
        investedAt: new Date().toISOString(),
        paymentMethod: data.paymentMethod,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return newInvestment;
    }
    
    const response = await api.post<ApiResponse<Investment>>('/investments', data);
    return response.data!;
  },
  
  // Get investment history
  async getInvestmentHistory(investmentId: string): Promise<PerformanceHistory[]> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const investment = mockInvestments.find(i => i.id === investmentId);
      if (!investment) throw new Error('Investment not found');
      
      // Generate mock history based on investment
      const history: PerformanceHistory[] = [];
      const now = new Date();
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const progress = (30 - i) / 30;
        const value = investment.initialAmount + (investment.pnl * progress);
        const pnl = value - investment.initialAmount;
        const pnlPercentage = (pnl / investment.initialAmount) * 100;
        
        history.push({
          timestamp: date.toISOString(),
          value,
          pnl,
          pnlPercentage,
        });
      }
      
      return history;
    }
    
    const response = await api.get<ApiResponse<PerformanceHistory[]>>(`/investments/${investmentId}/history`);
    return response.data!;
  },
};
