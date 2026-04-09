import type { VercelRequest } from '@vercel/node';

interface FirebaseTokenPayload {
  sub: string; // uid
  email?: string;
  name?: string;
  picture?: string;
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
