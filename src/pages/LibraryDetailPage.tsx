import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { useClipboard } from '../hooks/useClipboard';
import { getLibraryItem, type LibraryItemDetail } from '../services/anivoiceApi';
import { formatCreditTimeMs } from '../utils/format';
import { resolvePersoFileUrl } from '../services/persoApi';
import { DownloadIcon, LinkIcon, ChevronLeftIcon, LoadingSpinner } from '../components/icons';

const PAGE_SHELL_CLASS = 'min-h-screen bg-void pt-24 pb-16';

const SECONDARY_BUTTON_CLASS =
  'inline-flex items-center gap-2 px-4 py-2 bg-ink border-2 border-bone/30 text-bone text-sm font-medium hover:border-bone hover:text-bone transition-colors';

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
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-bone font-display mb-2">{t('library.notFound')}</h1>
          <p className="text-bone/60 mb-6">{t('library.notFoundDesc')}</p>
          <Link
            to="/library"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-lucy text-void border-2 border-lucy hover:bg-void hover:text-lucy font-medium text-sm transition-colors"
          >
            {t('library.backToLibrary')}
          </Link>
        </div>
      </main>
    );
  }

  const videoSrc = resolvePersoFileUrl(item.videoUrl);
  const audioSrc = resolvePersoFileUrl(item.audioUrl);
  const subtitleSrc = resolvePersoFileUrl(item.subtitleUrl);

  return (
    <main className="min-h-screen bg-void pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back link */}
        <Link
          to="/library"
          className="inline-flex items-center gap-1.5 font-mono uppercase tracking-widest text-xs text-bone/60 hover:text-bone transition-colors mb-6"
        >
          <ChevronLeftIcon />
          {t('library.backToLibrary')}
        </Link>

        {/* Video player */}
        <div className="bg-ink border-2 border-bone/30 overflow-hidden mb-6 corner-marks">
          {videoSrc ? (
            <video
              src={videoSrc}
              controls
              className="w-full aspect-video bg-black"
              poster={resolvePersoFileUrl(item.thumbnailUrl)}
            />
          ) : (
            <div className="w-full aspect-video bg-ink flex items-center justify-center">
              <span className="text-bone/50 text-lg">{t('common.noData')}</span>
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="relative bg-ink border-2 border-bone/30 p-6 space-y-4 corner-marks">
          <span className="absolute -top-3 left-4 font-mono text-[10px] uppercase tracking-[0.3em] text-lucy bg-void px-2" aria-hidden="true">INFO</span>
          {/* Title + meta */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-bone font-display mb-1">{item.title}</h1>
            <p className="text-bone/60 text-sm font-mono">
              {t('library.by')} {item.authorName}
            </p>
          </div>

          {/* Language + duration badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-ink border-2 border-bone/30 text-xs text-bone/80 uppercase font-mono">
              {item.sourceLanguage} → {item.targetLanguage}
            </span>
            <span className="px-3 py-1 bg-ink border-2 border-bone/30 text-xs text-bone/80 font-mono">
              {formatCreditTimeMs(item.durationMs, t)}
            </span>
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-lucy/15 text-lucy text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            {videoSrc && (
              <a
                href={videoSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-lucy text-void border-2 border-lucy hover:bg-void hover:text-lucy text-sm font-medium transition-colors offset-lucy-sm"
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
            <button
              onClick={handleCopyLink}
              className={SECONDARY_BUTTON_CLASS}
            >
              <LinkIcon />
              {linkCopied ? t('library.linkCopied') : t('library.copyLink')}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
