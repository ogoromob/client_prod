/**
 * Application Constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:3000',
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 90000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000,
} as const;

// Mock Mode
export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

// Cache TTL (Time To Live) in milliseconds
export const CACHE_TTL = {
  POOLS: 30000, // 30 seconds
  INVESTMENTS: 60000, // 1 minute
  USER: 300000, // 5 minutes
  STATIC: 3600000, // 1 hour
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  INFINITE_SCROLL_THRESHOLD: 100,
} as const;

// Trading Pool Configuration
export const POOL_CONFIG = {
  MIN_INVESTMENT: 100, // Minimum investment amount in USD
  MAX_INVESTMENT: 1000000, // Maximum investment amount in USD
  WITHDRAWAL_FEE: 0.15, // 15% fee
  MFA_THRESHOLD: 1000, // MFA required for withdrawals > 1000 USD
  LOCK_PERIOD: 30, // Days
} as const;

// WebSocket Events
export const WS_EVENTS = {
  POOL_UPDATE: 'pool:update',
  POSITION_UPDATE: 'position:update',
  TRADE_EXECUTED: 'trade:executed',
  WITHDRAWAL_APPROVED: 'withdrawal:approved',
  WITHDRAWAL_REJECTED: 'withdrawal:rejected',
} as const;

// Status Types
export const STATUS = {
  POOL: {
    PENDING: 'pending',
    ACTIVE: 'active',
    SETTLEMENT: 'settlement',
    CLOSED: 'closed',
  },
  INVESTMENT: {
    LOCKED: 'locked',
    WITHDRAWABLE: 'withdrawable',
    WITHDRAWN: 'withdrawn',
  },
  WITHDRAWAL: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
  },
} as const;

// Risk Levels
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  VERY_HIGH: 'very_high',
} as const;

export const RISK_LEVEL_COLORS = {
  [RISK_LEVELS.LOW]: 'text-green-400',
  [RISK_LEVELS.MEDIUM]: 'text-yellow-400',
  [RISK_LEVELS.HIGH]: 'text-orange-400',
  [RISK_LEVELS.VERY_HIGH]: 'text-red-400',
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  WITH_TIME: 'MMM d, yyyy HH:mm',
  TIME_ONLY: 'HH:mm:ss',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

// Currency
export const CURRENCY = {
  DEFAULT: 'USD',
  SYMBOL: '$',
  DECIMALS: 2,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  PREFERENCES: 'preferences',
} as const;

// Route Paths
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Investor
  DASHBOARD: '/dashboard',
  POOLS: '/pools',
  POOL_DETAIL: '/pools/:id',
  INVESTMENTS: '/investments',
  INVESTMENT_DETAIL: '/investments/:id',
  
  // Admin
  ADMIN: '/admin',
  ADMIN_POOLS: '/admin/pools',
  ADMIN_USERS: '/admin/users',
  ADMIN_WITHDRAWALS: '/admin/withdrawals',
} as const;

// Performance Thresholds
export const PERFORMANCE = {
  SLOW_REQUEST_THRESHOLD: 1000, // ms
  SLOW_RENDER_THRESHOLD: 100, // ms
  MAX_BUNDLE_SIZE: 500, // KB
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_WEBSOCKET: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: false,
  ENABLE_DARK_MODE_ONLY: true,
} as const;

// Trading Pool Pro 2025 Brand Colors
export const BRAND_COLORS = {
  BG_MAIN: '#0a0e17',
  BG_CARD: '#111827',
  ACCENT: '#00f5a0',
  ACCENT_SECONDARY: '#00bcd4',
  DANGER: '#ff3366',
  TEXT_PRIMARY: '#e2e8f0',
  TEXT_SECONDARY: '#94a3b8',
  BORDER: '#1e293b',
} as const;
