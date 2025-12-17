// src/pages/DashboardPage.tsx
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { fadeInUp, staggerContainer } from '@/components/ui/animation'
import { StatCard } from '@/components/StatCard'
import { DollarSign, Zap, Briefcase, TrendingUp } from 'lucide-react'
import { PoolCard } from '@/components/pools/PoolCard'
import { TRADING_PAIRS, TradingPool } from '@/config/poolConfig'

// Mock Data based on the new architecture
const userStats = {
  totalBalance: 24780,
  pnlPercent: 12.5,
  activeInvestments: 12,
}

const activePools: TradingPool[] = [
  {
    id: '1',
    name: 'Bitcoin Pool Alpha',
    tradingPair: 'BTC',
    status: 'ACTIVE',
    totalDeposits: 125000,
    participantsCount: 45,
    currentBalance: 138750,
    performance: 11.0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    isLocked: false,
    botStrategy: 'Scalping',
    minimumDeposit: 50,
  },
  {
    id: '2',
    name: 'Dogecoin Moon',
    tradingPair: 'DOGE',
    status: 'ACTIVE',
    totalDeposits: 85000,
    participantsCount: 62,
    currentBalance: 81200,
    performance: -4.5,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isLocked: false,
    botStrategy: 'Trend Following',
    minimumDeposit: 50,
  },
  {
    id: '3',
    name: 'Community Choice',
    tradingPair: 'COMMUNITY',
    status: 'ACTIVE',
    totalDeposits: 95000,
    participantsCount: 38,
    currentBalance: 103450,
    performance: 8.9,
    startDate: new Date(),
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    isLocked: true,
    botStrategy: 'Grid Trading',
    minimumDeposit: 50,
  }
];

export function DashboardPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-white">Tableau de bord</h1>
        <Button size="lg">
          <DollarSign className="h-4 w-4 mr-2" />
          Effectuer un Dépôt
        </Button>
      </motion.div>

      {/* User Stats */}
      <motion.div 
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={fadeInUp}>
          <StatCard 
            title="Solde Total" 
            value={`$${userStats.totalBalance.toLocaleString()}`}
            subtitle="sur tous les pools"
            icon={DollarSign}
            trend="up"
            color="accent"
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <StatCard 
            title="Performance Globale" 
            value={`${userStats.pnlPercent > 0 ? '+' : ''}${userStats.pnlPercent.toFixed(1)}%`}
            subtitle="P&L sur 30 jours"
            icon={TrendingUp}
            trend={userStats.pnlPercent >= 0 ? 'up' : 'down'}
            color={userStats.pnlPercent >= 0 ? 'accent' : 'danger'}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <StatCard 
            title="Investissements Actifs" 
            value={userStats.activeInvestments}
            subtitle="pools"
            icon={Briefcase}
            trend="neutral"
            color="neutral"
          />
        </motion.div>
      </motion.div>

      {/* Active Pools Section */}
      <motion.div variants={fadeInUp}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-display font-bold text-white">Pools Actifs</h2>
          <Button variant="link">Voir tout</Button>
        </div>
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
                  onViewDetails={() => console.log('View details:', pool.id)}
                  onDeposit={() => console.log('Deposit to:', pool.id)}
                />
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
