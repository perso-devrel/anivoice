import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { useClipboard } from '../hooks/useClipboard';
import { getLibraryItem, type LibraryItemDetail } from '../services/anivoiceApi';
import { formatCreditTimeMs } from '../utils/format';
import { resolvePersoFileUrl } from '../services/persoApi';
import { DownloadIcon, LinkIcon, ChevronLeftIcon, LoadingSpinner } from '../components/icons';

const PAGE_SHELL_CLASS = 'min-h-screen bg-cream pt-20 md:pt-28 pb-24';

const PRIMARY_BUTTON_CLASS =
  'inline-flex items-center gap-2 px-5 py-3 bg-ink text-cream font-mono text-[12px] uppercase tracking-[0.18em] hover:bg-cinnabar transition-colors';

const SECONDARY_BUTTON_CLASS =
  'inline-flex items-center gap-2 px-5 py-3 border border-ink text-ink font-mono text-[12px] uppercase tracking-[0.18em] hover:bg-ink hover:text-cream transition-colors';

export default function LibraryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  usePageTitle('pageTitle.libraryDetail');
  const [item, setItem] = useState<LibraryItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { copied: linkCopied, copy: copyToClipboard } = useClipboard();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getLibraryItem(Number(id))
      .then((data) => {
        if (!cancelled) {
          setError(false);
          setItem(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [id]);

  async function handleCopyLink() {
    await copyToClipboard(window.location.href);
  }

  if (loading) {
    return (
      <main className={`${PAGE_SHELL_CLASS} flex items-center justify-center`}>
        <LoadingSpinner />
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className={PAGE_SHELL_CLASS}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h1 className="font-display text-4xl text-ink mb-3">{t('library.notFound')}</h1>
          <p className="text-ink-soft mb-8">{t('library.notFoundDesc')}</p>
          <Link to="/library" className={PRIMARY_BUTTON_CLASS}>
            ← {t('library.backToLibrary')}
          </Link>
        </div>
      </main>
    );
  }

  const videoSrc = resolvePersoFileUrl(item.videoUrl);
  const audioSrc = resolvePersoFileUrl(item.audioUrl);
  const subtitleSrc = resolvePersoFileUrl(item.subtitleUrl);

  return (
    <main className={PAGE_SHELL_CLASS}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        {/* Back link */}
        <Link
          to="/library"
          className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.18em] text-ink-soft hover:text-cinnabar transition-colors mb-8"
        >
          <ChevronLeftIcon />
          {t('library.backToLibrary')}
        </Link>

        {/* Title block — newspaper masthead */}
        <header className="border-t border-ink pt-6 mb-8">
          <div className="flex items-baseline justify-between mb-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
              {item.sourceLanguage} → {item.targetLanguage}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
              {formatCreditTimeMs(item.durationMs, t)}
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl text-ink leading-[1.05] tracking-tight mb-3">
            {item.title}
          </h1>
          <p className="text-ink-soft">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute mr-2">
              {t('library.by')}
            </span>
            {item.authorName}
          </p>
        </header>

        {/* Video player */}
        <div className="mb-10 border border-ink/15">
          {videoSrc ? (
            <video
              src={videoSrc}
              controls
              className="w-full aspect-video bg-ink"
              poster={resolvePersoFileUrl(item.thumbnailUrl)}
            />
          ) : (
            <div className="w-full aspect-video bg-paper-deep flex items-center justify-center">
              <span className="font-mono text-[12px] uppercase tracking-[0.22em] text-ink-mute">
                {t('common.noData')}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-ink/15 pb-5 mb-8">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
              Tags
            </span>
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[12px] uppercase tracking-[0.18em] text-cinnabar"
              >
                · {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {videoSrc && (
            <a
              href={videoSrc}
              target="_blank"
              rel="noopener noreferrer"
              className={PRIMARY_BUTTON_CLASS}
            >
              <DownloadIcon className="w-4 h-4" />
              {t('library.downloadVideo')}
            </a>
          )}
          {audioSrc && (
            <a
              href={audioSrc}
              target="_blank"
              rel="noopener noreferrer"
              className={SECONDARY_BUTTON_CLASS}
            >
              <DownloadIcon className="w-4 h-4" />
              {t('library.downloadAudio')}
            </a>
          )}
          {subtitleSrc && (
            <a
              href={subtitleSrc}
              target="_blank"
              rel="noopener noreferrer"
              className={SECONDARY_BUTTON_CLASS}
            >
              <DownloadIcon className="w-4 h-4" />
              {t('library.downloadSubtitle')}
            </a>
          )}
          <button onClick={handleCopyLink} className={SECONDARY_BUTTON_CLASS}>
            <LinkIcon />
            {linkCopied ? t('library.linkCopied') : t('library.copyLink')}
          </button>
        </div>
      </div>
    </main>
  );
}
