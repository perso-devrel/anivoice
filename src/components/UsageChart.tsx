import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { CreditHistoryDay } from '../services/anivoiceApi';

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
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
        <XAxis
          dataKey="day"
          tickFormatter={(d: string) => d.slice(5)}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          contentStyle={{ background: '#1e1e2e', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#9ca3af' }}
          itemStyle={{ color: '#a78bfa' }}
          formatter={(value) => [`${value}s`, t('dashboard.usageSeconds')]}
          labelFormatter={(label) => String(label)}
        />
        <Bar dataKey="usedSeconds" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
