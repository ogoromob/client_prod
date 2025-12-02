import { api } from '../lib/axios';
import type { 
  Withdrawal, 
  WithdrawalFormData,
  WithdrawalStatus,
  ApiResponse 
} from '../types';
import { mockWithdrawals } from '../mocks/data';

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

export const withdrawalService = {
  // Get my withdrawals
  async getMyWithdrawals(): Promise<Withdrawal[]> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockWithdrawals;
    }
    
    const response = await api.get<ApiResponse<Withdrawal[]>>('/withdrawals');
    return response.data!;
  },
  
  // Get withdrawal by ID
  async getWithdrawalById(id: string): Promise<Withdrawal> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const withdrawal = mockWithdrawals.find(w => w.id === id);
      if (!withdrawal) throw new Error('Withdrawal not found');
      
      return withdrawal;
    }
    
    const response = await api.get<ApiResponse<Withdrawal>>(`/withdrawals/${id}`);
    return response.data!;
  },
  
  // Create withdrawal request
  async createWithdrawal(data: WithdrawalFormData): Promise<Withdrawal> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate MFA check for large amounts
      if (data.amount > 1000 && !data.mfaCode) {
        throw new Error('Code MFA requis pour les retraits > 1000€');
      }
      
      if (data.mfaCode && data.mfaCode !== '123456') {
        throw new Error('Code MFA invalide');
      }
      
      const managerFee = data.amount > 0 ? data.amount * 0.15 : 0;
      const netAmount = data.amount - managerFee;
      
      const newWithdrawal: Withdrawal = {
        id: `wd-${Date.now()}`,
        investmentId: data.investmentId,
        userId: '1',
        amount: data.amount,
        managerFee,
        netAmount,
        status: 'pending' as WithdrawalStatus,
        requestedAt: new Date().toISOString(),
        withdrawalMethod: data.withdrawalMethod,
        destinationAddress: data.destinationAddress,
      };
      
      return newWithdrawal;
    }
    
    const response = await api.post<ApiResponse<Withdrawal>>('/withdrawals', data);
    return response.data!;
  },
  
  // Calculate withdrawal fees
  async calculateWithdrawalFees(investmentId: string, amount: number): Promise<{
    amount: number;
    managerFee: number;
    netAmount: number;
    feePercentage: number;
  }> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const feePercentage = 15;
      const managerFee = amount * (feePercentage / 100);
      const netAmount = amount - managerFee;
      
      return {
        amount,
        managerFee,
        netAmount,
        feePercentage,
      };
    }
    
    const response = await api.post<ApiResponse<any>>('/withdrawals/calculate-fees', {
      investmentId,
      amount,
    });
    return response.data!;
  },
  
  // Get all withdrawals (admin only)
  async getAllWithdrawals(filters?: { status?: string[] }): Promise<Withdrawal[]> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let withdrawals = [...mockWithdrawals];
      
      if (filters?.status) {
        withdrawals = withdrawals.filter(w => filters.status!.includes(w.status));
      }
      
      return withdrawals;
    }
    
    const response = await api.get<ApiResponse<Withdrawal[]>>('/admin/withdrawals', { params: filters });
    return response.data!;
  },
  
  // Approve withdrawal (admin only)
  async approveWithdrawal(id: string): Promise<Withdrawal> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const withdrawal = mockWithdrawals.find(w => w.id === id);
      if (!withdrawal) throw new Error('Withdrawal not found');
      
      return {
        ...withdrawal,
        status: 'approved' as WithdrawalStatus,
        processedAt: new Date().toISOString(),
      };
    }
    
    const response = await api.put<ApiResponse<Withdrawal>>(`/admin/withdrawals/${id}/approve`);
    return response.data!;
  },
  
  // Reject withdrawal (admin only)
  async rejectWithdrawal(id: string, reason: string): Promise<Withdrawal> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const withdrawal = mockWithdrawals.find(w => w.id === id);
      if (!withdrawal) throw new Error('Withdrawal not found');
      
      return {
        ...withdrawal,
        status: 'rejected' as WithdrawalStatus,
        processedAt: new Date().toISOString(),
        rejectionReason: reason,
      };
    }
    
    const response = await api.put<ApiResponse<Withdrawal>>(`/admin/withdrawals/${id}/reject`, { reason });
    return response.data!;
  },
};
