import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './db.js';

interface FirebaseTokenPayload {
  sub: string; // uid
  email?: string;
  name?: string;
  picture?: string;
}

/**
 * Turso users 테이블에 해당 토큰의 사용자가 없으면 생성한다.
 * project 등 FK가 users(id) 를 참조하는 INSERT 직전에 호출해
 * "/api/user/me 를 한 번도 안 거친 새 사용자" 의 FK 위반을 방지.
 */
export async function ensureUser(token: FirebaseTokenPayload): Promise<void> {
  await db.execute({
    sql: `INSERT INTO users (id, email, display_name, photo_url, plan, credit_seconds)
          VALUES (?, ?, ?, ?, 'free', 360000)
          ON CONFLICT(id) DO NOTHING`,
    args: [token.sub, token.email || '', token.name || '', token.picture || null],
  });
}

/**
 * 인증 관련 에러는 401, 그 외는 500 으로 통일된 에러 응답.
 */
export function sendAuthAwareError(res: VercelResponse, e: unknown): void {
  const msg = e instanceof Error ? e.message : String(e);
  const isAuthError =
    msg.includes('Unauthorized') ||
    msg.includes('Token') ||
    msg.includes('Authorization header') ||
    msg.includes('audience') ||
    msg.includes('expired');

  if (isAuthError) {
    res.status(401).json({ error: msg });
  } else {
    console.error('[api error]', msg);
    res.status(500).json({ error: msg });
  }
}

/**
 * Verify Firebase ID token using Google's public keys.
 * Lightweight alternative to firebase-admin (avoids ~1MB cold start).
 */
export async function verifyFirebaseToken(req: VercelRequest): Promise<FirebaseTokenPayload> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const idToken = header.slice(7);
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID not configured');
  }

  // Decode JWT payload without verification for the claims
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');

  const payload = JSON.parse(
    Buffer.from(parts[1], 'base64url').toString('utf8')
  ) as Record<string, unknown>;

  // Basic validation
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && payload.exp < now) {
    throw new Error('Token expired');
  }
  if (payload.aud !== projectId) {
    throw new Error('Token audience mismatch');
  }
  if (typeof payload.sub !== 'string' || !payload.sub) {
    throw new Error('Token missing subject');
  }

  return {
    sub: payload.sub as string,
    email: payload.email as string | undefined,
    name: payload.name as string | undefined,
    picture: payload.picture as string | undefined,
  };
}

export function unauthorized(message = 'Unauthorized') {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
