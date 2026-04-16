import { CheckIcon } from './icons';

export type Step = 'upload' | 'settings' | 'result';

const STEPS: Step[] = ['upload', 'settings', 'result'];

interface StepIndicatorProps {
  currentStep: Step;
  labels: Record<Step, string>;
}

export function StepIndicator({ currentStep, labels }: StepIndicatorProps) {
  const currentIdx = STEPS.indexOf(currentStep);
  return (
    <div className="border-t border-ink mb-12">
      <div className="grid grid-cols-3 divide-x divide-ink/15">
        {STEPS.map((s, i) => {
          const isCurrent = s === currentStep;
          const isPast = currentIdx > i;
          const tone = isCurrent ? 'text-cinnabar' : isPast ? 'text-ink' : 'text-ink-mute';
          const numTone = isCurrent || isPast ? 'text-ink' : 'text-ink-mute';
          return (
            <div key={s} className="px-5 pt-5 pb-6">
              <div className="flex items-baseline justify-between mb-3">
                <span className={`font-mono text-[11px] uppercase tracking-[0.22em] ${tone}`}>
                  Step {String(i + 1).padStart(2, '0')}
                </span>
                {isPast && <CheckIcon className="w-3 h-3 text-ink" />}
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-cinnabar animate-pulse" />}
              </div>
              <p className={`font-display text-xl ${numTone}`}>{labels[s]}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
