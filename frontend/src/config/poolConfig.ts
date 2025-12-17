// src/config/poolConfig.ts

export const TRADING_PAIRS = {
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: '₿',
    color: '#F7931A'
  },
  DOGE: {
    symbol: 'DOGE',
    name: 'Dogecoin',
    icon: 'Ð',
    color: '#C2A633'
  },
  COMMUNITY: {
    symbol: 'COMM',
    name: 'Community Coin',
    icon: '🗳️',
    color: '#6366F1' // Will be dynamic
  }
} as const;

export const FEES = {
  DEPOSIT: 0,
  WITHDRAWAL: 0.10, // 10% à la fin de la session
  MINIMUM_DEPOSIT: 50 // En USD
} as const;

export const POOL_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  CLOSED: 'closed',
  SETTLING: 'settling'
} as const;

// Types TypeScript
export interface TradingPool {
  id: string;
  name: string;
  tradingPair: keyof typeof TRADING_PAIRS;
  status: keyof typeof POOL_STATUS;
  startDate: Date;
  endDate: Date;
  totalDeposits: number;
  participantsCount: number;
  currentBalance: number;
  performance: number; // Percentage
  botStrategy: string;
  minimumDeposit: number;
  isLocked: boolean;
}

export interface UserInvestment {
  id: string;
  poolId: string;
  amount: number;
  depositDate: Date;
  currentValue: number;
  profit: number;
  profitPercentage: number;
  status: 'active' | 'completed' | 'pending';
}

export interface PoolMessage {
  id: string;
  poolId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  isAdmin: boolean;
}

export interface AdminStats {
  totalPools: number;
  activePools: number;
  totalUsers: number;
  totalVolume: number;
  averageReturn: number;
  pendingWithdrawals: number;
}

// Règles de validation
export const VALIDATION_RULES = {
  MIN_SESSION_DURATION: 7, // jours
  MAX_SESSION_DURATION: 90, // jours
  MIN_DEPOSIT: 50,
  MAX_DEPOSIT_PER_USER: 10000,
  COUNTDOWN_WARNING_HOURS: 24
} as const;

// Messages d'erreur standardisés
export const ERROR_MESSAGES = {
  POOL_LOCKED: 'Ce pool est verrouillé. Vous ne pouvez pas effectuer de dépôt.',
  INSUFFICIENT_FUNDS: 'Solde insuffisant pour effectuer ce dépôt.',
  MIN_DEPOSIT: `Le dépôt minimum est de ${VALIDATION_RULES.MIN_DEPOSIT} USD.`,
  SESSION_ENDED: 'La session est terminée. Impossible de déposer.',
  WITHDRAWAL_LOCKED: 'Les retraits ne sont pas autorisés avant la fin de la session.',
  TERMS_NOT_ACCEPTED: 'Vous devez accepter les conditions générales et la politique de confidentialité.'
};
