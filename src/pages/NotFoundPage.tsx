import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { ArrowLeftIcon } from '../components/icons';

export default function NotFoundPage() {
  const { t } = useTranslation();
  usePageTitle('pageTitle.notFound');

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center scanlines">
      <div className="relative">
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-jp text-[200px] text-bone/[0.03] select-none pointer-events-none" aria-hidden="true">迷子</span>
        <p className="font-display font-black text-lucy text-outline-bone chromatic-hover relative" style={{ fontSize: 'clamp(80px, 14vw, 200px)' }}>404</p>
      </div>
      <h1 className="text-2xl font-display font-bold text-bone mb-2">
        {t('notFound.title')}
      </h1>
      <p className="text-bone/60 mb-8 max-w-md">
        {t('notFound.description')}
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-lucy text-void font-display font-bold uppercase tracking-widest text-sm border-2 border-lucy hover:bg-void hover:text-lucy transition-colors offset-lucy-sm hover:shadow-none flicker-on-hover"
      >
        <ArrowLeftIcon />
        {t('notFound.goHome')}
      </Link>
    </main>
  );
}
