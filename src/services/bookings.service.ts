import api from './api';
import type { Booking } from '@/types/api.types';

export interface CreateBookingResponse extends Booking {
  updatedBalance?: number;
}

export const bookingsService = {
  getAll: async () => {
    const { data } = await api.get<{ data: Booking[] }>('/bookings');
    return data.data;
  },

  create: async (payload: { vehicleId: number; hours: number }) => {
    const { data } = await api.post<CreateBookingResponse>('/bookings', payload);
    return data;
  },

  complete: async (id: number) => {
    const { data } = await api.patch<Booking>(`/bookings/${id}/complete`);
    return data;
  },
};