// src/hooks/useDashboard.ts
import { useState, useEffect } from 'react';
import { poolService } from '@/services/poolService';
import type { TradingPool } from '@/config/poolConfig';

interface DashboardStats {
  totalBalance: number;
  pnlPercent: number;
  pnlAmount: number;
  activeInvestments: number;
  totalInvested: number;
}

interface UseDashboardReturn {
  stats: DashboardStats | null;
  activePools: TradingPool[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activePools, setActivePools] = useState<TradingPool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch active pools (returns TradingPool[] in mock mode)
      const pools = await poolService.getPools({ status: 'ACTIVE', limit: 6 }) as unknown as TradingPool[];
      setActivePools(pools);

      // Calculate stats (in real app, this would come from backend)
      const totalBalance = pools.reduce((sum, pool) => sum + (pool.currentBalance || 0), 0);
      const totalInvested = pools.reduce((sum, pool) => sum + (pool.totalDeposits || 0), 0);
      const pnlAmount = totalBalance - totalInvested;
      const pnlPercent = totalInvested > 0 ? (pnlAmount / totalInvested) * 100 : 0;

      setStats({
        totalBalance,
        pnlPercent,
        pnlAmount,
        activeInvestments: pools.length,
        totalInvested,
      });
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refresh = async () => {
    await fetchDashboardData();
  };

  return {
    stats,
    activePools,
    isLoading,
    error,
    refresh,
  };
}
