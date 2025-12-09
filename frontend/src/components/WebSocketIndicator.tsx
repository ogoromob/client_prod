import { useEffect, useState } from 'react';
import { Activity, WifiOff } from 'lucide-react';

interface WebSocketIndicatorProps {
  url?: string;
  showLabel?: boolean;
}

export function WebSocketIndicator({ url, showLabel = true }: WebSocketIndicatorProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Simulate WebSocket connection status
    // In production, this would connect to actual WebSocket
    const interval = setInterval(() => {
      setIsConnected(true);
      setLastUpdate(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, [url]);

  if (!showLabel) {
    return (
      <div
        className={`ws-indicator ${isConnected ? '' : 'opacity-30'}`}
        title={isConnected ? 'Connected' : 'Disconnected'}
      />
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-bg-card border border-brand-border">
      {isConnected ? (
        <>
          <Activity className="w-4 h-4 text-brand-accent animate-pulse" />
          <span className="text-xs font-medium text-brand-accent">Live</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-500">Offline</span>
        </>
      )}
      {lastUpdate && (
        <span className="text-xs text-brand-text-secondary">
          {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
