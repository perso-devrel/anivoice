import { useTranslation } from 'react-i18next';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { SpinnerIcon } from './icons';

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

const CARD_FIELDS: { key: keyof CardForm; labelKey: string; placeholder: string; fullWidth: boolean }[] = [
  { key: 'number', labelKey: 'pricing.cardNumber', placeholder: '0000 0000 0000 0000', fullWidth: true },
  { key: 'expiry', labelKey: 'pricing.expiry', placeholder: 'MM/YY', fullWidth: false },
  { key: 'cvc', labelKey: 'pricing.cvc', placeholder: '123', fullWidth: false },
];

const INPUT_CLASS = 'w-full px-0 py-2 bg-transparent border-b border-ink/30 text-ink placeholder-ink-mute focus:border-cinnabar focus:outline-none transition-colors font-mono text-[14px]';

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

  return (
    <div
      ref={trapRef}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('pricing.checkout')}
      onClick={() => !isProcessing && onClose()}
    >
      <div className="absolute inset-0 bg-ink/40" />
      <div
        className="relative bg-cream border border-ink p-8 md:p-10 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
          Receipt — Checkout
        </span>
        <h3 className="font-display text-3xl text-ink mt-2 mb-1">
          {t('pricing.buyCredits')}
        </h3>
        <p className="text-ink-soft mb-8 border-b border-ink/15 pb-4 flex items-baseline justify-between">
          <span>{label}</span>
          <span className="font-display text-2xl text-ink">{price}</span>
        </p>

        <div className="grid grid-cols-2 gap-x-5 gap-y-5 mb-8">
          {CARD_FIELDS.map((field) => (
            <div key={field.key} className={field.fullWidth ? 'col-span-2' : ''}>
              <label className="block font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mute mb-2">
                {t(field.labelKey)}
              </label>
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

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-3 border border-ink text-ink font-mono text-[12px] uppercase tracking-[0.18em] hover:bg-ink hover:text-cream transition-colors disabled:opacity-40"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onCheckout}
            disabled={isProcessing}
            className="flex-1 py-3 bg-ink text-cream font-mono text-[12px] uppercase tracking-[0.18em] hover:bg-cinnabar transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
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
  );
}
