import type { 
  Pool, 
  Investment, 
  Withdrawal,
  PoolStatus, 
  InvestmentStatus, 
  WithdrawalStatus,
  RiskLevel,
  User,
  PoolMetrics,
  Position,
  AdminDashboardMetrics,
  Alert
} from '../types';

// Users mockés
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'investor@example.com',
    role: 'investor',
    mfaEnabled: false,
    createdAt: '2024-01-15T10:00:00Z',
    lastLogin: '2024-12-02T08:30:00Z',
    kycStatus: 'approved',
  },
  {
    id: 'admin-1',
    email: 'sesshomaru@admin.com',
    role: 'admin',
    mfaEnabled: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-12-02T09:00:00Z',
    kycStatus: 'approved',
  },
];

// Pools mockés
export const mockPools: Pool[] = [
  {
    id: 'pool-1',
    name: 'BTC Momentum Strategy',
    description: 'Stratégie momentum sur Bitcoin avec analyse technique avancée',
    status: 'active' as PoolStatus,
    managerId: 'manager-1',
    managerName: 'Jean Trader',
    
    targetAmount: 150000,
    currentAmount: 125000,
    totalInvested: 125000,
    totalPnL: 10250,
    managerFeePercentage: 15,
    
    startDate: '2024-11-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    
    minInvestment: 500,
    maxInvestors: 50,
    currentInvestors: 24,
    tradingStrategy: 'Momentum + RSI + MACD',
    riskLevel: 'medium' as RiskLevel,
    
    metadata: {
      exchanges: ['Binance', 'Bybit'],
      pairs: ['BTC/USDT'],
      strategyId: 'momentum_btc_v2',
      maxLeverage: 3,
      stopLoss: 5,
      takeProfit: 15,
    },
    
    createdAt: '2024-10-15T10:00:00Z',
    updatedAt: '2024-12-02T09:00:00Z',
  },
  {
    id: 'pool-2',
    name: 'ETH Swing Trading',
    description: 'Trading swing sur Ethereum avec gestion de risque stricte',
    status: 'active' as PoolStatus,
    managerId: 'manager-1',
    managerName: 'Jean Trader',
    
    targetAmount: 100000,
    currentAmount: 85000,
    totalInvested: 85000,
    totalPnL: 12750,
    managerFeePercentage: 15,
    
    startDate: '2024-10-15T00:00:00Z',
    endDate: '2024-12-15T23:59:59Z',
    
    minInvestment: 300,
    maxInvestors: 40,
    currentInvestors: 18,
    tradingStrategy: 'Swing Trading',
    riskLevel: 'low' as RiskLevel,
    
    metadata: {
      exchanges: ['Binance'],
      pairs: ['ETH/USDT', 'ETH/BTC'],
      strategyId: 'swing_eth_v1',
      maxLeverage: 2,
      stopLoss: 3,
      takeProfit: 10,
    },
    
    createdAt: '2024-09-20T10:00:00Z',
    updatedAt: '2024-12-02T08:45:00Z',
  },
  {
    id: 'pool-3',
    name: 'Altcoin Beta Fund',
    description: 'Portfolio diversifié d\'altcoins à fort potentiel',
    status: 'pending' as PoolStatus,
    managerId: 'manager-2',
    managerName: 'Marie Crypto',
    
    targetAmount: 50000,
    currentAmount: 12500,
    totalInvested: 12500,
    totalPnL: 0,
    managerFeePercentage: 15,
    
    minInvestment: 200,
    maxInvestors: 30,
    currentInvestors: 3,
    tradingStrategy: 'Portfolio Diversification',
    riskLevel: 'high' as RiskLevel,
    
    metadata: {
      exchanges: ['Binance', 'KuCoin'],
      pairs: ['SOL/USDT', 'AVAX/USDT', 'MATIC/USDT'],
      strategyId: 'altcoin_portfolio_v1',
      maxLeverage: 1,
    },
    
    createdAt: '2024-11-25T10:00:00Z',
    updatedAt: '2024-12-01T15:30:00Z',
  },
  {
    id: 'pool-4',
    name: 'Conservative DCA Strategy',
    description: 'Stratégie DCA (Dollar Cost Averaging) sur BTC et ETH',
    status: 'closed' as PoolStatus,
    managerId: 'manager-1',
    managerName: 'Jean Trader',
    
    targetAmount: 80000,
    currentAmount: 80000,
    totalInvested: 80000,
    totalPnL: 9600,
    managerFeePercentage: 15,
    
    startDate: '2024-08-01T00:00:00Z',
    endDate: '2024-10-31T23:59:59Z',
    settlementDate: '2024-11-02T10:00:00Z',
    
    minInvestment: 500,
    maxInvestors: 25,
    currentInvestors: 16,
    tradingStrategy: 'DCA + Hold',
    riskLevel: 'low' as RiskLevel,
    
    metadata: {
      exchanges: ['Binance'],
      pairs: ['BTC/USDT', 'ETH/USDT'],
      strategyId: 'dca_conservative_v1',
    },
    
    createdAt: '2024-07-15T10:00:00Z',
    updatedAt: '2024-11-02T10:30:00Z',
  },
];

