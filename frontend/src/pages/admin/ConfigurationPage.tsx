import { Settings, Save, RotateCcw, Database, Bell, Zap } from 'lucide-react';
import { useState } from 'react';
import { PremiumCard } from '@/components/ui/PremiumCard';

export function ConfigurationPage() {
  const [config, setConfig] = useState({
    subscriptionFee: 2.0,
    maxDailyDrawdown: 10,
    minInvestment: 100,
    maxInvestmentPerUser: 15000,
    maxInvestmentPerAdmin: 20000,
    poolHardCap: 100000,
    durationDays: 30,
    autoReinvest: true,
    maintenanceMode: false,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: string, value: any) => {
    setConfig({ ...config, [key]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Configuration saved:', config);
    setHasChanges(false);
  };

  const handleReset = () => {
    setConfig({
      subscriptionFee: 2.0,
      maxDailyDrawdown: 10,
      minInvestment: 100,
      maxInvestmentPerUser: 15000,
      maxInvestmentPerAdmin: 20000,
      poolHardCap: 100000,
      durationDays: 30,
      autoReinvest: true,
      maintenanceMode: false,
    });
    setHasChanges(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configuration</h1>
        <p className="text-slate-400">Paramètres système et limites</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          Enregistrer les modifications
        </button>
        <button
          onClick={handleReset}
          disabled={!hasChanges}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-800 disabled:opacity-50 text-slate-300 rounded-lg font-medium transition-all disabled:cursor-not-allowed"
        >
          <RotateCcw className="h-4 w-4" />
          Réinitialiser
        </button>
      </div>

      {/* Fees Configuration */}
      <PremiumCard gradient="cyan" hover>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Zap className="h-5 w-5 text-cyan-400" />
            Frais et Abonnements
          </h3>
          <p className="text-sm text-slate-400">Configurez les frais du système</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Frais d'Abonnement Mensuel (USDT)
            </label>
            <input
              type="number"
              value={config.subscriptionFee}
              onChange={(e) => handleChange('subscriptionFee', parseFloat(e.target.value))}
              step="0.1"
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
            <p className="text-xs text-slate-500 mt-1">Frais mensuels pour l'accès à la plateforme</p>
          </div>
        </div>
      </PremiumCard>

      {/* Investment Limits */}
      <PremiumCard gradient="blue" hover>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-400" />
            Limites d'Investissement
          </h3>
          <p className="text-sm text-slate-400">Configurez les limites par rôle</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Investissement Minimum (USDT)
            </label>
            <input
              type="number"
              value={config.minInvestment}
              onChange={(e) => handleChange('minInvestment', parseFloat(e.target.value))}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Max par Utilisateur (USDT)
            </label>
            <input
              type="number"
              value={config.maxInvestmentPerUser}
              onChange={(e) => handleChange('maxInvestmentPerUser', parseFloat(e.target.value))}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Max par Admin (USDT)
            </label>
            <input
              type="number"
              value={config.maxInvestmentPerAdmin}
              onChange={(e) => handleChange('maxInvestmentPerAdmin', parseFloat(e.target.value))}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Hard Cap du Pool (USDT)
            </label>
            <input
              type="number"
              value={config.poolHardCap}
              onChange={(e) => handleChange('poolHardCap', parseFloat(e.target.value))}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </PremiumCard>

      {/* Pool Configuration */}
      <PremiumCard gradient="purple" hover>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-400" />
            Configuration des Pools
          </h3>
          <p className="text-sm text-slate-400">Paramètres par défaut des pools</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Durée par Défaut (jours)
            </label>
            <input
              type="number"
              value={config.durationDays}
              onChange={(e) => handleChange('durationDays', parseInt(e.target.value))}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Drawdown Maximal Quotidien (%)
            </label>
            <input
              type="number"
              value={config.maxDailyDrawdown}
              onChange={(e) => handleChange('maxDailyDrawdown', parseFloat(e.target.value))}
              step="0.1"
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>
      </PremiumCard>

      {/* Features */}
      <PremiumCard gradient="emerald" hover>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-400" />
            Fonctionnalités
          </h3>
          <p className="text-sm text-slate-400">Activez ou désactivez les fonctionnalités</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
            <div>
              <p className="font-medium text-white">Auto-Réinvestissement</p>
              <p className="text-sm text-slate-400">Réinvestir automatiquement les gains</p>
            </div>
            <button
              onClick={() => handleChange('autoReinvest', !config.autoReinvest)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                config.autoReinvest ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  config.autoReinvest ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
            <div>
              <p className="font-medium text-white">Mode Maintenance</p>
              <p className="text-sm text-slate-400">Désactiver l'accès utilisateur</p>
            </div>
            <button
              onClick={() => handleChange('maintenanceMode', !config.maintenanceMode)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                config.maintenanceMode ? 'bg-rose-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  config.maintenanceMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
}

export default ConfigurationPage;
