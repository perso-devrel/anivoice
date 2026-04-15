import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './db.js';

interface FirebaseTokenPayload {
  sub: string; // uid
  email?: string;
  name?: string;
  picture?: string;
}

/**
 * Upsert the token's user into the Turso users table (no-op if exists).
 * Call before any INSERT that has an FK to users(id) to prevent
 * FK violations for users who haven't hit /api/user/me yet.
 */
export async function ensureUser(token: FirebaseTokenPayload): Promise<void> {
  await db.execute({
    sql: `INSERT INTO users (id, email, display_name, photo_url, credit_seconds)
          VALUES (?, ?, ?, ?, 0)
          ON CONFLICT(id) DO NOTHING`,
    args: [token.sub, token.email || '', token.name || '', token.picture || null],
  });
}

/**
 * Send 401 for auth-related errors, 500 for everything else.
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

const GOOGLE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

let cachedCerts: Record<string, string> | null = null;
let cachedCertsExpiry = 0;

async function getGoogleCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedCerts && now < cachedCertsExpiry) return cachedCerts;

  const res = await fetch(GOOGLE_CERTS_URL);
  if (!res.ok) throw new Error(`Failed to fetch Google certs: ${res.status}`);

  const cacheControl = res.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) * 1000 : 3600_000;

  cachedCerts = await res.json() as Record<string, string>;
  cachedCertsExpiry = now + maxAge;
  return cachedCerts;
}

function base64urlDecode(str: string): Buffer {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  return Buffer.from(padded, 'base64');
}

/**
 * Verify Firebase ID token using Google's public X.509 certificates.
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

  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');

  // Decode header to get key ID
  const jwtHeader = JSON.parse(
    base64urlDecode(parts[0]).toString('utf8')
  ) as Record<string, unknown>;

  const kid = jwtHeader.kid as string | undefined;
  if (!kid) throw new Error('Token header missing kid');
  if (jwtHeader.alg !== 'RS256') throw new Error('Unsupported algorithm');

  // Verify signature with Google's public certificate
  const certs = await getGoogleCerts();
  const cert = certs[kid];
  if (!cert) throw new Error('Token signed with unknown key');

  const crypto = await import('crypto');
  const signatureValid = crypto.createVerify('RSA-SHA256')
    .update(`${parts[0]}.${parts[1]}`)
    .verify(cert, base64urlDecode(parts[2]));

  if (!signatureValid) throw new Error('Token signature verification failed');

  // Decode and validate claims
  const payload = JSON.parse(
    base64urlDecode(parts[1]).toString('utf8')
  ) as Record<string, unknown>;

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && payload.exp < now) {
    throw new Error('Token expired');
  }
  if (typeof payload.iat === 'number' && payload.iat > now + 60) {
    throw new Error('Token issued in the future');
  }
  if (payload.aud !== projectId) {
    throw new Error('Token audience mismatch');
  }
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    throw new Error('Token issuer mismatch');
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
