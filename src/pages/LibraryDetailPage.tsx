import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { useClipboard } from '../hooks/useClipboard';
import { getLibraryItem, type LibraryItemDetail } from '../services/anivoiceApi';
import { formatCreditTimeMs } from '../utils/format';
import { resolvePersoFileUrl } from '../services/persoApi';
import { DownloadIcon, LinkIcon, ChevronLeftIcon, LoadingSpinner } from '../components/icons';

const SECONDARY_BUTTON_CLASS =
  'inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-700 text-white text-sm font-medium hover:bg-surface-600 transition-colors';

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
      <main className="min-h-screen bg-surface-950 pt-24 pb-16 flex items-center justify-center">
        <LoadingSpinner />
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="min-h-screen bg-surface-950 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">{t('library.notFound')}</h1>
          <p className="text-gray-400 mb-6">{t('library.notFoundDesc')}</p>
          <Link
            to="/library"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white font-medium text-sm hover:opacity-90 transition-opacity"
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
    <main className="min-h-screen bg-surface-950 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back link */}
        <Link
          to="/library"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ChevronLeftIcon />
          {t('library.backToLibrary')}
        </Link>

        {/* Video player */}
        <div className="glass rounded-2xl overflow-hidden mb-6">
          {videoSrc ? (
            <video
              src={videoSrc}
              controls
              className="w-full aspect-video bg-black"
              poster={resolvePersoFileUrl(item.thumbnailUrl)}
            />
          ) : (
            <div className="w-full aspect-video bg-surface-800 flex items-center justify-center">
              <span className="text-gray-500 text-lg">{t('common.noData')}</span>
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="glass rounded-2xl p-6 space-y-4">
          {/* Title + meta */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">{item.title}</h1>
            <p className="text-gray-400 text-sm">
              {t('library.by')} {item.authorName}
            </p>
          </div>

          {/* Language + duration badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-surface-800 text-xs text-gray-300 uppercase">
              {item.sourceLanguage} → {item.targetLanguage}
            </span>
            <span className="px-3 py-1 rounded-full bg-surface-800 text-xs text-gray-300">
              {formatCreditTimeMs(item.durationMs, t)}
            </span>
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded bg-accent-500/15 text-accent-400 text-xs font-medium"
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 transition-opacity"
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
