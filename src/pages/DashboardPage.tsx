import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { listMyProjects, toggleFavorite, getCreditHistory, type DbProject, type CreditHistoryDay } from '../services/anivoiceApi';
import { formatCreditTime, getErrorMessage } from '../utils/format';
import { PlusIcon, AlertCircleIcon, SearchIcon, EmptyProjectsIcon, LoadingSpinner } from '../components/icons';
import { ProjectCard } from '../components/ProjectCard';
import { DashboardToolbar } from '../components/DashboardToolbar';

const UsageChart = lazy(() => import('../components/UsageChart'));
import { useAuthStore } from '../stores/authStore';
import OnboardingModal from '../components/OnboardingModal';
import { shouldShowOnboarding } from '../utils/onboarding';
import { mapDbStatus, filterProjects, sortProjects, extractAvailableLanguages, countProjectStats, type FilterTab, type SortOrder } from '../utils/dashboard';

const PROJECT_PAGE_SIZE = 20;
const CREDIT_HISTORY_DAYS = 30;

const DASHBOARD_TABS: { key: FilterTab; i18nKey: string }[] = [
  { key: 'all', i18nKey: 'common.all' },
  { key: 'favorites', i18nKey: 'dashboard.favorites' },
  { key: 'in-progress', i18nKey: 'dashboard.inProgress' },
  { key: 'completed', i18nKey: 'dashboard.completed' },
];

function StatePanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-ink/15 px-6 py-20 flex flex-col items-center justify-center text-center bg-cream">
      {children}
    </div>
  );
}

function StatCell({ label, value, sub }: { label: React.ReactNode; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="border-r border-b border-ink/15 px-6 py-7 last:border-r-0 md:last:border-r-0">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute mb-3">
        {label}
      </p>
      <p className="font-display text-4xl text-ink leading-none">{value}</p>
      {sub && <p className="mt-2 font-mono text-[11px] tracking-widest text-ink-mute">{sub}</p>}
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
    <main className="min-h-screen bg-cream pt-20 md:pt-24 pb-16">
      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Masthead */}
        <header className="border-t border-ink pt-6 mb-10">
          <div className="flex items-baseline justify-between mb-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
              Console — Dashboard · 卓
            </span>
            <span className="font-mono text-[11px] tracking-widest text-ink-mute hidden sm:inline">
              {new Date().toISOString().split('T')[0]}
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="font-display text-5xl md:text-6xl text-ink leading-[1.02] tracking-tight">
                {t('dashboard.myProjects')}
              </h1>
              {user?.displayName && (
                <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-soft mt-3">
                  {user.displayName}
                </p>
              )}
            </div>
            <Link
              to="/studio"
              className="inline-flex items-baseline gap-3 bg-ink text-cream px-6 py-3 font-mono text-[12px] uppercase tracking-[0.18em] hover:bg-cinnabar transition-colors self-start md:self-auto"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              {t('dashboard.newProject')}
            </Link>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-ink/15 mb-12">
          <StatCell
            label={t('dashboard.creditsRemaining')}
            value={loading ? '—' : user ? formatCreditTime(user.creditSeconds, t) : '—'}
            sub="credit · time"
          />
          <StatCell
            label={t('dashboard.inProgress')}
            value={loading ? '—' : inProgressCount}
            sub="project(s)"
          />
          <StatCell
            label={t('dashboard.completed')}
            value={loading ? '—' : completedCount}
            sub="project(s)"
          />
        </div>

        {/* Usage Chart */}
        <div className="border-t border-ink pt-6 mb-12">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
              {t('dashboard.usageChart')}
            </h2>
            <span className="font-mono text-[11px] tracking-widest text-ink-mute">
              · last {CREDIT_HISTORY_DAYS}d
            </span>
          </div>
          <Suspense fallback={<div className="h-[200px] flex items-center justify-center"><LoadingSpinner className="w-6 h-6 border-ink" /></div>}>
            <UsageChart data={usageData} />
          </Suspense>
        </div>

        {/* Recent Projects Header + Toolbar */}
        <div className="border-t border-ink pt-6 mb-8">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-display text-2xl md:text-3xl text-ink">
              {t('dashboard.recentProjects')}
            </h2>
          </div>
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

        {/* Loading State */}
        {loading && (
          <StatePanel>
            <LoadingSpinner className="w-8 h-8 border-ink mb-4" />
            <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-ink-mute">
              {t('common.loading')}
            </p>
          </StatePanel>
        )}

        {/* Error State */}
        {!loading && error && (
          <StatePanel>
            <AlertCircleIcon className="w-7 h-7 text-cinnabar mb-4" />
            <p className="font-display text-2xl text-ink mb-2">{t('common.error')}</p>
            <p className="text-ink-soft text-sm max-w-md mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 border border-ink text-ink font-mono text-[12px] uppercase tracking-[0.18em] hover:bg-ink hover:text-cream transition-colors"
            >
              {t('common.retry')}
            </button>
          </StatePanel>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProjects.length === 0 && projects.length === 0 && (
          <StatePanel>
            <EmptyProjectsIcon className="w-14 h-14 text-ink-mute mb-6" />
            <h3 className="font-display text-3xl text-ink mb-3">
              {t('dashboard.noProjectsTitle')}
            </h3>
            <p className="text-ink-soft text-sm max-w-sm mb-8">
              {t('dashboard.noProjectsDesc')}
            </p>
            <Link
              to="/studio"
              className="inline-flex items-baseline gap-3 bg-ink text-cream px-6 py-3 font-mono text-[12px] uppercase tracking-[0.18em] hover:bg-cinnabar transition-colors"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              {t('dashboard.newProject')}
            </Link>
          </StatePanel>
        )}

        {/* Filter no-results */}
        {!loading && !error && filteredProjects.length === 0 && projects.length > 0 && (
          <StatePanel>
            <SearchIcon className="w-8 h-8 text-ink-mute mb-5" />
            <p className="font-display text-xl text-ink mb-2">
              {t('dashboard.noFilterResults')}
            </p>
            <p className="text-ink-soft text-sm max-w-sm mb-6">
              {t('dashboard.noFilterResultsDesc')}
            </p>
            <button
              onClick={() => { setSearchQuery(''); setLanguageFilter(''); setActiveTab('all'); }}
              className="px-5 py-2.5 border border-ink text-ink font-mono text-[12px] uppercase tracking-[0.18em] hover:bg-ink hover:text-cream transition-colors"
            >
              {t('dashboard.clearFilters')}
            </button>
          </StatePanel>
        )}

        {/* Project Grid */}
        {!loading && !error && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
