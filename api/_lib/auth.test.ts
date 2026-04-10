import { describe, it, expect, vi, beforeAll } from 'vitest';

vi.mock('./db.js', () => ({ db: {} }));

let unauthorized: typeof import('./auth').unauthorized;
let badRequest: typeof import('./auth').badRequest;
let json: typeof import('./auth').json;
let sendAuthAwareError: typeof import('./auth').sendAuthAwareError;

beforeAll(async () => {
  const mod = await import('./auth');
  unauthorized = mod.unauthorized;
  badRequest = mod.badRequest;
  json = mod.json;
  sendAuthAwareError = mod.sendAuthAwareError;
});

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
