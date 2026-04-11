import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { purchaseCredits } from '../services/anivoiceApi';
import { formatSeconds } from '../utils/format';
import { showToast } from '../stores/toastStore';
import { SpinnerIcon, CheckmarkIcon, ClockIcon } from '../components/icons';
import type { PlanType } from '../types';

interface ModalState {
  type: 'plan' | 'credit';
  planType?: PlanType;
  label: string;
  price: string;
  seconds?: number;
  creditSeconds?: number;
}

const PLAN_CONFIGS = [
  {
    nameKey: 'pricing.free',
    id: 'free',
    planType: 'free' as PlanType,
    price: '$0',
    periodKey: null,
    timeLabelKey: 'pricing.freeTimeLabel',
    creditSeconds: 360000,
    featureKeys: ['pricing.freeFeatureMain', 'pricing.freeFeature2', 'pricing.freeFeature3'],
    highlighted: false,
  },
  {
    nameKey: 'pricing.basic',
    id: 'basic',
    planType: 'basic' as PlanType,
    price: '$4.99',
    periodKey: 'pricing.perMonth',
    timeLabelKey: 'pricing.basicTimeLabel',
    creditSeconds: 1080000,
    featureKeys: ['pricing.basicFeatureMain', 'pricing.basicFeature2', 'pricing.basicFeature3', 'pricing.basicFeature4'],
    highlighted: false,
  },
  {
    nameKey: 'pricing.pro',
    id: 'pro',
    planType: 'pro' as PlanType,
    price: '$14.99',
    periodKey: 'pricing.perMonth',
    timeLabelKey: 'pricing.proTimeLabel',
    creditSeconds: 3600000,
    featureKeys: ['pricing.proFeatureMain', 'pricing.proFeature2', 'pricing.proFeature3', 'pricing.proFeature4', 'pricing.proFeature5'],
    highlighted: true,
  },
  {
    nameKey: 'pricing.payPerUse',
    id: 'payPerUse',
    planType: 'pay-per-use' as PlanType,
    price: '$1.5',
    periodKey: 'pricing.perMinute',
    timeLabelKey: 'pricing.payPerUseTimeLabel',
    creditSeconds: 0,
    featureKeys: ['pricing.payPerUseFeatureMain', 'pricing.payPerUseFeature2', 'pricing.payPerUseFeature3'],
    highlighted: false,
  },
];

const TIME_PACKAGE_CONFIGS = [
  { seconds: 600, labelKey: 'pricing.timePack10', price: '$12', priceNum: 12, savingsKey: '' },
  { seconds: 3000, labelKey: 'pricing.timePack50', price: '$50', priceNum: 50, savingsKey: 'pricing.save17' },
  { seconds: 6000, labelKey: 'pricing.timePack100', price: '$90', priceNum: 90, savingsKey: 'pricing.save40' },
];

