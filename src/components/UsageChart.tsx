import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { CreditHistoryDay } from '../services/anivoiceApi';
import { formatChartDay } from '../utils/format';

const CHART_MARGIN = { top: 4, right: 8, bottom: 0, left: 0 };
const AXIS_TICK_STYLE = { fill: '#F5F0E680', fontSize: 11 };
const TOOLTIP_CONTENT_STYLE = { background: '#1A1A1A', border: '2px solid #F5F0E6', borderRadius: 0, fontSize: 12 };
const TOOLTIP_LABEL_STYLE = { color: '#F5F0E6' };
const TOOLTIP_ITEM_STYLE = { color: '#FF4FA3' };

function formatTooltipLabel(label: unknown): string {
  return String(label);
}

export default function UsageChart({ data }: { data: CreditHistoryDay[] }) {
  const { t } = useTranslation();

  if (data.length === 0) {
    return (
      <p className="text-sm text-bone/50 text-center py-8">
        {t('dashboard.noUsageData')}
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={CHART_MARGIN}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F5F0E630" vertical={false} />
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
        <Bar dataKey="usedSeconds" fill="#FF4FA3" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
