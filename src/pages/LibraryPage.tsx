import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLibrary, getTags, formatSeconds, type LibraryItem, type Tag } from '../services/anivoiceApi';
import { resolvePersoFileUrl } from '../services/persoApi';

const GRADIENT_PALETTES = [
  'from-primary-600 to-accent-600',
  'from-accent-600 to-primary-500',
  'from-primary-500 to-accent-500',
  'from-accent-500 to-primary-600',
  'from-primary-600 to-accent-500',
  'from-accent-600 to-primary-600',
  'from-primary-500 to-accent-600',
  'from-accent-500 to-primary-500',
];

function SearchIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function LibraryPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const [sortMode, setSortMode] = useState<'popular' | 'latest'>('popular');
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
          setError(err instanceof Error ? err.message : 'Failed to load library');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [activeTag, languageFilter, sortMode, searchQuery]);

  const languageOptions = ['all', 'ja', 'ko', 'en', 'es', 'pt', 'id', 'ar'];

  return (
    <div className="min-h-screen bg-surface-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-3">
            {t('library.title')}
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
            {t('library.subtitle')}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="glass rounded-2xl p-4 sm:p-6 mb-8 space-y-4">
          {/* Top row: search + language */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                <SearchIcon />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`${t('common.search')}...`}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-800 border border-surface-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              />
            </div>

            {/* Language filter */}
            <div className="relative">
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="appearance-none w-full sm:w-44 px-4 py-2.5 pr-9 bg-surface-800 border border-surface-700 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors cursor-pointer"
              >
                {languageOptions.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang === 'all' ? t('common.all') : t(`languages.${lang}`)}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                <ChevronDownIcon />
              </div>
            </div>
          </div>

          {/* Bottom row: tag tabs + sort */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Tag pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTag('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTag === 'all'
                    ? 'gradient-bg text-white shadow-lg shadow-primary-500/20'
                    : 'bg-surface-800 text-gray-400 hover:text-white hover:bg-surface-700'
                }`}
              >
                {t('common.all')}
              </button>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setActiveTag(tag.name)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeTag === tag.name
                      ? 'gradient-bg text-white shadow-lg shadow-primary-500/20'
                      : 'bg-surface-800 text-gray-400 hover:text-white hover:bg-surface-700'
                  }`}
                >
                  {tag.displayNameKo}
                </button>
              ))}
            </div>

            {/* Sort tabs */}
            <div className="flex bg-surface-800 rounded-xl p-1 shrink-0">
              <button
                onClick={() => setSortMode('popular')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  sortMode === 'popular'
                    ? 'bg-surface-700 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {t('library.popular')}
              </button>
              <button
                onClick={() => setSortMode('latest')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  sortMode === 'latest'
                    ? 'bg-surface-700 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {t('library.latest')}
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <svg className="w-8 h-8 animate-spin text-primary-400 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-gray-500">{t('common.loading')}</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-20 text-red-400">
            <p className="text-lg">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">아직 공개된 더빙 영상이 없습니다</p>
          </div>
        )}

        {/* Card Grid */}
        {!loading && !error && items.length > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-4">{total}개의 영상</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map((item, index) => {
                const thumbnailSrc = resolvePersoFileUrl(item.thumbnailUrl);
                return (
                  <Link
                    key={item.id}
                    to={`/library/${item.id}`}
                    className="group glass rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-500/30"
                  >
                    {/* Thumbnail */}
                    <div className={`relative aspect-video ${!thumbnailSrc ? `bg-gradient-to-br ${GRADIENT_PALETTES[index % GRADIENT_PALETTES.length]}` : 'bg-surface-800'} flex items-center justify-center overflow-hidden`}>
                      {thumbnailSrc ? (
                        <img
                          src={thumbnailSrc}
                          alt={item.title}
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
                      {/* Title + Author */}
                      <div>
                        <h3 className="text-white font-semibold text-sm leading-tight truncate">
                          {item.title}
                        </h3>
                        <p className="text-gray-500 text-xs mt-0.5 truncate">
                          {item.authorName}
                        </p>
                      </div>

                      {/* Duration + Language row */}
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-gray-500 text-xs">
                          <ClockIcon />
                          {formatSeconds(Math.floor(item.durationMs / 1000))}
                        </span>
                        <span className="text-gray-600 text-xs">|</span>
                        <span className="text-xs text-gray-400 uppercase">
                          {item.sourceLanguage} → {item.targetLanguage}
                        </span>
                      </div>

                      {/* Tag badges */}
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
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
