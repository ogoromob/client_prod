// src/pages/PoolsExplorerPage.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { fadeInUp, staggerContainer } from '@/components/ui/animation';
import { PoolCard } from '@/components/pools/PoolCard';
import { TRADING_PAIRS, TradingPool, POOL_STATUS } from '@/config/poolConfig';
import { List, Search } from 'lucide-react';

// Mock Data for all pools
const allPools: TradingPool[] = [
  {
    id: '1',
    name: 'Bitcoin Alpha',
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
  },
  {
    id: '4',
    name: 'Stable Growth',
    tradingPair: 'BTC',
    status: 'UPCOMING',
    totalDeposits: 10000,
    participantsCount: 5,
    currentBalance: 10000,
    performance: 0,
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    isLocked: false,
    botStrategy: 'Arbitrage',
    minimumDeposit: 100,
  },
  {
    id: '5',
    name: 'ETH Momentum',
    tradingPair: 'BTC', // Placeholder as we only have 3 pairs
    status: 'CLOSED',
    totalDeposits: 250000,
    participantsCount: 112,
    currentBalance: 295000,
    performance: 18.0,
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    isLocked: true,
    botStrategy: 'Momentum',
    minimumDeposit: 50,
  },
];

export function PoolsExplorerPage() {
  const [filter, setFilter] = useState<keyof typeof POOL_STATUS | 'ALL'>('ALL');

  const filteredPools = allPools.filter(pool => {
    if (filter === 'ALL') return true;
    return pool.status === filter;
  });

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
          <h1 className="text-3xl font-display font-bold text-white">Explorer les Pools</h1>
          <p className="text-gray-400 mt-1">Trouvez la stratégie qui vous convient.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input 
            type="text"
            placeholder="Rechercher un pool..."
            className="w-full md:w-64 bg-dark-800 border-gray-700 rounded-lg p-2 pl-10 text-white focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp} className="flex items-center gap-2 overflow-x-auto pb-2">
        {(['ALL', ...Object.keys(POOL_STATUS)] as const).map(status => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status as keyof typeof POOL_STATUS | 'ALL')}
          >
            {status === 'ALL' ? 'Tous' : POOL_STATUS[status]}
          </Button>
        ))}
      </motion.div>

      {/* Pool Grid */}
      <motion.div 
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredPools.length > 0 ? (
          filteredPools.map(pool => {
            const pairInfo = TRADING_PAIRS[pool.tradingPair];
            return (
              <motion.div variants={fadeInUp} key={pool.id}>
                <PoolCard
                  {...pool}
                  tradingPairSymbol={pairInfo.symbol}
                  pairColor={pairInfo.color}
                  pairIcon={pairInfo.icon}
                  onViewDetails={() => console.log('Navigate to details:', pool.id)}
                  onDeposit={() => console.log('Deposit to:', pool.id)}
                />
              </motion.div>
            )
          })
        ) : (
          <motion.div variants={fadeInUp} className="col-span-full text-center py-20 bg-dark-800/50 rounded-xl">
            <List className="h-12 w-12 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white">Aucun pool trouvé</h3>
            <p className="text-gray-500 mt-2">Essayez de sélectionner un autre filtre.</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
