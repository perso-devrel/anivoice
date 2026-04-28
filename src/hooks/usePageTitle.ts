import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const APP_NAME = 'KoeDub';
const DEFAULT_DESC = '';

function getMetaDescription(): HTMLMetaElement | null {
  return document.querySelector('meta[name="description"]');
}

function getOrCreateCanonicalLink(): HTMLLinkElement {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  return link;
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

    const canonicalLink = getOrCreateCanonicalLink();
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
    canonicalLink.setAttribute('href', canonicalUrl);

    return () => {
      document.title = APP_NAME;
      if (meta) meta.setAttribute('content', prevDesc);
      canonicalLink.removeAttribute('href');
    };
  }, [t, titleKey, i18n.language]);
}
