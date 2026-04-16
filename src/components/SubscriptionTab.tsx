import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCreditTime } from '../utils/format';

interface SubscriptionTabProps {
  creditSeconds: number;
}

export function SubscriptionTab({ creditSeconds }: SubscriptionTabProps) {
  const { t } = useTranslation();
  const hasCredits = creditSeconds > 0;

  return (
    <div className="border-t border-ink pt-6 space-y-8">
      <div>
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
          Credits · 貯蔵
        </span>
        <h2 className="font-display text-3xl md:text-4xl text-ink mt-2">
          {t('settings.creditBalance')}
        </h2>
      </div>

      <div className="border-t border-b border-ink/15 py-8">
        <div className="flex items-baseline justify-between mb-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
            {t('common.credits')}
          </span>
          <span className={`font-mono text-[11px] uppercase tracking-[0.18em] ${hasCredits ? 'text-ink' : 'text-cinnabar'}`}>
            · {hasCredits ? t('settings.active') : t('settings.noCredits')}
          </span>
        </div>
        <p className="font-display text-5xl md:text-6xl text-ink leading-none">
          {formatCreditTime(creditSeconds, t)}
        </p>
      </div>

      <Link
        to="/pricing"
        className="inline-flex items-baseline gap-3 bg-ink text-cream px-6 py-3 font-mono text-[12px] uppercase tracking-[0.22em] hover:bg-cinnabar transition-colors"
      >
        {t('settings.rechargeCredits')}
        <span>→</span>
      </Link>
    </div>
  );
}
