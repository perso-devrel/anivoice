import { create } from 'zustand';

type UILanguage = 'ko' | 'en' | 'ja' | 'zh';

interface UIState {
  sidebarOpen: boolean;
  language: UILanguage;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLanguage: (lang: UILanguage) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  language: 'ko',
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setLanguage: (language) => set({ language }),
}));
