import { api } from '../lib/axios';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'investor';
  kycStatus: 'pending' | 'approved' | 'rejected';
  mfaEnabled: boolean;
  isBlocked: boolean;
  isSubscriptionActive: boolean;
  subscriptionExpiresAt?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

class UserService {
  // Admin: Get all users
  async getAllUsers(filters?: any) {
    return api.get('/admin/users', { params: filters });
  }

  // Admin: Get user by ID
  async getUserById(id: string) {
    return api.get(`/admin/users/${id}`);
  }

  // Admin: Update KYC status
  async updateKycStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
    return api.put(`/admin/users/${id}/kyc-status`, { status });
  }

  // Admin: Block user
  async blockUser(id: string) {
    return api.post(`/admin/users/${id}/block`);
  }

  // Admin: Unblock user
  async unblockUser(id: string) {
    return api.post(`/admin/users/${id}/unblock`);
  }

  // Get KYC status color
  getKycStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'text-amber-400',
      approved: 'text-emerald-400',
      rejected: 'text-red-400',
    };
    return colors[status] || 'text-slate-400';
  }

  // Get KYC status label
  getKycStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
    };
    return labels[status] || status;
  }

  // Get role label
  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Administrateur',
      investor: 'Investisseur',
    };
    return labels[role] || role;
  }
}

export default new UserService();
