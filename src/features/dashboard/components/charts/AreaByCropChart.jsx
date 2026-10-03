// src/features/dashboard/components/charts/AreaByCropChart.jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Ruler } from 'lucide-react';
import ChartCard from './ChartCard';
import { CHART_COLORS, formatFaNumber } from './chartDefaults';
import {
  commonTooltipProps,
  commonXAxisProps,
  commonYAxisProps,
  commonGridProps,
} from './chartDefaults.recharts';

/**
 * AreaByCropChart — مساحت به تفکیک محصول
 *
 * props:
 *   data: { "گندم": 25.4, "جو": 12.1, ... }  (هکتار)
 */
const AreaByCropChart = ({ data = {} }) => {
  // مرتب‌سازی نزولی — React Compiler خودش memoize می‌کند
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);

  const totalArea = sorted.reduce((sum, [, area]) => sum + area, 0);

  // ✅ Recharts data: [{ name, value, color }]
  const chartData = sorted.map(([name, area], i) => ({
    name,
    value: Number(Number(area).toFixed(2)),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // ── حالت خالی ──
  if (chartData.length === 0) {
    return (
      <ChartCard
        title="مساحت به تفکیک محصول"
        subtitle="واحد: هکتار"
        icon={Ruler}
        color="amber"
      >
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
            <Ruler size={20} />
          </div>
          <p className="text-xs text-slate-500">
            هنوز داده‌ای برای نمایش نیست
          </p>
        </div>
      </ChartCard>
    );
  }

  // ✅ محاسبه ارتفاع بر اساس تعداد آیتم‌ها
  // (تا barها در هم فشرده نشوند)
  const chartHeight = Math.max(320, chartData.length * 40 + 60);

  return (
    <ChartCard
      title="مساحت به تفکیک محصول"
      subtitle="واحد: هکتار"
      icon={Ruler}
      color="amber"
      action={
        <div className="text-left">
          <div className="text-[10px] text-slate-500">کل</div>
          <div className="text-sm font-bold text-amber-600 tabular-nums">
            {formatFaNumber(totalArea, 1)}
            <span className="text-[10px] mr-1 text-amber-500">ha</span>
          </div>
        </div>
      }
    >
      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 60, left: 4, bottom: 4 }}
          >
            {/* گرادیانت مشترک برای همه barها */}
            <defs>
              {chartData.map((entry, i) => (
                <linearGradient
                  key={`gradient-${i}`}
                  id={`barGradient-${i}`}
                  x1="1"
                  y1="0"
                  x2="0"
                  y2="0"
                >
                  <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.85} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid
              {...commonGridProps}
              horizontal={false}
              vertical={true}
            />

            <XAxis
              type="number"
              {...commonXAxisProps}
              tickFormatter={(val) => formatFaNumber(val, 0)}
            />

            <YAxis
              type="category"
              dataKey="name"
              {...commonYAxisProps}
              width={70}
              tick={{
                ...commonYAxisProps.tick,
                fontWeight: 600,
                fontSize: 12,
              }}
            />

            <Tooltip
              {...commonTooltipProps}
              formatter={(value) => [`${formatFaNumber(value, 2)} هکتار`, 'مساحت']}
            />

            <Bar
              dataKey="value"
              radius={[0, 6, 6, 0]}
              barSize={24}
            >
              {chartData.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={`url(#barGradient-${i})`} />
              ))}

              <LabelList
                dataKey="value"
                position="right"
                formatter={(val) => `${formatFaNumber(val, 1)} ha`}
                style={{
                  fontFamily: 'Vazirmatn, sans-serif',
                  fontSize: 11,
                  fontWeight: 600,
                  fill: '#334155',
                  direction: 'ltr',
                }}
                offset={6}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default AreaByCropChart;