import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'pageTitle.dashboard': 'Dashboard',
        'pageTitle.studio': 'Dubbing Studio',
        'pageTitle.empty': '',
        'pageDesc.dashboard': 'View your dubbing projects, credits, and usage at a glance.',
        'pageDesc.studio': 'Upload an anime video and dub it into your chosen language with AI.',
        'pageDesc.empty': '',
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

const metaEl = { getAttribute: vi.fn(), setAttribute: vi.fn() };

Object.defineProperty(globalThis, 'document', {
  value: {
    title: 'AniVoice',
    querySelector: (sel: string) => sel === 'meta[name="description"]' ? metaEl : null,
  },
  writable: true,
});

import { usePageTitle } from './usePageTitle';

describe('usePageTitle', () => {
  beforeEach(() => {
    document.title = 'AniVoice';
    effectFn = null;
    metaEl.getAttribute.mockReturnValue('default desc');
    metaEl.setAttribute.mockClear();
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

  it('sets meta description from pageDesc key', () => {
    usePageTitle('pageTitle.dashboard');
    effectFn?.();
    expect(metaEl.setAttribute).toHaveBeenCalledWith(
      'content',
      'View your dubbing projects, credits, and usage at a glance.',
    );
  });

  it('does not set meta description when translation falls back to key', () => {
    usePageTitle('pageTitle.unknown');
    effectFn?.();
    const descCalls = metaEl.setAttribute.mock.calls.filter(
      (c: string[]) => c[1] !== 'default desc',
    );
    expect(descCalls).toHaveLength(0);
  });

  it('cleanup restores previous meta description', () => {
    usePageTitle('pageTitle.studio');
    const cleanup = effectFn?.() as unknown as (() => void) | undefined;
    cleanup?.();
    expect(metaEl.setAttribute).toHaveBeenCalledWith('content', 'default desc');
  });
});
