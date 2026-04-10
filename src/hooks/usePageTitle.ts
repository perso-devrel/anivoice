import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const APP_NAME = 'AniVoice';
const DEFAULT_DESC = '';

function getMetaDescription(): HTMLMetaElement | null {
  return document.querySelector('meta[name="description"]');
}

export function usePageTitle(titleKey: string) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const translated = t(titleKey);
    document.title = translated ? `${translated} | ${APP_NAME}` : APP_NAME;

    const descKey = titleKey.replace('pageTitle.', 'pageDesc.');
    const desc = t(descKey);
    const meta = getMetaDescription();
    const prevDesc = meta?.getAttribute('content') ?? DEFAULT_DESC;
    if (meta && desc && desc !== descKey) {
      meta.setAttribute('content', desc);
    }

    return () => {
      document.title = APP_NAME;
      if (meta) meta.setAttribute('content', prevDesc);
    };
  }, [t, titleKey, i18n.language]);
}
