import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFocusTrap } from '../hooks/useFocusTrap';

export interface CardForm {
  number: string;
  expiry: string;
  cvc: string;
}

interface CheckoutModalProps {
  label: string;
  price: string;
  cardForm: CardForm;
  isProcessing: boolean;
  onCardFormChange: (field: keyof CardForm, value: string) => void;
  onCheckout: () => void;
  onClose: () => void;
}

type Phase = 'idle' | 'processing' | 'complete';

const CARD_FIELDS: { key: keyof CardForm; labelKey: string; placeholder: string; fullWidth: boolean }[] = [
  { key: 'number', labelKey: 'pricing.cardNumber', placeholder: '0000 0000 0000 0000', fullWidth: true },
  { key: 'expiry', labelKey: 'pricing.expiry', placeholder: 'MM/YY', fullWidth: false },
  { key: 'cvc', labelKey: 'pricing.cvc', placeholder: '123', fullWidth: false },
];

const INPUT_CLASS = 'w-full px-4 py-3 bg-ink border-2 border-bone/30 text-bone placeholder-bone/40 focus:border-lucy focus:outline-none transition-colors';

const SCRAMBLE_CHARS = '█▓▒░╔╗╚╝ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const STATUS_LINES = [
  '> INITIALIZING TRANSACTION...',
  '> VERIFYING CREDENTIALS...',
  '> PROCESSING PAYMENT...',
  '> CREDITS LOADED \u2713',
];

function useScrambleText(target: string, active: boolean): string {
  const [display, setDisplay] = useState(target);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      setDisplay(target); // eslint-disable-line react-hooks/set-state-in-effect -- sync display with target when animation stops
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    let settled = 0;
    const len = target.length;

    intervalRef.current = setInterval(() => {
      if (settled >= len) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplay(target);
        return;
      }

      const chars: string[] = [];
      for (let i = 0; i < len; i++) {
        if (i < settled) {
          chars.push(target[i]);
        } else {
          chars.push(SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]);
        }
      }
      settled++;
      setDisplay(chars.join(''));
    }, 60);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [target, active]);

  return display;
}

export function CheckoutModal({
  label,
  price,
  cardForm,
  isProcessing,
  onCardFormChange,
  onCheckout,
  onClose,
}: CheckoutModalProps) {
  const { t } = useTranslation();
  const trapRef = useFocusTrap<HTMLDivElement>(true);

  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const [prevIsProcessing, setPrevIsProcessing] = useState(false);

  // Detect prop transitions via "setState during render" pattern (React-sanctioned)
  if (isProcessing !== prevIsProcessing) {
    setPrevIsProcessing(isProcessing);
    if (isProcessing) {
      setPhase('processing');
      setProgress(0);
      setVisibleLines(0);
      setFlashColor(null);
    } else if (phase !== 'idle') {
      setPhase('complete');
      setFlashColor('lucy');
    }
  }

  // Handle flash sequence on complete
  useEffect(() => {
    if (phase !== 'complete') return;
    const t1 = setTimeout(() => setFlashColor('david'), 100);
    const t2 = setTimeout(() => {
      setFlashColor(null);
      setPhase('idle');
    }, 200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  // Progress bar animation
  useEffect(() => {
    if (phase !== 'processing') return;
    const start = performance.now();
    const duration = 1500;
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(elapsed / duration, 1);
      setProgress(pct * 100);
      if (pct < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // Terminal status lines
  useEffect(() => {
    if (phase !== 'processing') return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    STATUS_LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), i * 400));
    });
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const buttonTarget = phase === 'complete' ? 'COMPLETE' : phase === 'processing' ? 'PROCESSING...' : t('pricing.pay');
  const scrambleActive = phase === 'processing' || phase === 'complete';
  const buttonText = useScrambleText(buttonTarget, scrambleActive);

  const borderColor = flashColor === 'lucy'
    ? 'border-lucy'
    : flashColor === 'david'
      ? 'border-david'
      : 'border-bone/30';

  const handleCheckout = useCallback(() => {
    onCheckout();
  }, [onCheckout]);

  return (
    <div
      ref={trapRef}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('pricing.checkout')}
      onClick={() => !isProcessing && onClose()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative bg-ink border-2 ${borderColor} p-8 w-full max-w-md transition-colors duration-100`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-bone mb-1">
          {t('pricing.buyCredits')}
        </h3>
        <p className="text-bone/60 mb-6">
          {label} — <span className="text-bone font-semibold">{price}</span>
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {CARD_FIELDS.map((field) => (
            <div key={field.key} className={field.fullWidth ? 'col-span-2' : ''}>
              <label className="block text-sm text-bone/60 mb-1">{t(field.labelKey)}</label>
              <input
                type="text"
                value={cardForm[field.key]}
                onChange={(e) => onCardFormChange(field.key, e.target.value)}
                className={INPUT_CLASS}
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>

        {/* Terminal status lines */}
        {(phase === 'processing' || phase === 'complete') && (
          <div className="mb-4 space-y-1">
            {STATUS_LINES.slice(0, visibleLines).map((line, i) => (
              <p
                key={i}
                className={`font-mono text-xs ${i === visibleLines - 1 && line.includes('\u2713') ? 'text-david' : 'text-wire'}`}
                style={{ animation: 'flicker-once 420ms steps(8, end)' }}
              >
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {(phase === 'processing' || phase === 'complete') && (
          <div className="mb-4 h-1 bg-void w-full">
            <div
              className="h-full bg-david transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-3 border-2 border-bone/30 text-bone/80 font-medium hover:border-bone transition-colors disabled:opacity-40"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className="flex-1 py-3 bg-lucy text-void font-mono font-medium uppercase tracking-widest hover:bg-void hover:text-lucy border-2 border-lucy transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
