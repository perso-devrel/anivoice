import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';

vi.mock('./db.js', () => ({
  db: {
    execute: vi.fn().mockResolvedValue({ rows: [] }),
  },
}));

let unauthorized: typeof import('./auth').unauthorized;
let badRequest: typeof import('./auth').badRequest;
let json: typeof import('./auth').json;
let sendAuthAwareError: typeof import('./auth').sendAuthAwareError;
let verifyFirebaseToken: typeof import('./auth').verifyFirebaseToken;
let ensureUser: typeof import('./auth').ensureUser;

beforeAll(async () => {
  const mod = await import('./auth');
  unauthorized = mod.unauthorized;
  badRequest = mod.badRequest;
  json = mod.json;
  sendAuthAwareError = mod.sendAuthAwareError;
  verifyFirebaseToken = mod.verifyFirebaseToken;
  ensureUser = mod.ensureUser;
});

function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.fakesig`;
}

function mockRequest(authHeader?: string) {
  return {
    headers: authHeader !== undefined ? { authorization: authHeader } : {},
  } as Parameters<typeof verifyFirebaseToken>[0];
}

function mockVercelResponse() {
  let capturedStatus = 0;
  let capturedBody: unknown;
  const res = {
    status(code: number) {
      capturedStatus = code;
      return { json(body: unknown) { capturedBody = body; } };
    },
  };
  return {
    res: res as Parameters<typeof sendAuthAwareError>[0],
    getStatus: () => capturedStatus,
    getBody: () => capturedBody,
  };
}

describe('unauthorized', () => {
  it('returns 401 with default message', async () => {
    const resp = unauthorized();
    expect(resp.status).toBe(401);
    const body = await resp.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 401 with custom message', async () => {
    const resp = unauthorized('Token expired');
    expect(resp.status).toBe(401);
    const body = await resp.json();
    expect(body).toEqual({ error: 'Token expired' });
  });

  it('sets Content-Type header', () => {
    const resp = unauthorized();
    expect(resp.headers.get('Content-Type')).toBe('application/json');
  });
});

describe('badRequest', () => {
  it('returns 400 with message', async () => {
    const resp = badRequest('Missing field');
    expect(resp.status).toBe(400);
    const body = await resp.json();
    expect(body).toEqual({ error: 'Missing field' });
  });

  it('sets Content-Type header', () => {
    const resp = badRequest('x');
    expect(resp.headers.get('Content-Type')).toBe('application/json');
  });
});

describe('json', () => {
  it('returns 200 by default', async () => {
    const resp = json({ ok: true });
    expect(resp.status).toBe(200);
    const body = await resp.json();
    expect(body).toEqual({ ok: true });
  });

  it('accepts custom status', async () => {
    const resp = json({ created: true }, 201);
    expect(resp.status).toBe(201);
  });

  it('serializes arrays', async () => {
    const resp = json([1, 2, 3]);
    const body = await resp.json();
    expect(body).toEqual([1, 2, 3]);
  });

  it('sets Content-Type header', () => {
    const resp = json({});
    expect(resp.headers.get('Content-Type')).toBe('application/json');
  });
});

describe('sendAuthAwareError', () => {
  it('sends 401 for Unauthorized error', () => {
    const { res, getStatus, getBody } = mockVercelResponse();
    sendAuthAwareError(res, new Error('Unauthorized'));
    expect(getStatus()).toBe(401);
    expect(getBody()).toEqual({ error: 'Unauthorized' });
  });

  it('sends 401 for Token errors', () => {
    const { res, getStatus } = mockVercelResponse();
    sendAuthAwareError(res, new Error('Token expired'));
    expect(getStatus()).toBe(401);
  });

  it('sends 401 for Authorization header errors', () => {
    const { res, getStatus } = mockVercelResponse();
    sendAuthAwareError(res, new Error('Missing or invalid Authorization header'));
    expect(getStatus()).toBe(401);
  });

  it('sends 401 for audience mismatch', () => {
    const { res, getStatus } = mockVercelResponse();
    sendAuthAwareError(res, new Error('Token audience mismatch'));
    expect(getStatus()).toBe(401);
  });

  it('sends 401 for expired tokens', () => {
    const { res, getStatus } = mockVercelResponse();
    sendAuthAwareError(res, new Error('expired'));
    expect(getStatus()).toBe(401);
  });

  it('sends 500 for non-auth errors', () => {
    const { res, getStatus, getBody } = mockVercelResponse();
    sendAuthAwareError(res, new Error('Database connection failed'));
    expect(getStatus()).toBe(500);
    expect(getBody()).toEqual({ error: 'Database connection failed' });
  });

  it('handles non-Error values', () => {
    const { res, getStatus, getBody } = mockVercelResponse();
    sendAuthAwareError(res, 'some string error');
    expect(getStatus()).toBe(500);
    expect(getBody()).toEqual({ error: 'some string error' });
  });

  it('sends 500 for generic errors', () => {
    const { res, getStatus } = mockVercelResponse();
    sendAuthAwareError(res, new Error('SQLITE_ERROR'));
    expect(getStatus()).toBe(500);
  });
});

describe('verifyFirebaseToken', () => {
  const PROJECT_ID = 'test-project-123';
  let origEnv: string | undefined;

  beforeEach(() => {
    origEnv = process.env.FIREBASE_PROJECT_ID;
    process.env.FIREBASE_PROJECT_ID = PROJECT_ID;
  });

  afterEach(() => {
    if (origEnv !== undefined) {
      process.env.FIREBASE_PROJECT_ID = origEnv;
    } else {
      delete process.env.FIREBASE_PROJECT_ID;
    }
  });

  it('parses a valid token', async () => {
    const token = makeJwt({
      sub: 'user-1',
      email: 'a@b.com',
      name: 'Test',
      picture: 'https://img/1',
      aud: PROJECT_ID,
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    const result = await verifyFirebaseToken(mockRequest(`Bearer ${token}`));
    expect(result).toEqual({
      sub: 'user-1',
      email: 'a@b.com',
      name: 'Test',
      picture: 'https://img/1',
    });
  });

  it('throws on missing Authorization header', async () => {
    await expect(verifyFirebaseToken(mockRequest())).rejects.toThrow('Authorization header');
  });

  it('throws on non-Bearer Authorization header', async () => {
    await expect(verifyFirebaseToken(mockRequest('Basic abc'))).rejects.toThrow('Authorization header');
  });

  it('throws on malformed token (not 3 parts)', async () => {
    await expect(verifyFirebaseToken(mockRequest('Bearer abc.def'))).rejects.toThrow('Invalid token format');
  });

  it('throws on expired token', async () => {
    const token = makeJwt({
      sub: 'user-1',
      aud: PROJECT_ID,
      exp: Math.floor(Date.now() / 1000) - 100,
    });
    await expect(verifyFirebaseToken(mockRequest(`Bearer ${token}`))).rejects.toThrow('expired');
  });

  it('throws on audience mismatch', async () => {
    const token = makeJwt({
      sub: 'user-1',
      aud: 'wrong-project',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    await expect(verifyFirebaseToken(mockRequest(`Bearer ${token}`))).rejects.toThrow('audience');
  });

  it('throws on missing subject', async () => {
    const token = makeJwt({
      aud: PROJECT_ID,
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    await expect(verifyFirebaseToken(mockRequest(`Bearer ${token}`))).rejects.toThrow('subject');
  });

  it('throws on empty string subject', async () => {
    const token = makeJwt({
      sub: '',
      aud: PROJECT_ID,
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    await expect(verifyFirebaseToken(mockRequest(`Bearer ${token}`))).rejects.toThrow('subject');
  });

  it('throws when FIREBASE_PROJECT_ID is not configured', async () => {
    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.VITE_FIREBASE_PROJECT_ID;
    const token = makeJwt({ sub: 'user-1', aud: 'x', exp: Math.floor(Date.now() / 1000) + 3600 });
    await expect(verifyFirebaseToken(mockRequest(`Bearer ${token}`))).rejects.toThrow('PROJECT_ID');
  });

  it('accepts token without exp (no expiry check)', async () => {
    const token = makeJwt({ sub: 'user-1', aud: PROJECT_ID });
    const result = await verifyFirebaseToken(mockRequest(`Bearer ${token}`));
    expect(result.sub).toBe('user-1');
  });

  it('returns undefined for missing optional fields', async () => {
    const token = makeJwt({
      sub: 'user-1',
      aud: PROJECT_ID,
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    const result = await verifyFirebaseToken(mockRequest(`Bearer ${token}`));
    expect(result.email).toBeUndefined();
    expect(result.name).toBeUndefined();
    expect(result.picture).toBeUndefined();
  });

  it('falls back to VITE_FIREBASE_PROJECT_ID', async () => {
    delete process.env.FIREBASE_PROJECT_ID;
    process.env.VITE_FIREBASE_PROJECT_ID = 'vite-project';
    const token = makeJwt({
      sub: 'user-1',
      aud: 'vite-project',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    const result = await verifyFirebaseToken(mockRequest(`Bearer ${token}`));
    expect(result.sub).toBe('user-1');
    delete process.env.VITE_FIREBASE_PROJECT_ID;
  });
});

describe('ensureUser', () => {
  it('calls db.execute with INSERT OR IGNORE', async () => {
    const { db } = await import('./db.js');
    const executeSpy = vi.mocked(db.execute);
    executeSpy.mockClear();

    await ensureUser({ sub: 'uid-1', email: 'a@b.com', name: 'Test', picture: 'pic.jpg' });

    expect(executeSpy).toHaveBeenCalledOnce();
    const call = executeSpy.mock.calls[0][0];
    expect(typeof call === 'object' && 'sql' in call ? call.sql : '').toContain('INSERT');
    expect(typeof call === 'object' && 'args' in call ? call.args : []).toEqual(['uid-1', 'a@b.com', 'Test', 'pic.jpg']);
  });

  it('defaults empty strings for missing email/name', async () => {
    const { db } = await import('./db.js');
    const executeSpy = vi.mocked(db.execute);
    executeSpy.mockClear();

    await ensureUser({ sub: 'uid-2' });

    const call = executeSpy.mock.calls[0][0];
    expect(typeof call === 'object' && 'args' in call ? call.args : []).toEqual(['uid-2', '', '', null]);
  });
});
