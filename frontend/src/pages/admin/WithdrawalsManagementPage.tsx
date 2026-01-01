import React, { useState, useEffect } from 'react';
import withdrawalService, { Withdrawal } from '../../services/withdrawalService';
import { toast } from 'sonner';
import { DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';

const WithdrawalsManagementPage: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadWithdrawals();
  }, [filterStatus]);

  const loadWithdrawals = async () => {
    try {
      setIsLoading(true);
      const response = await withdrawalService.getAllWithdrawals(
        filterStatus !== 'all' ? { status: filterStatus } : {}
      );
      setWithdrawals((response as any)?.data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des retraits');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      await withdrawalService.approveWithdrawal(id);
      toast.success('Retrait approuvé');
      loadWithdrawals();
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
      await withdrawalService.rejectWithdrawal(id, reason);
      toast.success('Retrait rejeté');
      loadWithdrawals();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkCompleted = async (id: string) => {
    const txHash = prompt('Hash de transaction (optionnel) :');

    try {
      setActionLoading(id);
      await withdrawalService.markCompleted(id, txHash || undefined);
      toast.success('Retrait marqué comme complété');
      loadWithdrawals();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      pending: {
        bg: 'bg-amber-900/50',
        text: 'text-amber-200',
        icon: <Clock className="w-4 h-4" />,
      },
      approved: {
        bg: 'bg-blue-900/50',
        text: 'text-blue-200',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      rejected: {
        bg: 'bg-red-900/50',
        text: 'text-red-200',
        icon: <XCircle className="w-4 h-4" />,
      },
      completed: {
        bg: 'bg-emerald-900/50',
        text: 'text-emerald-200',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      failed: {
        bg: 'bg-red-900/50',
        text: 'text-red-200',
        icon: <XCircle className="w-4 h-4" />,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        {withdrawalService.getStatusLabel(status)}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter((w) => w.status === 'pending').length,
    approved: withdrawals.filter((w) => w.status === 'approved').length,
    completed: withdrawals.filter((w) => w.status === 'completed').length,
    rejected: withdrawals.filter((w) => w.status === 'rejected').length,
    totalAmount: withdrawals.reduce((sum, w) => sum + w.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Gestion des Retraits</h1>
        <p className="text-slate-400 mt-1">Approuvez et gérez les demandes de retrait</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-lg border border-slate-800/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{stats.total}</p>
        </div>
        <div className="bg-amber-900/30 backdrop-blur-lg border border-amber-800/50 rounded-lg p-4">
          <p className="text-amber-300 text-sm">En attente</p>
          <p className="text-2xl font-bold text-amber-200 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-blue-900/30 backdrop-blur-lg border border-blue-800/50 rounded-lg p-4">
          <p className="text-blue-300 text-sm">Approuvés</p>
          <p className="text-2xl font-bold text-blue-200 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-emerald-900/30 backdrop-blur-lg border border-emerald-800/50 rounded-lg p-4">
          <p className="text-emerald-300 text-sm">Complétés</p>
          <p className="text-2xl font-bold text-emerald-200 mt-1">{stats.completed}</p>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-lg border border-slate-800/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Montant total</p>
          <p className="text-xl font-bold text-slate-100 mt-1">{formatCurrency(stats.totalAmount)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'approved', 'completed', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {status === 'all' ? 'Tous' : withdrawalService.getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-900/60 backdrop-blur-lg border border-slate-800/50 rounded-lg p-4 animate-pulse"
            >
              <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : withdrawals.length === 0 ? (
        /* Empty State */
        <div className="bg-slate-900/60 backdrop-blur-lg border border-slate-800/50 rounded-lg p-12 text-center">
          <DollarSign className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">Aucun retrait</p>
          <p className="text-slate-500 text-sm mt-1">
            {filterStatus === 'all'
              ? 'Aucune demande de retrait pour le moment'
              : `Aucun retrait avec le statut "${withdrawalService.getStatusLabel(filterStatus)}"`}
          </p>
        </div>
      ) : (
        /* Withdrawals Table */
        <div className="bg-slate-900/60 backdrop-blur-lg border border-slate-800/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/50 bg-slate-800/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Utilisateur</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Montant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Méthode</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr
                    key={withdrawal.id}
                    className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300 font-medium">
                        {withdrawal.userId.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-100">
                        {formatCurrency(withdrawal.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400">
                        {withdrawalService.getMethodLabel(withdrawal.method)}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(withdrawal.status)}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400">{formatDate(withdrawal.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setShowDetails(true);
                          }}
                          className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors"
                        >
                          Détails
                        </button>

                        {withdrawal.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(withdrawal.id)}
                              disabled={actionLoading === withdrawal.id}
                              className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              {actionLoading === withdrawal.id ? '...' : 'Approuver'}
                            </button>
                            <button
                              onClick={() => handleReject(withdrawal.id)}
                              disabled={actionLoading === withdrawal.id}
                              className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              {actionLoading === withdrawal.id ? '...' : 'Rejeter'}
                            </button>
                          </>
                        )}

                        {withdrawal.status === 'approved' && (
                          <button
                            onClick={() => handleMarkCompleted(withdrawal.id)}
                            disabled={actionLoading === withdrawal.id}
                            className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading === withdrawal.id ? '...' : 'Complété'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900/80 backdrop-blur-lg border border-slate-800/50 rounded-xl shadow-2xl shadow-blue-500/10 w-full max-w-md">
            <div className="sticky top-0 bg-slate-900/90 border-b border-slate-800/50 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-100">Détails du retrait</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-slate-400 hover:text-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-400">Utilisateur</p>
                <p className="text-slate-100 font-medium mt-1">{selectedWithdrawal.userId}</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Montant</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">
                  {formatCurrency(selectedWithdrawal.amount)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Méthode</p>
                <p className="text-slate-100 font-medium mt-1">
                  {withdrawalService.getMethodLabel(selectedWithdrawal.method)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Status</p>
                <div className="mt-1">{getStatusBadge(selectedWithdrawal.status)}</div>
              </div>

              {selectedWithdrawal.bankAccount && (
                <div>
                  <p className="text-sm text-slate-400">Compte bancaire</p>
                  <div className="mt-1 space-y-1">
                    <p className="text-slate-100 font-medium">{selectedWithdrawal.bankAccount.accountHolder}</p>
                    <p className="text-slate-400 text-sm">{selectedWithdrawal.bankAccount.iban}</p>
                  </div>
                </div>
              )}

              {selectedWithdrawal.cryptoAddress && (
                <div>
                  <p className="text-sm text-slate-400">Adresse crypto</p>
                  <p className="text-slate-100 font-mono text-xs mt-1 break-all">
                    {selectedWithdrawal.cryptoAddress}
                  </p>
                </div>
              )}

              {selectedWithdrawal.rejectionReason && (
                <div>
                  <p className="text-sm text-slate-400">Raison du rejet</p>
                  <p className="text-red-300 mt-1">{selectedWithdrawal.rejectionReason}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-slate-400">Créé le</p>
                <p className="text-slate-100 text-sm mt-1">{formatDate(selectedWithdrawal.createdAt)}</p>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 hover:text-slate-100 transition-colors mt-6"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalsManagementPage;
