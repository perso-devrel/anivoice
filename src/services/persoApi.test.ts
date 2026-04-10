import { describe, it, expect } from 'vitest';
import {
  unwrapResult,
  extractProjectIds,
  findApiMessage,
  isTransientError,
  isRecord,
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
