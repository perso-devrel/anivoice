import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../stores/authStore';

vi.stubEnv('VITE_FIREBASE_API_KEY', '');

const storage = new Map<string, string>();

vi.stubGlobal('localStorage', {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => storage.set(k, v),
  removeItem: (k: string) => storage.delete(k),
  clear: () => storage.clear(),
});

let signInWithEmail: typeof import('./firebase').signInWithEmail;
let signUpWithEmail: typeof import('./firebase').signUpWithEmail;
let signInWithGoogle: typeof import('./firebase').signInWithGoogle;
let signOut: typeof import('./firebase').signOut;
let initAuthListener: typeof import('./firebase').initAuthListener;
let updateProfile: typeof import('./firebase').updateProfile;

beforeAll(async () => {
  const mod = await import('./firebase');
  signInWithEmail = mod.signInWithEmail;
  signUpWithEmail = mod.signUpWithEmail;
  signInWithGoogle = mod.signInWithGoogle;
  signOut = mod.signOut;
  initAuthListener = mod.initAuthListener;
  updateProfile = mod.updateProfile;
});

beforeEach(() => {
  storage.clear();
  useAuthStore.setState({ user: null, isLoading: true });
});

describe('firebase mock auth', () => {
  describe('signInWithEmail', () => {
    it('signs in with valid credentials', async () => {
      const user = await signInWithEmail('dervel@estsoft.com', 'dervel!!');
      expect(user.email).toBe('dervel@estsoft.com');
      expect(user.displayName).toBe('Dervel');
      expect(user.plan).toBe('free');
    });

    it('persists user to localStorage', async () => {
      await signInWithEmail('dervel@estsoft.com', 'dervel!!');
      const stored = JSON.parse(storage.get('anivoice_mock_user')!);
      expect(stored.email).toBe('dervel@estsoft.com');
    });

    it('rejects wrong password', async () => {
      await expect(signInWithEmail('dervel@estsoft.com', 'wrong')).rejects.toThrow(
        'auth/invalid-credential',
      );
    });

    it('rejects unknown email', async () => {
      await expect(signInWithEmail('nobody@example.com', 'pass')).rejects.toThrow(
        'auth/invalid-credential',
      );
    });
  });

  describe('signUpWithEmail', () => {
    it('creates a new user', async () => {
      const user = await signUpWithEmail('new@example.com', 'pass123', 'NewUser');
      expect(user.email).toBe('new@example.com');
      expect(user.displayName).toBe('NewUser');
      expect(user.plan).toBe('free');
      expect(user.creditSeconds).toBe(0);
    });

    it('persists new user to localStorage', async () => {
      await signUpWithEmail('persist@example.com', 'pass123', 'Persist');
      const stored = JSON.parse(storage.get('anivoice_mock_user')!);
      expect(stored.email).toBe('persist@example.com');
    });

    it('rejects duplicate email', async () => {
      await expect(
        signUpWithEmail('dervel@estsoft.com', 'pass', 'Dup'),
      ).rejects.toThrow('auth/email-already-in-use');
    });
  });

  describe('signInWithGoogle', () => {
    it('returns default mock account', async () => {
      const user = await signInWithGoogle();
      expect(user.email).toBe('dervel@estsoft.com');
      expect(user.displayName).toBe('Dervel');
    });

    it('persists user to localStorage', async () => {
      await signInWithGoogle();
      expect(storage.has('anivoice_mock_user')).toBe(true);
    });
  });

  describe('signOut', () => {
    it('removes user from localStorage', async () => {
      await signInWithEmail('dervel@estsoft.com', 'dervel!!');
      expect(storage.has('anivoice_mock_user')).toBe(true);
      await signOut();
      expect(storage.has('anivoice_mock_user')).toBe(false);
    });

    it('clears auth store user', async () => {
      useAuthStore.getState().setUser({
        id: 'x', email: 'x', displayName: 'x',
        plan: 'free', creditSeconds: 0, language: 'ko', createdAt: '',
      });
      await signOut();
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('initAuthListener', () => {
    it('loads persisted user into auth store', () => {
      storage.set(
        'anivoice_mock_user',
        JSON.stringify({
          id: 'u1', email: 'a@b.com', displayName: 'A',
          plan: 'free', creditSeconds: 100, language: 'ko', createdAt: '',
        }),
      );
      initAuthListener();
      expect(useAuthStore.getState().user?.email).toBe('a@b.com');
    });

    it('sets null when no persisted user', () => {
      initAuthListener();
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('updates displayName for signed-in user', async () => {
      await signInWithEmail('dervel@estsoft.com', 'dervel!!');
      useAuthStore.getState().setUser({
        id: 'mock-001', email: 'dervel@estsoft.com', displayName: 'Dervel',
        plan: 'pro', creditSeconds: 3600000, language: 'ko', createdAt: '',
      });
      await updateProfile('NewName');
      const stored = JSON.parse(storage.get('anivoice_mock_user')!);
      expect(stored.displayName).toBe('NewName');
      expect(useAuthStore.getState().user?.displayName).toBe('NewName');
    });

    it('throws when not authenticated', async () => {
      await expect(updateProfile('Name')).rejects.toThrow('Not authenticated');
    });
  });
});
