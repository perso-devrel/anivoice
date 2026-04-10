import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { listMyProjects, toggleFavorite, formatSeconds, getCreditHistory, type DbProject, type CreditHistoryDay } from '../services/anivoiceApi';

const UsageChart = lazy(() => import('../components/UsageChart'));
import { useAuthStore } from '../stores/authStore';
import OnboardingModal from '../components/OnboardingModal';
import { shouldShowOnboarding } from '../utils/onboarding';
import { mapDbStatus, formatDuration, getProgressBarColor, filterProjects, sortProjects, extractAvailableLanguages, type FilterTab, type SortOrder } from '../utils/dashboard';

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

const GRADIENT_PLACEHOLDERS = [
  'from-purple-600/30 to-blue-600/30',
  'from-pink-600/30 to-orange-600/30',
  'from-cyan-600/30 to-green-600/30',
  'from-indigo-600/30 to-pink-600/30',
  'from-amber-600/30 to-red-600/30',
];

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
  const [usageData, setUsageData] = useState<CreditHistoryDay[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await listMyProjects(20, 0);
        if (cancelled) return;
        setProjects(result.projects);
        if (shouldShowOnboarding(result.projects.length)) {
          setShowOnboarding(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function fetchUsage() {
      try {
        const hist = await getCreditHistory(30);
        if (!cancelled) setUsageData(hist.data);
      } catch {
        // non-critical — chart simply stays empty
      }
    }

    fetchData();
    fetchUsage();
    return () => { cancelled = true; };
  }, []);

  const mappedProjects = projects.map((p) => ({
    ...p,
    mappedStatus: mapDbStatus(p),
  }));

  const availableLanguages = extractAvailableLanguages(projects);

  const filteredProjects = sortProjects(
    filterProjects(mappedProjects, { query: searchQuery, languageFilter, activeTab }),
    sortOrder,
  );

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
    <main className="min-h-screen bg-surface-950 pt-20 pb-12">
      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}
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
                {loading ? '...' : user ? formatSeconds(user.creditSeconds, { hours: t('common.hours'), minutes: t('common.minutes'), seconds: t('common.seconds') }) : '--'}
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

        {/* Usage Chart */}
        <div className="glass rounded-xl p-5 mb-10">
          <h2 className="text-base font-semibold text-white mb-4">
            {t('dashboard.usageChart')}
          </h2>
          <Suspense fallback={<div className="h-[200px] flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" /></div>}>
            <UsageChart data={usageData} />
          </Suspense>
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
        {!loading && !error && filteredProjects.length === 0 && projects.length === 0 && (
          <div className="glass rounded-2xl p-12 sm:p-16 flex flex-col items-center justify-center text-center">
            <div className="w-32 h-32 mb-8 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 blur-xl" />
              <div className="relative w-full h-full rounded-2xl bg-surface-800/80 flex items-center justify-center">
                <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
                  <rect x="8" y="14" width="48" height="36" rx="4" stroke="url(#emptyGrad)" strokeWidth="2.5" />
                  <path d="M8 22h48" stroke="url(#emptyGrad)" strokeWidth="2" opacity="0.5" />
                  <circle cx="32" cy="36" r="8" stroke="url(#emptyGrad)" strokeWidth="2.5" />
                  <polygon points="30,33 30,39 36,36" fill="url(#emptyGrad)" />
                  <path d="M44 10l4-4m0 0l4 4m-4-4v8" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
                  <circle cx="14" cy="10" r="2" fill="#ec4899" opacity="0.5" />
                  <circle cx="52" cy="54" r="1.5" fill="#8b5cf6" opacity="0.5" />
                  <defs>
                    <linearGradient id="emptyGrad" x1="8" y1="14" x2="56" y2="50">
                      <stop stopColor="#ec4899" />
                      <stop offset="1" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold gradient-text mb-2">
              {t('dashboard.noProjectsTitle')}
            </h3>
            <p className="text-gray-400 text-sm max-w-sm mb-8">
              {t('dashboard.noProjectsDesc')}
            </p>
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary-500/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t('dashboard.newProject')}
            </Link>
          </div>
        )}

        {/* Filter/Search — no results */}
        {!loading && !error && filteredProjects.length === 0 && projects.length > 0 && (
          <div className="glass rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 mb-6 rounded-2xl bg-surface-800/80 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="text-gray-300 text-base font-medium mb-1">
              {t('dashboard.noFilterResults')}
            </p>
            <p className="text-gray-500 text-sm max-w-sm mb-6">
              {t('dashboard.noFilterResultsDesc')}
            </p>
            <button
              onClick={() => { setSearchQuery(''); setLanguageFilter(''); setActiveTab('all'); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-800 text-white text-sm font-medium hover:bg-surface-700 transition-colors"
            >
              {t('dashboard.clearFilters')}
            </button>
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
                      aria-label={project.isFavorite ? t('dashboard.removeFavorite') : t('dashboard.addFavorite')}
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
    </main>
  );
}
