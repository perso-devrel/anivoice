import { useAuthStore } from '../stores/authStore';
import type { User } from '../types';

const FIREBASE_CONFIGURED =
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_API_KEY !== 'your_firebase_key';

/**
 * After authenticating, sync the store with the DB user record
 * (which has the real credit balance). Uses dynamic import to
 * avoid circular dependency with koedubApi.ts.
 */
async function syncUserFromDb(): Promise<void> {
  try {
    const { getMe } = await import('./koedubApi.js');
    const dbUser = await getMe();
    const { user } = useAuthStore.getState();
    if (user) {
      useAuthStore.getState().setUser({
        ...user,
        creditSeconds: dbUser.creditSeconds,
        language: (dbUser.language as User['language']) || user.language,
      });
    }
  } catch {
    // API not available (e.g. offline, no backend) — keep Firebase-only data
  }
}

// ── Mock auth (when Firebase is not configured) ──

const MOCK_ACCOUNTS: Record<string, { password: string; user: User }> = {
  'demo@example.com': {
    password: 'demo1234',
    user: {
      id: 'mock-001',
      email: 'demo@example.com',
      displayName: 'Demo User',
      creditSeconds: 0,
      language: 'ko',
      createdAt: '2026-01-01T00:00:00Z',
    },
  },
};

const MOCK_STORAGE_KEY = 'koedub_mock_user';

function getMockUser(): User | null {
  try {
    const stored = localStorage.getItem(MOCK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function setMockUser(user: User | null) {
  if (user) {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(MOCK_STORAGE_KEY);
  }
}

async function mockSignInWithEmail(email: string, password: string): Promise<User> {
  await new Promise((r) => setTimeout(r, 500));
  const account = MOCK_ACCOUNTS[email];
  if (!account || account.password !== password) {
    throw new Error('auth/invalid-credential');
  }
  setMockUser(account.user);
  return account.user;
}

async function mockSignUpWithEmail(email: string, password: string, displayName: string): Promise<User> {
  await new Promise((r) => setTimeout(r, 500));
  if (MOCK_ACCOUNTS[email]) {
    throw new Error('auth/email-already-in-use');
  }
  const user: User = {
    id: `mock-${Date.now()}`,
    email,
    displayName,
    creditSeconds: 0,
    language: 'ko',
    createdAt: new Date().toISOString(),
  };
  MOCK_ACCOUNTS[email] = { password, user };
  setMockUser(user);
  return user;
}

async function mockSignInWithGoogle(): Promise<User> {
  // In mock mode, just sign in as the default account
  const defaultAccount = MOCK_ACCOUNTS['demo@example.com'];
  setMockUser(defaultAccount.user);
  return defaultAccount.user;
}

async function mockSignOut() {
  setMockUser(null);
  useAuthStore.getState().setUser(null);
}

function mockInitAuthListener() {
  const { setUser } = useAuthStore.getState();
  const user = getMockUser();
  setUser(user);
  if (user) syncUserFromDb();
}

async function mockUpdateProfile(displayName: string) {
  const user = getMockUser();
  if (!user) throw new Error('Not authenticated');
  const updated = { ...user, displayName };
  setMockUser(updated);
  useAuthStore.getState().setUser(updated);
}

// ── Firebase auth (when configured) ──

type SignInFn = (email: string, password: string) => Promise<User>;
type SignUpFn = (email: string, password: string, displayName: string) => Promise<User>;
type GoogleFn = () => Promise<User>;
type SignOutFn = () => Promise<void>;
type InitFn = () => void;
type UpdateProfileFn = (displayName: string) => Promise<void>;

let firebaseSignIn: SignInFn;
let firebaseSignUp: SignUpFn;
let firebaseGoogleSignIn: GoogleFn;
let firebaseSignOut: SignOutFn;
let firebaseInitListener: InitFn;
let firebaseUpdateProfile: UpdateProfileFn;

if (FIREBASE_CONFIGURED) {
  // Lazy import to avoid Firebase init errors when not configured
  const firebaseApp = await import('firebase/app');
  const firebaseAuth = await import('firebase/auth');

  const app = firebaseApp.initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  });

  const auth = firebaseAuth.getAuth(app);
  const googleProvider = new firebaseAuth.GoogleAuthProvider();

  function mapFirebaseUser(fbUser: import('firebase/auth').User): User {
    return {
      id: fbUser.uid,
      email: fbUser.email || '',
      displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
      photoURL: fbUser.photoURL || undefined,
      creditSeconds: 0,
      language: 'ko',
      createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
    };
  }

  firebaseGoogleSignIn = async () => {
    const result = await firebaseAuth.signInWithPopup(auth, googleProvider);
    return mapFirebaseUser(result.user);
  };

  firebaseSignIn = async (email: string, password: string) => {
    const result = await firebaseAuth.signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUser(result.user);
  };

  firebaseSignUp = async (email: string, password: string, displayName: string) => {
    const result = await firebaseAuth.createUserWithEmailAndPassword(auth, email, password);
    await firebaseAuth.updateProfile(result.user, { displayName });
    return mapFirebaseUser(result.user);
  };

  firebaseSignOut = async () => {
    await firebaseAuth.signOut(auth);
    useAuthStore.getState().setUser(null);
  };

  firebaseInitListener = () => {
    const { setUser, setLoading } = useAuthStore.getState();
    setLoading(true);
    firebaseAuth.onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser ? mapFirebaseUser(fbUser) : null);
      if (fbUser) syncUserFromDb();
    });
  };

  firebaseUpdateProfile = async (displayName: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');
    await firebaseAuth.updateProfile(currentUser, { displayName });
    const { user } = useAuthStore.getState();
    if (user) {
      useAuthStore.getState().setUser({ ...user, displayName });
    }
  };
}

// ── Exports (auto-switch between mock and Firebase) ──

export const signInWithEmail: SignInFn = FIREBASE_CONFIGURED ? firebaseSignIn! : mockSignInWithEmail;
export const signUpWithEmail: SignUpFn = FIREBASE_CONFIGURED ? firebaseSignUp! : mockSignUpWithEmail;
export const signInWithGoogle: GoogleFn = FIREBASE_CONFIGURED ? firebaseGoogleSignIn! : mockSignInWithGoogle;
export const signOut: SignOutFn = FIREBASE_CONFIGURED ? firebaseSignOut! : mockSignOut;
export const initAuthListener: InitFn = FIREBASE_CONFIGURED ? firebaseInitListener! : mockInitAuthListener;
export const updateProfile: UpdateProfileFn = FIREBASE_CONFIGURED ? firebaseUpdateProfile! : mockUpdateProfile;
