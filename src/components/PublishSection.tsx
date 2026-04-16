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
    <div className="border-t border-ink/15 pt-5 space-y-4">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
          {isPublished ? 'Published · 公開' : 'Publish · 公開'}
        </span>
        {isPublished && (
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
            {t('studio.publishedMessage')}
          </span>
        )}
      </div>

      {isPublished ? (
        <button
          type="button"
          onClick={onCopyShareLink}
          className="w-full border border-ink/30 px-4 py-3 flex items-center justify-center gap-2 font-mono text-[12px] uppercase tracking-[0.18em] text-ink hover:bg-ink hover:text-cream transition-colors"
        >
          <LinkIcon />
          {linkCopied ? t('studio.linkCopied') : t('studio.copyShareLink')}
        </button>
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
                    className={`px-3 py-1.5 border font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                      isSelected
                        ? 'border-ink bg-ink text-cream'
                        : 'border-ink/30 text-ink-soft hover:border-ink hover:text-ink'
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
            className="w-full bg-ink text-cream py-3 font-mono text-[12px] uppercase tracking-[0.22em] hover:bg-cinnabar transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isPublishing ? <SpinnerIcon className="w-4 h-4" /> : (
              <>
                {t('studio.publishTitle')}
                <span>→</span>
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
