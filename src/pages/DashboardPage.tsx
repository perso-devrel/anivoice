import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { listMyProjects, toggleFavorite, formatSeconds, type DbProject } from '../services/anivoiceApi';
import { useAuthStore } from '../stores/authStore';
import type { ProjectStatus } from '../types';

type FilterTab = 'all' | 'favorites' | 'in-progress' | 'completed';

function mapDbStatus(project: DbProject): ProjectStatus {
  const s = project.status?.toLowerCase() || '';
  if (s === 'failed') return 'failed';
  if (s === 'completed' || project.progress >= 100) return 'completed';
  if (s.includes('lip')) return 'lip-syncing';
  if (s.includes('dub') || s.includes('translat')) return 'dubbing';
  if (s.includes('upload')) return 'uploading';
  if (s.includes('analyz') || s.includes('process')) return 'analyzing';
  if (project.progress > 0 && project.progress < 100) return 'dubbing';
  return 'analyzing';
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

const STATUS_CONFIG: Record<
  string,
  { labelKey: string; dotClass: string; badgeBg: string; badgeText: string }
> = {
  analyzing: {
    labelKey: 'dashboard.statusAnalyzing',
    dotClass: 'bg-yellow-400',
    badgeBg: 'bg-yellow-400/10',
    badgeText: 'text-yellow-400',
  },
  dubbing: {
    labelKey: 'dashboard.statusDubbing',
    dotClass: 'bg-blue-400',
    badgeBg: 'bg-blue-400/10',
    badgeText: 'text-blue-400',
  },
  'lip-syncing': {
    labelKey: 'dashboard.statusLipSyncing',
    dotClass: 'bg-blue-300',
    badgeBg: 'bg-blue-300/10',
    badgeText: 'text-blue-300',
  },
  uploading: {
    labelKey: 'dashboard.statusUploading',
    dotClass: 'bg-yellow-300',
    badgeBg: 'bg-yellow-300/10',
    badgeText: 'text-yellow-300',
  },
  completed: {
    labelKey: 'dashboard.statusCompleted',
    dotClass: 'bg-green-400',
    badgeBg: 'bg-green-400/10',
    badgeText: 'text-green-400',
  },
  failed: {
    labelKey: 'dashboard.statusFailed',
    dotClass: 'bg-red-400',
    badgeBg: 'bg-red-400/10',
    badgeText: 'text-red-400',
  },
};

function getProgressBarColor(status: ProjectStatus): string {
  switch (status) {
    case 'analyzing':
    case 'uploading':
      return 'bg-yellow-400';
    case 'dubbing':
    case 'lip-syncing':
      return 'bg-blue-400';
    case 'completed':
      return 'bg-green-400';
    case 'failed':
      return 'bg-red-400';
    default:
      return 'bg-primary-400';
  }
}

const GRADIENT_PLACEHOLDERS = [
  'from-purple-600/30 to-blue-600/30',
  'from-pink-600/30 to-orange-600/30',
  'from-cyan-600/30 to-green-600/30',
  'from-indigo-600/30 to-pink-600/30',
  'from-amber-600/30 to-red-600/30',
];

type SortOrder = 'newest' | 'oldest';

export default function DashboardPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [projects, setProjects] = useState<DbProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await listMyProjects(20, 0);
        if (cancelled) return;
        setProjects(result.projects);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const mappedProjects = projects.map((p) => ({
    ...p,
    mappedStatus: mapDbStatus(p),
  }));

  const availableLanguages = Array.from(
    new Set(
      projects.flatMap((p) =>
        (p.targetLanguage || '').split(',').map((l) => l.trim().toLowerCase()).filter(Boolean)
      )
    )
  ).sort();

  const query = searchQuery.trim().toLowerCase();
  const filteredProjects = mappedProjects
    .filter((project) => {
      if (query && !project.title.toLowerCase().includes(query) && !project.targetLanguage.toLowerCase().includes(query)) return false;
      if (languageFilter && !project.targetLanguage.toLowerCase().includes(languageFilter)) return false;
      if (activeTab === 'all') return true;
      if (activeTab === 'favorites') return project.isFavorite;
      if (activeTab === 'completed') return project.mappedStatus === 'completed';
      return project.mappedStatus !== 'completed' && project.mappedStatus !== 'failed';
    })
    .sort((a, b) => {
      const dateA = a.createdAt || '';
      const dateB = b.createdAt || '';
      return sortOrder === 'newest' ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
    });

  const inProgressCount = mappedProjects.filter(
    (p) => p.mappedStatus !== 'completed' && p.mappedStatus !== 'failed'
  ).length;
  const completedCount = mappedProjects.filter(
    (p) => p.mappedStatus === 'completed'
  ).length;

  async function handleToggleFavorite(e: React.MouseEvent, projectId: number, current: boolean) {
    e.preventDefault();
    e.stopPropagation();
    const next = !current;
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, isFavorite: next } : p));
    try {
      await toggleFavorite(projectId, next);
    } catch {
      setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, isFavorite: current } : p));
    }
  }

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: t('common.all') },
    { key: 'favorites', label: t('dashboard.favorites') },
    { key: 'in-progress', label: t('dashboard.inProgress') },
    { key: 'completed', label: t('dashboard.completed') },
  ];

  return (
    <div className="min-h-screen bg-surface-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {t('dashboard.myProjects')}
            </h1>
            {user?.displayName && (
              <p className="text-sm text-gray-400 mt-1">
                {user.displayName}
              </p>
            )}
          </div>
          <Link
            to="/studio"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            {t('dashboard.newProject')}
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {/* Credits remaining */}
          <div className="glass rounded-xl p-5 flex items-center gap-4">
            <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-primary-500/15 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">
                {t('dashboard.creditsRemaining')}
                {user?.plan && <span className="ml-1 text-gray-500">({user.plan})</span>}
              </p>
              <p className="text-2xl font-bold text-white">
                {loading ? '...' : user ? formatSeconds(user.creditSeconds) : '--'}
              </p>
            </div>
          </div>

          {/* In progress */}
          <div className="glass rounded-xl p-5 flex items-center gap-4">
            <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-accent-500/15 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-accent-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M21.015 4.356v4.992"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">
                {t('dashboard.inProgress')}
              </p>
              <p className="text-2xl font-bold text-white">
                {loading ? '...' : inProgressCount}
              </p>
            </div>
          </div>

          {/* Completed */}
          <div className="glass rounded-xl p-5 flex items-center gap-4">
            <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-green-500/15 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">
                {t('dashboard.completed')}
              </p>
              <p className="text-2xl font-bold text-white">
                {loading ? '...' : completedCount}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Projects Header + Search + Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-white">
            {t('dashboard.recentProjects')}
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search')}
                className="w-44 pl-8 pr-3 py-1.5 rounded-lg bg-surface-800 text-sm text-white placeholder-gray-500 border border-surface-700 focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>
            {availableLanguages.length > 0 && (
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-surface-800 text-sm text-white border border-surface-700 focus:border-primary-500 focus:outline-none transition-colors"
              >
                <option value="">{t('dashboard.allLanguages')}</option>
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {t(`languages.${lang}`, lang.toUpperCase())}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 text-sm text-gray-300 border border-surface-700 hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {sortOrder === 'newest' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
                )}
              </svg>
              {t(sortOrder === 'newest' ? 'dashboard.sortNewest' : 'dashboard.sortOldest')}
            </button>
            <div className="flex gap-1 p-1 rounded-lg bg-surface-800">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-surface-700 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="glass rounded-2xl p-16 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-base">{t('common.loading')}</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="glass rounded-2xl p-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 mb-4 rounded-full bg-red-500/15 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-red-400 text-base mb-2">{t('common.error')}</p>
            <p className="text-gray-500 text-sm max-w-md mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-lg bg-surface-800 text-white text-sm font-medium hover:bg-surface-700 transition-colors"
            >
              {t('common.retry')}
            </button>
          </div>
        )}

        {/* Projects Grid / Empty State */}
        {!loading && !error && filteredProjects.length === 0 && (
          <div className="glass rounded-2xl p-16 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 mb-6 rounded-2xl bg-surface-800 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5"
                />
              </svg>
            </div>
            <p className="text-gray-400 text-base max-w-sm">
              {t('dashboard.noProjects')}
            </p>
            <Link
              to="/studio"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              {t('dashboard.newProject')}
            </Link>
          </div>
        )}

        {!loading && !error && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProjects.map((project, idx) => {
              const status = project.mappedStatus;
              const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.analyzing;
              const gradient = GRADIENT_PLACEHOLDERS[idx % GRADIENT_PLACEHOLDERS.length];
              return (
                <Link
                  key={project.id}
                  to={`/studio?project=${project.persoProjectSeq}&space=${project.persoSpaceSeq}`}
                  className="glass rounded-xl overflow-hidden group hover:ring-1 hover:ring-primary-500/40 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-surface-800 flex items-center justify-center overflow-hidden">
                    {project.thumbnailUrl ? (
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                    )}
                    {!project.thumbnailUrl && (
                      <svg
                        className="w-10 h-10 text-surface-700 relative z-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                        />
                      </svg>
                    )}
                    {/* Language badge */}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-900/80 text-gray-300 backdrop-blur-sm">
                      {project.sourceLanguage?.toUpperCase() || '?'} &rarr;{' '}
                      {project.targetLanguage?.toUpperCase() || '?'}
                    </span>
                    {/* Favorite toggle */}
                    <button
                      onClick={(e) => handleToggleFavorite(e, project.id, project.isFavorite)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-surface-900/60 backdrop-blur-sm hover:bg-surface-900/90 transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} fill={project.isFavorite ? 'currentColor' : 'none'}>
                        <path className={project.isFavorite ? 'text-yellow-400' : 'text-gray-400'} strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    </button>
                    {/* Duration */}
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[11px] font-medium bg-black/60 text-gray-300">
                      {formatDuration(project.durationMs || 0)}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
                        {project.title}
                      </h3>
                      <span
                        className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.badgeBg} ${cfg.badgeText}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`}
                        />
                        {t(cfg.labelKey)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-gray-500">
                          {project.progress}%
                        </span>
                        <span className="text-[11px] text-gray-600">
                          {project.createdAt?.split('T')[0] || ''}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-surface-800">
                        <div
                          className={`h-full rounded-full ${getProgressBarColor(status)} transition-all`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
