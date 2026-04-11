import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { Link, useNavigate } from 'react-router-dom';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { signOut, updateProfile as updateUserProfile } from '../services/firebase';
import { formatCreditTime } from '../utils/format';
import { CheckmarkIcon, UserIcon } from '../components/icons';

type Tab = 'profile' | 'subscription' | 'billing' | 'language';

const SETTINGS_TABS: { key: Tab; i18nKey: string }[] = [
  { key: 'profile', i18nKey: 'settings.profile' },
  { key: 'subscription', i18nKey: 'settings.subscription' },
  { key: 'billing', i18nKey: 'settings.billing' },
  { key: 'language', i18nKey: 'settings.language' },
];

const BILLING_HISTORY_ENTRIES = [
  { date: '2026-03-01', descriptionKey: 'settings.billingBasicPlan', amount: '$4.99', statusKey: 'settings.paid' },
  { date: '2026-02-01', descriptionKey: 'settings.billingBasicPlan', amount: '$4.99', statusKey: 'settings.paid' },
  { date: '2026-01-15', descriptionKey: 'settings.billingCreditPack', amount: '$12.00', statusKey: 'settings.paid' },
] as const;

const BASIC_FEATURE_KEYS = [
  'settings.basicFeature1',
  'settings.basicFeature2',
  'settings.basicFeature3',
] as const;

const LANGUAGE_OPTIONS: { code: 'ko' | 'en'; emoji: string; label: string; subtitleKey: string }[] = [
  { code: 'ko', emoji: '🇰🇷', label: '한국어', subtitleKey: 'settings.langKoreanSub' },
  { code: 'en', emoji: '🇺🇸', label: 'English', subtitleKey: 'settings.langEnglishSub' },
];

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  usePageTitle('pageTitle.settings');
  const { language, setLanguage } = useUIStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const [displayName, setDisplayName] = useState(user?.displayName || 'User');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile(displayName);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Profile update failed silently — user can retry
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (lang: 'ko' | 'en') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const billingHistory = BILLING_HISTORY_ENTRIES.map((entry) => ({
    date: entry.date,
    description: t(entry.descriptionKey),
    amount: entry.amount,
    status: t(entry.statusKey),
  }));

  return (
    <main className="min-h-screen bg-surface-950 pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold gradient-text mb-2">
          {t('settings.title')}
        </h1>
        <p className="text-gray-400 mb-8">{t('settings.subtitle')}</p>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 bg-surface-900 rounded-xl overflow-x-auto">
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'gradient-bg text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-surface-800'
              }`}
            >
              {t(tab.i18nKey)}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="glass rounded-2xl p-6 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-surface-700 flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-gray-500" />
              </div>
              <div>
                <p className="text-white font-medium">
                  {t('settings.avatarPlaceholder')}
                </p>
                <p className="text-sm text-gray-500">
                  {t('settings.avatarHint')}
                </p>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('settings.displayName')}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-surface-700 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Email (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('settings.email')}
              </label>
              <input
                type="email"
                value={user?.email || 'user@example.com'}
                readOnly
                className="w-full px-4 py-3 rounded-xl bg-surface-850 border border-surface-700 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('settings.emailReadonly')}
              </p>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saved ? t('settings.saved') : saving ? t('common.loading') : t('settings.save')}
            </button>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="glass rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white">
              {t('settings.currentPlan')}
            </h2>

            <div className="rounded-xl border border-surface-700 bg-surface-900 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-lg font-bold text-white capitalize">{user?.plan || 'Free'}</p>
                  <p className="text-sm text-gray-400">
                    {t('common.credits')}: {formatCreditTime(user?.creditSeconds || 0, t)}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-400">
                  {t('settings.active')}
                </span>
              </div>

              <ul className="space-y-2 mb-6">
                {BASIC_FEATURE_KEYS.map((key, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckmarkIcon className="w-4 h-4 text-primary-400 flex-shrink-0" />
                    {t(key)}
                  </li>
                ))}
              </ul>

              <Link
                to="/pricing"
                className="inline-block px-6 py-3 rounded-xl border border-primary-500 text-primary-400 font-medium hover:bg-primary-500/10 transition-colors"
              >
                {t('settings.upgradePlan')}
              </Link>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              {t('settings.paymentHistory')}
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-700">
                    <th className="text-left text-sm font-medium text-gray-400 pb-3 pr-4">
                      {t('settings.date')}
                    </th>
                    <th className="text-left text-sm font-medium text-gray-400 pb-3 pr-4">
                      {t('settings.description')}
                    </th>
                    <th className="text-left text-sm font-medium text-gray-400 pb-3 pr-4">
                      {t('settings.amount')}
                    </th>
                    <th className="text-left text-sm font-medium text-gray-400 pb-3">
                      {t('settings.status')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-surface-800 last:border-0"
                    >
                      <td className="py-4 pr-4 text-sm text-gray-300">
                        {row.date}
                      </td>
                      <td className="py-4 pr-4 text-sm text-white">
                        {row.description}
                      </td>
                      <td className="py-4 pr-4 text-sm text-white font-medium">
                        {row.amount}
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Language Tab */}
        {activeTab === 'language' && (
          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white mb-2">
              {t('settings.selectLanguage')}
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              {t('settings.languageHint')}
            </p>

            <div className="space-y-3">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => handleLanguageChange(opt.code)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    language === opt.code
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-surface-700 bg-surface-900 hover:border-surface-600'
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <div className="text-left">
                    <p className="text-white font-medium">{opt.label}</p>
                    <p className="text-sm text-gray-400">{t(opt.subtitleKey)}</p>
                  </div>
                  {language === opt.code && (
                    <CheckmarkIcon className="w-5 h-5 text-primary-400 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Logout */}
        <div className="mt-8 pt-8 border-t border-surface-800">
          <button
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
            className="px-6 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            {t('common.logout')}
          </button>
        </div>
      </div>
    </main>
  );
}
