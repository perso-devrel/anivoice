import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCreditTime } from '../utils/format';

interface SubscriptionTabProps {
  creditSeconds: number;
}

export function SubscriptionTab({ creditSeconds }: SubscriptionTabProps) {
  const { t } = useTranslation();

  return (
    <div className="relative bg-ink border-2 border-bone/30 p-6 space-y-6 corner-marks">
      <span className="absolute -top-3 left-4 font-mono text-[10px] uppercase tracking-[0.3em] text-lucy bg-void px-2">CREDITS</span>

      <h2 className="font-mono uppercase tracking-widest text-sm text-bone/50">
        {t('settings.creditBalance')}
      </h2>

      <div className="border-2 border-bone/30 bg-void p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-mono uppercase tracking-widest text-sm text-bone/50 mb-1">{t('common.credits')}</p>
            <p className="font-mono text-5xl font-bold text-lucy">
              {formatCreditTime(creditSeconds, t)}
            </p>
            <div className="mt-3 font-mono text-sm text-bone/30">
              <span className="text-lucy">{'█'.repeat(Math.min(Math.round(creditSeconds / 300), 20))}</span>
              <span>{'░'.repeat(Math.max(20 - Math.round(creditSeconds / 300), 0))}</span>
            </div>
          </div>
          <span className={`font-mono text-[10px] uppercase px-3 py-1 ${
            creditSeconds > 0
              ? 'bg-lucy/20 text-lucy'
              : 'bg-ink text-bone/50'
          }`}>
            {creditSeconds > 0 ? t('settings.active') : t('settings.noCredits')}
          </span>
        </div>

        <Link
          to="/pricing"
          className="inline-block w-full text-center px-6 py-3 bg-david text-void border-2 border-david font-mono uppercase tracking-widest font-bold hover:bg-void hover:text-david transition-colors flicker-on-hover"
        >
          {t('settings.rechargeCredits')}
        </Link>
      </div>
    </div>
  );
}
