import { describe, it, expect } from 'vitest';
import { buildTargetUrl, buildForwardHeaders, serializeBody, isHopByHopHeader } from './proxy';

describe('buildTargetUrl', () => {
  const base = 'https://api.perso.ai';

  it('builds URL without query', () => {
    expect(buildTargetUrl(base, 'v1/spaces', {})).toBe('https://api.perso.ai/v1/spaces');
  });

  it('builds URL with single query param', () => {
    expect(buildTargetUrl(base, 'v1/spaces', { page: '1' })).toBe(
      'https://api.perso.ai/v1/spaces?page=1',
    );
  });

  it('builds URL with multiple query params', () => {
    const url = buildTargetUrl(base, 'v1/spaces', { page: '1', limit: '10' });
    expect(url).toContain('page=1');
    expect(url).toContain('limit=10');
  });

  it('builds URL with array query param', () => {
    const url = buildTargetUrl(base, 'v1/media', { lang: ['en', 'ko'] });
    expect(url).toContain('lang=en');
    expect(url).toContain('lang=ko');
  });

  it('handles empty persoPath', () => {
    expect(buildTargetUrl(base, '', {})).toBe('https://api.perso.ai/');
  });

  it('skips undefined values in query', () => {
    const query = { a: '1', b: undefined as unknown as string };
    const url = buildTargetUrl(base, 'test', query);
    expect(url).toContain('a=1');
    expect(url).not.toContain('b=');
  });
});

describe('buildForwardHeaders', () => {
  const key = 'test-api-key';

  it('always includes XP-API-KEY', () => {
    const h = buildForwardHeaders(key, undefined, 'GET');
    expect(h['XP-API-KEY']).toBe(key);
  });

  it('preserves incoming content-type', () => {
    const h = buildForwardHeaders(key, 'multipart/form-data', 'POST');
    expect(h['Content-Type']).toBe('multipart/form-data');
  });

  it('defaults to application/json for non-GET without content-type', () => {
    const h = buildForwardHeaders(key, undefined, 'POST');
    expect(h['Content-Type']).toBe('application/json');
  });

  it('does not set content-type for GET without incoming', () => {
    const h = buildForwardHeaders(key, undefined, 'GET');
    expect(h['Content-Type']).toBeUndefined();
  });

  it('does not set content-type for HEAD without incoming', () => {
    const h = buildForwardHeaders(key, undefined, 'HEAD');
    expect(h['Content-Type']).toBeUndefined();
  });

  it('prefers incoming content-type over default for non-GET', () => {
    const h = buildForwardHeaders(key, 'text/xml', 'PUT');
    expect(h['Content-Type']).toBe('text/xml');
  });

  it('handles undefined method', () => {
    const h = buildForwardHeaders(key, undefined, undefined);
    expect(h['Content-Type']).toBeUndefined();
  });
});

describe('serializeBody', () => {
  it('returns undefined for GET', () => {
    expect(serializeBody('GET', { a: 1 })).toBeUndefined();
  });

  it('returns undefined for HEAD', () => {
    expect(serializeBody('HEAD', 'data')).toBeUndefined();
  });

  it('returns undefined for null body', () => {
    expect(serializeBody('POST', null)).toBeUndefined();
  });

  it('returns undefined for undefined body', () => {
    expect(serializeBody('POST', undefined)).toBeUndefined();
  });

  it('returns string body as-is', () => {
    expect(serializeBody('POST', '{"a":1}')).toBe('{"a":1}');
  });

  it('JSON-stringifies object body', () => {
    expect(serializeBody('POST', { a: 1 })).toBe('{"a":1}');
  });

  it('handles undefined method', () => {
    expect(serializeBody(undefined, { a: 1 })).toBeUndefined();
  });

  it('works with PUT method', () => {
    expect(serializeBody('PUT', { b: 2 })).toBe('{"b":2}');
  });

  it('works with PATCH method', () => {
    expect(serializeBody('PATCH', 'raw')).toBe('raw');
  });
});

describe('isHopByHopHeader', () => {
  it('detects connection', () => {
    expect(isHopByHopHeader('connection')).toBe(true);
  });

  it('detects transfer-encoding', () => {
    expect(isHopByHopHeader('transfer-encoding')).toBe(true);
  });

  it('detects content-encoding', () => {
    expect(isHopByHopHeader('content-encoding')).toBe(true);
  });

  it('detects content-length', () => {
    expect(isHopByHopHeader('content-length')).toBe(true);
  });

  it('detects keep-alive', () => {
    expect(isHopByHopHeader('keep-alive')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isHopByHopHeader('Content-Length')).toBe(true);
    expect(isHopByHopHeader('KEEP-ALIVE')).toBe(true);
  });

  it('returns false for non-hop-by-hop headers', () => {
    expect(isHopByHopHeader('x-custom')).toBe(false);
    expect(isHopByHopHeader('content-type')).toBe(false);
    expect(isHopByHopHeader('authorization')).toBe(false);
  });
});
