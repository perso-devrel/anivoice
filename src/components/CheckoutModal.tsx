import { useTranslation } from 'react-i18next';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { SpinnerIcon } from './icons';

interface CheckoutModalProps {
  type: 'plan' | 'credit';
  label: string;
  price: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  isProcessing: boolean;
  onCardNumberChange: (value: string) => void;
  onCardExpiryChange: (value: string) => void;
  onCardCvcChange: (value: string) => void;
  onCheckout: () => void;
  onClose: () => void;
}

export function CheckoutModal({
  type,
  label,
  price,
  cardNumber,
  cardExpiry,
  cardCvc,
  isProcessing,
  onCardNumberChange,
  onCardExpiryChange,
  onCardCvcChange,
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
          {type === 'plan' ? t('pricing.changePlan') : t('pricing.buyCredits')}
        </h3>
        <p className="text-gray-400 mb-6">
          {label} — <span className="text-white font-semibold">{price}</span>
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">{t('pricing.cardNumber')}</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => onCardNumberChange(e.target.value)}
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
                onChange={(e) => onCardExpiryChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-surface-600 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('pricing.cvc')}</label>
              <input
                type="text"
                value={cardCvc}
                onChange={(e) => onCardCvcChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-surface-600 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
                placeholder="123"
              />
            </div>
          </div>
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
