import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { markOnboardingDone } from '../utils/onboarding';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { XIcon, UploadIcon, CheckCircleIcon, ArrowRightIcon, TranslateIcon } from './icons';

const PRIMARY_BUTTON_CLASS =
  'inline-flex items-center gap-2 px-6 py-3 bg-ink text-cream font-mono text-[12px] uppercase tracking-[0.18em] hover:bg-cinnabar transition-colors';

const STEPS = [
  {
    icon: <UploadIcon className="w-7 h-7 text-ink" />,
    titleKey: 'onboarding.step1Title',
    descKey: 'onboarding.step1Desc',
  },
  {
    icon: <TranslateIcon className="w-7 h-7 text-ink" />,
    titleKey: 'onboarding.step2Title',
    descKey: 'onboarding.step2Desc',
  },
  {
    icon: <CheckCircleIcon className="w-7 h-7 text-ink" />,
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
    <div
      ref={trapRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-5"
      role="dialog"
      aria-modal="true"
      aria-label={t('onboarding.welcome')}
    >
      <div className="w-full max-w-lg bg-cream border border-ink p-10 relative">
        <button
          onClick={handleSkip}
          aria-label={t('common.close')}
          className="absolute top-4 right-4 text-ink-mute hover:text-ink transition-colors"
        >
          <XIcon />
        </button>

        <div className="flex items-baseline justify-between mb-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
            {t('onboarding.welcome')}
          </span>
          <span className="font-mono text-[11px] tracking-widest text-ink-mute">
            {String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
          </span>
        </div>

        <div className="border-t border-ink pt-8 mb-8">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 border border-ink flex items-center justify-center shrink-0">
              {current.icon}
            </div>
            <div>
              <h3 className="font-display text-3xl text-ink leading-tight mb-3">
                {t(current.titleKey)}
              </h3>
              <p className="text-ink-soft leading-relaxed">
                {t(current.descKey)}
              </p>
            </div>
          </div>
        </div>

        {/* Progress dots as hairlines */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-px transition-all ${
                i === step ? 'w-10 bg-cinnabar' : 'w-4 bg-ink/30'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink-soft hover:text-ink transition-colors"
          >
            {t('onboarding.skip')}
          </button>
          {step === STEPS.length - 1 ? (
            <Link
              to="/studio"
              onClick={() => markOnboardingDone()}
              className={PRIMARY_BUTTON_CLASS}
            >
              {t('onboarding.startNow')}
              <ArrowRightIcon />
            </Link>
          ) : (
            <button onClick={handleNext} className={PRIMARY_BUTTON_CLASS}>
              {t('onboarding.next')}
              <ArrowRightIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
