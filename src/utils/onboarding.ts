const STORAGE_KEY = 'koedub_onboarding_done';

export function shouldShowOnboarding(projectCount: number): boolean {
  if (projectCount > 0) return false;
  return localStorage.getItem(STORAGE_KEY) !== '1';
}

export function markOnboardingDone() {
  localStorage.setItem(STORAGE_KEY, '1');
}
