import { describe, it, expect } from 'vitest';
import {
  unwrapResult,
  extractProjectIds,
  findApiMessage,
  isTransientError,
  isRecord,
  resolvePersoFileUrl,
  extractApiErrorMessage,
} from './persoApi';

describe('isRecord', () => {
  it('returns true for plain objects', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ a: 1 })).toBe(true);
  });

  it('returns false for non-objects', () => {
    expect(isRecord(null)).toBe(false);
    expect(isRecord(undefined)).toBe(false);
    expect(isRecord(42)).toBe(false);
    expect(isRecord('str')).toBe(false);
    expect(isRecord([1, 2])).toBe(false);
  });
});

describe('unwrapResult', () => {
  it('extracts .result when present', () => {
    expect(unwrapResult({ result: { id: 1 } })).toEqual({ id: 1 });
  });

  it('extracts primitive .result', () => {
    expect(unwrapResult({ result: 'ok' })).toBe('ok');
  });

  it('returns payload as-is when no result key', () => {
    const payload = { id: 1, name: 'test' };
    expect(unwrapResult(payload)).toEqual(payload);
  });

  it('returns array payload as-is', () => {
    const arr = [1, 2, 3];
    expect(unwrapResult(arr)).toEqual(arr);
  });

  it('returns null result when result is null', () => {
    expect(unwrapResult({ result: null })).toBe(null);
  });
});

describe('findApiMessage', () => {
  it('returns string payload directly', () => {
    expect(findApiMessage('Server error')).toBe('Server error');
  });

  it('trims whitespace', () => {
    expect(findApiMessage('  error  ')).toBe('error');
  });

  it('returns undefined for empty string', () => {
    expect(findApiMessage('')).toBeUndefined();
    expect(findApiMessage('   ')).toBeUndefined();
  });

  it('extracts from detail key', () => {
    expect(findApiMessage({ detail: 'Not found' })).toBe('Not found');
  });

  it('extracts from message key', () => {
    expect(findApiMessage({ message: 'Bad request' })).toBe('Bad request');
  });

  it('extracts from error key', () => {
    expect(findApiMessage({ error: 'Unauthorized' })).toBe('Unauthorized');
  });

  it('extracts from title key', () => {
    expect(findApiMessage({ title: 'Forbidden' })).toBe('Forbidden');
  });

  it('prioritizes detail over message', () => {
    expect(findApiMessage({ detail: 'A', message: 'B' })).toBe('A');
  });

  it('searches nested result', () => {
    expect(findApiMessage({ result: { message: 'inner' } })).toBe('inner');
  });

  it('searches nested data', () => {
    expect(findApiMessage({ data: { error: 'deep' } })).toBe('deep');
  });

  it('returns undefined for non-matching payload', () => {
    expect(findApiMessage({ foo: 123, bar: true })).toBeUndefined();
    expect(findApiMessage(null)).toBeUndefined();
    expect(findApiMessage(42)).toBeUndefined();
  });
});

describe('extractProjectIds', () => {
  it('extracts from { result: { startGenerateProjectIdList } }', () => {
    const payload = { result: { startGenerateProjectIdList: [100, 200] } };
    expect(extractProjectIds(payload)).toEqual([100, 200]);
  });

  it('extracts from flat { startGenerateProjectIdList }', () => {
    expect(extractProjectIds({ startGenerateProjectIdList: [42] })).toEqual([42]);
  });

  it('extracts from { projectSeqList }', () => {
    expect(extractProjectIds({ projectSeqList: [1, 2, 3] })).toEqual([1, 2, 3]);
  });

  it('extracts from { projectIdList }', () => {
    expect(extractProjectIds({ result: { projectIdList: [5] } })).toEqual([5]);
  });

  it('extracts from { projectIds }', () => {
    expect(extractProjectIds({ projectIds: [10, 20] })).toEqual([10, 20]);
  });

  it('extracts from { projectSeqs }', () => {
    expect(extractProjectIds({ projectSeqs: [7] })).toEqual([7]);
  });

  it('extracts single projectSeq', () => {
    expect(extractProjectIds({ projectSeq: 99 })).toEqual([99]);
  });

  it('extracts single projectId', () => {
    expect(extractProjectIds({ result: { projectId: 55 } })).toEqual([55]);
  });

  it('extracts single project_seq', () => {
    expect(extractProjectIds({ project_seq: 77 })).toEqual([77]);
  });

  it('extracts single project_id', () => {
    expect(extractProjectIds({ project_id: 88 })).toEqual([88]);
  });

  it('handles array of objects with seq/id fields', () => {
    const payload = {
      result: { startGenerateProjectIdList: [{ projectSeq: 1 }, { projectSeq: 2 }] },
    };
    expect(extractProjectIds(payload)).toEqual([1, 2]);
  });

  it('handles string numeric ids', () => {
    expect(extractProjectIds({ projectSeqList: ['123', '456'] })).toEqual([123, 456]);
  });

  it('handles result as array directly', () => {
    expect(extractProjectIds({ result: [10, 20, 30] })).toEqual([10, 20, 30]);
  });

  it('returns empty for unrecognized structure', () => {
    expect(extractProjectIds({})).toEqual([]);
    expect(extractProjectIds({ foo: 'bar' })).toEqual([]);
    expect(extractProjectIds(null)).toEqual([]);
    expect(extractProjectIds('string')).toEqual([]);
  });

  it('filters non-numeric values from arrays', () => {
    expect(extractProjectIds({ projectSeqList: [1, null, 'abc', 2] })).toEqual([1, 2]);
  });
});

