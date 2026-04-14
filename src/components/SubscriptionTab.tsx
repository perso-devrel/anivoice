import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCreditTime } from '../utils/format';

interface SubscriptionTabProps {
  creditSeconds: number;
}

export function SubscriptionTab({ creditSeconds }: SubscriptionTabProps) {
  const { t } = useTranslation();

  return (
    <div className="glass rounded-2xl p-6 space-y-6">
      <h2 className="text-xl font-semibold text-white">
        {t('settings.creditBalance')}
      </h2>

      <div className="rounded-xl border border-surface-700 bg-surface-900 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">{t('common.credits')}</p>
            <p className="text-3xl font-bold text-white">
              {formatCreditTime(creditSeconds, t)}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            creditSeconds > 0
              ? 'bg-primary-500/20 text-primary-400'
              : 'bg-surface-700 text-gray-400'
          }`}>
            {creditSeconds > 0 ? t('settings.active') : t('settings.noCredits')}
          </span>
        </div>

        <Link
          to="/pricing"
          className="inline-block w-full text-center px-6 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
        >
          {t('settings.rechargeCredits')}
        </Link>
      </div>
    </div>
  );
}
