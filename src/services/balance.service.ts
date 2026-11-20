import api from './api';
import type { User } from '@/types/api.types';

export interface TopUpResponse {
  message: string;
  balance: number;
  user: User;
}

export const balanceService = {
  getMe: async () => {
    const { data } = await api.get<{ user: User }>('/auth/me');
    return data.user;
  },
  topUp: async (amount: number) => {
    const { data } = await api.post<TopUpResponse>('/auth/balance/topup', { amount });
    return data;
  },
};