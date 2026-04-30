import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { formatCreditTime } from '../utils/format';
import { showToast } from '../stores/toastStore';
import { trackEvent } from '../services/analytics';
import { ClockIcon } from '../components/icons';
import { CheckoutModal, type CardForm } from '../components/CheckoutModal';
import {
  TIME_PACK_10_MIN_SECONDS,
  TIME_PACK_50_MIN_SECONDS,
  TIME_PACK_100_MIN_SECONDS,
  TIME_PACK_10_MIN_PRICE,
  TIME_PACK_50_MIN_PRICE,
  TIME_PACK_100_MIN_PRICE,
  FAKE_PAYMENT_DELAY_MS,
  MOCK_CARD_DEFAULTS,
  CREDIT_PRICE_PER_MINUTE_USD,
} from '../utils/pricing';

interface ModalState {
  label: string;
  price: string;
  seconds: number;
}

const TIME_PACKAGE_CONFIGS = [
  { seconds: TIME_PACK_10_MIN_SECONDS, labelKey: 'pricing.timePack10', price: `$${TIME_PACK_10_MIN_PRICE}`, priceNum: TIME_PACK_10_MIN_PRICE, savingsKey: '' },
  { seconds: TIME_PACK_50_MIN_SECONDS, labelKey: 'pricing.timePack50', price: `$${TIME_PACK_50_MIN_PRICE}`, priceNum: TIME_PACK_50_MIN_PRICE, savingsKey: '' },
  { seconds: TIME_PACK_100_MIN_SECONDS, labelKey: 'pricing.timePack100', price: `$${TIME_PACK_100_MIN_PRICE}`, priceNum: TIME_PACK_100_MIN_PRICE, savingsKey: '' },
];

