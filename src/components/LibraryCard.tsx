import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { LibraryItem } from '../services/anivoiceApi';
import { resolvePersoFileUrl } from '../services/persoApi';
import { formatCreditTimeMs } from '../utils/format';
import { PlayIcon, ClockIcon } from './icons';

export function LibraryCard({ item, gradient }: { item: LibraryItem; gradient: string }) {
  const { t } = useTranslation();
  const thumbnailSrc = resolvePersoFileUrl(item.thumbnailUrl);

  return (
    <Link
      to={`/library/${item.id}`}
      className="group glass rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-500/30"
    >
      {/* Thumbnail */}
      <div className={`relative aspect-video ${!thumbnailSrc ? `bg-gradient-to-br ${gradient}` : 'bg-surface-800'} flex items-center justify-center overflow-hidden`}>
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white/20 text-6xl font-black select-none">
            {item.title.charAt(0)}
          </span>
        )}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
            <PlayIcon />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2.5">
        <div>
          <h3 className="text-white font-semibold text-sm leading-tight truncate">
            {item.title}
          </h3>
          <p className="text-gray-500 text-xs mt-0.5 truncate">
            {item.authorName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-gray-500 text-xs">
            <ClockIcon />
            {formatCreditTimeMs(item.durationMs, t)}
          </span>
          <span className="text-gray-600 text-xs">|</span>
          <span className="text-xs text-gray-400 uppercase">
            {item.sourceLanguage} → {item.targetLanguage}
          </span>
        </div>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tagName) => (
              <span
                key={tagName}
                className="px-1.5 py-0.5 rounded bg-accent-500/15 text-accent-400 text-[10px] font-medium"
              >
                {tagName}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
