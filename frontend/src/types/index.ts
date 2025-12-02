// User & Authentication Types
export interface User {
  id: string;
  email: string;
  role: 'investor' | 'admin' | 'manager';
  mfaEnabled: boolean;
  createdAt: string;
  lastLogin?: string;
  kycStatus?: 'pending' | 'approved' | 'rejected';
  metadata?: Record<string, any>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
}

// Pool Types
export type PoolStatus = 'draft' | 'pending' | 'active' | 'settlement' | 'closed' | 'cancelled' | 'archived';

export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high';

export interface Pool {
  id: string;
  name: string;
  description?: string;
  status: PoolStatus;
  managerId: string;
  managerName?: string;
  
  // Montants
  targetAmount: number;
  currentAmount: number;
  totalInvested: number;
  totalPnL: number;
  managerFeePercentage: number;
  
  // Dates
  startDate?: string;
  endDate?: string;
  settlementDate?: string;
  
  // Configuration
  minInvestment: number;
  maxInvestors: number;
  currentInvestors?: number;
  tradingStrategy?: string;
  riskLevel: RiskLevel;
  
  // Metadata
  metadata?: {
    exchanges?: string[];
    pairs?: string[];
    strategyId?: string;
    maxLeverage?: number;
    stopLoss?: number;
    takeProfit?: number;
  };
  
  createdAt: string;
  updatedAt: string;
}

// Investment Types
export type InvestmentStatus = 'pending' | 'confirmed' | 'locked' | 'withdrawable' | 'withdrawal_pending' | 'withdrawn';

export interface Investment {
  id: string;
  poolId: string;
  poolName?: string;
  userId: string;
  
  // Montants
  initialAmount: number;
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
  
  // Statut
  status: InvestmentStatus;
  
  // Dates
  investedAt: string;
  lockedUntil?: string;
  withdrawnAt?: string;
  
  // Payment
  paymentMethod?: string;
  transactionHash?: string;
  metadata?: Record<string, any>;
  
  createdAt: string;
  updatedAt: string;
}

// Withdrawal Types
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Withdrawal {
  id: string;
  investmentId: string;
  userId: string;
  
  amount: number;
  managerFee: number;
  netAmount: number;
  
  status: WithdrawalStatus;
  
  requestedAt: string;
  processedAt?: string;
  
  withdrawalMethod?: string;
  destinationAddress?: string;
  transactionHash?: string;
  
  rejectionReason?: string;
  metadata?: Record<string, any>;
}

// Performance & Metrics Types
export interface PoolMetrics {
  poolId: string;
  timestamp: string;
  
  totalValue: number;
  pnl: number;
  pnlPercentage: number;
  
  openPositions: number;
  totalTrades: number;
  winRate?: number;
  
  drawdown?: number;
  sharpeRatio?: number;
  volatility?: number;
}

export interface PerformanceHistory {
  timestamp: string;
  value: number;
  pnl: number;
  pnlPercentage: number;
}

export interface Position {
  id: string;
  poolId: string;
  exchange: string;
  pair: string;
  side: 'long' | 'short';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  leverage?: number;
  pnl: number;
  pnlPercentage: number;
  openedAt: string;
}

// Admin Types
export interface AdminDashboardMetrics {
  totalAUM: number;
  totalPools: number;
  activePools: number;
  totalInvestors: number;
  totalPnL: number;
  
  pendingWithdrawals: number;
  pendingKYC: number;
  
  recentAlerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'investment' | 'withdrawal' | 'pool' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// WebSocket Types
export type WSEventType = 'pool:update' | 'metrics:update' | 'position:update' | 'investment:update' | 'withdrawal:update' | 'notification';

export interface WSMessage<T = any> {
  event: WSEventType;
  data: T;
  timestamp: string;
}

// Form Types
export interface InvestmentFormData {
  poolId: string;
  amount: number;
  paymentMethod: 'bank_transfer' | 'crypto' | 'card';
  termsAccepted: boolean;
}

export interface WithdrawalFormData {
  investmentId: string;
  amount: number;
  withdrawalMethod: 'bank_transfer' | 'crypto';
  destinationAddress: string;
  mfaCode?: string;
}

export interface PoolFormData {
  name: string;
  description?: string;
  targetAmount: number;
  minInvestment: number;
  maxInvestors: number;
  managerFeePercentage: number;
  startDate?: string;
  endDate?: string;
  tradingStrategy?: string;
  riskLevel: RiskLevel;
  exchanges?: string[];
  pairs?: string[];
  maxLeverage?: number;
  stopLoss?: number;
  takeProfit?: number;
}

// Utility Types
export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

export interface FilterConfig {
  status?: PoolStatus[] | InvestmentStatus[] | WithdrawalStatus[];
  riskLevel?: RiskLevel[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
