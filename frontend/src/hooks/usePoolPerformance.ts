import { useQuery } from '@tanstack/react-query';
import { poolService } from '../services/poolService';
import { useWebSocket } from './useWebSocket';
import { useEffect, useState } from 'react';

interface PoolPerformanceData {
  totalValue: number;
  pnl: number;
  pnlPercentage: number;
  lastUpdate: Date;
}

export function usePoolPerformance(poolId: string) {
  const [liveData, setLiveData] = useState<PoolPerformanceData | null>(null);

  // Fetch initial data
  const { data: poolData, isLoading, error, refetch } = useQuery({
    queryKey: ['pool-performance', poolId],
    queryFn: () => poolService.getPoolById(poolId),
    refetchInterval: 30000, // Fallback: refetch every 30 seconds
  });

  // Subscribe to WebSocket updates
  const { isConnected, lastMessage } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'pool:update' && message.poolId === poolId) {
        setLiveData({
          totalValue: message.totalValue,
          pnl: message.pnl,
          pnlPercentage: message.pnlPercentage,
          lastUpdate: new Date(message.timestamp),
        });
      }
    },
  });

  useEffect(() => {
    if (poolData && !liveData) {
      setLiveData({
        totalValue: poolData.currentAmount,
        pnl: poolData.totalPnL,
        pnlPercentage: (poolData.totalPnL / poolData.totalInvested) * 100,
        lastUpdate: new Date(),
      });
    }
  }, [poolData, liveData]);

  return {
    data: liveData || (poolData ? {
      totalValue: poolData.currentAmount,
      pnl: poolData.totalPnL,
      pnlPercentage: (poolData.totalPnL / poolData.totalInvested) * 100,
      lastUpdate: new Date(),
    } : null),
    isLoading,
    error,
    isLive: isConnected,
    refetch,
  };
}
