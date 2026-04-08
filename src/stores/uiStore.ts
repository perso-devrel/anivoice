import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  language: 'ko' | 'en';
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLanguage: (lang: 'ko' | 'en') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  language: 'ko',
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setLanguage: (language) => set({ language }),
}));
