import { describe, it, expect, beforeEach, vi } from 'vitest';
import { shouldShowOnboarding, markOnboardingDone } from './onboarding';

const storage = new Map<string, string>();

vi.stubGlobal('localStorage', {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => storage.set(k, v),
  removeItem: (k: string) => storage.delete(k),
  clear: () => storage.clear(),
});

describe('onboarding', () => {
  beforeEach(() => {
    storage.clear();
  });

  it('shows onboarding for new user with zero projects', () => {
    expect(shouldShowOnboarding(0)).toBe(true);
  });

  it('hides onboarding if user already has projects', () => {
    expect(shouldShowOnboarding(1)).toBe(false);
    expect(shouldShowOnboarding(5)).toBe(false);
  });

  it('hides onboarding after markOnboardingDone', () => {
    markOnboardingDone();
    expect(shouldShowOnboarding(0)).toBe(false);
  });

  it('markOnboardingDone sets localStorage key', () => {
    markOnboardingDone();
    expect(storage.get('koedub_onboarding_done')).toBe('1');
  });
});
