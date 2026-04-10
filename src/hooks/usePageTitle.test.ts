import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'pageTitle.dashboard': 'Dashboard',
        'pageTitle.studio': 'Dubbing Studio',
        'pageTitle.empty': '',
      };
      return map[key] ?? key;
    },
    i18n: { language: 'en' },
  }),
}));

let effectFn: (() => void) | null = null;
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    useEffect: (fn: () => void) => { effectFn = fn; },
  };
});

Object.defineProperty(globalThis, 'document', {
  value: { title: 'AniVoice' },
  writable: true,
});

import { usePageTitle } from './usePageTitle';

describe('usePageTitle', () => {
  beforeEach(() => {
    document.title = 'AniVoice';
    effectFn = null;
  });

  it('sets document.title with translated key and app name', () => {
    usePageTitle('pageTitle.dashboard');
    effectFn?.();
    expect(document.title).toBe('Dashboard | AniVoice');
  });

  it('uses different title for studio', () => {
    usePageTitle('pageTitle.studio');
    effectFn?.();
    expect(document.title).toBe('Dubbing Studio | AniVoice');
  });

  it('falls back to app name when translation is empty', () => {
    usePageTitle('pageTitle.empty');
    effectFn?.();
    expect(document.title).toBe('AniVoice');
  });

  it('cleanup restores default title', () => {
    usePageTitle('pageTitle.dashboard');
    const cleanup = effectFn?.() as unknown as (() => void) | undefined;
    cleanup?.();
    expect(document.title).toBe('AniVoice');
  });
});
