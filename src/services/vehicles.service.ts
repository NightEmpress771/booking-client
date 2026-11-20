import api from './api';
import type { PaginatedResponse, Vehicle, VehicleStatus, VehicleType } from '@/types/api.types';

export interface VehiclesQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: VehicleType | 'ALL';
  status?: VehicleStatus | 'ALL';
}

export interface VehiclePayload {
  type: VehicleType;
  model: string;
  description?: string;
  pricePerHour: number;
  imageUrl?: string;
  status?: VehicleStatus;
}

export const vehiclesService = {
  getAll: async (params: VehiclesQuery = {}) => {
    const { data } = await api.get<PaginatedResponse<Vehicle>>('/vehicles', { params });
    return data;
  },

  getById: async (id: number) => {
    const { data } = await api.get<Vehicle>(`/vehicles/${id}`);
    return data;
  },

  create: async (payload: VehiclePayload) => {
    const { data } = await api.post<Vehicle>('/vehicles', payload);
    return data;
  },

  update: async (id: number, payload: VehiclePayload) => {
    const { data } = await api.put<Vehicle>(`/vehicles/${id}`, payload);
    return data;
  },

  remove: async (id: number) => {
    await api.delete(`/vehicles/${id}`);
  },
};