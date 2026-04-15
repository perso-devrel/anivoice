import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { CreditHistoryDay } from '../services/anivoiceApi';
import { formatChartDay } from '../utils/format';

const CHART_MARGIN = { top: 4, right: 8, bottom: 0, left: 0 };
const AXIS_TICK_STYLE = { fill: '#6b7280', fontSize: 11 };
const TOOLTIP_CONTENT_STYLE = { background: '#1e1e2e', border: '1px solid #333', borderRadius: 8, fontSize: 12 };
const TOOLTIP_LABEL_STYLE = { color: '#9ca3af' };
const TOOLTIP_ITEM_STYLE = { color: '#fb923c' };

function formatTooltipLabel(label: unknown): string {
  return String(label);
}

export default function UsageChart({ data }: { data: CreditHistoryDay[] }) {
  const { t } = useTranslation();

  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-8">
        {t('dashboard.noUsageData')}
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={CHART_MARGIN}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
        <XAxis
          dataKey="day"
          tickFormatter={formatChartDay}
          tick={AXIS_TICK_STYLE}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={AXIS_TICK_STYLE}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          contentStyle={TOOLTIP_CONTENT_STYLE}
          labelStyle={TOOLTIP_LABEL_STYLE}
          itemStyle={TOOLTIP_ITEM_STYLE}
          formatter={(value) => [`${value}s`, t('dashboard.usageSeconds')]}
          labelFormatter={formatTooltipLabel}
        />
        <Bar dataKey="usedSeconds" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
