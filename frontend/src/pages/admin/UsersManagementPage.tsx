import React, { useState, useEffect } from 'react';
import userService, { User } from '../../services/userService';
import { toast } from 'sonner';
import { Users, Shield, Lock, Unlock, CheckCircle, AlertCircle } from 'lucide-react';

const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterKyc, setFilterKyc] = useState<string>('all');
  const [searchEmail, setSearchEmail] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [filterRole, filterKyc]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (filterRole !== 'all') filters.role = filterRole;
      if (filterKyc !== 'all') filters.kycStatus = filterKyc;

      const response = await userService.getAllUsers(filters);
      setUsers((response as any)?.data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des utilisateurs');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateKyc = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      setActionLoading(id);
      await userService.updateKycStatus(id, status);
      toast.success(`KYC ${userService.getKycStatusLabel(status).toLowerCase()}`);
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlockUser = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir bloquer cet utilisateur ?')) return;

    try {
      setActionLoading(id);
      await userService.blockUser(id);
      toast.success('Utilisateur bloqué');
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblockUser = async (id: string) => {
    try {
      setActionLoading(id);
      await userService.unblockUser(id);
      toast.success('Utilisateur débloqué');
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  const getKycBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      pending: {
        bg: 'bg-amber-900/50',
        text: 'text-amber-200',
        icon: <AlertCircle className="w-4 h-4" />,
      },
      approved: {
        bg: 'bg-emerald-900/50',
        text: 'text-emerald-200',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      rejected: {
        bg: 'bg-red-900/50',
        text: 'text-red-200',
        icon: <AlertCircle className="w-4 h-4" />,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        {userService.getKycStatusLabel(status)}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const isAdmin = role === 'admin';
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
          isAdmin
            ? 'bg-purple-900/50 text-purple-200'
            : 'bg-blue-900/50 text-blue-200'
        }`}
      >
        <Shield className="w-4 h-4" />
        {userService.getRoleLabel(role)}
      </span>
    );
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

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    investors: users.filter((u) => u.role === 'investor').length,
    kycApproved: users.filter((u) => u.kycStatus === 'approved').length,
    kycPending: users.filter((u) => u.kycStatus === 'pending').length,
    blocked: users.filter((u) => u.isBlocked).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Gestion des Utilisateurs</h1>
        <p className="text-slate-400 mt-1">Gérez les utilisateurs et leur statut KYC</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-lg border border-slate-800/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{stats.total}</p>
        </div>
        <div className="bg-purple-900/30 backdrop-blur-lg border border-purple-800/50 rounded-lg p-4">
          <p className="text-purple-300 text-sm">Admins</p>
          <p className="text-2xl font-bold text-purple-200 mt-1">{stats.admins}</p>
        </div>
        <div className="bg-blue-900/30 backdrop-blur-lg border border-blue-800/50 rounded-lg p-4">
          <p className="text-blue-300 text-sm">Investisseurs</p>
          <p className="text-2xl font-bold text-blue-200 mt-1">{stats.investors}</p>
        </div>
        <div className="bg-emerald-900/30 backdrop-blur-lg border border-emerald-800/50 rounded-lg p-4">
          <p className="text-emerald-300 text-sm">KYC Approuvés</p>
          <p className="text-2xl font-bold text-emerald-200 mt-1">{stats.kycApproved}</p>
        </div>
        <div className="bg-amber-900/30 backdrop-blur-lg border border-amber-800/50 rounded-lg p-4">
          <p className="text-amber-300 text-sm">KYC En attente</p>
          <p className="text-2xl font-bold text-amber-200 mt-1">{stats.kycPending}</p>
        </div>
        <div className="bg-red-900/30 backdrop-blur-lg border border-red-800/50 rounded-lg p-4">
          <p className="text-red-300 text-sm">Bloqués</p>
          <p className="text-2xl font-bold text-red-200 mt-1">{stats.blocked}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Rôle</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tous</option>
              <option value="admin">Administrateur</option>
              <option value="investor">Investisseur</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">KYC</label>
            <select
              value={filterKyc}
              onChange={(e) => setFilterKyc(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">Rechercher</label>
            <input
              type="text"
              placeholder="Email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
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
      ) : filteredUsers.length === 0 ? (
        /* Empty State */
        <div className="bg-slate-900/60 backdrop-blur-lg border border-slate-800/50 rounded-lg p-12 text-center">
          <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">Aucun utilisateur</p>
          <p className="text-slate-500 text-sm mt-1">Aucun utilisateur ne correspond aux filtres</p>
        </div>
      ) : (
        /* Users Table */
        <div className="bg-slate-900/60 backdrop-blur-lg border border-slate-800/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/50 bg-slate-800/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Rôle</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">KYC</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Abonnement</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300 font-medium">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4">{getKycBadge(user.kycStatus)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-medium ${
                          user.isSubscriptionActive ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {user.isSubscriptionActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-medium ${
                          user.isBlocked ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {user.isBlocked ? 'Bloqué' : 'Actif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetails(true);
                          }}
                          className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors"
                        >
                          Détails
                        </button>

                        {user.kycStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateKyc(user.id, 'approved')}
                              disabled={actionLoading === user.id}
                              className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              {actionLoading === user.id ? '...' : 'Approuver'}
                            </button>
                            <button
                              onClick={() => handleUpdateKyc(user.id, 'rejected')}
                              disabled={actionLoading === user.id}
                              className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              {actionLoading === user.id ? '...' : 'Rejeter'}
                            </button>
                          </>
                        )}

                        {!user.isBlocked && (
                          <button
                            onClick={() => handleBlockUser(user.id)}
                            disabled={actionLoading === user.id}
                            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading === user.id ? '...' : 'Bloquer'}
                          </button>
                        )}

                        {user.isBlocked && (
                          <button
                            onClick={() => handleUnblockUser(user.id)}
                            disabled={actionLoading === user.id}
                            className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading === user.id ? '...' : 'Débloquer'}
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
      {showDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900/80 backdrop-blur-lg border border-slate-800/50 rounded-xl shadow-2xl shadow-blue-500/10 w-full max-w-md">
            <div className="sticky top-0 bg-slate-900/90 border-b border-slate-800/50 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-100">Détails de l'utilisateur</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-slate-400 hover:text-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="text-slate-100 font-medium mt-1">{selectedUser.email}</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Rôle</p>
                <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
              </div>

              <div>
                <p className="text-sm text-slate-400">KYC Status</p>
                <div className="mt-1">{getKycBadge(selectedUser.kycStatus)}</div>
              </div>

              <div>
                <p className="text-sm text-slate-400">Abonnement</p>
                <p className="text-slate-100 font-medium mt-1">
                  {selectedUser.isSubscriptionActive ? 'Actif' : 'Inactif'}
                </p>
                {selectedUser.subscriptionExpiresAt && (
                  <p className="text-slate-400 text-sm">
                    Expire le: {formatDate(selectedUser.subscriptionExpiresAt)}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-400">MFA</p>
                <p className="text-slate-100 font-medium mt-1">
                  {selectedUser.mfaEnabled ? 'Activé' : 'Désactivé'}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Status</p>
                <p className="text-slate-100 font-medium mt-1">
                  {selectedUser.isBlocked ? 'Bloqué' : 'Actif'}
                </p>
              </div>

              {selectedUser.lastLogin && (
                <div>
                  <p className="text-sm text-slate-400">Dernière connexion</p>
                  <p className="text-slate-100 text-sm mt-1">{formatDate(selectedUser.lastLogin)}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-slate-400">Créé le</p>
                <p className="text-slate-100 text-sm mt-1">{formatDate(selectedUser.createdAt)}</p>
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

export default UsersManagementPage;
