import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { listMyProjects, toggleFavorite, getCreditHistory, type DbProject, type CreditHistoryDay } from '../services/anivoiceApi';
import { formatCreditTime, formatDuration, getErrorMessage } from '../utils/format';
import { PlusIcon, AlertCircleIcon, SearchIcon, StarIcon, LoadingSpinner } from '../components/icons';
import { DashboardToolbar } from '../components/DashboardToolbar';

const UsageChart = lazy(() => import('../components/UsageChart'));
import { useAuthStore } from '../stores/authStore';
import OnboardingModal from '../components/OnboardingModal';
import { shouldShowOnboarding } from '../utils/onboarding';
import { mapDbStatus, filterProjects, sortProjects, extractAvailableLanguages, countProjectStats, type FilterTab, type SortOrder } from '../utils/dashboard';
import type { ProjectStatus } from '../types';

const PROJECT_PAGE_SIZE = 20;
const CREDIT_HISTORY_DAYS = 30;

const DASHBOARD_TABS: { key: FilterTab; i18nKey: string }[] = [
  { key: 'all', i18nKey: 'common.all' },
  { key: 'favorites', i18nKey: 'dashboard.favorites' },
  { key: 'in-progress', i18nKey: 'dashboard.inProgress' },
  { key: 'completed', i18nKey: 'dashboard.completed' },
];

const MISSION_STATUS: Record<string, { labelKey: string; badgeClass: string }> = {
  analyzing: { labelKey: 'dashboard.statusAnalyzing', badgeClass: 'text-david bg-david/10' },
  uploading: { labelKey: 'dashboard.statusUploading', badgeClass: 'text-david bg-david/10' },
  dubbing: { labelKey: 'dashboard.statusDubbing', badgeClass: 'text-lucy bg-lucy/10' },
  'lip-syncing': { labelKey: 'dashboard.statusLipSyncing', badgeClass: 'text-wire bg-wire/10' },
  completed: { labelKey: 'dashboard.statusCompleted', badgeClass: 'text-wire bg-wire/10' },
  failed: { labelKey: 'dashboard.statusFailed', badgeClass: 'text-rebecca bg-rebecca/10' },
};

function getMissionBarColor(status: ProjectStatus): string {
  if (status === 'completed') return 'bg-wire';
  if (status === 'failed') return 'bg-rebecca';
  return 'bg-lucy';
}

