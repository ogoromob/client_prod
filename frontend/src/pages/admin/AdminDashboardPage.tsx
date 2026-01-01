import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import adminService from '@/services/adminService';

interface DashboardMetrics {
  totalUsers: number;
  activeInvestments: number;
  totalInvested: number;
  totalPnL: number;
  pendingWithdrawals: number;
  activePools: number;
}

export function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    activeInvestments: 0,
    totalInvested: 0,
    totalPnL: 0,
    pendingWithdrawals: 0,
    activePools: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      // Mock data for now - will be replaced with real API call
      setMetrics({
        totalUsers: 1234,
        activeInvestments: 456,
        totalInvested: 2500000,
        totalPnL: 125000,
        pendingWithdrawals: 3,
        activePools: 8,
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    change, 
    gradient 
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    change?: string;
    gradient: 'cyan' | 'blue' | 'purple' | 'emerald' | 'amber' | 'rose';
  }) => (
    <PremiumCard gradient={gradient} hover>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium mb-2">{label}</p>
          <p className="text-3xl font-bold text-white mb-2">{value}</p>
          {change && (
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {change}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
          {Icon}
        </div>
      </div>
    </PremiumCard>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Admin</h1>
        <p className="text-slate-400">Bienvenue sur votre plateforme de gestion</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={<Users className="h-6 w-6 text-cyan-400" />}
          label="Utilisateurs Actifs"
          value={metrics.totalUsers}
          change="+12% ce mois"
          gradient="cyan"
        />
        <StatCard
          icon={<BarChart3 className="h-6 w-6 text-blue-400" />}
          label="Investissements Actifs"
          value={metrics.activeInvestments}
          change="+8% cette semaine"
          gradient="blue"
        />
        <StatCard
          icon={<DollarSign className="h-6 w-6 text-emerald-400" />}
          label="Total Investi"
          value={`$${(metrics.totalInvested / 1000).toFixed(1)}K`}
          change="+25% ce mois"
          gradient="emerald"
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6 text-purple-400" />}
          label="PnL Total"
          value={`$${(metrics.totalPnL / 1000).toFixed(1)}K`}
          change="+5.2% ROI"
          gradient="purple"
        />
        <StatCard
          icon={<Activity className="h-6 w-6 text-amber-400" />}
          label="Retraits en Attente"
          value={metrics.pendingWithdrawals}
          change="À traiter"
          gradient="amber"
        />
        <StatCard
          icon={<CheckCircle className="h-6 w-6 text-rose-400" />}
          label="Pools Actifs"
          value={metrics.activePools}
          change="Tous opérationnels"
          gradient="rose"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <PremiumCard gradient="cyan" hover>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Performance Mensuelle</h3>
            <p className="text-sm text-slate-400">Évolution des investissements</p>
          </div>
          <div className="h-64 flex items-end justify-around gap-2">
            {[65, 78, 90, 81, 95, 87, 92].map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-lg transition-all duration-300 hover:from-cyan-400 hover:to-blue-400"
                  style={{ height: `${value}%` }}
                />
                <span className="text-xs text-slate-500">S{i + 1}</span>
              </div>
            ))}
          </div>
        </PremiumCard>

        {/* Recent Activity */}
        <PremiumCard gradient="purple" hover>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Activité Récente</h3>
            <p className="text-sm text-slate-400">Dernières transactions</p>
          </div>
          <div className="space-y-4">
            {[
              { type: 'investment', user: 'User #1234', amount: '+$5,000', time: 'Il y a 2h' },
              { type: 'withdrawal', user: 'User #5678', amount: '-$2,500', time: 'Il y a 4h' },
              { type: 'investment', user: 'User #9012', amount: '+$10,000', time: 'Il y a 6h' },
              { type: 'fee', user: 'Frais', amount: '+$150', time: 'Il y a 8h' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'investment' ? 'bg-emerald-500/20' :
                    activity.type === 'withdrawal' ? 'bg-amber-500/20' :
                    'bg-blue-500/20'
                  }`}>
                    {activity.type === 'investment' ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    ) : activity.type === 'withdrawal' ? (
                      <DollarSign className="h-4 w-4 text-amber-400" />
                    ) : (
                      <Activity className="h-4 w-4 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{activity.user}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
                <p className={`font-semibold ${
                  activity.amount.startsWith('+') ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {activity.amount}
                </p>
              </div>
            ))}
          </div>
        </PremiumCard>
      </div>

      {/* Alerts Section */}
      <PremiumCard gradient="rose" hover>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-rose-500/20 rounded-lg">
            <AlertCircle className="h-6 w-6 text-rose-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">Alertes Importantes</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• 3 retraits en attente de validation</li>
              <li>• 1 pool approchant du hard cap</li>
              <li>• Maintenance prévue demain à 2h du matin</li>
            </ul>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
}

export default AdminDashboardPage;
