import { create } from 'zustand';
import type { User, PlanType } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  updatePlan: (plan: PlanType) => void;
  addCredits: (amount: number) => void;
  useCredits: (amount: number) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  updatePlan: (plan) => {
    const { user } = get();
    if (user) {
      const creditMap: Record<PlanType, number> = {
        free: 60,
        basic: 1800,
        pro: 7200,
        'pay-per-use': user.credits,
      };
      set({ user: { ...user, plan, credits: creditMap[plan] } });
    }
  },
  addCredits: (amount) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, credits: user.credits + amount } });
    }
  },
  useCredits: (amount) => {
    const { user } = get();
    if (user && user.credits >= amount) {
      set({ user: { ...user, credits: user.credits - amount } });
      return true;
    }
    return false;
  },
}));
