import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import investmentService, { Investment } from '../../services/investmentService';
import { toast } from 'sonner';

interface PendingInvestmentsCardProps {
  onRefresh?: () => void;
}

const PendingInvestmentsCard: React.FC<PendingInvestmentsCardProps> = ({ onRefresh }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPendingInvestments();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadPendingInvestments = async () => {
    try {
      setIsLoading(true);
      const response = await investmentService.getPendingInvestments();
      setInvestments((response as any)?.data || []);
      updateTimeRemaining();
    } catch (error: any) {
      toast.error('Erreur lors du chargement des investissements');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTimeRemaining = () => {
    const times: Record<string, string> = {};
    investments.forEach((inv) => {
      times[inv.id] = investmentService.formatTimeRemaining(inv.validationDeadline);
    });
    setTimeRemaining(times);
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      await investmentService.approveInvestment(id);
      toast.success('Investissement approuvé');
      loadPendingInvestments();
      onRefresh?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Raison du rejet :');
    if (!reason) return;

    try {
      setActionLoading(id);
      await investmentService.rejectInvestmentAdmin(id, reason);
      toast.success('Investissement rejeté');
      loadPendingInvestments();
      onRefresh?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const getTimeColor = (deadline: string) => {
    const { hours, isExpired } = investmentService.getTimeRemaining(deadline);

    if (isExpired) return 'text-red-400';
    if (hours < 1) return 'text-orange-400';
    return 'text-emerald-400';
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-lg border border-slate-800/50 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (investments.length === 0) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-lg border border-slate-800/50 rounded-lg p-6 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
        <p className="text-slate-300 font-medium">Aucun investissement en attente</p>
        <p className="text-slate-500 text-sm mt-1">Tous les investissements ont été traités</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-lg border border-slate-800/50 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-800/30">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-slate-100">
            Investissements en attente ({investments.length})
          </h3>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Validation requise dans les 48 heures
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800/50 bg-slate-800/20">
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Utilisateur</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Pool</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Montant</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Temps restant</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((inv) => (
              <tr
                key={inv.id}
                className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-300 font-medium">
                    {inv.userId.slice(0, 8)}...
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-400">Pool #{inv.poolId.slice(0, 8)}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-100">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(inv.amount)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-2 text-sm font-medium ${getTimeColor(inv.validationDeadline)}`}>
                    <Clock className="w-4 h-4" />
                    {timeRemaining[inv.id] || '...'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(inv.id)}
                      disabled={actionLoading === inv.id}
                      className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      {actionLoading === inv.id ? '...' : 'Approuver'}
                    </button>
                    <button
                      onClick={() => handleReject(inv.id)}
                      disabled={actionLoading === inv.id}
                      className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      {actionLoading === inv.id ? '...' : 'Rejeter'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingInvestmentsCard;
