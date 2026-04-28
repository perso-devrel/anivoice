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
const canonicalEl = { setAttribute: vi.fn(), removeAttribute: vi.fn() };

Object.defineProperty(globalThis, 'document', {
  value: {
    title: 'KoeDub',
    querySelector: (sel: string) => {
      if (sel === 'meta[name="description"]') return metaEl;
      if (sel === 'link[rel="canonical"]') return canonicalEl;
      return null;
    },
    createElement: () => canonicalEl,
    head: { appendChild: vi.fn() },
  },
  writable: true,
});

Object.defineProperty(globalThis, 'window', {
  value: {
    location: { origin: 'https://koedub.vercel.app', pathname: '/dashboard' },
  },
  writable: true,
});

import { usePageTitle } from './usePageTitle';

describe('usePageTitle', () => {
  beforeEach(() => {
    document.title = 'KoeDub';
    effectFn = null;
    metaEl.getAttribute.mockReturnValue('default desc');
    metaEl.setAttribute.mockClear();
    canonicalEl.setAttribute.mockClear();
    canonicalEl.removeAttribute.mockClear();
  });

  it('sets document.title with translated key and app name', () => {
    usePageTitle('pageTitle.dashboard');
    effectFn?.();
    expect(document.title).toBe('Dashboard | KoeDub');
  });

  it('uses different title for studio', () => {
    usePageTitle('pageTitle.studio');
    effectFn?.();
    expect(document.title).toBe('Dubbing Studio | KoeDub');
  });

  it('falls back to app name when translation is empty', () => {
    usePageTitle('pageTitle.empty');
    effectFn?.();
    expect(document.title).toBe('KoeDub');
  });

  it('cleanup restores default title', () => {
    usePageTitle('pageTitle.dashboard');
    const cleanup = effectFn?.() as unknown as (() => void) | undefined;
    cleanup?.();
    expect(document.title).toBe('KoeDub');
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

  it('sets canonical link href to current URL', () => {
    usePageTitle('pageTitle.dashboard');
    effectFn?.();
    expect(canonicalEl.setAttribute).toHaveBeenCalledWith(
      'href',
      'https://koedub.vercel.app/dashboard',
    );
  });

  it('uses existing canonical link element if present', () => {
    usePageTitle('pageTitle.studio');
    effectFn?.();
    expect(canonicalEl.setAttribute).toHaveBeenCalledWith(
      'href',
      'https://koedub.vercel.app/dashboard',
    );
    expect(document.head.appendChild).not.toHaveBeenCalled();
  });

  it('creates canonical link element when none exists', () => {
    const origQuerySelector = document.querySelector;
    document.querySelector = (sel: string) => {
      if (sel === 'link[rel="canonical"]') return null;
      return origQuerySelector(sel);
    };

    usePageTitle('pageTitle.dashboard');
    effectFn?.();

    expect(document.head.appendChild).toHaveBeenCalled();
    expect(canonicalEl.setAttribute).toHaveBeenCalledWith('rel', 'canonical');

    document.querySelector = origQuerySelector;
  });

  it('cleanup removes canonical href', () => {
    usePageTitle('pageTitle.dashboard');
    const cleanup = effectFn?.() as unknown as (() => void) | undefined;
    cleanup?.();
    expect(canonicalEl.removeAttribute).toHaveBeenCalledWith('href');
  });
});
