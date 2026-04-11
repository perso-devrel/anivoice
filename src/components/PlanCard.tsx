import { useTranslation } from 'react-i18next';
import { CheckmarkIcon } from './icons';
import type { PlanType } from '../types';

export interface PlanConfig {
  nameKey: string;
  id: string;
  planType: PlanType;
  price: string;
  periodKey: string | null;
  timeLabelKey: string;
  creditSeconds: number;
  featureKeys: string[];
  highlighted: boolean;
}

interface PlanCardProps {
  plan: PlanConfig;
  isCurrent: boolean;
  onSelect: (plan: PlanConfig) => void;
}

export function PlanCard({ plan, isCurrent, onSelect }: PlanCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`relative rounded-2xl p-6 flex flex-col ${
        plan.highlighted
          ? 'bg-gradient-to-b from-primary-500/20 to-accent-500/10 border border-primary-500/50'
          : 'glass border border-surface-700'
      }`}
    >
      {isCurrent && (
        <div className="absolute -top-3 right-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/90 text-white shadow-lg">
            {t('pricing.currentPlan')}
          </span>
        </div>
      )}

      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 rounded-full text-xs font-semibold gradient-bg text-white shadow-lg">
            {t('pricing.mostPopular')}
          </span>
        </div>
      )}

      <h3 className="text-lg font-semibold text-white mb-2">
        {t(plan.nameKey)}
      </h3>

      <div className="mb-2">
        <span className="text-4xl font-bold text-white">
          {plan.price}
        </span>
        {plan.periodKey && (
          <span className="text-gray-400 ml-1">/ {t(plan.periodKey)}</span>
        )}
      </div>

      <p className="text-sm text-primary-400 font-medium mb-4">
        {t(plan.timeLabelKey)}
      </p>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.featureKeys.map((key) => (
          <li
            key={key}
            className="flex items-start gap-2 text-sm text-gray-300"
          >
            <CheckmarkIcon className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
            {t(key)}
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <button
          disabled
          className="w-full py-3 rounded-xl border border-green-500/50 text-green-400 font-medium cursor-not-allowed opacity-60"
        >
          {t('pricing.currentPlan')}
        </button>
      ) : (
        <button
          onClick={() => onSelect(plan)}
          className={`w-full py-3 rounded-xl font-medium ${
            plan.highlighted
              ? 'gradient-bg text-white hover:opacity-90 transition-opacity'
              : 'border border-surface-600 text-gray-300 hover:border-primary-500 hover:text-white transition-colors'
          }`}
        >
          {t('pricing.selectPlan')}
        </button>
      )}
    </div>
  );
}
