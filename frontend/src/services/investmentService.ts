import { api } from '../lib/axios';

export interface Investment {
  id: string;
  userId: string;
  poolId: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'withdrawn';
  validationDeadline: string;
  confirmedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentWithPool extends Investment {
  pool: {
    id: string;
    name: string;
    type: string;
    status: string;
  };
}

class InvestmentService {
  // Get user investments
  async getMyInvestments() {
    return api.get('/investments/my');
  }

  // Get investment by ID
  async getInvestmentById(id: string) {
    return api.get(`/investments/${id}`);
  }

  // Create investment (subscribe to pool)
  async createInvestment(poolId: string, amount: number) {
    return api.post('/investments', { poolId, amount });
  }

  // Confirm investment (user action within 48h)
  async confirmInvestment(id: string) {
    return api.post(`/investments/${id}/confirm`);
  }

  // Reject investment (user action within 48h)
  async rejectInvestment(id: string, reason?: string) {
    return api.post(`/investments/${id}/reject`, { reason });
  }

  // Admin: Get pending investments
  async getPendingInvestments() {
    return api.get('/admin/investments/pending');
  }

  // Admin: Get all investments
  async getAllInvestments(filters?: any) {
    return api.get('/admin/investments', { params: filters });
  }

  // Admin: Approve investment
  async approveInvestment(id: string) {
    return api.post(`/admin/investments/${id}/approve`);
  }

  // Admin: Reject investment
  async rejectInvestmentAdmin(id: string, reason: string) {
    return api.post(`/admin/investments/${id}/reject`, { reason });
  }

  // Calculate time remaining for validation
  getTimeRemaining(deadline: string): {
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();

    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, isExpired: false };
  }

  // Format time remaining
  formatTimeRemaining(deadline: string): string {
    const { hours, minutes, seconds, isExpired } = this.getTimeRemaining(deadline);

    if (isExpired) {
      return 'Expiré';
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m ${seconds}s`;
  }
}

export default new InvestmentService();
