import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

const mockUser = {
  id: 'u1',
  email: 'test@example.com',
  displayName: 'Test',
  creditSeconds: 1000,
  language: 'ko' as const,
  createdAt: '2026-01-01',
};

beforeEach(() => {
  useAuthStore.setState({ user: null, isLoading: true });
});

describe('authStore', () => {
  it('starts with null user and loading true', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(true);
  });

  it('setUser sets user and clears loading', () => {
    useAuthStore.getState().setUser(mockUser);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isLoading).toBe(false);
  });

  it('setUser(null) clears user', () => {
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().setUser(null);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('setLoading updates loading state', () => {
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('setCreditSeconds updates credits when user exists', () => {
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().setCreditSeconds(2000);
    expect(useAuthStore.getState().user!.creditSeconds).toBe(2000);
  });

  it('setCreditSeconds is a no-op when user is null', () => {
    useAuthStore.getState().setCreditSeconds(2000);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('addCreditSeconds adds to existing credits', () => {
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().addCreditSeconds(500);
    expect(useAuthStore.getState().user!.creditSeconds).toBe(1500);
  });

  it('addCreditSeconds is a no-op when user is null', () => {
    useAuthStore.getState().addCreditSeconds(500);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
