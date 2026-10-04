// src/features/dashboard/components/charts/CropDistributionChart.jsx
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getCropColor } from './chartDefaults';
import {
  commonTooltipProps,
  commonLegendProps,
  formatFaNumber,
} from './chartDefaults.recharts';

const CropDistributionChart = ({ data = {}, colorByCrop = {} }) => {
  const labels = Object.keys(data);
  const series = Object.values(data);
  const total = series.reduce((a, b) => a + b, 0);

  const chartData = labels.map((label, i) => ({
    name: label,
    value: series[i],
    // ✅ استفاده از helper — نامشخص/سایر → توسی
    color: getCropColor(label, colorByCrop, i),
  }));

  if (labels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-xs text-slate-500">داده‌ای موجود نیست</p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="42%"
            outerRadius="65%"
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
              return [`${formatFaNumber(value)} مزرعه (${pct}٪)`, name];
            }}
          />

          <Legend {...commonLegendProps} verticalAlign="bottom" align="center" />
        </RechartsPieChart>
      </ResponsiveContainer>

      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ paddingBottom: 40 }}
      >
        <span className="text-[11px] text-slate-500 font-medium">کل</span>
        <span className="text-lg font-bold text-slate-900" dir="rtl">
          {formatFaNumber(total)}
        </span>
      </div>
    </div>
  );
};

export default CropDistributionChart;