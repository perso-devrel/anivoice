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

const INPUT_CLASS = 'w-full px-4 py-3 rounded-xl bg-surface-800 border border-surface-600 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors';

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative glass border border-surface-600 rounded-2xl p-8 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-1">
          {t('pricing.buyCredits')}
        </h3>
        <p className="text-gray-400 mb-6">
          {label} — <span className="text-white font-semibold">{price}</span>
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {CARD_FIELDS.map((field) => (
            <div key={field.key} className={field.fullWidth ? 'col-span-2' : ''}>
              <label className="block text-sm text-gray-400 mb-1">{t(field.labelKey)}</label>
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
            className="flex-1 py-3 rounded-xl border border-surface-600 text-gray-300 font-medium hover:border-primary-500 hover:text-white transition-colors disabled:opacity-40"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onCheckout}
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
  );
}
