import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { API_URL } from '../../services/api';

export function ServerStatus() {
  const [status, setStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      const start = Date.now();
      try {
        // Adjust API_URL to root if it includes /api/v1
        const rootUrl = API_URL.replace('/api/v1', '');
        const res = await fetch(`${rootUrl}/health`);
        if (res.ok) {
          const end = Date.now();
          setLatency(end - start);
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } catch (e) {
        setStatus('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  if (status === 'checking') return null;

  return (
    <div className={`fixed bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md border shadow-lg z-50 transition-all duration-300 ${
      status === 'online' 
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
        : 'bg-red-500/10 border-red-500/20 text-red-400'
    }`}>
      <div className={`relative flex h-2 w-2`}>
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
          status === 'online' ? 'bg-emerald-400' : 'bg-red-400'
        }`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${
          status === 'online' ? 'bg-emerald-500' : 'bg-red-500'
        }`}></span>
      </div>
      <span>{status === 'online' ? 'Système Opérationnel' : 'Déconnecté'}</span>
      {latency && <span className="text-xs opacity-70 border-l border-white/10 pl-2 ml-1">{latency}ms</span>}
    </div>
  );
}
