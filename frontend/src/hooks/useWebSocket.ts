import { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseWebSocketOptions {
  url?: string;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface WebSocketState {
  isConnected: boolean;
  lastMessage: any;
  error: Event | null;
  reconnectAttempt: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = import.meta.env.VITE_WS_URL || 'ws://localhost:3000',
    onMessage,
    onError,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
  } = options;

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    lastMessage: null,
    error: null,
    reconnectAttempt: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      // Skip WebSocket in mock mode
      if (import.meta.env.VITE_MOCK_MODE === 'true') {
        setState((prev) => ({ ...prev, isConnected: true }));
        return;
      }

      const ws = new WebSocket(url);

      ws.onopen = () => {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          error: null,
          reconnectAttempt: 0,
        }));
        toast.success('Connexion temps réel établie', {
          duration: 2000,
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setState((prev) => ({ ...prev, lastMessage: data }));
          onMessage?.(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        setState((prev) => ({ ...prev, error }));
        onError?.(error);
      };

      ws.onclose = () => {
        setState((prev) => ({
          ...prev,
          isConnected: false,
        }));

        // Attempt reconnection
        if (state.reconnectAttempt < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setState((prev) => ({
              ...prev,
              reconnectAttempt: prev.reconnectAttempt + 1,
            }));
            connect();
          }, reconnectInterval);
        } else {
          toast.error('Connexion temps réel perdue', {
            description: 'Veuillez rafraîchir la page',
          });
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }, [url, onMessage, onError, reconnectInterval, maxReconnectAttempts, state.reconnectAttempt]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    ...state,
    sendMessage,
    reconnect: connect,
    disconnect,
  };
}
