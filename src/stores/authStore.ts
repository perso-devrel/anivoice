import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setCreditSeconds: (seconds: number) => void;
  addCreditSeconds: (seconds: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setCreditSeconds: (creditSeconds) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, creditSeconds } });
    }
  },
  addCreditSeconds: (seconds) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, creditSeconds: user.creditSeconds + seconds } });
    }
  },
}));
