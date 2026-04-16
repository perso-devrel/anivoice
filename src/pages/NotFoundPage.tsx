import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';

export default function NotFoundPage() {
  const { t } = useTranslation();
  usePageTitle('pageTitle.notFound');

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-5">
      <div className="max-w-xl w-full">
        <div className="border-t border-ink pt-8">
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
              Error · 404
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
              迷子
            </span>
          </div>
          <p className="font-display text-[7rem] md:text-[10rem] leading-none text-ink tracking-tight">
            404
          </p>
          <h1 className="font-display italic text-3xl text-ink mt-2 mb-3">
            {t('notFound.title')}
          </h1>
          <p className="text-ink-soft mb-10 max-w-md">
            {t('notFound.description')}
          </p>
          <Link
            to="/"
            className="inline-flex items-baseline gap-3 bg-ink text-cream px-6 py-3 font-mono text-[12px] uppercase tracking-[0.22em] hover:bg-cinnabar transition-colors"
          >
            ← {t('notFound.goHome')}
          </Link>
        </div>
      </div>
    </main>
  );
}
