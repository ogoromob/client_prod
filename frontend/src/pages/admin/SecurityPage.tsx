import { Shield, Lock, AlertTriangle, CheckCircle, Key, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { PremiumCard } from '@/components/ui/PremiumCard';

export function SecurityPage() {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Sécurité</h1>
        <p className="text-slate-400">Gestion de la sécurité et des accès</p>
      </div>

      {/* Security Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PremiumCard gradient="emerald" hover>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">Système Sécurisé</h3>
              <p className="text-sm text-slate-400">Tous les contrôles de sécurité sont actifs</p>
              <p className="text-xs text-emerald-400 mt-2">✓ SSL/TLS activé</p>
              <p className="text-xs text-emerald-400">✓ Authentification JWT</p>
              <p className="text-xs text-emerald-400">✓ Rate limiting actif</p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard gradient="cyan" hover>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-cyan-500/20 rounded-lg">
              <Shield className="h-6 w-6 text-cyan-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">Dernière Vérification</h3>
              <p className="text-sm text-slate-400">Audit de sécurité complété</p>
              <p className="text-xs text-cyan-400 mt-2">Date: 2026-01-01 10:30</p>
              <p className="text-xs text-cyan-400">Résultat: Aucune vulnérabilité</p>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* MFA Settings */}
      <PremiumCard gradient="purple" hover>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Lock className="h-5 w-5 text-purple-400" />
            Authentification Multi-Facteurs (MFA)
          </h3>
          <p className="text-sm text-slate-400">Renforcez la sécurité de votre compte</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
            <div>
              <p className="font-medium text-white">Authentification par SMS</p>
              <p className="text-sm text-slate-400">Recevez un code par SMS</p>
            </div>
            <button className="px-4 py-2 bg-emerald-600/20 text-emerald-300 rounded-lg font-medium hover:bg-emerald-600/30 transition-colors">
              ✓ Activé
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
            <div>
              <p className="font-medium text-white">Authentification par Email</p>
              <p className="text-sm text-slate-400">Recevez un code par email</p>
            </div>
            <button className="px-4 py-2 bg-emerald-600/20 text-emerald-300 rounded-lg font-medium hover:bg-emerald-600/30 transition-colors">
              ✓ Activé
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
            <div>
              <p className="font-medium text-white">Clé de Sécurité Physique</p>
              <p className="text-sm text-slate-400">Utilisez une clé de sécurité USB</p>
            </div>
            <button className="px-4 py-2 bg-slate-700/50 text-slate-400 rounded-lg font-medium hover:bg-slate-700 transition-colors">
              Configurer
            </button>
          </div>
        </div>
      </PremiumCard>

      {/* API Keys */}
      <PremiumCard gradient="blue" hover>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-400" />
            Clés API
          </h3>
          <p className="text-sm text-slate-400">Gérez vos clés d'accès API</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-white mb-1">Clé API Principale</p>
              <div className="flex items-center gap-2">
                <code className="text-sm text-slate-400 bg-slate-900/50 px-3 py-1 rounded">
                  {showApiKey ? 'sk_live_51234567890abcdef' : '••••••••••••••••••••'}
                </code>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="p-2 hover:bg-slate-700/50 rounded transition-colors"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
            <button className="px-4 py-2 bg-red-600/20 text-red-300 rounded-lg font-medium hover:bg-red-600/30 transition-colors">
              Révoquer
            </button>
          </div>

          <button className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium transition-all">
            + Générer une nouvelle clé
          </button>
        </div>
      </PremiumCard>

      {/* Security Alerts */}
      <PremiumCard gradient="rose" hover>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            Alertes de Sécurité
          </h3>
          <p className="text-sm text-slate-400">Activités suspectes détectées</p>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-amber-300 font-medium">⚠ Tentative de connexion échouée</p>
            <p className="text-xs text-amber-200 mt-1">3 tentatives depuis 192.168.1.100 - Il y a 2h</p>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <p className="text-sm text-emerald-300 font-medium">✓ Nouvelle connexion approuvée</p>
            <p className="text-xs text-emerald-200 mt-1">Connexion depuis Chrome sur Windows - Il y a 1h</p>
          </div>
        </div>
      </PremiumCard>

      {/* Security Recommendations */}
      <PremiumCard gradient="amber" hover>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Recommandations de Sécurité</h3>
          <p className="text-sm text-slate-400">Améliorez votre posture de sécurité</p>
        </div>

        <ul className="space-y-3 text-sm text-slate-300">
          <li className="flex items-start gap-3">
            <span className="text-amber-400 mt-1">→</span>
            <span>Changez votre mot de passe tous les 90 jours</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-400 mt-1">→</span>
            <span>Activez MFA sur tous les comptes administrateur</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-400 mt-1">→</span>
            <span>Révoquez les clés API inutilisées</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-400 mt-1">→</span>
            <span>Vérifiez régulièrement les logs d'audit</span>
          </li>
        </ul>
      </PremiumCard>
    </div>
  );
}

export default SecurityPage;
