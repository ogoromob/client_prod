import api from './api';

export interface PoolType {
  id: string;
  name: string;
  type: 'momentum' | 'swing' | 'altcoin' | 'dca' | 'community';
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  status: 'draft' | 'pending' | 'active' | 'settlement' | 'closed' | 'paused' | 'cancelled';
  targetAmount: number;
  currentAmount: number;
  minInvestment: number;
  maxInvestors: number;
  managerFeePercentage: number;
  startDate: string;
  endDate: string;
  tradingStrategy: string;
  totalPnL: number;
  pnlPercentage: number;
  investorCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePoolForm {
  name: string;
  type: 'momentum' | 'swing' | 'altcoin' | 'dca' | 'community';
  description: string;
  targetAmount: number;
  minInvestment: number;
  maxInvestors: number;
  managerFeePercentage: number;
  startDate: string;
  endDate: string;
  tradingStrategy: string;
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  exchanges?: string[];
  pairs?: string[];
  maxLeverage?: number;
  stopLoss?: number;
  takeProfit?: number;
}

export const poolTypePresets = {
  momentum: {
    name: 'Momentum BTC',
    description: 'Trading haute volatilité sur BTC avec leverage',
    riskLevel: 'very_high' as const,
    tradingStrategy: 'Momentum scalping sur BTC/USDT avec TP/SL serrés',
    pairs: ['BTC/USDT'],
    exchanges: ['Binance'],
    maxLeverage: 10,
    stopLoss: 2,
    takeProfit: 5,
  },
  swing: {
    name: 'Swing ETH',
    description: 'Trading swing sur ETH, risque modéré',
    riskLevel: 'medium' as const,
    tradingStrategy: 'Swing trading sur ETH/USDT, 4h-1d timeframe',
    pairs: ['ETH/USDT'],
    exchanges: ['Binance'],
    maxLeverage: 3,
    stopLoss: 3,
    takeProfit: 8,
  },
  altcoin: {
    name: 'Altcoin Beta',
    description: 'Altcoins haute croissance, très haut risque',
    riskLevel: 'very_high' as const,
    tradingStrategy: 'Sélection altcoins avec potentiel 10x+',
    pairs: ['SOL/USDT', 'AVAX/USDT', 'MATIC/USDT'],
    exchanges: ['Binance'],
    maxLeverage: 5,
    stopLoss: 5,
    takeProfit: 20,
  },
  dca: {
    name: 'Conservative DCA',
    description: 'Dollar Cost Averaging, risque faible',
    riskLevel: 'low' as const,
    tradingStrategy: 'DCA hebdomadaire sur BTC/ETH, pas de leverage',
    pairs: ['BTC/USDT', 'ETH/USDT'],
    exchanges: ['Binance'],
    maxLeverage: 1,
    stopLoss: 0,
    takeProfit: 0,
  },
  community: {
    name: 'Community Choice',
    description: 'Stratégie votée par la communauté',
    riskLevel: 'medium' as const,
    tradingStrategy: 'À définir par vote communautaire',
    pairs: [],
    exchanges: [],
    maxLeverage: 2,
    stopLoss: 0,
    takeProfit: 0,
  },
};

class AdminService {
  // Dashboard
  async getDashboard() {
    return api.get('/admin/dashboard');
  }

  // Pools
  async getPools() {
    return api.get('/admin/pools');
  }

  async getPoolById(id: string) {
    return api.get(`/admin/pools/${id}`);
  }

  async createPool(data: CreatePoolForm) {
    return api.post('/admin/pools', data);
  }

  async updatePool(id: string, data: Partial<CreatePoolForm>) {
    return api.put(`/admin/pools/${id}`, data);
  }

  async deletePool(id: string) {
    return api.delete(`/admin/pools/${id}`);
  }

  async publishPool(id: string) {
    return api.post(`/admin/pools/${id}/publish`);
  }

  async pausePool(id: string) {
    return api.post(`/admin/pools/${id}/pause`);
  }

  async resumePool(id: string) {
    return api.post(`/admin/pools/${id}/resume`);
  }

  async forceSettlement(id: string) {
    return api.post(`/admin/pools/${id}/force-settlement`);
  }

  async emergencyStop(id: string) {
    return api.post(`/admin/pools/${id}/emergency-stop`);
  }

  // Users
  async getUsers(filters?: any) {
    return api.get('/admin/users', { params: filters });
  }

  async getUserById(id: string) {
    return api.get(`/admin/users/${id}`);
  }

  async updateUserKycStatus(id: string, status: string) {
    return api.put(`/admin/users/${id}/kyc-status`, { status });
  }

  async blockUser(id: string) {
    return api.post(`/admin/users/${id}/block`);
  }

  async unblockUser(id: string) {
    return api.post(`/admin/users/${id}/unblock`);
  }

  // Withdrawals
  async getWithdrawals(filters?: any) {
    return api.get('/admin/withdrawals', { params: filters });
  }

  async approveWithdrawal(id: string) {
    return api.put(`/admin/withdrawals/${id}/approve`);
  }

  async rejectWithdrawal(id: string, reason: string) {
    return api.put(`/admin/withdrawals/${id}/reject`, { reason });
  }

  // Audit logs
  async getAuditLogs(filters?: any) {
    return api.get('/admin/audit-logs', { params: filters });
  }

  // Config
  async getConfig() {
    return api.get('/admin/config');
  }

  async updateConfig(config: any) {
    return api.put('/admin/config', config);
  }

  async triggerBackup() {
    return api.post('/admin/backup');
  }
}

export default new AdminService();
