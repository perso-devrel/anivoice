import { useTranslation } from 'react-i18next';
import { SearchIcon, SortIcon } from './icons';
import type { FilterTab, SortOrder } from '../utils/dashboard';

interface DashboardToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  languageFilter: string;
  onLanguageFilterChange: (lang: string) => void;
  availableLanguages: string[];
  sortOrder: SortOrder;
  onSortToggle: () => void;
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  tabs: { key: FilterTab; label: string }[];
}

export function DashboardToolbar({
  searchQuery,
  onSearchChange,
  languageFilter,
  onLanguageFilterChange,
  availableLanguages,
  sortOrder,
  onSortToggle,
  activeTab,
  onTabChange,
  tabs,
}: DashboardToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('common.search')}
          aria-label={t('common.search')}
          className="w-44 pl-8 pr-3 py-1.5 rounded-lg bg-surface-800 text-sm text-white placeholder-gray-500 border border-surface-700 focus:border-primary-500 focus:outline-none transition-colors"
        />
      </div>
      {availableLanguages.length > 0 && (
        <select
          value={languageFilter}
          onChange={(e) => onLanguageFilterChange(e.target.value)}
          aria-label={t('common.filterByLanguage')}
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
        onClick={onSortToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 text-sm text-gray-300 border border-surface-700 hover:text-white transition-colors"
      >
        <SortIcon className="w-3.5 h-3.5" />
        {t(sortOrder === 'newest' ? 'dashboard.sortNewest' : 'dashboard.sortOldest')}
      </button>
      <div className="flex gap-1 p-1 rounded-lg bg-surface-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
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
  );
}
