import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';

export default function NotFoundPage() {
  const { t } = useTranslation();
  usePageTitle('pageTitle.notFound');

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-bold text-primary-500 mb-4">404</p>
      <h1 className="text-2xl font-bold text-white mb-2">
        {t('notFound.title')}
      </h1>
      <p className="text-gray-400 mb-8 max-w-md">
        {t('notFound.description')}
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-bg text-white font-semibold hover:opacity-90 transition-opacity"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        {t('notFound.goHome')}
      </Link>
    </main>
  );
}
