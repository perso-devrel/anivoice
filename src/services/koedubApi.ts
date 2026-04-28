import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  try {
    const token = await getFirebaseIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // No token available — endpoints that don't need auth will still work
  }
  return config;
});

/** Get Firebase ID token from current user */
async function getFirebaseIdToken(): Promise<string | null> {
  // Dynamic import to avoid circular dependency with firebase.ts
  try {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  } catch {
    // Firebase not initialized — check localStorage for mock token
    const mockUser = localStorage.getItem('koedub_mock_user');
    if (mockUser) {
      // For mock auth, create a fake JWT-like token
      const payload = btoa(JSON.stringify({
        sub: JSON.parse(mockUser).id,
        email: JSON.parse(mockUser).email,
        name: JSON.parse(mockUser).displayName,
        exp: Math.floor(Date.now() / 1000) + 3600,
        aud: 'mock',
      }));
      return `header.${payload}.signature`;
    }
    return null;
  }
}

// ── User ──

interface DbUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  creditSeconds: number;
  language: string;
  createdAt: string;
}

export async function getMe(): Promise<DbUser> {
  const { data } = await api.get('/user/me');
  return data;
}

// ── Projects ──

export interface DbProject {
  id: number;
  title: string;
  originalFileName: string;
  sourceLanguage: string;
  targetLanguage: string;
  status: string;
  progress: number;
  durationMs: number;
  persoProjectSeq: number | null;
  persoSpaceSeq: number | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  subtitleUrl: string | null;
  zipUrl: string | null;
  isPublic: boolean;
  isFavorite: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export async function listMyProjects(limit = 20, offset = 0): Promise<{ projects: DbProject[]; total: number }> {
  const { data } = await api.get('/projects', { params: { limit, offset } });
  return data;
}

export async function getProjectByPersoSeq(persoProjectSeq: number, persoSpaceSeq: number): Promise<DbProject | null> {
  const { data } = await api.get('/projects', {
    params: { persoProjectSeq, persoSpaceSeq, limit: 1 },
  });
  return data.projects?.[0] ?? null;
}

export async function createProject(params: {
  title: string;
  originalFileName?: string;
  sourceLanguage: string;
  targetLanguage: string;
  durationMs?: number;
  persoProjectSeq?: number;
  persoSpaceSeq?: number;
}): Promise<{ id: number }> {
  const { data } = await api.post('/projects', params);
  return data;
}

export async function updateProject(id: number, params: {
  status?: string;
  progress?: number;
  durationMs?: number;
  persoProjectSeq?: number;
  persoSpaceSeq?: number;
  thumbnailUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  subtitleUrl?: string;
  zipUrl?: string;
}): Promise<void> {
  await api.patch(`/projects/${id}`, params);
}

export async function toggleFavorite(id: number, isFavorite: boolean): Promise<void> {
  await api.patch(`/projects/${id}`, { isFavorite });
}

export async function publishProject(id: number, tagIds: number[], isPublic = true): Promise<void> {
  await api.post(`/projects/${id}/publish`, { tagIds, isPublic });
}

// ── Credits ──

export async function deductCredits(projectId: number, durationMs: number, languageCount = 1): Promise<{ remainingSeconds: number; deducted: number }> {
  const { data } = await api.post('/credits/deduct', { projectId, durationMs, languageCount });
  return data;
}

export async function purchaseCredits(params: { seconds?: number; description?: string; paymentIntentId?: string }): Promise<{ creditSeconds: number; added: number }> {
  const { data } = await api.post('/credits/purchase', params);
  return data;
}

export interface CreditHistoryDay {
  day: string;
  usedSeconds: number;
  txCount: number;
}

export async function getCreditHistory(days = 30): Promise<{ days: number; data: CreditHistoryDay[] }> {
  const { data } = await api.get('/credits/history', { params: { days } });
  return data;
}

export interface CreditTransaction {
  id: number;
  type: string;
  amountSeconds: number;
  balanceAfter: number;
  description: string | null;
  projectId: number | null;
  createdAt: string;
}

export async function getCreditTransactions(limit = 20, offset = 0): Promise<{ transactions: CreditTransaction[]; total: number }> {
  const { data } = await api.get('/credits/transactions', { params: { limit, offset } });
  return data;
}

// ── Library (public, no auth) ──

export interface LibraryItem {
  id: number;
  title: string;
  authorName: string;
  sourceLanguage: string;
  targetLanguage: string;
  durationMs: number;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  tags: string[];
  createdAt: string;
}

export interface LibraryItemDetail extends LibraryItem {
  audioUrl: string | null;
  subtitleUrl: string | null;
}

export async function getLibrary(params: {
  tag?: string;
  lang?: string;
  sort?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ items: LibraryItem[]; total: number }> {
  const { data } = await api.get('/library', { params });
  return data;
}

export async function getLibraryItem(id: number): Promise<LibraryItemDetail> {
  const { data } = await api.get(`/library/${id}`);
  return data;
}

// ── Tags ──

export interface Tag {
  id: number;
  name: string;
  displayNameKo: string;
  displayNameEn: string;
}

export async function getTags(): Promise<Tag[]> {
  const { data } = await api.get('/tags');
  return data.tags;
}

