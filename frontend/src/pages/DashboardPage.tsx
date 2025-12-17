// src/pages/DashboardPage.tsx
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { fadeInUp, staggerContainer } from '@/components/ui/animation'
import { StatCard } from '@/components/StatCard'
import { DollarSign, Briefcase, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react'
import { PoolCard } from '@/components/pools/PoolCard'
import { TRADING_PAIRS } from '@/config/poolConfig'
import { useDashboard } from '@/hooks/useDashboard'
import { formatCurrencyWithColor, formatPercentageWithColor } from '@/theme/utils'

export function DashboardPage() {
  const { stats, activePools, isLoading, error, refresh } = useDashboard();

  const handleRefresh = async () => {
    toast.promise(refresh(), {
      loading: 'Actualisation en cours...',
      success: 'Données mises à jour',
      error: 'Échec de l\'actualisation',
    });
  };
  // Show error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] space-y-4"
      >
        <AlertCircle className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold text-white">Erreur de chargement</h2>
        <p className="text-gray-400 text-center max-w-md">
          Impossible de charger les données du tableau de bord. Veuillez réessayer.
        </p>
        <Button onClick={handleRefresh} size="lg">
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Tableau de bord</h1>
          <p className="text-gray-400 mt-1">Bienvenue sur votre plateforme de trading</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="lg" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button size="lg">
            <DollarSign className="h-4 w-4 mr-2" />
            Effectuer un Dépôt
          </Button>
        </div>
      </motion.div>

      {/* User Stats */}
      <motion.div 
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : stats ? (
          <>
            <motion.div variants={fadeInUp}>
              <StatCard 
                title="Solde Total" 
                value={formatCurrencyWithColor(stats.totalBalance).text}
                subtitle="sur tous les pools"
                icon={DollarSign}
                trend="up"
                color="accent"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard 
                title="Performance Globale" 
                value={formatPercentageWithColor(stats.pnlPercent).text}
                subtitle="P&L sur 30 jours"
                icon={TrendingUp}
                trend={stats.pnlPercent >= 0 ? 'up' : 'down'}
                color={stats.pnlPercent >= 0 ? 'accent' : 'danger'}
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <StatCard 
                title="Investissements Actifs" 
                value={stats.activeInvestments}
                subtitle="pools actifs"
                icon={Briefcase}
                trend="neutral"
                color="neutral"
              />
            </motion.div>
          </>
        ) : null}
      </motion.div>

      {/* Active Pools Section */}
      <motion.div variants={fadeInUp}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-white">Pools Actifs</h2>
            <p className="text-gray-400 text-sm mt-1">
              {isLoading ? 'Chargement...' : `${activePools.length} pool(s) disponible(s)`}
            </p>
          </div>
          <Button variant="link">Voir tout →</Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : activePools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePools.map(pool => {
              const pairInfo = TRADING_PAIRS[pool.tradingPair];
              return (
                <motion.div variants={fadeInUp} key={pool.id}>
                  <PoolCard
                    {...pool}
                    tradingPairSymbol={pairInfo.symbol}
                    pairColor={pairInfo.color}
                    pairIcon={pairInfo.icon}
                    onViewDetails={() => {
                      toast.info('Navigation vers détails du pool', {
                        description: `Pool: ${pool.name}`,
                      });
                    }}
                    onDeposit={() => {
                      toast.info('Ouverture du formulaire de dépôt', {
                        description: `Pool: ${pool.name}`,
                      });
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            variants={fadeInUp}
            className="flex flex-col items-center justify-center py-16 bg-dark-800/50 rounded-xl border border-gray-700"
          >
            <Briefcase className="h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucun pool actif</h3>
            <p className="text-gray-400 mb-6">Commencez à investir dans un pool dès maintenant</p>
            <Button size="lg">
              <DollarSign className="h-4 w-4 mr-2" />
              Explorer les pools
            </Button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
