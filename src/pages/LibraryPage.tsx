import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { getLibrary, getTags, type LibraryItem, type Tag } from '../services/anivoiceApi';
import { getErrorMessage } from '../utils/format';
import { SearchIcon, ChevronDownIcon, SpinnerIcon } from '../components/icons';
import { LibraryCard } from '../components/LibraryCard';
import { LANGUAGE_KEYS } from '../constants';

const LIBRARY_LANGUAGE_OPTIONS = ['all', ...LANGUAGE_KEYS] as const;

type SortMode = 'popular' | 'latest';
const SORT_MODES: readonly { key: SortMode; i18nKey: string }[] = [
  { key: 'popular', i18nKey: 'library.popular' },
  { key: 'latest', i18nKey: 'library.latest' },
];

export default function LibraryPage() {
  const { t } = useTranslation();
  usePageTitle('pageTitle.library');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('popular');
  const [languageFilter, setLanguageFilter] = useState('all');

  const [items, setItems] = useState<LibraryItem[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getTags()
      .then(setTags)
      .catch(() => { /* tags are optional */ });
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getLibrary({
          tag: activeTag === 'all' ? undefined : activeTag,
          lang: languageFilter === 'all' ? undefined : languageFilter,
          sort: sortMode,
          search: searchQuery.trim() || undefined,
        });
        if (!cancelled) {
          setItems(result.items);
          setTotal(result.total);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, t('library.loadError')));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [activeTag, languageFilter, sortMode, searchQuery, t]);

  return (
    <main className="min-h-screen bg-cream pt-20 md:pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="grid grid-cols-12 gap-6 mb-14">
          <div className="col-span-12 md:col-span-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
              文庫 — Catalogue
            </span>
            <h1 className="font-display text-5xl md:text-7xl text-ink leading-[1.02] tracking-tight mt-3">
              {t('library.title')}
            </h1>
          </div>
          <div className="col-span-12 md:col-span-8 md:pl-12 flex md:items-end">
            <p className="text-ink-soft text-lg leading-relaxed max-w-xl">
              {t('library.subtitle')}
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="border-t border-ink pt-6 mb-10">
          <div className="flex flex-col gap-5">
            {/* Top row: search + language */}
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-ink-mute">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`${t('common.search')}...`}
                  aria-label={t('common.search')}
                  className="w-full pl-7 pr-2 py-2 bg-transparent border-b border-ink/30 text-ink placeholder-ink-mute focus:outline-none focus:border-cinnabar transition-colors text-[15px]"
                />
              </div>

              <div className="relative">
                <select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  aria-label={t('common.filterByLanguage')}
                  className="appearance-none w-full sm:w-48 pl-0 pr-7 py-2 bg-transparent border-b border-ink/30 text-ink focus:outline-none focus:border-cinnabar transition-colors cursor-pointer font-mono text-[12px] uppercase tracking-[0.18em]"
                >
                  {LIBRARY_LANGUAGE_OPTIONS.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang === 'all' ? t('common.all') : t(`languages.${lang}`)}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none text-ink-mute">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>

            {/* Bottom row: tag pills + sort */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {[{ id: 'all', name: 'all', label: t('common.all') },
                  ...tags.map((tag) => ({ id: String(tag.id), name: tag.name, label: tag.displayNameKo })),
                ].map((tag) => {
                  const isActive = activeTag === tag.name;
                  return (
                    <button
                      key={tag.id}
                      onClick={() => setActiveTag(tag.name)}
                      className={`font-mono text-[12px] uppercase tracking-[0.18em] pb-1 transition-colors ${
                        isActive
                          ? 'text-cinnabar border-b border-cinnabar'
                          : 'text-ink-mute hover:text-ink border-b border-transparent'
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4 shrink-0">
                {SORT_MODES.map(({ key, i18nKey }) => (
                  <button
                    key={key}
                    onClick={() => setSortMode(key)}
                    className={`font-mono text-[12px] uppercase tracking-[0.18em] pb-1 transition-colors ${
                      sortMode === key
                        ? 'text-ink border-b border-ink'
                        : 'text-ink-mute hover:text-ink border-b border-transparent'
                    }`}
                  >
                    {t(i18nKey)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-24">
            <SpinnerIcon className="w-6 h-6 text-ink mx-auto mb-4" />
            <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-ink-mute">
              {t('common.loading')}
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-24">
            <p className="text-cinnabar text-lg">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-24">
            <p className="font-display text-2xl text-ink-soft">{t('library.emptyState')}</p>
          </div>
        )}

        {/* Card Grid */}
        {!loading && !error && items.length > 0 && (
          <>
            <div className="flex items-baseline justify-between border-b border-ink/15 pb-3 mb-8">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
                {t('library.totalCount', { count: total })}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute hidden sm:inline">
                Sorted · {t(SORT_MODES.find((m) => m.key === sortMode)!.i18nKey)}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
              {items.map((item) => (
                <LibraryCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
