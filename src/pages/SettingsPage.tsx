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

const TABLE_HEADER_CLASS = 'text-left font-mono text-xs uppercase tracking-widest text-bone/50 pb-3';

const LANGUAGE_OPTIONS: { code: 'ko' | 'en' | 'ja' | 'zh'; emoji: string; label: string; subtitleKey: string }[] = [
  { code: 'ko', emoji: '🇰🇷', label: '한국어', subtitleKey: 'settings.langKoreanSub' },
  { code: 'en', emoji: '🇺🇸', label: 'English', subtitleKey: 'settings.langEnglishSub' },
  { code: 'ja', emoji: '🇯🇵', label: '日本語', subtitleKey: 'settings.langJapaneseSub' },
  { code: 'zh', emoji: '🇨🇳', label: '中文', subtitleKey: 'settings.langChineseSub' },
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
    <main className="min-h-screen bg-void pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="relative mb-10">
          <span className="absolute -top-6 -left-2 font-jp text-[100px] leading-none text-bone/[0.03] select-none pointer-events-none" aria-hidden="true">個人</span>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40 mb-1">RUNNER PROFILE</p>
          <h1 className="text-4xl sm:text-5xl font-display font-black text-david relative">
            {user?.displayName || 'UNKNOWN'}
          </h1>
          <p className="font-mono text-xs text-bone/30 mt-2">{user?.email}</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-8 border-b border-bone/20 overflow-x-auto">
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex-1 px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-b-2 border-lucy bg-transparent text-lucy'
                  : 'text-bone/40 hover:text-bone border-b-2 border-transparent'
              }`}
            >
              {t(tab.i18nKey)}
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
          <div className="relative bg-ink border-2 border-bone/30 p-6 corner-marks">
            <span className="absolute -top-3 left-4 font-mono text-[10px] uppercase tracking-[0.3em] text-lucy bg-void px-2" aria-hidden="true">BILLING</span>
            <h2 className="text-xl font-display font-semibold text-bone mb-6">
              {t('settings.paymentHistory')}
            </h2>

            {txLoading ? (
              <p className="text-bone/60 text-sm py-8 text-center">{t('settings.loadingTransactions')}</p>
            ) : transactions.length === 0 ? (
              <p className="text-bone/60 text-sm py-8 text-center">{t('settings.noTransactions')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-bone/30">
                      <th className={`${TABLE_HEADER_CLASS} pr-4 border-r border-bone/10`}>
                        {t('settings.date')}
                      </th>
                      <th className={`${TABLE_HEADER_CLASS} pr-4 border-r border-bone/10`}>
                        {t('settings.description')}
                      </th>
                      <th className={`${TABLE_HEADER_CLASS} pr-4 border-r border-bone/10`}>
                        {t('settings.amount')}
                      </th>
                      <th className={TABLE_HEADER_CLASS}>
                        {t('settings.status')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="group relative border-b border-bone/20 last:border-0 hover:bg-void/30 transition-colors"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-lucy opacity-0 group-hover:opacity-100 transition-opacity" />
                        <td className="py-4 pr-4 text-sm text-bone/80 border-r border-bone/10">
                          {tx.createdAt.slice(0, 10)}
                        </td>
                        <td className="py-4 pr-4 text-sm text-bone border-r border-bone/10">
                          {t(getTxTypeKey(tx.type))}
                        </td>
                        <td className={`py-4 pr-4 text-sm font-medium border-r border-bone/10 ${tx.amountSeconds > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatTxAmount(tx.amountSeconds)}
                        </td>
                        <td className="py-4">
                          <span className="font-mono text-[10px] uppercase px-2 py-0.5 bg-green-500/20 text-green-400">
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
          <div className="relative bg-ink border-2 border-bone/30 p-6 space-y-4 corner-marks">
            <span className="absolute -top-3 left-4 font-mono text-[10px] uppercase tracking-[0.3em] text-lucy bg-void px-2" aria-hidden="true">LANG</span>
            <h2 className="text-xl font-display font-semibold text-bone mb-2">
              {t('settings.selectLanguage')}
            </h2>
            <p className="text-sm font-mono text-bone/60 mb-6">
              {t('settings.languageHint')}
            </p>

            <div className="space-y-3">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => handleLanguageChange(opt.code)}
                  className={`w-full flex items-center gap-4 p-4 border-2 transition-all ${
                    language === opt.code
                      ? 'border-lucy bg-lucy/10 corner-marks offset-lucy-sm'
                      : 'border-bone/20 bg-ink hover:border-bone/30'
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <div className="text-left">
                    <p className="text-bone font-medium">{opt.label}</p>
                    <p className="text-sm text-bone/60">{t(opt.subtitleKey)}</p>
                  </div>
                  {language === opt.code && (
                    <CheckmarkIcon className="w-5 h-5 text-lucy ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Logout — DANGER ZONE */}
        <div className="mt-10 pt-8 border-t-2 border-rebecca/30">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-rebecca/60 mb-4">DANGER ZONE</p>
          <div className="bg-rebecca/5 border-2 border-rebecca/30 p-6">
            <p className="text-sm text-bone/60 mb-4">{t('settings.logoutDescription', t('common.logout'))}</p>
            <button
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
              className="px-6 py-3 border-2 border-rebecca text-rebecca font-mono text-sm uppercase tracking-widest hover:bg-rebecca hover:text-void transition-colors flicker-on-hover"
            >
              {t('common.logout')}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
