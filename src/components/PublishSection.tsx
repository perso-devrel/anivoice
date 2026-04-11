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
    <div className="glass rounded-2xl p-5 space-y-4">
      <h3 className="text-base font-semibold text-surface-200/90">
        {isPublished ? t('studio.publishedTitle') : t('studio.publishTitle')}
      </h3>
      {isPublished ? (
        <div className="space-y-3">
          <p className="text-sm text-green-400">{t('studio.publishedMessage')}</p>
          <button
            type="button"
            onClick={onCopyShareLink}
            className="w-full glass rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 text-sm text-surface-200/80 hover:text-white hover:border-primary-500/40 transition-colors"
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
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500/15 text-primary-400'
                        : 'border-surface-700 bg-surface-900/50 text-surface-200/60 hover:border-surface-200/30'
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
            className="w-full gradient-bg py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {isPublishing ? <SpinnerIcon className="w-4 h-4 mx-auto" /> : t('studio.publishTitle')}
          </button>
        </>
      )}
    </div>
  );
}
