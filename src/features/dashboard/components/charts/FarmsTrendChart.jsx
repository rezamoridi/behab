// src/features/dashboard/components/charts/FarmsTrendChart.jsx
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import ChartCard from './ChartCard';
import { formatFaNumber } from './chartDefaults';
import {
  commonTooltipProps,
  commonXAxisProps,
  commonYAxisProps,
  commonGridProps,
} from './chartDefaults.recharts';

/**
 * FarmsTrendChart — روند ثبت مزارع در ۶ ماه اخیر
 *
 * props:
 *   data: [{ date: Date, count: number }, ...]
 */
const FarmsTrendChart = ({ data = [] }) => {
  // ✅ Recharts data: [{ name, value }]
  // React Compiler خودش memoize می‌کند
  const chartData = data.map((d) => {
    let monthLabel = '';
    try {
      monthLabel = d.date.toLocaleDateString('fa-IR', {
        month: 'long',
      });
    } catch {
      monthLabel = '';
    }
    return {
      name: monthLabel,
      value: d.count,
    };
  });

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <ChartCard
      title="روند ثبت مزارع"
      subtitle="۶ ماه اخیر"
      icon={TrendingUp}
      color="emerald"
      action={
        total > 0 && (
          <div className="text-left">
            <div className="text-[10px] text-slate-500">مجموع</div>
            <div className="text-sm font-bold text-emerald-600 tabular-nums">
              {formatFaNumber(total)}
            </div>
          </div>
        )
      }
    >
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 12, right: 8, left: 8, bottom: 4 }}
          >
            {/* ✅ گرادیانت عمودی (سبز → شفاف) */}
            <defs>
              <linearGradient id="farmsTrendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2e7d32" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#2e7d32" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid
              {...commonGridProps}
              horizontal={true}
              vertical={false}
            />

            {/* ✅ محور X — برچسب ماه‌های فارسی */}
            <XAxis
              dataKey="name"
              {...commonXAxisProps}
              interval={0}
              tickMargin={8}
            />

            {/* ✅ محور Y — اعداد فارسی */}
            <YAxis
              {...commonYAxisProps}
              tickFormatter={(val) => formatFaNumber(val)}
              allowDecimals={false}
            />

            {/* ✅ Tooltip با «مزرعه» فارسی */}
            <Tooltip
              {...commonTooltipProps}
              formatter={(value) => [`${formatFaNumber(value)} مزرعه`, 'ثبت‌شده']}
            />

            {/* ✅ Area با curve نرم + gradient + marker */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2e7d32"
              strokeWidth={3}
              fill="url(#farmsTrendGradient)"
              dot={{
                r: 4,
                fill: '#ffffff',
                stroke: '#2e7d32',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: '#2e7d32',
                stroke: '#ffffff',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default FarmsTrendChart;