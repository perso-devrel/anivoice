import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCreditTime } from '../utils/format';
import { CheckmarkIcon } from './icons';

const BASIC_FEATURE_KEYS = [
  'settings.basicFeature1',
  'settings.basicFeature2',
  'settings.basicFeature3',
] as const;

interface SubscriptionTabProps {
  plan: string;
  creditSeconds: number;
}

export function SubscriptionTab({ plan, creditSeconds }: SubscriptionTabProps) {
  const { t } = useTranslation();

  return (
    <div className="glass rounded-2xl p-6 space-y-6">
      <h2 className="text-xl font-semibold text-white">
        {t('settings.currentPlan')}
      </h2>

      <div className="rounded-xl border border-surface-700 bg-surface-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-lg font-bold text-white capitalize">{plan}</p>
            <p className="text-sm text-gray-400">
              {t('common.credits')}: {formatCreditTime(creditSeconds, t)}
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
  );
}