function HudCounter({ label, value, color, loading }: {
  label: string;
  value: React.ReactNode;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="flex-1 lg:flex-none border-b border-bone/20 pb-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40 mb-1">{label}</p>
      <p className={`font-mono text-3xl font-bold ${color}`}>
        {loading ? '---' : value}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  usePageTitle('pageTitle.dashboard');
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
        const result = await listMyProjects(PROJECT_PAGE_SIZE, 0);
        if (cancelled) return;
        setProjects(result.projects);
        if (shouldShowOnboarding(result.projects.length)) {
          setShowOnboarding(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function fetchUsage() {
      try {
        const hist = await getCreditHistory(CREDIT_HISTORY_DAYS);
        if (!cancelled) setUsageData(hist.data);
      } catch {
        // non-critical
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

  const { inProgress: inProgressCount, completed: completedCount } = countProjectStats(mappedProjects);

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

  const tabs = DASHBOARD_TABS.map(({ key, i18nKey }) => ({ key, label: t(i18nKey) }));

  return (
    <main className="min-h-screen bg-void pt-20 pb-12">
      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── SIDE PANEL ── */}
          <aside className="lg:w-72 shrink-0 space-y-6 lg:border-r lg:border-bone/10 lg:pr-8">
            {/* Runner identity */}
            <div className="relative border-b-2 border-bone/20 pb-6">
              <span
                className="absolute -top-4 -left-2 font-jp text-[80px] leading-none text-bone/[0.03] select-none pointer-events-none"
                aria-hidden="true"
              >
                作業
              </span>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40 mb-1">RUNNER</p>
              <p className="text-2xl font-display font-black text-david truncate relative">
                {user?.displayName || 'UNKNOWN'}
              </p>
              {user?.email && (
                <p className="font-mono text-xs text-bone/30 mt-1 truncate">{user.email}</p>
              )}
            </div>

            {/* HUD Counters */}
            <div className="flex lg:flex-col gap-4 lg:gap-5">
              <HudCounter
                label={t('dashboard.creditsRemaining')}
                value={user ? formatCreditTime(user.creditSeconds, t) : '--'}
                color="text-lucy"
                loading={loading}
              />
              <HudCounter
                label={t('dashboard.inProgress')}
                value={inProgressCount}
                color="text-david"
                loading={loading}
              />
              <HudCounter
                label={t('dashboard.completed')}
                value={completedCount}
                color="text-wire"
                loading={loading}
              />
            </div>

            {/* New Mission */}
            <Link
              to="/studio"
              className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-david text-void font-mono text-sm uppercase tracking-widest border-2 border-david hover:bg-void hover:text-david transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              NEW MISSION
            </Link>

            {/* Usage Chart — desktop sidebar */}
            <div className="hidden lg:block border-t border-bone/10 pt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40 mb-3">USAGE</p>
              <Suspense fallback={<div className="h-[140px] flex items-center justify-center"><LoadingSpinner className="w-5 h-5 border-lucy" /></div>}>
                <UsageChart data={usageData} />
              </Suspense>
            </div>
          </aside>

          {/* ── MAIN PANEL ── */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Usage Chart — mobile */}
            <div className="lg:hidden bg-ink border-2 border-bone/30 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40 mb-3">USAGE</p>
              <Suspense fallback={<div className="h-[160px] flex items-center justify-center"><LoadingSpinner className="w-5 h-5 border-lucy" /></div>}>
                <UsageChart data={usageData} />
              </Suspense>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="font-mono text-sm uppercase tracking-widest text-bone/60 border-l-4 border-lucy pl-3">
                ACTIVE MISSIONS
              </h2>
              <DashboardToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                languageFilter={languageFilter}
                onLanguageFilterChange={setLanguageFilter}
                availableLanguages={availableLanguages}
                sortOrder={sortOrder}
                onSortToggle={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabs={tabs}
              />
            </div>

            {/* Loading */}
            {loading && (
              <div className="bg-ink border-2 border-bone/30 py-16 text-center space-y-4">
                <p className="font-mono text-sm text-bone/40 tracking-widest">LOADING DATA...</p>
                <div className="w-48 mx-auto h-1 bg-bone/10 overflow-hidden">
                  <div className="h-full bg-lucy w-2/3 animate-pulse" />
                </div>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="bg-ink border-2 border-bone/30 py-12 text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-rebecca/10 flex items-center justify-center">
                  <AlertCircleIcon className="w-6 h-6 text-rebecca" />
                </div>
                <p className="font-mono text-sm text-rebecca tracking-wider">ERROR</p>
                <p className="text-bone/50 text-sm max-w-md mx-auto">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2 bg-ink text-bone text-sm font-mono uppercase tracking-wider hover:bg-void border-2 border-bone/30 transition-colors"
                >
                  {t('common.retry')}
                </button>
              </div>
            )}

            {/* Empty — no projects */}
            {!loading && !error && filteredProjects.length === 0 && projects.length === 0 && (
              <div className="scanlines relative bg-ink border-2 border-bone/30 py-20 text-center">
                <p className="font-mono text-3xl text-bone/20 tracking-[0.2em] mb-3">NO SIGNAL</p>
                <p className="font-mono text-sm text-bone/30">
                  &gt; START YOUR FIRST MISSION
                  <span className="inline-block w-2 h-4 bg-bone/40 ml-1 animate-pulse align-middle" />
                </p>
                <Link
                  to="/studio"
                  className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-david text-void font-mono text-sm uppercase tracking-widest border-2 border-david hover:bg-void hover:text-david transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  NEW MISSION
                </Link>
              </div>
            )}

            {/* Empty — filter no results */}
            {!loading && !error && filteredProjects.length === 0 && projects.length > 0 && (
              <div className="bg-ink border-2 border-bone/30 py-12 text-center space-y-4">
                <SearchIcon className="w-8 h-8 text-bone/30 mx-auto" />
                <p className="font-mono text-sm text-bone/40 tracking-wider">NO RESULTS</p>
                <p className="text-bone/30 text-sm">{t('dashboard.noFilterResultsDesc')}</p>
                <button
                  onClick={() => { setSearchQuery(''); setLanguageFilter(''); setActiveTab('all'); }}
                  className="px-5 py-2 text-sm font-mono uppercase tracking-wider text-bone/60 hover:text-bone border-2 border-bone/30 hover:border-bone transition-colors"
                >
                  CLEAR FILTERS
                </button>
              </div>
            )}

            {/* Project Table */}
            {!loading && !error && filteredProjects.length > 0 && (
              <div className="border-2 border-bone/30">
                {/* Table header */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_6.5rem_7.5rem_5rem_1.5rem] gap-4 px-5 py-2.5 border-b border-bone/20 bg-ink">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/30">MISSION</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/30">STATUS</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/30">PROGRESS</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/30 text-right">DATE</span>
                  <span />
                </div>

                {/* Rows */}
                <div className="divide-y divide-bone/10">
                  {filteredProjects.map((project) => {
                    const status = project.mappedStatus;
                    const cfg = MISSION_STATUS[status] ?? MISSION_STATUS.analyzing;
                    return (
                      <Link
                        key={project.id}
                        to={`/studio?project=${project.persoProjectSeq}&space=${project.persoSpaceSeq}`}
                        className="group relative flex flex-col sm:grid sm:grid-cols-[1fr_6.5rem_7.5rem_5rem_1.5rem] gap-2 sm:gap-4 sm:items-center px-5 py-3.5 hover:bg-void/50 transition-colors"
                      >
                        {/* Hover accent bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-lucy opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Mission info */}
                        <div className="min-w-0">
                          <p className="text-sm text-bone truncate group-hover:text-lucy transition-colors">
                            {project.title}
                          </p>
                          <p className="font-mono text-[10px] text-bone/30 uppercase mt-0.5">
                            {project.sourceLanguage || '?'} &rarr; {project.targetLanguage || '?'}
                            {project.durationMs > 0 && (
                              <span className="ml-2 text-bone/20">{formatDuration(project.durationMs)}</span>
                            )}
                          </p>
                        </div>

                        {/* Status badge */}
                        <span className={`self-start sm:self-auto inline-flex px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider justify-center ${cfg.badgeClass}`}>
                          {t(cfg.labelKey)}
                        </span>

                        {/* Progress */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-bone/10">
                            <div
                              className={`h-full ${getMissionBarColor(status)} transition-all`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-bone/40 w-8 text-right shrink-0">
                            {project.progress}%
                          </span>
                        </div>

                        {/* Date */}
                        <span className="font-mono text-[10px] text-bone/30 text-right hidden sm:block">
                          {project.createdAt?.split('T')[0] || ''}
                        </span>

                        {/* Favorite */}
                        <button
                          onClick={(e) => handleToggleFavorite(e, project.id, project.isFavorite)}
                          aria-label={project.isFavorite ? t('dashboard.removeFavorite') : t('dashboard.addFavorite')}
                          className="hidden sm:flex items-center justify-center p-0.5 text-bone/20 hover:text-yellow-400 transition-colors"
                        >
                          <StarIcon
                            className="w-3.5 h-3.5"
                            fill={project.isFavorite ? 'currentColor' : 'none'}
                          />
                        </button>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
