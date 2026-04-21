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
      to={`/archive/${item.id}`}
      className="group relative bg-ink border-2 border-bone/30 overflow-hidden cursor-pointer transition-colors hover:border-lucy corner-marks"
    >
      {/* Hover left accent */}
      <div className="absolute top-0 left-0 w-1 h-full bg-lucy opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />

      {/* "+" marker */}
      <span className="absolute top-2 right-2 font-mono text-bone/10 text-lg select-none pointer-events-none z-10">+</span>

      {/* Thumbnail */}
      <div className={`relative aspect-video ${!thumbnailSrc ? `bg-gradient-to-br ${gradient}` : 'bg-void'} flex items-center justify-center overflow-hidden`}>
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-bone/20 text-6xl font-black select-none">
            {item.title.charAt(0)}
          </span>
        )}
        {/* Corner crop markers */}
        <span className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-bone/30" aria-hidden="true" />
        <span className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-bone/30" aria-hidden="true" />
        <span className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-bone/30" aria-hidden="true" />
        <span className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-bone/30" aria-hidden="true" />

        <div className="absolute inset-0 bg-void/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 bg-lucy/80 flex items-center justify-center text-void">
            <PlayIcon />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2.5">
        <div>
          <h3 className="text-bone font-medium text-sm leading-tight truncate">
            {item.title}
          </h3>
          <p className="font-mono text-[10px] uppercase tracking-wider text-bone/40 mt-0.5 truncate">
            {item.authorName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-bone/50">
            <ClockIcon />
            {formatCreditTimeMs(item.durationMs, t)}
          </span>
          <span className="text-bone/40 text-[10px]">|</span>
          <span className="font-mono text-[10px] uppercase text-bone/60">
            {item.sourceLanguage} → {item.targetLanguage}
          </span>
        </div>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tagName) => (
              <span
                key={tagName}
                className="px-1.5 py-0.5 bg-lucy/15 text-lucy font-mono text-[10px] uppercase font-medium"
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
