import { useState } from 'react';
import { Search, Filter, Download, Clock, User, Shield } from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: 'success' | 'failed' | 'warning';
  details: string;
}

export function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed' | 'warning'>('all');

  const logs: AuditLog[] = [
    {
      id: '1',
      timestamp: '2026-01-01 14:32:15',
      user: 'admin@example.com',
      action: 'Pool Created',
      resource: 'Pool #1234',
      status: 'success',
      details: 'Created new trading pool with 50K USDT cap',
    },
    {
      id: '2',
      timestamp: '2026-01-01 13:45:22',
      user: 'manager@example.com',
      action: 'User Blocked',
      resource: 'User #5678',
      status: 'success',
      details: 'Blocked user due to suspicious activity',
    },
    {
      id: '3',
      timestamp: '2026-01-01 12:15:08',
      user: 'admin@example.com',
      action: 'Config Updated',
      resource: 'System Config',
      status: 'warning',
      details: 'Updated subscription fee from 2 to 2.5 USDT',
    },
    {
      id: '4',
      timestamp: '2026-01-01 11:22:45',
      user: 'super_admin@example.com',
      action: 'Emergency Stop',
      resource: 'All Pools',
      status: 'failed',
      details: 'Emergency stop triggered - system recovered',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'warning':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Pool')) return <Shield className="h-4 w-4" />;
    if (action.includes('User')) return <User className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Logs & Audit</h1>
        <p className="text-slate-400">Historique complet des actions système</p>
      </div>

      {/* Filters */}
      <PremiumCard gradient="cyan" hover>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher dans les logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="all">Tous les statuts</option>
            <option value="success">Succès</option>
            <option value="failed">Échoué</option>
            <option value="warning">Avertissement</option>
          </select>

          {/* Export */}
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium transition-all">
            <Download className="h-4 w-4" />
            Exporter
          </button>
        </div>
      </PremiumCard>

      {/* Logs Table */}
      <PremiumCard gradient="blue" hover>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Timestamp</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Utilisateur</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Action</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Ressource</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Détails</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      {log.timestamp}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{log.user}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      {log.action}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{log.resource}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(log.status)}`}>
                      {log.status === 'success' && '✓'}
                      {log.status === 'failed' && '✗'}
                      {log.status === 'warning' && '⚠'}
                      {' '}{log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PremiumCard>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PremiumCard gradient="emerald" hover>
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-2">Actions Réussies</p>
            <p className="text-3xl font-bold text-emerald-400">2,847</p>
            <p className="text-xs text-slate-500 mt-2">+12% ce mois</p>
          </div>
        </PremiumCard>
        <PremiumCard gradient="amber" hover>
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-2">Avertissements</p>
            <p className="text-3xl font-bold text-amber-400">156</p>
            <p className="text-xs text-slate-500 mt-2">À surveiller</p>
          </div>
        </PremiumCard>
        <PremiumCard gradient="rose" hover>
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-2">Erreurs</p>
            <p className="text-3xl font-bold text-rose-400">23</p>
            <p className="text-xs text-slate-500 mt-2">-5% ce mois</p>
          </div>
        </PremiumCard>
      </div>
    </div>
  );
}

export default AuditLogsPage;
