// src/pages/admin/AdminDashboardPage.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/StatCard';
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { fadeInUp, staggerContainer } from '@/components/ui/animation';
import { formatCurrencyWithColor, formatPercentageWithColor } from '@/theme/utils';
import adminService from '@/services/adminService';

interface AdminStats {
  totalUsers: number;
  totalPools: number;
  totalAUM: number;
  totalPnL: number;
  pendingWithdrawals: number;
  activeInvestors: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch admin dashboard data
      const dashboardData = await adminService.getDashboard() as any;
      
      setStats({
        totalUsers: dashboardData?.data?.totalInvestors || 0,
        totalPools: dashboardData?.data?.totalPools || 0,
        totalAUM: dashboardData?.data?.totalAUM || 0,
        totalPnL: dashboardData?.data?.totalPnL || 0,
        pendingWithdrawals: dashboardData?.data?.pendingWithdrawals || 0,
        activeInvestors: dashboardData?.data?.activePools || 0,
      });

      // Mock alerts for now
      setAlerts([
        {
          id: '1',
          type: 'warning',
          title: 'Retrait en attente',
          message: '3 retraits nécessitent votre approbation',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'info',
          title: 'Nouveau pool',
          message: 'Un nouveau pool a été créé: "Ethereum Alpha"',
          timestamp: new Date().toISOString(),
        },
      ]);

      setRecentActivities([]);
    } catch (error) {
      console.error('Failed to fetch admin dashboard:', error);
      toast.error('Échec du chargement des données admin');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    toast.promise(fetchDashboardData(), {
      loading: 'Actualisation...',
      success: 'Données actualisées',
      error: 'Échec de l\'actualisation',
    });
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-col md:flex-row justify-between md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Administration
          </h1>
          <p className="text-gray-400 mt-1">
            Vue d'ensemble et gestion de la plateforme
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button size="lg">
            <Briefcase className="h-4 w-4 mr-2" />
            Nouveau Pool
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : stats ? (
          <>
            <motion.div variants={fadeInUp}>
              <StatCard
                title="Utilisateurs Totaux"
                value={stats.totalUsers.toLocaleString()}
                subtitle="investisseurs actifs"
                icon={Users}
                trend="up"
                color="accent"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard
                title="Pools Actifs"
                value={stats.totalPools}
                subtitle="pools en cours"
                icon={Briefcase}
                trend="neutral"
                color="neutral"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard
                title="AUM Total"
                value={formatCurrencyWithColor(stats.totalAUM).text}
                subtitle="actifs sous gestion"
                icon={DollarSign}
                trend="up"
                color="accent"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard
                title="P&L Global"
                value={formatPercentageWithColor(stats.totalPnL).text}
                subtitle="performance globale"
                icon={TrendingUp}
                trend={stats.totalPnL >= 0 ? 'up' : 'down'}
                color={stats.totalPnL >= 0 ? 'accent' : 'danger'}
              />
            </motion.div>
          </>
        ) : null}
      </motion.div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            Alertes Récentes
          </h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Alert
                key={alert.id}
                variant={alert.type}
                title={alert.title}
                description={alert.message}
                closable
                onClose={() =>
                  setAlerts(alerts.filter((a) => a.id !== alert.id))
                }
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-dark-800/50 rounded-xl border border-gray-700 hover:border-primary-500 transition-colors cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-400" />
            </div>
            <Badge variant="warning">{stats?.pendingWithdrawals || 0}</Badge>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Retraits en Attente
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Vérifier et approuver les demandes
          </p>
          <Button variant="outline" size="sm" className="w-full group-hover:border-primary-500">
            Gérer →
          </Button>
        </div>

        <div className="p-6 bg-dark-800/50 rounded-xl border border-gray-700 hover:border-primary-500 transition-colors cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <ArrowUpRight className="h-6 w-6 text-green-400" />
            </div>
            <Badge variant="success">{stats?.activeInvestors || 0}</Badge>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Investisseurs Actifs
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Voir les utilisateurs actifs
          </p>
          <Button variant="outline" size="sm" className="w-full group-hover:border-primary-500">
            Voir →
          </Button>
        </div>

        <div className="p-6 bg-dark-800/50 rounded-xl border border-gray-700 hover:border-primary-500 transition-colors cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-400" />
            </div>
            <Badge variant="info">{stats?.totalPools || 0}</Badge>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Gestion des Pools
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Créer et gérer les pools
          </p>
          <Button variant="outline" size="sm" className="w-full group-hover:border-primary-500">
            Gérer →
          </Button>
        </div>
      </motion.div>

      {/* Recent Activities Table */}
      <motion.div variants={fadeInUp}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            Activités Récentes
          </h2>
          <Button variant="link">Voir tout →</Button>
        </div>

        {isLoading ? (
          <SkeletonTable rows={5} columns={4} />
        ) : (
          <div className="bg-dark-800/50 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-dark-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {recentActivities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      Aucune activité récente
                    </td>
                  </tr>
                ) : (
                  recentActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-dark-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge>{activity.type}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {activity.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {activity.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {activity.date}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
