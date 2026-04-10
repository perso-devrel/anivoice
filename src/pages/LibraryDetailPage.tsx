import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLibraryItem, formatSeconds, type LibraryItemDetail } from '../services/anivoiceApi';
import { resolvePersoFileUrl } from '../services/persoApi';

export default function LibraryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [item, setItem] = useState<LibraryItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-surface-950 pt-24 pb-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
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
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
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
              {formatSeconds(Math.floor(item.durationMs / 1000), { hours: t('common.hours'), minutes: t('common.minutes'), seconds: t('common.seconds') })}
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
                <DownloadIcon />
                {t('library.downloadVideo')}
              </a>
            )}
            {audioSrc && (
              <a
                href={audioSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-700 text-white text-sm font-medium hover:bg-surface-600 transition-colors"
              >
                <DownloadIcon />
                {t('library.downloadAudio')}
              </a>
            )}
            {subtitleSrc && (
              <a
                href={subtitleSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-700 text-white text-sm font-medium hover:bg-surface-600 transition-colors"
              >
                <DownloadIcon />
                {t('library.downloadSubtitle')}
              </a>
            )}
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-700 text-white text-sm font-medium hover:bg-surface-600 transition-colors"
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

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.04a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364L4.34 8.374" />
    </svg>
  );
}
