import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useToastStore } from '../stores/toastStore';
import type { ToastType } from '../stores/toastStore';
import { XIcon, CheckmarkIcon, InfoIcon } from './icons';

const iconByType: Record<ToastType, ReactNode> = {
  success: <CheckmarkIcon />,
  error: <XIcon />,
  info: <InfoIcon />,
};

const styleByType: Record<ToastType, string> = {
  success: 'bg-ink text-cream border-ink',
  error: 'bg-cinnabar text-cream border-cinnabar',
  info: 'bg-cream text-ink border-ink',
};

const labelByType: Record<ToastType, string> = {
  success: 'OK',
  error: 'ERR',
  info: 'INFO',
};

export default function ToastContainer() {
  const { t } = useTranslation();
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-3 border animate-[fadeSlideIn_0.3s_ease-out] ${styleByType[toast.type]}`}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-70">
            {labelByType[toast.type]}
          </span>
          <span className="opacity-80">{iconByType[toast.type]}</span>
          <span className="text-[13px]">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            aria-label={t('common.close')}
            className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
