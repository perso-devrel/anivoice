import type { Analytics } from 'firebase/analytics';

const MEASUREMENT_ID = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;
const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const APP_ID = import.meta.env.VITE_FIREBASE_APP_ID;
const ENABLED =
  !!FIREBASE_API_KEY &&
  FIREBASE_API_KEY !== 'your_firebase_key' &&
  !!MEASUREMENT_ID &&
  !!APP_ID;

if (typeof window !== 'undefined') {
  // 진단용 로그: 배포된 사이트 콘솔에서 한 번만 노출되어 어떤 단계에서
  // 막히는지 파악할 수 있도록 한다. 운영 안정화 후 제거 가능.
  console.info('[KoeDub Analytics] init', {
    enabled: ENABLED,
    hasApiKey: !!FIREBASE_API_KEY,
    hasAppId: !!APP_ID,
    measurementId: MEASUREMENT_ID || '(missing)',
  });
}

let analyticsPromise: Promise<Analytics | null> | null = null;

async function getAnalytics(): Promise<Analytics | null> {
  if (!ENABLED) return null;
  if (analyticsPromise) return analyticsPromise;

  analyticsPromise = (async () => {
    try {
      const firebaseApp = await import('firebase/app');
      const analyticsMod = await import('firebase/analytics');
      const supported = await analyticsMod.isSupported();
      if (!supported) {
        console.warn('[KoeDub Analytics] firebase/analytics isSupported() returned false');
        return null;
      }
      const app = firebaseApp.getApps()[0] ?? firebaseApp.initializeApp({
        apiKey: FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        appId: APP_ID,
        measurementId: MEASUREMENT_ID,
      });
      const a = analyticsMod.getAnalytics(app);
      console.info('[KoeDub Analytics] ready');
      return a;
    } catch (err) {
      console.warn('[KoeDub Analytics] init failed:', err);
      return null;
    }
  })();

  return analyticsPromise;
}

export async function trackEvent(name: string, params?: Record<string, unknown>) {
  try {
    const a = await getAnalytics();
    if (!a) return;
    const { logEvent } = await import('firebase/analytics');
    logEvent(a, name as string, params as Record<string, unknown> | undefined);
  } catch {
    // Swallow analytics errors — never block UX.
  }
}

export async function trackPageView(path: string, title?: string) {
  try {
    const a = await getAnalytics();
    if (!a) return;
    const { logEvent } = await import('firebase/analytics');
    logEvent(a, 'page_view', {
      page_path: path,
      page_location: typeof window !== 'undefined' ? window.location.href : path,
      page_title: title ?? (typeof document !== 'undefined' ? document.title : undefined),
    });
  } catch {
    // Ignore.
  }
}

export async function setAnalyticsUserId(userId: string | null) {
  try {
    const a = await getAnalytics();
    if (!a) return;
    const { setUserId } = await import('firebase/analytics');
    setUserId(a, userId);
  } catch {
    // Ignore.
  }
}