describe('isTransientError', () => {
  it('treats 500+ as transient', () => {
    const err = Object.assign(new Error('fail'), {
      isAxiosError: true,
      response: { status: 502 },
      config: {},
      toJSON: () => ({}),
    });
    // Patch axios.isAxiosError to recognize this
    expect(isTransientError(err)).toBe(true);
  });

  it('treats network errors (no status) as transient', () => {
    const err = new Error('fetch failed');
    expect(isTransientError(err)).toBe(true);
  });

  it('treats ECONNRESET as transient', () => {
    expect(isTransientError(new Error('ECONNRESET'))).toBe(true);
  });

  it('treats ETIMEDOUT as transient', () => {
    expect(isTransientError(new Error('ETIMEDOUT'))).toBe(true);
  });

  it('treats socket error as transient', () => {
    expect(isTransientError(new Error('socket hang up'))).toBe(true);
  });

  it('does not treat 400 as transient', () => {
    expect(isTransientError(new Error('Bad request'))).toBe(false);
  });

  it('does not treat non-Error as transient', () => {
    expect(isTransientError('string error')).toBe(false);
    expect(isTransientError(42)).toBe(false);
    expect(isTransientError(null)).toBe(false);
  });
});

describe('resolvePersoFileUrl', () => {
  it('returns undefined for null/undefined/empty', () => {
    expect(resolvePersoFileUrl(null)).toBeUndefined();
    expect(resolvePersoFileUrl(undefined)).toBeUndefined();
    expect(resolvePersoFileUrl('')).toBeUndefined();
  });

  it('returns absolute URL as-is', () => {
    const url = 'https://cdn.perso.ai/files/video.mp4';
    expect(resolvePersoFileUrl(url)).toBe(url);
  });

  it('returns http URL as-is', () => {
    const url = 'http://example.com/file.mp4';
    expect(resolvePersoFileUrl(url)).toBe(url);
  });

  it('prepends base URL for relative paths', () => {
    expect(resolvePersoFileUrl('/files/video.mp4')).toBe('https://perso.ai/files/video.mp4');
  });
});

function makeAxiosError(overrides: {
  status?: number;
  url?: string;
  method?: string;
  data?: unknown;
  message?: string;
}) {
  return Object.assign(new Error(overrides.message || 'request failed'), {
    isAxiosError: true as const,
    response: overrides.status != null
      ? { status: overrides.status, data: overrides.data }
      : undefined,
    config: {
      url: overrides.url || '/portal/api/v1/spaces',
      method: overrides.method || 'get',
    },
    toJSON: () => ({}),
  });
}

describe('extractApiErrorMessage', () => {
  it('formats generic axios error with status', () => {
    const err = makeAxiosError({ status: 404, data: { message: 'Not found' } });
    expect(extractApiErrorMessage(err)).toBe('Perso API request failed (404): Not found');
  });

  it('falls back to error.message when no API message in data', () => {
    const err = makeAxiosError({ status: 500, data: null, message: 'Internal Server Error' });
    expect(extractApiErrorMessage(err)).toBe('Perso API request failed (500): Internal Server Error');
  });

  it('returns detail without status prefix for network errors', () => {
    const err = makeAxiosError({ message: 'Network Error' });
    expect(extractApiErrorMessage(err)).toBe('Network Error');
  });

  it('returns special message for 401 on file upload endpoint', () => {
    const err = makeAxiosError({
      status: 401,
      url: '/file/api/v1/upload',
      method: 'post',
      data: { message: 'Unauthorized' },
    });
    expect(extractApiErrorMessage(err)).toContain('Perso File API rejected this upload request');
  });

  it('returns special message for 403 on file upload endpoint', () => {
    const err = makeAxiosError({
      status: 403,
      url: '/file/api/v1/upload',
      method: 'PUT',
      data: { error: 'Forbidden' },
    });
    expect(extractApiErrorMessage(err)).toContain('file upload/write endpoints are not authorized');
  });

  it('does NOT trigger file upload message for GET requests', () => {
    const err = makeAxiosError({
      status: 401,
      url: '/file/api/v1/upload',
      method: 'get',
      data: { message: 'Unauthorized' },
    });
    expect(extractApiErrorMessage(err)).toBe('Perso API request failed (401): Unauthorized');
  });

  it('does NOT trigger file upload message for non-file URLs', () => {
    const err = makeAxiosError({
      status: 401,
      url: '/portal/api/v1/spaces',
      method: 'post',
      data: { message: 'Unauthorized' },
    });
    expect(extractApiErrorMessage(err)).toBe('Perso API request failed (401): Unauthorized');
  });

  it('extracts message from plain Error', () => {
    expect(extractApiErrorMessage(new Error('something broke'))).toBe('something broke');
  });

  it('stringifies non-Error values', () => {
    expect(extractApiErrorMessage('raw string')).toBe('raw string');
    expect(extractApiErrorMessage(42)).toBe('42');
    expect(extractApiErrorMessage(null)).toBe('null');
  });

  it('handles axios error with detail in response data', () => {
    const err = makeAxiosError({ status: 422, data: { detail: 'Validation error' } });
    expect(extractApiErrorMessage(err)).toBe('Perso API request failed (422): Validation error');
  });

  it('defaults method to GET when config has no method', () => {
    const err = Object.assign(new Error('fail'), {
      isAxiosError: true as const,
      response: { status: 401, data: null },
      config: { url: '/file/api/v1/upload' },
      toJSON: () => ({}),
    });
    expect(extractApiErrorMessage(err)).toBe('Perso API request failed (401): fail');
  });
});
