import { api } from '../lib/axios';

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';
  bankAccount?: {
    iban: string;
    accountHolder: string;
  };
  cryptoAddress?: string;
  method: 'bank_transfer' | 'crypto' | 'card';
  rejectionReason?: string;
  approvedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalWithUser extends Withdrawal {
  user: {
    id: string;
    email: string;
    kycStatus: string;
  };
}

class WithdrawalService {
  // Get user withdrawals
  async getMyWithdrawals() {
    return api.get('/withdrawals/my');
  }

  // Get withdrawal by ID
  async getWithdrawalById(id: string) {
    return api.get(`/withdrawals/${id}`);
  }

  // Request withdrawal
  async requestWithdrawal(amount: number, method: 'bank_transfer' | 'crypto' | 'card', details?: any) {
    return api.post('/withdrawals', { amount, method, ...details });
  }

  // Cancel withdrawal (only if pending)
  async cancelWithdrawal(id: string) {
    return api.post(`/withdrawals/${id}/cancel`);
  }

  // Admin: Get all withdrawals
  async getAllWithdrawals(filters?: any) {
    return api.get('/admin/withdrawals', { params: filters });
  }

  // Admin: Get pending withdrawals
  async getPendingWithdrawals() {
    return api.get('/admin/withdrawals/pending');
  }

  // Admin: Approve withdrawal
  async approveWithdrawal(id: string) {
    return api.put(`/admin/withdrawals/${id}/approve`);
  }

  // Admin: Reject withdrawal
  async rejectWithdrawal(id: string, reason: string) {
    return api.put(`/admin/withdrawals/${id}/reject`, { reason });
  }

  // Admin: Mark as completed
  async markCompleted(id: string, transactionHash?: string) {
    return api.post(`/admin/withdrawals/${id}/complete`, { transactionHash });
  }

  // Get withdrawal status color
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'text-amber-400',
      approved: 'text-blue-400',
      rejected: 'text-red-400',
      completed: 'text-emerald-400',
      failed: 'text-red-400',
    };
    return colors[status] || 'text-slate-400';
  }

  // Get withdrawal status label
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      completed: 'Complété',
      failed: 'Échoué',
    };
    return labels[status] || status;
  }

  // Get method label
  getMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      bank_transfer: 'Virement bancaire',
      crypto: 'Crypto',
      card: 'Carte bancaire',
    };
    return labels[method] || method;
  }
}

export default new WithdrawalService();
