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

const bgByType: Record<ToastType, string> = {
  success: 'bg-green-500/90',
  error: 'bg-red-500/90',
  info: 'bg-primary-500/90',
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
          className={`pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-xl text-white font-medium shadow-lg backdrop-blur-sm animate-[fadeSlideIn_0.3s_ease-out] ${bgByType[toast.type]}`}
        >
          {iconByType[toast.type]}
          <span className="text-sm">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            aria-label={t('common.close')}
            className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
