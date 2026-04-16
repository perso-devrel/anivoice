import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { CreditHistoryDay } from '../services/anivoiceApi';
import { formatChartDay } from '../utils/format';

const CHART_MARGIN = { top: 4, right: 8, bottom: 0, left: 0 };
const AXIS_TICK_STYLE = { fill: '#8a8377', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' };
const TOOLTIP_CONTENT_STYLE = {
  background: '#f4efe6',
  border: '1px solid #1a1815',
  borderRadius: 0,
  fontSize: 12,
  fontFamily: 'JetBrains Mono, monospace',
};
const TOOLTIP_LABEL_STYLE = { color: '#5a544b' };
const TOOLTIP_ITEM_STYLE = { color: '#a8362a' };

function formatTooltipLabel(label: unknown): string {
  return String(label);
}

export default function UsageChart({ data }: { data: CreditHistoryDay[] }) {
  const { t } = useTranslation();

  if (data.length === 0) {
    return (
      <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-ink-mute text-center py-10">
        {t('dashboard.noUsageData')}
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={CHART_MARGIN}>
        <CartesianGrid strokeDasharray="2 4" stroke="#1a1815" strokeOpacity={0.15} vertical={false} />
        <XAxis
          dataKey="day"
          tickFormatter={formatChartDay}
          tick={AXIS_TICK_STYLE}
          axisLine={{ stroke: '#1a1815', strokeOpacity: 0.4 }}
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
          cursor={{ fill: '#1a1815', fillOpacity: 0.05 }}
          formatter={(value) => [`${value}s`, t('dashboard.usageSeconds')]}
          labelFormatter={formatTooltipLabel}
        />
        <Bar dataKey="usedSeconds" fill="#1a1815" maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
