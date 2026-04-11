import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { listMyProjects, toggleFavorite, getCreditHistory, type DbProject, type CreditHistoryDay } from '../services/anivoiceApi';
import { formatCreditTime, getErrorMessage } from '../utils/format';
import { PlusIcon, AlertCircleIcon, CheckCircleIcon, SearchIcon, WalletIcon, RefreshIcon, EmptyProjectsIcon, LoadingSpinner } from '../components/icons';
import { ProjectCard } from '../components/ProjectCard';
import { DashboardToolbar } from '../components/DashboardToolbar';

const UsageChart = lazy(() => import('../components/UsageChart'));
import { useAuthStore } from '../stores/authStore';
import OnboardingModal from '../components/OnboardingModal';
import { shouldShowOnboarding } from '../utils/onboarding';
import { mapDbStatus, filterProjects, sortProjects, extractAvailableLanguages, countProjectStats, type FilterTab, type SortOrder } from '../utils/dashboard';

const DASHBOARD_TABS: { key: FilterTab; i18nKey: string }[] = [
  { key: 'all', i18nKey: 'common.all' },
  { key: 'favorites', i18nKey: 'dashboard.favorites' },
  { key: 'in-progress', i18nKey: 'dashboard.inProgress' },
  { key: 'completed', i18nKey: 'dashboard.completed' },
];

function StatePanel({ padding = 'p-16', children }: { padding?: string; children: React.ReactNode }) {
  return (
    <div className={`glass rounded-2xl ${padding} flex flex-col items-center justify-center text-center`}>
      {children}
    </div>
  );
}

function StatCard({ icon, iconBg, label, value }: {
  icon: React.ReactNode;
  iconBg: string;
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="glass rounded-xl p-5 flex items-center gap-4">
      <div className={`flex-shrink-0 w-11 h-11 rounded-lg ${iconBg} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

const GRADIENT_PLACEHOLDERS = [
  'from-purple-600/30 to-blue-600/30',
  'from-pink-600/30 to-orange-600/30',
  'from-cyan-600/30 to-green-600/30',
  'from-indigo-600/30 to-pink-600/30',
  'from-amber-600/30 to-red-600/30',
];

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
        const result = await listMyProjects(20, 0);
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
            <PlusIcon className="w-4 h-4" />
            {t('dashboard.newProject')}
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard
            icon={<WalletIcon className="w-5 h-5 text-primary-400" />}
            iconBg="bg-primary-500/15"
            label={<>{t('dashboard.creditsRemaining')}{user?.plan && <span className="ml-1 text-gray-500">({user.plan})</span>}</>}
            value={loading ? '...' : user ? formatCreditTime(user.creditSeconds, t) : '--'}
          />
          <StatCard
            icon={<RefreshIcon className="w-5 h-5 text-accent-400" />}
            iconBg="bg-accent-500/15"
            label={t('dashboard.inProgress')}
            value={loading ? '...' : inProgressCount}
          />
          <StatCard
            icon={<CheckCircleIcon className="w-5 h-5 text-green-400" />}
            iconBg="bg-green-500/15"
            label={t('dashboard.completed')}
            value={loading ? '...' : completedCount}
          />
        </div>

        {/* Usage Chart */}
        <div className="glass rounded-xl p-5 mb-10">
          <h2 className="text-base font-semibold text-white mb-4">
            {t('dashboard.usageChart')}
          </h2>
          <Suspense fallback={<div className="h-[200px] flex items-center justify-center"><LoadingSpinner className="w-6 h-6 border-primary-400" /></div>}>
            <UsageChart data={usageData} />
          </Suspense>
        </div>

        {/* Recent Projects Header + Search + Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-white">
            {t('dashboard.recentProjects')}
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

        {/* Loading State */}
        {loading && (
          <StatePanel>
            <LoadingSpinner className="w-10 h-10 border-primary-400 mb-4" />
            <p className="text-gray-400 text-base">{t('common.loading')}</p>
          </StatePanel>
        )}

        {/* Error State */}
        {!loading && error && (
          <StatePanel>
            <div className="w-12 h-12 mb-4 rounded-full bg-red-500/15 flex items-center justify-center">
              <AlertCircleIcon className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-red-400 text-base mb-2">{t('common.error')}</p>
            <p className="text-gray-500 text-sm max-w-md mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-lg bg-surface-800 text-white text-sm font-medium hover:bg-surface-700 transition-colors"
            >
              {t('common.retry')}
            </button>
          </StatePanel>
        )}

        {/* Projects Grid / Empty State */}
        {!loading && !error && filteredProjects.length === 0 && projects.length === 0 && (
          <StatePanel padding="p-12 sm:p-16">
            <div className="w-32 h-32 mb-8 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 blur-xl" />
              <div className="relative w-full h-full rounded-2xl bg-surface-800/80 flex items-center justify-center">
                <EmptyProjectsIcon className="w-16 h-16" />
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
              <PlusIcon className="w-4 h-4" />
              {t('dashboard.newProject')}
            </Link>
          </StatePanel>
        )}

        {/* Filter/Search — no results */}
        {!loading && !error && filteredProjects.length === 0 && projects.length > 0 && (
          <StatePanel padding="p-12">
            <div className="w-20 h-20 mb-6 rounded-2xl bg-surface-800/80 flex items-center justify-center">
              <SearchIcon className="w-10 h-10 text-gray-500" />
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
          </StatePanel>
        )}

        {!loading && !error && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProjects.map((project, idx) => (
              <ProjectCard
                key={project.id}
                project={project}
                gradient={GRADIENT_PLACEHOLDERS[idx % GRADIENT_PLACEHOLDERS.length]}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
