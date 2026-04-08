import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

interface AnimeItem {
  id: number;
  title: string;
  originalTitle: string;
  genre: string;
  duration: string;
  languages: string[];
  likes: number;
  isFree: boolean;
  isNew: boolean;
}

const MOCK_DATA: AnimeItem[] = [
  {
    id: 1,
    title: '진격의 거인 EP1',
    originalTitle: 'Attack on Titan EP1',
    genre: 'Action',
    duration: '23:40',
    languages: ['ko', 'en', 'es', 'pt'],
    likes: 2847,
    isFree: true,
    isNew: false,
  },
  {
    id: 2,
    title: '귀멸의 칼날 EP3',
    originalTitle: 'Demon Slayer EP3',
    genre: 'Action',
    duration: '22:15',
    languages: ['ko', 'en', 'ar'],
    likes: 3102,
    isFree: false,
    isNew: false,
  },
  {
    id: 3,
    title: '주술회전 EP5',
    originalTitle: 'Jujutsu Kaisen EP5',
    genre: 'Action',
    duration: '24:00',
    languages: ['ko', 'en', 'es', 'id'],
    likes: 1956,
    isFree: false,
    isNew: true,
  },
  {
    id: 4,
    title: '원피스 EP12',
    originalTitle: 'One Piece EP12',
    genre: 'Comedy',
    duration: '24:30',
    languages: ['ko', 'en', 'pt', 'es', 'ar'],
    likes: 4210,
    isFree: true,
    isNew: false,
  },
  {
    id: 5,
    title: '나의 히어로 아카데미아 EP2',
    originalTitle: 'My Hero Academia EP2',
    genre: 'Action',
    duration: '23:50',
    languages: ['ko', 'en'],
    likes: 1583,
    isFree: false,
    isNew: false,
  },
  {
    id: 6,
    title: '스파이 패밀리 EP1',
    originalTitle: 'SPY x FAMILY EP1',
    genre: 'Comedy',
    duration: '25:10',
    languages: ['ko', 'en', 'es', 'pt', 'id', 'ar'],
    likes: 5321,
    isFree: true,
    isNew: true,
  },
  {
    id: 7,
    title: '체인소 맨 EP4',
    originalTitle: 'Chainsaw Man EP4',
    genre: 'Action',
    duration: '22:45',
    languages: ['ko', 'en', 'es'],
    likes: 2764,
    isFree: false,
    isNew: true,
  },
  {
    id: 8,
    title: '도쿄 리벤저스 EP7',
    originalTitle: 'Tokyo Revengers EP7',
    genre: 'Action',
    duration: '23:20',
    languages: ['ko', 'en', 'id'],
    likes: 1892,
    isFree: false,
    isNew: false,
  },
];

function formatDurationMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

const GENRES = ['All', 'Action', 'Romance', 'Comedy', 'Fantasy', 'Sci-Fi'];

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

function HeartIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
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

const PERSO_BASE = (import.meta.env.VITE_PERSO_PROXY_PATH || '/api/perso').replace(/\/+$/, '');

export default function LibraryPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');
  const [sortMode, setSortMode] = useState<'popular' | 'latest'>('popular');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [libraryData, setLibraryData] = useState<AnimeItem[]>(MOCK_DATA);

  // Try Perso Community Spotlight API, fallback to mock data
  useEffect(() => {
    let cancelled = false;
    async function fetchRecommended() {
      try {
        const { data } = await axios.get(
          `${PERSO_BASE}/video-translator/api/v1/projects/recommended`,
          { timeout: 5000 }
        );
        const items = data?.result?.content ?? data?.result ?? data?.content ?? [];
        if (!cancelled && Array.isArray(items) && items.length > 0) {
          const mapped: AnimeItem[] = items.map((item: Record<string, unknown>, i: number) => ({
            id: (item.seq as number) ?? i + 100,
            title: (item.title as string) ?? `Project ${i + 1}`,
            originalTitle: (item.title as string) ?? '',
            genre: 'Action',
            duration: formatDurationMs((item.durationMs as number) ?? 0),
            languages: [
              ((item.sourceLanguage as Record<string, string>)?.code ?? 'ja'),
              ((item.targetLanguage as Record<string, string>)?.code ?? 'en'),
            ],
            likes: (item.viewCount as number) ?? 0,
            isFree: true,
            isNew: false,
          }));
          setLibraryData(mapped);
        }
      } catch {
        // API failed — keep mock data (already set as default)
      }
    }
    fetchRecommended();
    return () => { cancelled = true; };
  }, []);

  const filteredData = useMemo(() => {
    let items = [...libraryData];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.originalTitle.toLowerCase().includes(q)
      );
    }

    // Genre filter
    if (activeGenre !== 'All') {
      items = items.filter((item) => item.genre === activeGenre);
    }

    // Language filter
    if (languageFilter !== 'all') {
      items = items.filter((item) => item.languages.includes(languageFilter));
    }

    // Sort
    if (sortMode === 'popular') {
      items.sort((a, b) => b.likes - a.likes);
    } else {
      items.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.id - a.id);
    }

    return items;
  }, [searchQuery, activeGenre, sortMode, languageFilter, libraryData]);

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

          {/* Bottom row: genre tabs + sort */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Genre pills */}
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setActiveGenre(genre)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeGenre === genre
                      ? 'gradient-bg text-white shadow-lg shadow-primary-500/20'
                      : 'bg-surface-800 text-gray-400 hover:text-white hover:bg-surface-700'
                  }`}
                >
                  {genre === 'All' ? t('common.all') : genre}
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

        {/* Card Grid */}
        {filteredData.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">{t('common.noData')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredData.map((item, index) => (
              <div
                key={item.id}
                className="group glass rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-500/30"
              >
                {/* Thumbnail */}
                <div className={`relative aspect-video bg-gradient-to-br ${GRADIENT_PALETTES[index % GRADIENT_PALETTES.length]} flex items-center justify-center overflow-hidden`}>
                  <span className="text-white/20 text-6xl font-black select-none">
                    {item.title.charAt(0)}
                  </span>
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                      <PlayIcon />
                    </div>
                  </div>
                  {/* Free badge */}
                  {item.isFree && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-green-500/90 text-white text-xs font-bold">
                      {t('common.free')}
                    </span>
                  )}
                  {/* New badge */}
                  {item.isNew && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md gradient-bg text-white text-xs font-bold">
                      NEW
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 space-y-2.5">
                  {/* Title */}
                  <div>
                    <h3 className="text-white font-semibold text-sm leading-tight truncate">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-xs mt-0.5 truncate">
                      {item.originalTitle}
                    </p>
                  </div>

                  {/* Genre + Duration row */}
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-accent-500/15 text-accent-400 text-xs font-medium">
                      {item.genre}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500 text-xs">
                      <ClockIcon />
                      {item.duration}
                    </span>
                  </div>

                  {/* Language chips */}
                  <div className="flex flex-wrap gap-1">
                    {item.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-1.5 py-0.5 rounded bg-surface-800 text-gray-400 text-[10px] font-medium uppercase"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>

                  {/* Likes */}
                  <div className="flex items-center gap-1 text-gray-500 text-xs pt-0.5">
                    <span className="text-primary-400">
                      <HeartIcon />
                    </span>
                    <span>{item.likes.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
