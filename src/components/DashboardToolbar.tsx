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
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
      <div className="relative">
        <SearchIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-mute pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('common.search')}
          aria-label={t('common.search')}
          className="w-44 pl-6 pr-2 py-1.5 bg-transparent border-b border-ink/30 text-sm text-ink placeholder-ink-mute focus:border-cinnabar focus:outline-none transition-colors"
        />
      </div>
      {availableLanguages.length > 0 && (
        <select
          value={languageFilter}
          onChange={(e) => onLanguageFilterChange(e.target.value)}
          aria-label={t('common.filterByLanguage')}
          className="appearance-none px-0 py-1.5 bg-transparent border-b border-ink/30 text-ink focus:border-cinnabar focus:outline-none transition-colors cursor-pointer font-mono text-[12px] uppercase tracking-[0.18em] pr-4"
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
        className="flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.18em] text-ink-soft hover:text-ink pb-1.5 border-b border-transparent hover:border-ink transition-colors"
      >
        <SortIcon className="w-3.5 h-3.5" />
        {t(sortOrder === 'newest' ? 'dashboard.sortNewest' : 'dashboard.sortOldest')}
      </button>
      <div className="flex gap-4 ml-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`font-mono text-[12px] uppercase tracking-[0.18em] pb-1.5 border-b transition-colors ${
              activeTab === tab.key
                ? 'text-cinnabar border-cinnabar'
                : 'text-ink-mute border-transparent hover:text-ink hover:border-ink/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