export default function PricingPage() {
  const { t } = useTranslation();
  usePageTitle('pageTitle.pricing');
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [modal, setModal] = useState<ModalState | null>(null);
  const [cardForm, setCardForm] = useState<CardForm>(MOCK_CARD_DEFAULTS);
  const [selectedSeconds, setSelectedSeconds] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCardFormChange = (field: keyof CardForm, value: string) => {
    setCardForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBuyTime = (pkg: typeof TIME_PACKAGE_CONFIGS[number]) => {
    trackEvent('checkout_open', {
      package_seconds: pkg.seconds,
      package_price_usd: pkg.priceNum,
      logged_in: !!user,
    });
    if (!user) {
      navigate('/login');
      return;
    }

    const label = t(pkg.labelKey);
    setSelectedSeconds(pkg.seconds);
    setModal({
      label: t('pricing.dubbingTimeLabel', { amount: label }),
      price: pkg.price,
      seconds: pkg.seconds,
    });
  };

  const handleCheckout = async () => {
    if (!user || !modal) return;
    trackEvent('checkout_attempt', {
      package_seconds: modal.seconds,
      package_label: modal.label,
    });
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, FAKE_PAYMENT_DELAY_MS));
    setIsProcessing(false);
    showToast(t('pricing.paymentError'), 'error');
  };

  return (
    <main className="min-h-screen bg-void pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 relative">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-jp text-[160px] sm:text-[220px] leading-none text-bone/[0.03] select-none pointer-events-none" aria-hidden="true">料金</span>
          <span className="absolute bottom-0 right-0 sm:right-8 font-jp text-[80px] sm:text-[120px] leading-none text-bone/[0.03] select-none pointer-events-none" aria-hidden="true">アップグレード</span>
          <div className="scanlines pointer-events-none absolute inset-0" aria-hidden="true"></div>
          <h1 className="text-4xl sm:text-5xl text-bone font-display font-black mb-4 chromatic-hover relative">
            {t('pricing.title')}
          </h1>
          <p className="font-mono text-sm text-bone/50 max-w-2xl mx-auto">
            {t('pricing.creditOnlySubtitle', { price: CREDIT_PRICE_PER_MINUTE_USD })}
          </p>
          {user && (
            <p className="mt-4 text-sm text-bone/50 font-mono">
              {t('pricing.remainingTime')} <span className="text-lucy font-medium">{formatCreditTime(user.creditSeconds, t)}</span>
            </p>
          )}
        </div>

        {/* Time Packages */}
        <div className="mb-10">
          <h2 className="text-bone mb-3 border-l-4 border-david pl-3 font-mono text-xl uppercase tracking-widest">
            {t('pricing.creditPackages')}
          </h2>
          <p className="font-mono text-sm text-bone/40">
            {t('pricing.creditSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TIME_PACKAGE_CONFIGS.map((pkg, idx) => {
            const isRecommended = idx === 1;
            const isSelected = selectedSeconds === pkg.seconds;
            return (
              <div
                key={pkg.seconds}
                className={`relative bg-ink border-2 ${isRecommended ? 'border-lucy' : 'border-bone'} p-6 flex flex-col items-center text-center hover:border-lucy corner-marks transition-all duration-200`}
                style={{
                  boxShadow: isSelected
                    ? '0 0 24px rgba(255,79,163,0.4), inset 0 0 12px rgba(255,79,163,0.08)'
                    : undefined,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.boxShadow = '0 0 20px rgba(255,79,163,0.3)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.boxShadow = '';
                }}
              >
                {isSelected && (
                  <span className="absolute -top-4 right-4 px-3 py-1 bg-david text-void font-mono text-[10px] uppercase tracking-widest z-10">[SELECTED]</span>
                )}
                {isRecommended && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-lucy text-void font-mono text-[10px] uppercase tracking-widest z-10">RECOMMENDED</span>
                )}
                <span className="absolute -top-3 -right-3 w-8 h-8 bg-david text-void flex items-center justify-center font-mono text-xs font-bold" aria-hidden="true">0{idx + 1}</span>
                <span className="sfx-pop absolute top-2 left-2 w-2 h-2 bg-lucy" aria-hidden="true"></span>

                <div className="w-12 h-12 bg-void border-2 border-bone/30 text-bone/60 flex items-center justify-center mb-4">
                  <ClockIcon className="w-6 h-6" />
                </div>

                <p className="font-mono uppercase tracking-widest text-bone/80 text-sm mb-1">
                  {t(pkg.labelKey)}
                </p>
                <p className="text-5xl text-david font-mono font-bold mb-6">
                  {pkg.price}
                </p>

                <div className="w-full text-left space-y-2 mb-6">
                  <p className="font-mono text-xs text-bone/60"><span className="text-wire mr-2">[+]</span>HD dubbing quality</p>
                  <p className="font-mono text-xs text-bone/60"><span className="text-wire mr-2">[+]</span>All languages</p>
                  <p className="font-mono text-xs text-bone/60"><span className="text-wire mr-2">[+]</span>Script editing</p>
                </div>

                <button
                  onClick={() => handleBuyTime(pkg)}
                  className={`mt-auto w-full py-3 border-2 font-mono uppercase tracking-widest flicker-on-hover transition-colors ${isRecommended ? 'bg-david text-void border-david hover:bg-void hover:text-david' : 'bg-void border-bone text-bone hover:bg-bone hover:text-void'}`}
                >
                  {t('common.buy')}
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 border-t-2 border-lucy pt-12">
          <p className="font-mono text-sm text-bone/40 mb-4">{t('pricing.needHelp')}</p>
          <Link
            to="/"
            className="text-lg text-lucy hover:text-david font-mono uppercase transition-colors"
          >
            {t('pricing.contactUs')}
          </Link>
        </div>
      </div>

      {modal && (
        <CheckoutModal
          label={modal.label}
          price={modal.price}
          cardForm={cardForm}
          isProcessing={isProcessing}
          onCardFormChange={handleCardFormChange}
          onCheckout={handleCheckout}
          onClose={() => { setModal(null); setSelectedSeconds(null); }}
        />
      )}
    </main>
  );
}
