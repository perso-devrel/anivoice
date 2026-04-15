import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { purchaseCredits } from '../services/anivoiceApi';
import { formatCreditTime } from '../utils/format';
import { showToast } from '../stores/toastStore';
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
    <main className="min-h-screen bg-surface-950 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t('pricing.creditOnlySubtitle', { price: CREDIT_PRICE_PER_MINUTE_USD })}
          </p>
          {user && (
            <p className="mt-4 text-sm text-gray-500">
              {t('pricing.remainingTime')} <span className="text-primary-400 font-medium">{formatCreditTime(user.creditSeconds, t)}</span>
            </p>
          )}
        </div>

        {/* Time Packages */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold gradient-text mb-3">
            {t('pricing.creditPackages')}
          </h2>
          <p className="text-gray-400">
            {t('pricing.creditSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TIME_PACKAGE_CONFIGS.map((pkg) => (
            <div
              key={pkg.seconds}
              className="glass rounded-2xl border border-surface-700 p-6 flex flex-col items-center text-center hover:border-primary-500/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4">
                <ClockIcon className="w-6 h-6 text-primary-400" />
              </div>

              <p className="text-2xl font-bold text-white mb-1">
                {t(pkg.labelKey)}
              </p>
              <p className="text-3xl font-bold gradient-text mb-6">
                {pkg.price}
              </p>

              <button
                onClick={() => handleBuyTime(pkg)}
                className="mt-auto w-full py-3 rounded-xl border border-surface-600 text-gray-300 font-medium hover:border-primary-500 hover:text-white transition-colors"
              >
                {t('common.buy')}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-4">{t('pricing.needHelp')}</p>
          <Link
            to="/"
            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
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
          onClose={() => setModal(null)}
        />
      )}
    </main>
  );
}