export default function PricingPage() {
  const { t } = useTranslation();
  usePageTitle('pageTitle.pricing');
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [modal, setModal] = useState<ModalState | null>(null);
  const modalTrapRef = useFocusTrap<HTMLDivElement>(modal !== null);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectPlan = (plan: typeof PLAN_CONFIGS[number]) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.plan === plan.planType) return;
    const name = t(plan.nameKey);
    const period = plan.periodKey ? t(plan.periodKey) : '';
    setModal({
      type: 'plan',
      planType: plan.planType,
      label: name,
      price: plan.price + (period ? ` / ${period}` : ''),
      creditSeconds: plan.creditSeconds,
    });
  };

  const handleBuyTime = (pkg: typeof TIME_PACKAGE_CONFIGS[number]) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const label = t(pkg.labelKey);
    setModal({
      type: 'credit',
      label: t('pricing.dubbingTimeLabel', { amount: label }),
      price: pkg.price,
      seconds: pkg.seconds,
    });
  };

  const handleCheckout = async () => {
    if (!user || !modal) return;
    setIsProcessing(true);

    try {
      // Fake 1.5s payment delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (modal.type === 'plan' && modal.planType) {
        const result = await purchaseCredits({ plan: modal.planType });
        useAuthStore.getState().updatePlan(modal.planType, result.creditSeconds);
      } else if (modal.type === 'credit' && modal.seconds) {
        const result = await purchaseCredits({
          seconds: modal.seconds,
          description: t('pricing.creditRecharge', { amount: modal.label }),
        });
        useAuthStore.getState().setCreditSeconds(result.creditSeconds);
      }

      setIsProcessing(false);
      setModal(null);
      showToast(
        modal.type === 'plan'
          ? t('pricing.planChanged')
          : t('pricing.creditsAdded', { amount: modal.label }),
        'success'
      );
    } catch {
      setIsProcessing(false);
      showToast(t('pricing.paymentError'));
    }
  };

  const isCurrentPlan = (planType: PlanType) => user?.plan === planType;

  return (
    <main className="min-h-screen bg-surface-950 pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t('pricing.subtitle')}
          </p>
          {user && (
            <p className="mt-4 text-sm text-gray-500">
              {t('pricing.remainingTime')} <span className="text-primary-400 font-medium">{formatSeconds(user.creditSeconds, { hours: t('common.hours'), minutes: t('common.minutes'), seconds: t('common.seconds') })}</span>
            </p>
          )}
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-20">
          {PLAN_CONFIGS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 flex flex-col ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-primary-500/20 to-accent-500/10 border border-primary-500/50'
                  : 'glass border border-surface-700'
              }`}
            >
              {isCurrentPlan(plan.planType) && (
                <div className="absolute -top-3 right-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/90 text-white shadow-lg">
                    {t('pricing.currentPlan')}
                  </span>
                </div>
              )}

              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-xs font-semibold gradient-bg text-white shadow-lg">
                    {t('pricing.mostPopular')}
                  </span>
                </div>
              )}

              <h3 className="text-lg font-semibold text-white mb-2">
                {t(plan.nameKey)}
              </h3>

              <div className="mb-2">
                <span className="text-4xl font-bold text-white">
                  {plan.price}
                </span>
                {plan.periodKey && (
                  <span className="text-gray-400 ml-1">/ {t(plan.periodKey)}</span>
                )}
              </div>

              <p className="text-sm text-primary-400 font-medium mb-4">
                {t(plan.timeLabelKey)}
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.featureKeys.map((key) => (
                  <li
                    key={key}
                    className="flex items-start gap-2 text-sm text-gray-300"
                  >
                    <CheckmarkIcon className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                    {t(key)}
                  </li>
                ))}
              </ul>

              {isCurrentPlan(plan.planType) ? (
                <button
                  disabled
                  className="w-full py-3 rounded-xl border border-green-500/50 text-green-400 font-medium cursor-not-allowed opacity-60"
                >
                  {t('pricing.currentPlan')}
                </button>
              ) : plan.highlighted ? (
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className="w-full py-3 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity"
                >
                  {t('pricing.selectPlan')}
                </button>
              ) : (
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className="w-full py-3 rounded-xl border border-surface-600 text-gray-300 font-medium hover:border-primary-500 hover:text-white transition-colors"
                >
                  {t('pricing.selectPlan')}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Time Packages */}
        <div className="max-w-4xl mx-auto">
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
                <p className="text-3xl font-bold gradient-text mb-2">
                  {pkg.price}
                </p>
                {pkg.savingsKey && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent-500/20 text-accent-400 mb-4">
                    {t(pkg.savingsKey)}
                  </span>
                )}

                <button
                  onClick={() => handleBuyTime(pkg)}
                  className="mt-auto w-full py-3 rounded-xl border border-surface-600 text-gray-300 font-medium hover:border-primary-500 hover:text-white transition-colors"
                >
                  {t('common.buy')}
                </button>
              </div>
            ))}
          </div>
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

      {/* Checkout Modal */}
      {modal && (
        <div
          ref={modalTrapRef}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-label={t('pricing.checkout')}
          onClick={() => !isProcessing && setModal(null)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative glass border border-surface-600 rounded-2xl p-8 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-1">
              {modal.type === 'plan' ? t('pricing.changePlan') : t('pricing.buyCredits')}
            </h3>
            <p className="text-gray-400 mb-6">
              {modal.label} — <span className="text-white font-semibold">{modal.price}</span>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">{t('pricing.cardNumber')}</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-surface-600 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                  placeholder="0000 0000 0000 0000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('pricing.expiry')}</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-surface-600 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">CVC</label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-surface-600 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl border border-surface-600 text-gray-300 font-medium hover:border-primary-500 hover:text-white transition-colors disabled:opacity-40"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <SpinnerIcon className="w-5 h-5" />
                    {t('pricing.processing')}
                  </>
                ) : (
                  t('pricing.pay')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
