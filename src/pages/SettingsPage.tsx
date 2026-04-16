import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { signOut } from '../services/firebase';
import { getCreditTransactions, type CreditTransaction } from '../services/anivoiceApi';
import { CREDIT_PRICE_PER_MINUTE_USD } from '../utils/pricing';
import { CheckmarkIcon } from '../components/icons';
import { ProfileTab } from '../components/ProfileTab';
import { SubscriptionTab } from '../components/SubscriptionTab';

type Tab = 'profile' | 'subscription' | 'billing' | 'language';

const SETTINGS_TABS: { key: Tab; i18nKey: string }[] = [
  { key: 'profile', i18nKey: 'settings.profile' },
  { key: 'subscription', i18nKey: 'settings.subscription' },
  { key: 'billing', i18nKey: 'settings.billing' },
  { key: 'language', i18nKey: 'settings.language' },
];

function formatTxAmount(amountSeconds: number): string {
  const minutes = Math.abs(amountSeconds) / 60;
  const usd = minutes * CREDIT_PRICE_PER_MINUTE_USD;
  const prefix = amountSeconds > 0 ? '+' : '-';
  return `${prefix}$${usd.toFixed(2)}`;
}

function getTxTypeKey(type: string): string {
  if (type === 'purchase') return 'settings.txTypePurchase';
  if (type === 'dubbing_deduct') return 'settings.txTypeDubbingDeduct';
  return 'settings.txTypeUnknown';
}

const TABLE_HEADER_CLASS = 'text-left font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute pb-3';

const LANGUAGE_OPTIONS: { code: 'ko' | 'en' | 'ja' | 'zh'; native: string; latin: string; subtitleKey: string }[] = [
  { code: 'ko', native: '한국어', latin: 'Korean', subtitleKey: 'settings.langKoreanSub' },
  { code: 'en', native: 'English', latin: 'English', subtitleKey: 'settings.langEnglishSub' },
  { code: 'ja', native: '日本語', latin: 'Japanese', subtitleKey: 'settings.langJapaneseSub' },
  { code: 'zh', native: '中文', latin: 'Chinese', subtitleKey: 'settings.langChineseSub' },
];

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  usePageTitle('pageTitle.settings');
  const { language, setLanguage } = useUIStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    if (tab === 'billing') {
      setTxLoading(true);
      getCreditTransactions(50)
        .then((res) => setTransactions(res.transactions))
        .catch(() => {})
        .finally(() => setTxLoading(false));
    }
  }

  const handleLanguageChange = (lang: 'ko' | 'en' | 'ja' | 'zh') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <main className="min-h-screen bg-cream text-ink pt-20 md:pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Masthead */}
        <header className="border-t border-ink pt-6 mb-10">
          <div className="flex items-baseline justify-between mb-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
              Console — Settings · 設定
            </span>
            <span className="font-mono text-[11px] tracking-widest text-ink-mute hidden sm:inline">
              {new Date().toISOString().split('T')[0]}
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-ink leading-[1.02] tracking-tight">
            {t('settings.title')}
          </h1>
          <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-soft mt-3">
            {t('settings.subtitle')}
          </p>
        </header>

        {/* Tabs */}
        <div className="border-t border-b border-ink/15 mb-8 flex overflow-x-auto">
          {SETTINGS_TABS.map((tab, i) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-5 py-4 font-mono text-[11px] uppercase tracking-[0.22em] whitespace-nowrap transition-colors relative ${
                i > 0 ? 'border-l border-ink/15' : ''
              } ${
                activeTab === tab.key
                  ? 'text-cinnabar'
                  : 'text-ink-mute hover:text-ink'
              }`}
            >
              <span className="text-ink-mute mr-2">{String(i + 1).padStart(2, '0')}</span>
              {t(tab.i18nKey)}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-px bg-cinnabar" />
              )}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <ProfileTab
            email={user?.email || 'user@example.com'}
            initialDisplayName={user?.displayName || 'User'}
          />
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <SubscriptionTab
            creditSeconds={user?.creditSeconds || 0}
          />
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="border-t border-ink pt-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
              Ledger · 帳簿
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-ink mt-2 mb-6">
              {t('settings.paymentHistory')}
            </h2>

            {txLoading ? (
              <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-ink-mute py-12 text-center">
                {t('settings.loadingTransactions')}
              </p>
            ) : transactions.length === 0 ? (
              <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-ink-mute py-12 text-center">
                {t('settings.noTransactions')}
              </p>
            ) : (
              <div className="overflow-x-auto border-t border-ink/15">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-ink/15">
                      <th className={`${TABLE_HEADER_CLASS} pr-4 pt-4`}>
                        {t('settings.date')}
                      </th>
                      <th className={`${TABLE_HEADER_CLASS} pr-4 pt-4`}>
                        {t('settings.description')}
                      </th>
                      <th className={`${TABLE_HEADER_CLASS} pr-4 pt-4`}>
                        {t('settings.amount')}
                      </th>
                      <th className={`${TABLE_HEADER_CLASS} pt-4`}>
                        {t('settings.status')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-b border-ink/10 last:border-0"
                      >
                        <td className="py-4 pr-4 font-mono text-[12px] text-ink-soft">
                          {tx.createdAt.slice(0, 10)}
                        </td>
                        <td className="py-4 pr-4 text-[14px] text-ink">
                          {t(getTxTypeKey(tx.type))}
                        </td>
                        <td className={`py-4 pr-4 font-mono text-[13px] ${tx.amountSeconds > 0 ? 'text-ink' : 'text-cinnabar'}`}>
                          {formatTxAmount(tx.amountSeconds)}
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-0.5 border border-ink font-mono text-[10px] uppercase tracking-[0.18em] text-ink">
                            {t('settings.paid')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Language Tab */}
        {activeTab === 'language' && (
          <div className="border-t border-ink pt-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
              Locale · 言語
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-ink mt-2 mb-2">
              {t('settings.selectLanguage')}
            </h2>
            <p className="text-ink-soft text-sm mb-8">
              {t('settings.languageHint')}
            </p>

            <div className="border-t border-ink/15 divide-y divide-ink/15">
              {LANGUAGE_OPTIONS.map((opt) => {
                const active = language === opt.code;
                return (
                  <button
                    key={opt.code}
                    onClick={() => handleLanguageChange(opt.code)}
                    className={`w-full flex items-center gap-5 py-5 text-left transition-colors group ${
                      active ? 'text-ink' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <span className={`font-mono text-[11px] uppercase tracking-[0.22em] ${active ? 'text-cinnabar' : 'text-ink-mute'}`}>
                      {opt.code.toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <p className="font-display text-2xl text-ink">{opt.native}</p>
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute mt-1">
                        {opt.latin} · {t(opt.subtitleKey)}
                      </p>
                    </div>
                    {active && <CheckmarkIcon className="w-5 h-5 text-ink" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="mt-12 pt-6 border-t border-ink/15">
          <button
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
            className="px-5 py-3 border border-cinnabar text-cinnabar font-mono text-[12px] uppercase tracking-[0.18em] hover:bg-cinnabar hover:text-cream transition-colors"
          >
            {t('common.logout')}
          </button>
        </div>
      </div>
    </main>
  );
}
