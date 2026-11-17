import api from './api';
import type { PaginatedResponse, User } from '@/types/api.types';
import type { UserFormData } from '@/schemas/user.schema';

export interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export const usersService = {
  getAll: async (params: UsersQuery = {}) => {
    const { data } = await api.get<PaginatedResponse<User>>('/users', { params });
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },
  create: async (payload: UserFormData) => {
    const { data } = await api.post<User>('/users', payload);
    return data;
  },
  update: async (id: number, payload: Partial<UserFormData>) => {
    const { data } = await api.put<User>(`/users/${id}`, payload);
    return data;
  },
  remove: async (id: number) => {
    await api.delete(`/users/${id}`);
  },
};