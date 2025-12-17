// src/pages/PoolDetailPage.tsx
import { useState } from 'react';
import { ArrowLeft, TrendingUp, DollarSign, Users, Calendar, Shield, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CountdownTimer } from '@/components/pools/CountdownTimer';
import { PoolChat } from '@/components/pools/PoolChat';
import { TRADING_PAIRS, TradingPool, PoolMessage } from '@/config/poolConfig';
import { StatCard } from '@/components/StatCard';

// Mock Data
const poolData: TradingPool = {
  id: '1',
  name: 'Bitcoin Pool Alpha',
  tradingPair: 'BTC',
  status: 'ACTIVE',
  totalDeposits: 125000,
  participantsCount: 45,
  currentBalance: 138750,
  performance: 11.0,
  startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  isLocked: false,
  botStrategy: 'Scalping',
  minimumDeposit: 50,
};

const performanceData = [
  { date: '01/12', value: 100000 },
  { date: '02/12', value: 102500 },
  { date: '03/12', value: 105800 },
  { date: '04/12', value: 108200 },
  { date: '05/12', value: 106500 },
  { date: '06/12', value: 110300 },
  { date: '07/12', value: 113800 },
];

const chatMessages: PoolMessage[] = [
  { id: '1', poolId: '1', userId: 'admin1', username: 'Admin Support', message: 'Bienvenue dans le chat du pool !', timestamp: new Date(Date.now() - 3600000), isAdmin: true },
  { id: '2', poolId: '1', userId: 'user1', username: 'CryptoTrader42', message: 'Excellente performance aujourd\'u0027hui ! 📈', timestamp: new Date(Date.now() - 1800000), isAdmin: false },
];

const userInvestment = {
  amount: 5000,
  currentValue: 5555,
  profit: 555,
  profitPercent: 11.1
};


export function PoolDetailPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'chat' | 'participants'>('overview');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [messages, setMessages] = useState(chatMessages);

  const pairInfo = TRADING_PAIRS[poolData.tradingPair];

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (amount >= poolData.minimumDeposit) {
      console.log('Dépôt de', amount, 'USD');
      setShowDepositModal(false);
      setDepositAmount('');
    }
  };

  const handleSendMessage = (message: string) => {
    const newMessage: PoolMessage = {
      id: Date.now().toString(),
      poolId: poolData.id,
      userId: 'currentUser',
      username: 'Vous',
      message,
      timestamp: new Date(),
      isAdmin: false
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold"
              style={{
                backgroundColor: `${pairInfo.color}15`,
                color: pairInfo.color
              }}
            >
              {pairInfo.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{poolData.name}</h1>
              <p className="text-sm text-gray-400">{poolData.tradingPair} • {poolData.botStrategy}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!poolData.isLocked && (
            <Button onClick={() => setShowDepositModal(true)} size="lg">
              Déposer
            </Button>
          )}
        </div>
      </div>

      {/* Countdown */}
      <CountdownTimer endDate={poolData.endDate} />

      {/* User Investment */}
      {userInvestment.amount > 0 && (
        <Card glass className="border-primary-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-primary-500" />
              Votre Investissement
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <InfoItem label="Dépôt Initial" value={`$${userInvestment.amount.toLocaleString()}`} />
              <InfoItem label="Valeur Actuelle" value={`$${userInvestment.currentValue.toLocaleString()}`} />
              <InfoItem label="Profit/Perte" value={`+$${userInvestment.profit.toLocaleString()}`} className="text-green-500" />
              <InfoItem label="Performance" value={`+${userInvestment.profitPercent}%`} className="text-green-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {[ 
          { id: 'overview', label: 'Vue d\'ensemble', icon: Info },
          { id: 'stats', label: 'Statistiques', icon: TrendingUp },
          { id: 'chat', label: 'Chat', icon: Users },
          { id: 'participants', label: 'Participants', icon: Shield }
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && <OverviewTab pool={poolData} />}
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'chat' && (
          <PoolChat
            poolId={poolData.id}
            poolName={poolData.name}
            messages={messages}
            currentUserId="currentUser"
            onSendMessage={handleSendMessage}
          />
        )}
        {activeTab === 'participants' && <ComingSoonTab icon={Shield} />}
      </motion.div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <DepositModal
          minDeposit={poolData.minimumDeposit}
          onClose={() => setShowDepositModal(false)}
          onConfirm={handleDeposit}
          amount={depositAmount}
          setAmount={setDepositAmount}
        />
      )}
    </div>
  );
}

// Sub-components for the detail page
function InfoItem({ label, value, className }: { label: string, value: string, className?: string }) {
  return (
    <div>
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className={cn("text-2xl font-bold text-white", className)}>
        {value}
      </div>
    </div>
  );
}

function OverviewTab({ pool }: { pool: TradingPool }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card glass>
          <CardHeader><CardTitle>Évolution de la Balance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <defs><linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="value" stroke="#0ea5e9" fill="url(#colorBalance)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card glass>
          <CardHeader><CardTitle>À propos de ce Pool</CardTitle></CardHeader>
          <CardContent>
            <p className="text-gray-300 leading-relaxed">Pool de trading automatisé sur Bitcoin utilisant une stratégie de scalping.</p>
            <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-yellow-400 mb-1">Avertissement</div>
                <p className="text-sm text-gray-300">Les performances passées ne garantissent pas les résultats futurs. Le trading comporte des risques.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <StatCard title="Dépôts Totaux" value={`$${pool.totalDeposits.toLocaleString()}`} icon={DollarSign} color="accent" />
        <StatCard title="Participants" value={pool.participantsCount.toString()} icon={Users} color="neutral" />
        <StatCard title="Performance" value={`+${pool.performance}%`} icon={TrendingUp} trend="up" color="accent" />
      </div>
    </div>
  )
}

function StatsTab() {
  return (
    <Card glass>
      <CardHeader><CardTitle>Statistiques Détaillées</CardTitle></CardHeader>
      <CardContent>
        <ComingSoonTab icon={TrendingUp} />
      </CardContent>
    </Card>
  )
}

function ComingSoonTab({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="text-center py-20 text-gray-400">
      <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>Cette section est en cours de développement.</p>
    </div>
  )
}

function DepositModal({ minDeposit, onClose, onConfirm, amount, setAmount }: any) {
  const fee = (parseFloat(amount) || 0) * 0.1;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <Card glass>
          <CardHeader><CardTitle>Effectuer un Dépôt</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Montant (USD)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Minimum: $${minDeposit}`} className="w-full px-4 py-3 rounded-lg bg-dark-800 border border-gray-700 text-white focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm text-gray-300 space-y-2">
              <div className="flex justify-between"><span>Montant du dépôt:</span><span className="font-semibold">${amount || '0'}</span></div>
              <div className="flex justify-between"><span>Frais de retrait (10%):</span><span className="font-semibold">${fee.toFixed(2)}</span></div>
              <div className="pt-2 border-t border-blue-500/30 flex justify-between"><span className="font-semibold">Total investi:</span><span className="font-bold text-white">${amount || '0'}</span></div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
              <Button className="flex-1" onClick={onConfirm} disabled={!amount || parseFloat(amount) < minDeposit}>Confirmer</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
