import { describe, it, expect } from 'vitest';
import { SUPPORTED_LANGUAGES, LANGUAGE_KEYS } from './constants';

describe('constants', () => {
  it('SUPPORTED_LANGUAGES has 7 entries with key and flag', () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(7);
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(lang).toHaveProperty('key');
      expect(lang).toHaveProperty('flag');
      expect(lang.key.length).toBeGreaterThan(0);
      expect(lang.flag.length).toBeGreaterThan(0);
    }
  });

  it('LANGUAGE_KEYS matches SUPPORTED_LANGUAGES keys', () => {
    expect(LANGUAGE_KEYS).toEqual(SUPPORTED_LANGUAGES.map((l) => l.key));
  });

  it('LANGUAGE_KEYS contains expected languages', () => {
    expect(LANGUAGE_KEYS).toContain('ja');
    expect(LANGUAGE_KEYS).toContain('ko');
    expect(LANGUAGE_KEYS).toContain('en');
    expect(LANGUAGE_KEYS).toContain('es');
    expect(LANGUAGE_KEYS).toContain('pt');
    expect(LANGUAGE_KEYS).toContain('id');
    expect(LANGUAGE_KEYS).toContain('ar');
  });

  it('LANGUAGE_KEYS does not include auto', () => {
    expect(LANGUAGE_KEYS).not.toContain('auto');
  });
});
