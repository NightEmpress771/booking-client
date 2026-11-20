import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/api.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  setBalance: (balance: number) => void;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      login: (user, accessToken) => set({ user, accessToken }),
      logout: () => set({ user: null, accessToken: null }),
      setBalance: (balance) =>
        set((state) => (state.user ? { user: { ...state.user, balance } } : state)),
      updateUser: (partial) =>
        set((state) => (state.user ? { user: { ...state.user, ...partial } } : state)),
    }),
    { name: 'auth-storage' }
  )
);