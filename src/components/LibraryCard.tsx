import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { LibraryItem } from '../services/anivoiceApi';
import { resolvePersoFileUrl } from '../services/persoApi';
import { formatCreditTimeMs } from '../utils/format';
import { PlayIcon } from './icons';

export function LibraryCard({ item, gradient: _gradient }: { item: LibraryItem; gradient?: string }) {
  const { t } = useTranslation();
  const thumbnailSrc = resolvePersoFileUrl(item.thumbnailUrl);
  void _gradient;

  return (
    <Link
      to={`/library/${item.id}`}
      className="group block"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-paper-deep overflow-hidden border border-ink/10 group-hover:border-ink/40 transition-colors">
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full bg-ink flex items-center justify-center">
            <span className="font-display italic text-cream/40 text-7xl select-none">
              {item.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 flex items-center justify-center transition-colors">
          <div className="w-12 h-12 border border-cream/0 group-hover:border-cream/80 flex items-center justify-center text-cream opacity-0 group-hover:opacity-100 transition-opacity">
            <PlayIcon className="w-5 h-5 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="pt-4 pb-2">
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <h3 className="font-display text-lg text-ink leading-tight truncate group-hover:text-cinnabar transition-colors">
            {item.title}
          </h3>
          <span className="font-mono text-[11px] tracking-wider text-ink-mute shrink-0">
            {formatCreditTimeMs(item.durationMs, t)}
          </span>
        </div>
        <p className="text-ink-soft text-sm truncate mb-3">
          {item.authorName}
        </p>
        <div className="flex items-center gap-3 border-t border-ink/15 pt-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-mute">
            {item.sourceLanguage} → {item.targetLanguage}
          </span>
          {item.tags.length > 0 && (
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cinnabar truncate">
              {item.tags.join(' · ')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
