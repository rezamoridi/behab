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
import { formatFaNumber } from './chartDefaults';
import {
  commonTooltipProps,
  commonXAxisProps,
  commonYAxisProps,
  commonGridProps,
} from './chartDefaults.recharts';

/**
 * FarmsTrendChart — بدون ChartCard داخلی
 * (Panel بیرونی عنوان و آیکون دارد)
 */
const FarmsTrendChart = ({ data = [] }) => {
  const chartData = data.map((d) => {
    let monthLabel = '';
    try {
      monthLabel = d.date.toLocaleDateString('fa-IR', { month: 'long' });
    } catch {
      monthLabel = '';
    }
    return { name: monthLabel, value: d.count };
  });

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 12, right: 8, left: 8, bottom: 4 }}
        >
          <defs>
            <linearGradient id="farmsTrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2e7d32" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#2e7d32" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid {...commonGridProps} horizontal={true} vertical={false} />

          <XAxis dataKey="name" {...commonXAxisProps} interval={0} tickMargin={8} />

          <YAxis
            {...commonYAxisProps}
            tickFormatter={(val) => formatFaNumber(val)}
            allowDecimals={false}
          />

          <Tooltip
            {...commonTooltipProps}
            formatter={(value) => [`${formatFaNumber(value)} مزرعه`, 'ثبت‌شده']}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke="#2e7d32"
            strokeWidth={3}
            fill="url(#farmsTrendGradient)"
            dot={{ r: 4, fill: '#ffffff', stroke: '#2e7d32', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#2e7d32', stroke: '#ffffff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FarmsTrendChart;