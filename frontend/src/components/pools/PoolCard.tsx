import { TrendingUp, TrendingDown, Users, DollarSign, Lock, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { POOL_STATUS, TradingPool } from '@/config/poolConfig';

// We'll use a subset of the TradingPool props, and add some specific UI-related ones.
interface PoolCardProps extends Omit<TradingPool, 'status' | 'startDate' | 'minimumDeposit' | 'tradingPair'> {
  tradingPairSymbol: string;
  pairColor: string;
  pairIcon: string;
  status: keyof typeof POOL_STATUS;
  onViewDetails?: () => void;
  onDeposit?: () => void;
}

export function PoolCard({
  name,
  tradingPairSymbol,
  pairColor,
  pairIcon,
  status,
  totalDeposits,
  participantsCount,
  currentBalance,
  performance,
  isLocked,
  botStrategy,
  onViewDetails,
  onDeposit
}: PoolCardProps) {
  const isPositive = performance >= 0;
  const isActive = status === 'ACTIVE';

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          "relative overflow-hidden cursor-pointer transition-all duration-300",
          "hover:shadow-2xl hover:shadow-primary-500/20",
          isActive && "ring-1 ring-primary-500/30"
        )}
        glass
        onClick={onViewDetails}
      >
        {/* Badge de statut */}
        <div className="absolute top-4 right-4 z-10">
          <StatusBadge status={status} isLocked={isLocked} />
        </div>

        {/* Dégradé de fond basé sur la paire */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            background: `linear-gradient(135deg, ${pairColor}22, transparent)`
          }}
        />

        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Icône de la paire */}
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold"
                style={{ 
                  backgroundColor: `${pairColor}15`,
                  color: pairColor
                }}
              >
                {pairIcon}
              </div>
              <div>
                <CardTitle className="text-xl mb-1">{name}</CardTitle>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-sm font-semibold"
                    style={{ color: pairColor }}
                  >
                    {tradingPairSymbol}
                  </span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-400">{botStrategy}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Performance */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-dark-800/50">
            <span className="text-sm text-gray-400">Performance</span>
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
              <span className={cn(
                "text-xl font-bold",
                isPositive ? "text-green-500" : "text-red-500"
              )}>
                {isPositive ? '+' : ''}{performance.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-4">
            <StatItem
              icon={DollarSign}
              label="Dépôts totaux"
              value={`$${totalDeposits.toLocaleString()}`}
            />
            <StatItem
              icon={Users}
              label="Participants"
              value={participantsCount.toString()}
            />
          </div>

          {/* Solde actuel */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/20">
            <div className="text-xs text-gray-400 mb-1">Solde Actuel</div>
            <div className="text-2xl font-bold text-white">
              ${currentBalance.toLocaleString()}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.();
              }}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors"
            >
              Détails
            </button>
            
            {isActive && !isLocked && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeposit?.();
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
              >
                Déposer
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatusBadge({ status, isLocked }: { status: keyof typeof POOL_STATUS; isLocked: boolean }) {
  const config = {
    UPCOMING: { label: 'À venir', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    ACTIVE: { label: 'Actif', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
    CLOSED: { label: 'Fermé', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    SETTLING: { label: 'Règlement', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
  }[status];

  return (
    <div className="flex items-center gap-2">
      <span className={cn(
        "px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm",
        config.className
      )}>
        {config.label}
      </span>
      {isLocked && (
        <div className="p-1.5 rounded-full bg-orange-500/20 border border-orange-500/30">
          <Lock className="h-3 w-3 text-orange-400" />
        </div>
      )}
      {!isLocked && status === 'ACTIVE' && (
        <div className="p-1.5 rounded-full bg-green-500/20 border border-green-500/30">
          <Unlock className="h-3 w-3 text-green-400" />
        </div>
      )}
    </div>
  );
}

function StatItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-dark-800/50">
        <Icon className="h-4 w-4 text-primary-500" />
      </div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm font-semibold text-white">{value}</div>
      </div>
    </div>
  );
}
