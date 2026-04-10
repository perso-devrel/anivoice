import { describe, it, expect } from 'vitest';
import ko from './ko';
import en from './en';

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...collectKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

describe('i18n key parity', () => {
  const koKeys = collectKeys(ko as Record<string, unknown>);
  const enKeys = collectKeys(en as Record<string, unknown>);

  it('ko and en have the same number of keys', () => {
    expect(koKeys.length).toBe(enKeys.length);
  });

  it('every ko key exists in en', () => {
    const enSet = new Set(enKeys);
    const missing = koKeys.filter((k) => !enSet.has(k));
    expect(missing).toEqual([]);
  });

  it('every en key exists in ko', () => {
    const koSet = new Set(koKeys);
    const missing = enKeys.filter((k) => !koSet.has(k));
    expect(missing).toEqual([]);
  });

  it('array keys have matching lengths', () => {
    const mismatched: string[] = [];
    function checkArrays(
      a: Record<string, unknown>,
      b: Record<string, unknown>,
      prefix = '',
    ) {
      for (const key of Object.keys(a)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const aVal = a[key];
        const bVal = b[key];
        if (Array.isArray(aVal) && Array.isArray(bVal)) {
          if (aVal.length !== bVal.length) mismatched.push(fullKey);
        } else if (
          aVal !== null &&
          bVal !== null &&
          typeof aVal === 'object' &&
          typeof bVal === 'object' &&
          !Array.isArray(aVal)
        ) {
          checkArrays(
            aVal as Record<string, unknown>,
            bVal as Record<string, unknown>,
            fullKey,
          );
        }
      }
    }
    checkArrays(
      ko as Record<string, unknown>,
      en as Record<string, unknown>,
    );
    expect(mismatched).toEqual([]);
  });

  it('no empty string values in ko', () => {
    const empty = koKeys.filter((k) => {
      const parts = k.split('.');
      let val: unknown = ko;
      for (const p of parts) val = (val as Record<string, unknown>)[p];
      return val === '';
    });
    expect(empty).toEqual([]);
  });

  it('no empty string values in en', () => {
    const empty = enKeys.filter((k) => {
      const parts = k.split('.');
      let val: unknown = en;
      for (const p of parts) val = (val as Record<string, unknown>)[p];
      return val === '';
    });
    expect(empty).toEqual([]);
  });
});
