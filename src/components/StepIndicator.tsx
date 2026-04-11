import { CheckIcon } from './icons';

export type Step = 'upload' | 'settings' | 'result';

const STEPS: Step[] = ['upload', 'settings', 'result'];

interface StepIndicatorProps {
  currentStep: Step;
  labels: Record<Step, string>;
}

export function StepIndicator({ currentStep, labels }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((s, i) => {
        const isCurrent = s === currentStep;
        const isPast = STEPS.indexOf(currentStep) > i;
        return (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all ${
                isCurrent
                  ? 'gradient-bg text-white shadow-lg shadow-primary-500/30'
                  : isPast
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface-800 text-surface-200/50'
              }`}
            >
              {isPast ? <CheckIcon className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={`text-sm hidden sm:inline ${
                isCurrent ? 'text-white font-medium' : isPast ? 'text-primary-400' : 'text-surface-200/50'
              }`}
            >
              {labels[s]}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`w-10 h-0.5 mx-1 rounded ${
                  isPast ? 'bg-primary-500' : 'bg-surface-700'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
