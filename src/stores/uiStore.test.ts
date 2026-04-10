import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.setState({ sidebarOpen: false, language: 'ko' });
  });

  it('defaults: sidebar closed, language ko', () => {
    const s = useUIStore.getState();
    expect(s.sidebarOpen).toBe(false);
    expect(s.language).toBe('ko');
  });

  it('toggleSidebar flips the boolean', () => {
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });

  it('setSidebarOpen sets directly', () => {
    useUIStore.getState().setSidebarOpen(true);
    expect(useUIStore.getState().sidebarOpen).toBe(true);
    useUIStore.getState().setSidebarOpen(false);
    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });

  it('setLanguage switches language', () => {
    useUIStore.getState().setLanguage('en');
    expect(useUIStore.getState().language).toBe('en');
    useUIStore.getState().setLanguage('ko');
    expect(useUIStore.getState().language).toBe('ko');
  });
});
