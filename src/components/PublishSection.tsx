import { useTranslation } from 'react-i18next';
import type { Tag } from '../services/anivoiceApi';
import { SpinnerIcon, LinkIcon } from './icons';

interface PublishSectionProps {
  isPublished: boolean;
  isPublishing: boolean;
  tags: Tag[];
  selectedTags: number[];
  onTagToggle: (tagId: number) => void;
  dbProjectId: number | null;
  linkCopied: boolean;
  onPublish: () => void;
  onCopyShareLink: () => void;
}

export function PublishSection({
  isPublished,
  isPublishing,
  tags,
  selectedTags,
  onTagToggle,
  dbProjectId,
  linkCopied,
  onPublish,
  onCopyShareLink,
}: PublishSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="relative bg-ink border-2 border-bone/30 p-5 space-y-4">
      <span className="absolute -top-3 left-4 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/30 bg-ink px-2">PUBLISH</span>
      <h3 className="font-mono uppercase tracking-widest text-sm text-bone/90">
        {isPublished ? t('studio.publishedTitle') : t('studio.publishTitle')}
      </h3>
      {isPublished ? (
        <div className="space-y-3">
          <p className="text-sm text-green-400">{t('studio.publishedMessage')}</p>
          <button
            type="button"
            onClick={onCopyShareLink}
            className="w-full bg-ink border-2 border-bone/30 px-4 py-2.5 flex items-center justify-center gap-2 font-mono uppercase text-[11px] text-bone/80 hover:text-bone transition-colors"
          >
            <LinkIcon />
            {linkCopied ? t('studio.linkCopied') : t('studio.copyShareLink')}
          </button>
        </div>
      ) : (
        <>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => onTagToggle(tag.id)}
                    className={`px-3 py-1.5 font-mono text-[10px] uppercase font-medium border transition-all ${
                      isSelected
                        ? 'border-lucy bg-lucy/15 text-lucy'
                        : 'border-bone/30 bg-void text-bone/60 hover:border-bone/50'
                    }`}
                  >
                    {tag.displayNameKo}
                  </button>
                );
              })}
            </div>
          )}
          <button
            type="button"
            onClick={onPublish}
            disabled={!dbProjectId || isPublishing}
            className="w-full bg-david text-void font-mono font-bold uppercase py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {isPublishing ? <SpinnerIcon className="w-4 h-4 mx-auto" /> : t('studio.publishTitle')}
          </button>
        </>
      )}
    </div>
  );
}