// Investments mockés
export const mockInvestments: Investment[] = [
  {
    id: 'inv-1',
    poolId: 'pool-1',
    poolName: 'BTC Momentum Strategy',
    userId: '1',
    
    initialAmount: 5000,
    currentValue: 5410,
    pnl: 410,
    pnlPercentage: 8.2,
    
    status: 'locked' as InvestmentStatus,
    
    investedAt: '2024-11-05T14:30:00Z',
    lockedUntil: '2024-12-31T23:59:59Z',
    
    paymentMethod: 'bank_transfer',
    
    createdAt: '2024-11-05T14:30:00Z',
    updatedAt: '2024-12-02T09:00:00Z',
  },
  {
    id: 'inv-2',
    poolId: 'pool-2',
    poolName: 'ETH Swing Trading',
    userId: '1',
    
    initialAmount: 3000,
    currentValue: 3450,
    pnl: 450,
    pnlPercentage: 15.0,
    
    status: 'locked' as InvestmentStatus,
    
    investedAt: '2024-10-20T10:00:00Z',
    lockedUntil: '2024-12-15T23:59:59Z',
    
    paymentMethod: 'crypto',
    transactionHash: '0x1234567890abcdef...',
    
    createdAt: '2024-10-20T10:00:00Z',
    updatedAt: '2024-12-02T08:45:00Z',
  },
  {
    id: 'inv-3',
    poolId: 'pool-4',
    poolName: 'Conservative DCA Strategy',
    userId: '1',
    
    initialAmount: 2500,
    currentValue: 2800,
    pnl: 300,
    pnlPercentage: 12.0,
    
    status: 'withdrawable' as InvestmentStatus,
    
    investedAt: '2024-08-10T09:00:00Z',
    
    paymentMethod: 'bank_transfer',
    
    createdAt: '2024-08-10T09:00:00Z',
    updatedAt: '2024-11-02T10:30:00Z',
  },
];

// Withdrawals mockés
export const mockWithdrawals: Withdrawal[] = [
  {
    id: 'wd-1',
    investmentId: 'inv-3',
    userId: '1',
    
    amount: 2800,
    managerFee: 45,
    netAmount: 2755,
    
    status: 'pending' as WithdrawalStatus,
    
    requestedAt: '2024-12-02T08:00:00Z',
    
    withdrawalMethod: 'bank_transfer',
    destinationAddress: 'FR76 1234 5678 9012 3456 7890 123',
  },
];

// Positions mockées
export const mockPositions: Position[] = [
  {
    id: 'pos-1',
    poolId: 'pool-1',
    exchange: 'Binance',
    pair: 'BTC/USDT',
    side: 'long',
    entryPrice: 42500,
    currentPrice: 43200,
    quantity: 2.5,
    leverage: 3,
    pnl: 5250,
    pnlPercentage: 4.94,
    openedAt: '2024-12-01T15:30:00Z',
  },
  {
    id: 'pos-2',
    poolId: 'pool-2',
    exchange: 'Binance',
    pair: 'ETH/USDT',
    side: 'long',
    entryPrice: 2250,
    currentPrice: 2310,
    quantity: 25,
    leverage: 2,
    pnl: 3000,
    pnlPercentage: 5.33,
    openedAt: '2024-12-01T10:00:00Z',
  },
];

// Métriques de pool
export const mockPoolMetrics: Record<string, PoolMetrics> = {
  'pool-1': {
    poolId: 'pool-1',
    timestamp: new Date().toISOString(),
    totalValue: 135250,
    pnl: 10250,
    pnlPercentage: 8.2,
    openPositions: 1,
    totalTrades: 45,
    winRate: 62.5,
    drawdown: 8.3,
    sharpeRatio: 1.85,
    volatility: 15.2,
  },
  'pool-2': {
    poolId: 'pool-2',
    timestamp: new Date().toISOString(),
    totalValue: 97750,
    pnl: 12750,
    pnlPercentage: 15.0,
    openPositions: 1,
    totalTrades: 32,
    winRate: 71.9,
    drawdown: 5.1,
    sharpeRatio: 2.15,
    volatility: 11.8,
  },
};

// Admin Dashboard Metrics
export const mockAdminMetrics: AdminDashboardMetrics = {
  totalAUM: 335250,
  totalPools: 4,
  activePools: 2,
  totalInvestors: 45,
  totalPnL: 32600,
  pendingWithdrawals: 1,
  pendingKYC: 3,
  recentAlerts: [
    {
      id: 'alert-1',
      type: 'warning',
      title: 'Retrait en attente',
      message: 'Un retrait de 2,755€ est en attente de validation',
      timestamp: '2024-12-02T08:00:00Z',
      read: false,
    },
    {
      id: 'alert-2',
      type: 'info',
      title: 'Nouveau pool créé',
      message: 'Altcoin Beta Fund créé et en phase de collecte',
      timestamp: '2024-11-25T10:00:00Z',
      read: false,
    },
  ],
};

// Historique de performance
export const mockPerformanceHistory = (_poolId: string) => {
  const now = new Date();
  const history = [];
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Simuler une croissance avec volatilité
    const baseValue = 100000;
    const trend = (30 - i) * 300; // Tendance haussière
    const volatility = Math.sin(i) * 2000; // Volatilité
    const value = baseValue + trend + volatility;
    const pnl = value - baseValue;
    const pnlPercentage = (pnl / baseValue) * 100;
    
    history.push({
      timestamp: date.toISOString(),
      value,
      pnl,
      pnlPercentage,
    });
  }
  
  return history;
};
