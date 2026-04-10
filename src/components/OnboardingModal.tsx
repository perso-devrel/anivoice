import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { markOnboardingDone } from '../utils/onboarding';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { XIcon, UploadIcon, CheckCircleIcon, ArrowRightIcon } from './icons';

const STEPS = [
  {
    icon: <UploadIcon className="w-10 h-10 text-primary-400" />,
    titleKey: 'onboarding.step1Title',
    descKey: 'onboarding.step1Desc',
  },
  {
    icon: (
      <svg className="w-10 h-10 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
      </svg>
    ),
    titleKey: 'onboarding.step2Title',
    descKey: 'onboarding.step2Desc',
  },
  {
    icon: <CheckCircleIcon className="w-10 h-10 text-green-400" />,
    titleKey: 'onboarding.step3Title',
    descKey: 'onboarding.step3Desc',
  },
];

interface Props {
  onClose: () => void;
}

export default function OnboardingModal({ onClose }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const trapRef = useFocusTrap<HTMLDivElement>();

  const handleSkip = useCallback(() => {
    markOnboardingDone();
    onClose();
  }, [onClose]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSkip]);

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      markOnboardingDone();
      onClose();
    }
  }

  const current = STEPS[step];

  return (
    <div ref={trapRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" role="dialog" aria-modal="true" aria-label={t('onboarding.welcome')}>
      <div className="w-full max-w-md glass rounded-2xl p-8 relative animate-in fade-in">
        <button
          onClick={handleSkip}
          aria-label={t('common.close')}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <XIcon />
        </button>

        {step === 0 && (
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            {t('onboarding.welcome')}
          </h2>
        )}

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-surface-800 flex items-center justify-center">
            {current.icon}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="font-semibold text-primary-400">{step + 1}</span>
            <span>/</span>
            <span>{STEPS.length}</span>
          </div>
          <h3 className="text-lg font-semibold text-white">
            {t(current.titleKey)}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
            {t(current.descKey)}
          </p>
        </div>

        <div className="flex items-center gap-2 justify-center mt-6 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-primary-500' : 'w-1.5 bg-surface-700'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            {t('onboarding.skip')}
          </button>
          {step === STEPS.length - 1 ? (
            <Link
              to="/studio"
              onClick={() => markOnboardingDone()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {t('onboarding.startNow')}
              <ArrowRightIcon />
            </Link>
          ) : (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {t('onboarding.next')}
              <ArrowRightIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
