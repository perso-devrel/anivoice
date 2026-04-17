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
              className={`flex items-center justify-center w-8 h-8 text-sm font-mono font-semibold transition-all ${
                isCurrent
                  ? 'bg-lucy text-void'
                  : isPast
                    ? 'bg-lucy/60 text-bone'
                    : 'bg-ink text-bone/40 border-2 border-bone/30'
              }`}
            >
              {isPast ? <CheckIcon className="w-4 h-4" /> : String(i + 1).padStart(2, '0')}
            </div>
            <span
              className={`text-[11px] font-mono uppercase tracking-widest hidden sm:inline ${
                isCurrent ? 'text-bone font-medium' : isPast ? 'text-lucy' : 'text-bone/50'
              }`}
            >
              {labels[s]}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`w-10 h-1 mx-1 ${
                  isPast ? 'bg-lucy' : 'bg-bone/30'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
