import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { PlanType } from '../types';

interface Plan {
  name: string;
  priceKey: string;
  planType: PlanType;
  price: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
}

interface ModalState {
  type: 'plan' | 'credit';
  planType?: PlanType;
  label: string;
  price: string;
  credits?: number;
}

export default function PricingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updatePlan, addCredits } = useAuthStore();

  const [modal, setModal] = useState<ModalState | null>(null);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const plans: Plan[] = [
    {
      name: t('pricing.free'),
      priceKey: 'free',
      planType: 'free',
      price: '$0',
      features: [
        t('pricing.freeFeature1'),
        t('pricing.freeFeature2'),
        t('pricing.freeFeature3'),
      ],
    },
    {
      name: t('pricing.basic'),
      priceKey: 'basic',
      planType: 'basic',
      price: '$4.99',
      period: t('pricing.perMonth'),
      features: [
        t('pricing.basicFeature1'),
        t('pricing.basicFeature2'),
        t('pricing.basicFeature3'),
        t('pricing.basicFeature4'),
      ],
    },
    {
      name: t('pricing.pro'),
      priceKey: 'pro',
      planType: 'pro',
      price: '$14.99',
      period: t('pricing.perMonth'),
      highlighted: true,
      features: [
        t('pricing.proFeature1'),
        t('pricing.proFeature2'),
        t('pricing.proFeature3'),
        t('pricing.proFeature4'),
        t('pricing.proFeature5'),
      ],
    },
    {
      name: t('pricing.payPerUse'),
      priceKey: 'payPerUse',
      planType: 'pay-per-use',
      price: '$1.5',
      period: t('pricing.perMinute'),
      features: [
        t('pricing.payPerUseFeature1'),
        t('pricing.payPerUseFeature2'),
        t('pricing.payPerUseFeature3'),
      ],
    },
  ];

  const creditPackages = [
    { credits: 10, price: '$12', priceNum: 12, savings: '' },
    { credits: 50, price: '$50', priceNum: 50, savings: t('pricing.save17') },
    { credits: 100, price: '$90', priceNum: 90, savings: t('pricing.save40') },
  ];

  const handleSelectPlan = (plan: Plan) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.plan === plan.planType) return;
    setModal({
      type: 'plan',
      planType: plan.planType,
      label: plan.name,
      price: plan.price + (plan.period ? ` / ${plan.period}` : ''),
    });
  };

  const handleBuyCredits = (pkg: { credits: number; price: string }) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setModal({
      type: 'credit',
      label: `${pkg.credits} ${t('pricing.credits')}`,
      price: pkg.price,
      credits: pkg.credits,
    });
  };

  const handleCheckout = () => {
    // TODO: Replace with real Stripe checkout
    // const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    // const session = await createCheckoutSession(planId);
    // stripe.redirectToCheckout({ sessionId: session.id });

    if (!user || !modal) return;
    setIsProcessing(true);

    setTimeout(() => {
      if (modal.type === 'plan' && modal.planType) {
        updatePlan(modal.planType);
      } else if (modal.type === 'credit' && modal.credits) {
        addCredits(modal.credits);
      }

      setIsProcessing(false);
      setModal(null);
      setSuccessMessage(
        modal.type === 'plan'
          ? t('pricing.planChanged')
          : t('pricing.creditsAdded', { amount: modal.credits })
      );

      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1500);
  };

  const isCurrentPlan = (planType: PlanType) => user?.plan === planType;

  return (
    <div className="min-h-screen bg-surface-950 pt-24 pb-16 px-4">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl bg-green-500/90 text-white font-medium shadow-lg backdrop-blur-sm animate-fade-in">
          {successMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.priceKey}
              className={`relative rounded-2xl p-6 flex flex-col ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-primary-500/20 to-accent-500/10 border border-primary-500/50'
                  : 'glass border border-surface-700'
              }`}
            >
              {/* Current Plan Badge */}
              {isCurrentPlan(plan.planType) && (
                <div className="absolute -top-3 right-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/90 text-white shadow-lg">
                    {t('pricing.currentPlan')}
                  </span>
                </div>
              )}

              {/* Most Popular Badge */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-xs font-semibold gradient-bg text-white shadow-lg">
                    {t('pricing.mostPopular')}
                  </span>
                </div>
              )}

              <h3 className="text-lg font-semibold text-white mb-2">
                {plan.name}
              </h3>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-gray-400 ml-1">/ {plan.period}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-300"
                  >
                    <svg
                      className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
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

        {/* Credit Packages */}
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
            {creditPackages.map((pkg) => (
              <div
                key={pkg.credits}
                className="glass rounded-2xl border border-surface-700 p-6 flex flex-col items-center text-center hover:border-primary-500/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75"
                    />
                  </svg>
                </div>

                <p className="text-2xl font-bold text-white mb-1">
                  {pkg.credits} {t('pricing.credits')}
                </p>
                <p className="text-3xl font-bold gradient-text mb-2">
                  {pkg.price}
                </p>
                {pkg.savings && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent-500/20 text-accent-400 mb-4">
                    {pkg.savings}
                  </span>
                )}

                <button
                  onClick={() => handleBuyCredits(pkg)}
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
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
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
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
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
    </div>
  );
}
