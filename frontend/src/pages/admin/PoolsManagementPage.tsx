import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import PoolModal from '../../components/admin/PoolModal';
import adminService, { PoolType } from '../../services/adminService';
import { toast } from 'react-hot-toast';

const PoolsManagementPage: React.FC = () => {
  const [pools, setPools] = useState<PoolType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<PoolType | undefined>();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getPools();
      setPools(response.data?.data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des pools');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePool = () => {
    setSelectedPool(undefined);
    setIsModalOpen(true);
  };

  const handleEditPool = (pool: PoolType) => {
    setSelectedPool(pool);
    setIsModalOpen(true);
  };

  const handlePublish = async (id: string) => {
    try {
      setActionLoading(id);
      await adminService.publishPool(id);
      toast.success('Pool publié');
      loadPools();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePause = async (id: string) => {
    try {
      setActionLoading(id);
      await adminService.pausePool(id);
      toast.success('Pool mis en pause');
      loadPools();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async (id: string) => {
    try {
      setActionLoading(id);
      await adminService.resumePool(id);
      toast.success('Pool repris');
      loadPools();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce pool ?')) return;
    try {
      setActionLoading(id);
      await adminService.deletePool(id);
      toast.success('Pool supprimé');
      loadPools();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      draft: { bg: 'bg-slate-700', text: 'text-slate-200', label: 'Brouillon' },
      pending: { bg: 'bg-amber-900/50', text: 'text-amber-200', label: 'En attente' },
      active: { bg: 'bg-emerald-900/50', text: 'text-emerald-200', label: 'Actif' },
      settlement: { bg: 'bg-blue-900/50', text: 'text-blue-200', label: 'Règlement' },
      closed: { bg: 'bg-red-900/50', text: 'text-red-200', label: 'Fermé' },
      paused: { bg: 'bg-orange-900/50', text: 'text-orange-200', label: 'En pause' },
      cancelled: { bg: 'bg-red-900/50', text: 'text-red-200', label: 'Annulé' },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getRiskBadge = (risk: string) => {
    const riskConfig: Record<string, { bg: string; text: string }> = {
      low: { bg: 'bg-emerald-900/30', text: 'text-emerald-300' },
      medium: { bg: 'bg-blue-900/30', text: 'text-blue-300' },
      high: { bg: 'bg-amber-900/30', text: 'text-amber-300' },
      very_high: { bg: 'bg-red-900/30', text: 'text-red-300' },
    };

    const config = riskConfig[risk] || riskConfig.medium;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {risk.toUpperCase()}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Gestion des Pools</h1>
            <p className="text-slate-400 mt-1">Créez et gérez les pools de trading</p>
          </div>
          <button
            onClick={handleCreatePool}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
          >
            + Nouveau Pool
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-900/60 backdrop-blur-lg border border-slate-800/50 rounded-lg p-4 animate-pulse"
              >
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2 mb-3"></div>
                <div className="h-3 bg-slate-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : pools.length === 0 ? (
          /* Empty State */
          <div className="bg-slate-900/60 backdrop-blur-lg border border-slate-800/50 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-slate-100 mb-2">Aucun pool créé</h3>
            <p className="text-slate-400 mb-6">Commencez par créer votre premier pool de trading</p>
            <button
              onClick={handleCreatePool}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
            >
              Créer un pool
            </button>
          </div>
        ) : (
          /* Pools Table */
          <div className="bg-slate-900/60 backdrop-blur-lg border border-slate-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800/50 bg-slate-800/30">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Nom</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Risque</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">AUM</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">PnL</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Investisseurs</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Dates</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pools.map((pool) => (
                    <tr
                      key={pool.id}
                      className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-100">{pool.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-400">{pool.type}</span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(pool.status)}</td>
                      <td className="px-6 py-4">{getRiskBadge(pool.riskLevel)}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-slate-100 font-medium">
                            {formatCurrency(pool.currentAmount)}
                          </p>
                          <p className="text-slate-500 text-xs">
                            / {formatCurrency(pool.targetAmount)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-medium ${
                            pool.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {pool.totalPnL >= 0 ? '+' : ''}{pool.pnlPercentage.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-400">{pool.investorCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-400">
                          <p>{formatDate(pool.startDate)}</p>
                          <p>{formatDate(pool.endDate)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPool(pool)}
                            className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded text-xs font-medium transition-colors"
                            disabled={actionLoading === pool.id}
                          >
                            Éditer
                          </button>

                          {pool.status === 'draft' && (
                            <button
                              onClick={() => handlePublish(pool.id)}
                              className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded text-xs font-medium transition-colors disabled:opacity-50"
                              disabled={actionLoading === pool.id}
                            >
                              {actionLoading === pool.id ? '...' : 'Publier'}
                            </button>
                          )}

                          {pool.status === 'active' && (
                            <button
                              onClick={() => handlePause(pool.id)}
                              className="px-3 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 rounded text-xs font-medium transition-colors disabled:opacity-50"
                              disabled={actionLoading === pool.id}
                            >
                              {actionLoading === pool.id ? '...' : 'Pause'}
                            </button>
                          )}

                          {pool.status === 'paused' && (
                            <button
                              onClick={() => handleResume(pool.id)}
                              className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded text-xs font-medium transition-colors disabled:opacity-50"
                              disabled={actionLoading === pool.id}
                            >
                              {actionLoading === pool.id ? '...' : 'Reprendre'}
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(pool.id)}
                            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded text-xs font-medium transition-colors disabled:opacity-50"
                            disabled={actionLoading === pool.id}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <PoolModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPool(undefined);
        }}
        onSuccess={loadPools}
        pool={selectedPool}
      />
    </AdminLayout>
  );
};

export default PoolsManagementPage;
