// src/features/dashboard/components/charts/CropDistributionChart.jsx
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PieChart } from 'lucide-react';
import ChartCard from './ChartCard';
import { CHART_COLORS } from './chartDefaults';
import {
  commonTooltipProps,
  commonLegendProps,
  formatFaNumber,
} from './chartDefaults.recharts';

/**
 * CropDistributionChart — توزیع محصولات در مزارع
 *
 * props:
 *   data: { "گندم": 10, "جو": 5, ... }
 */
const CropDistributionChart = ({ data = {} }) => {
  const labels = Object.keys(data);
  const series = Object.values(data);
  const total = series.reduce((a, b) => a + b, 0);

  // ✅ React Compiler خودش این را memoize می‌کند
  const chartData = labels.map((label, i) => ({
    name: label,
    value: series[i],
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // ── حالت خالی ──
  if (labels.length === 0) {
    return (
      <ChartCard
        title="توزیع محصولات"
        subtitle="بر اساس تعداد مزارع"
        icon={PieChart}
        color="primary"
      >
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
            <PieChart size={20} />
          </div>
          <p className="text-xs text-slate-500">
            هنوز محصولی به مزارع تخصیص داده نشده
          </p>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="توزیع محصولات"
      subtitle="بر اساس تعداد مزارع"
      icon={PieChart}
      color="primary"
    >
      <div className="relative" style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="45%"
              outerRadius="68%"
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {chartData.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip
              {...commonTooltipProps}
              formatter={(value, name) => {
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return [
                  `${formatFaNumber(value)} مزرعه (${pct}٪)`,
                  name,
                ];
              }}
            />

            <Legend {...commonLegendProps} verticalAlign="bottom" align="center" />
          </RechartsPieChart>
        </ResponsiveContainer>

        {/* ✅ Center label (Recharts این را ندارد) */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ paddingBottom: 60 }}
        >
          <span
            style={{
              fontFamily: 'Vazirmatn, sans-serif',
              fontSize: 12,
              color: '#64748b',
            }}
          >
            کل مزارع
          </span>
          <span
            style={{
              fontFamily: 'Vazirmatn, sans-serif',
              fontSize: 20,
              fontWeight: 700,
              color: '#0f172a',
              direction: 'rtl',
            }}
          >
            {formatFaNumber(total)}
          </span>
        </div>
      </div>
    </ChartCard>
  );
};

export default CropDistributionChart;