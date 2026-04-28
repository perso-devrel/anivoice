import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { getLibrary, getTags, type LibraryItem, type Tag } from '../services/koedubApi';
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

const GRADIENT_PALETTES = [
  'from-primary-600 to-accent-600',
  'from-accent-600 to-primary-500',
  'from-primary-500 to-amber-500',
  'from-accent-500 to-primary-600',
  'from-primary-600 to-rose-500',
  'from-amber-600 to-primary-600',
  'from-primary-500 to-accent-600',
  'from-rose-500 to-primary-500',
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

  // Fetch tags on mount
  useEffect(() => {
    getTags()
      .then(setTags)
      .catch(() => { /* tags are optional */ });
  }, []);

  // Fetch library items when filters change
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
    <main className="min-h-screen bg-void pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 relative">
          <div className="scanlines absolute inset-0 pointer-events-none" aria-hidden="true" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-jp text-[140px] sm:text-[200px] leading-none text-bone/[0.03] select-none pointer-events-none whitespace-nowrap" aria-hidden="true">作品集</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl text-bone font-display font-black mb-3 relative chromatic-hover">
            {t('library.title')}
          </h1>
          <p className="text-bone/60 text-base sm:text-lg max-w-xl mx-auto font-body">
            {t('library.subtitle')}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="relative bg-ink border-2 border-bone/30 p-4 sm:p-6 mb-8 space-y-4 corner-marks">
          <span className="absolute -top-3 left-4 font-mono text-[10px] uppercase tracking-[0.3em] text-lucy bg-void px-2" aria-hidden="true">FILTER</span>
          {/* Top row: search + language */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-bone/50">
                <SearchIcon />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH ARCHIVE..."
                aria-label={t('common.search')}
                className="w-full pl-10 pr-4 py-2.5 bg-transparent border-0 border-b-2 border-bone/30 font-mono text-sm text-bone placeholder-bone/40 focus:outline-none focus:border-lucy transition-colors"
              />
            </div>

            {/* Language filter */}
            <div className="relative">
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                aria-label={t('common.filterByLanguage')}
                className="appearance-none w-full sm:w-44 px-4 py-2.5 pr-9 bg-transparent border-0 border-b-2 border-bone/30 font-mono text-sm text-bone focus:outline-none focus:border-lucy transition-colors cursor-pointer"
              >
                {LIBRARY_LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang === 'all' ? t('common.all') : t(`languages.${lang}`)}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-bone/50">
                <ChevronDownIcon />
              </div>
            </div>
          </div>

          {/* Bottom row: tag tabs + sort */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Tag pills */}
            <div className="flex flex-wrap gap-2">
              {[{ id: 'all', name: 'all', label: t('common.all') },
                ...tags.map((tag) => ({ id: String(tag.id), name: tag.name, label: tag.displayNameKo })),
              ].map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setActiveTag(tag.name)}
                  className={`px-4 py-1.5 text-sm font-medium transition-all ${
                    activeTag === tag.name
                      ? 'bg-lucy text-void offset-lucy-sm'
                      : 'bg-ink border border-bone/30 text-bone/60 hover:text-bone'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {/* Sort tabs */}
            <div className="flex bg-ink border border-bone/30 p-1 shrink-0">
              {SORT_MODES.map(({ key, i18nKey }) => (
                <button
                  key={key}
                  onClick={() => setSortMode(key)}
                  className={`px-4 py-1.5 text-sm font-medium transition-all ${
                    sortMode === key
                      ? 'bg-bone/10 text-bone'
                      : 'text-bone/50 hover:text-bone'
                  }`}
                >
                  {t(i18nKey)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20 relative">
            <span className="absolute top-8 left-1/2 -translate-x-1/2 font-jp text-6xl text-lucy/10 select-none pointer-events-none" aria-hidden="true">読込中</span>
            <SpinnerIcon className="w-8 h-8 text-lucy mx-auto mb-4" />
            <p className="text-bone/50">{t('common.loading')}</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="scanlines relative bg-ink border-2 border-bone/30 py-20 text-center">
            <p className="font-mono text-3xl text-rebecca tracking-[0.2em] mb-3">SYSTEM ERROR</p>
            <p className="font-mono text-sm text-rebecca/60">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="scanlines relative bg-ink border-2 border-bone/30 py-20 text-center">
            <p className="font-mono text-3xl text-bone/20 tracking-[0.2em] mb-3">NO DATA FOUND</p>
            <p className="font-mono text-sm text-bone/30">
              &gt; START YOUR FIRST PROJECT
              <span className="inline-block w-2 h-4 bg-bone/40 ml-1 animate-pulse align-middle" />
            </p>
          </div>
        )}

        {/* Card Grid */}
        {!loading && !error && items.length > 0 && (
          <>
            <p className="font-mono text-xs uppercase tracking-widest text-bone/50 mb-4 border-l-4 border-lucy pl-3">{t('library.totalCount', { count: total })}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map((item, index) => (
                <LibraryCard
                  key={item.id}
                  item={item}
                  gradient={GRADIENT_PALETTES[index % GRADIENT_PALETTES.length]}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
