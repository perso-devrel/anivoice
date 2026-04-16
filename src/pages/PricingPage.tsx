import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { purchaseCredits } from '../services/anivoiceApi';
import { formatCreditTime } from '../utils/format';
import { showToast } from '../stores/toastStore';
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
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCardFormChange = (field: keyof CardForm, value: string) => {
    setCardForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBuyTime = (pkg: typeof TIME_PACKAGE_CONFIGS[number]) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const label = t(pkg.labelKey);
    setModal({
      label: t('pricing.dubbingTimeLabel', { amount: label }),
      price: pkg.price,
      seconds: pkg.seconds,
    });
  };

  const handleCheckout = async () => {
    if (!user || !modal) return;
    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, FAKE_PAYMENT_DELAY_MS));

      const result = await purchaseCredits({
        seconds: modal.seconds,
        description: t('pricing.creditRecharge', { amount: modal.label }),
      });
      useAuthStore.getState().setCreditSeconds(result.creditSeconds);

      setIsProcessing(false);
      setModal(null);
      showToast(t('pricing.creditsAdded', { amount: modal.label }), 'success');
    } catch {
      setIsProcessing(false);
      showToast(t('pricing.paymentError'));
    }
  };

  return (
    <main className="min-h-screen bg-cream pt-20 md:pt-28 pb-24 px-5 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="grid grid-cols-12 gap-6 mb-16 md:mb-24">
          <div className="col-span-12 md:col-span-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
              料金 — Pricing
            </span>
            <h1 className="font-display text-5xl md:text-7xl text-ink leading-[1.02] tracking-tight mt-3">
              {t('pricing.title')}
            </h1>
          </div>
          <div className="col-span-12 md:col-span-9 md:pl-12 flex md:items-end">
            <div>
              <p className="text-lg text-ink-soft leading-relaxed max-w-xl">
                {t('pricing.creditOnlySubtitle', { price: CREDIT_PRICE_PER_MINUTE_USD })}
              </p>
              {user && (
                <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.18em] text-ink-mute">
                  {t('pricing.remainingTime')}{' '}
                  <span className="text-cinnabar">{formatCreditTime(user.creditSeconds, t)}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section header */}
        <div className="border-t border-ink pt-10 mb-10">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl md:text-3xl text-ink">
              {t('pricing.creditPackages')}
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
              {t('pricing.creditSubtitle')}
            </span>
          </div>
        </div>

        {/* Packages — grid of newspaper boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-ink/15">
          {TIME_PACKAGE_CONFIGS.map((pkg, i) => (
            <div
              key={pkg.seconds}
              className="border-r border-b border-ink/15 px-8 py-12 flex flex-col bg-cream"
            >
              <div className="flex items-baseline justify-between mb-10">
                <span className="font-mono text-cinnabar text-sm tracking-widest">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
                  Pack
                </span>
              </div>
              <p className="font-display text-2xl text-ink mb-3">
                {t(pkg.labelKey)}
              </p>
              <p className="font-display text-6xl md:text-7xl text-ink leading-none mb-10">
                {pkg.price}
              </p>
              <button
                onClick={() => handleBuyTime(pkg)}
                className="mt-auto self-start inline-flex items-baseline gap-3 bg-ink text-cream px-6 py-3 font-mono text-[12px] uppercase tracking-[0.18em] hover:bg-cinnabar transition-colors"
              >
                {t('common.buy')}
                <span>→</span>
              </button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 border-t border-ink pt-10 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
          <p className="text-ink-soft">{t('pricing.needHelp')}</p>
          <Link
            to="/"
            className="font-mono text-[13px] uppercase tracking-[0.18em] text-ink border-b border-ink pb-1 hover:text-cinnabar hover:border-cinnabar transition-colors self-start"
          >
            {t('pricing.contactUs')} →
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
          onClose={() => setModal(null)}
        />
      )}
    </main>
  );
}
