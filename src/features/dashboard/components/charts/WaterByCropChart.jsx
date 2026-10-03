// src/features/dashboard/components/charts/WaterByCropChart.jsx
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
import { Droplets } from 'lucide-react';
import ChartCard from './ChartCard';
import { formatFaNumber } from './chartDefaults';
import {
  commonTooltipProps,
  commonXAxisProps,
  commonYAxisProps,
  commonGridProps,
  formatCompactFaNumber,
} from './chartDefaults.recharts';

// ✅ پالت مخصوص آبی (معادل ApexCharts)
const WATER_COLORS = [
  '#0288d1',
  '#039be5',
  '#29b6f6',
  '#4fc3f7',
  '#81d4fa',
  '#b3e5fc',
  '#e1f5fe',
];

/**
 * WaterByCropChart — آب مصرفی به تفکیک محصول
 *
 * props:
 *   data: { "گندم": 125000, "جو": 45000, ... }  (m³)
 */
const WaterByCropChart = ({ data = {} }) => {
  // مرتب‌سازی نزولی + فیلتر صفر — React Compiler memoize می‌کند
  const sorted = Object.entries(data)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  const totalWater = sorted.reduce((sum, [, water]) => sum + water, 0);

  // ✅ Recharts data
  const chartData = sorted.map(([name, water], i) => ({
    name,
    value: Math.round(water),
    color: WATER_COLORS[i % WATER_COLORS.length],
  }));

  // ── حالت خالی ──
  if (chartData.length === 0) {
    return (
      <ChartCard
        title="آب مصرفی به تفکیک محصول"
        subtitle="واحد: متر مکعب"
        icon={Droplets}
        color="blue"
      >
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
            <Droplets size={20} />
          </div>
          <p className="text-xs text-slate-500">
            برای محاسبه، نیاز است نرخ آب محصولات تعریف شده باشد
          </p>
        </div>
      </ChartCard>
    );
  }

  // ✅ ارتفاع داینامیک
  const chartHeight = Math.max(320, chartData.length * 40 + 60);

  return (
    <ChartCard
      title="آب مصرفی به تفکیک محصول"
      subtitle="واحد: متر مکعب"
      icon={Droplets}
      color="blue"
      action={
        <div className="text-left">
          <div className="text-[10px] text-slate-500">کل</div>
          <div
            className="text-sm font-bold text-blue-600 tabular-nums"
            dir="ltr"
          >
            {formatCompactFaNumber(totalWater)}
            <span className="text-[10px] mr-1 text-blue-500">m³</span>
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
            {/* گرادیانت per-bar — شبیه ApexCharts */}
            <defs>
              {chartData.map((entry, i) => (
                <linearGradient
                  key={`waterGradient-${i}`}
                  id={`waterGradient-${i}`}
                  x1="1"
                  y1="0"
                  x2="0"
                  y2="0"
                >
                  <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                  <stop
                    offset="100%"
                    stopColor={entry.color}
                    stopOpacity={0.9}
                  />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid
              {...commonGridProps}
              horizontal={false}
              vertical={true}
            />

            {/* ✅ محور X با فرمت compact */}
            <XAxis
              type="number"
              {...commonXAxisProps}
              tickFormatter={(val) => formatCompactFaNumber(val)}
            />

            {/* ✅ محور Y با نام محصول */}
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

            {/* ✅ Tooltip با فرمت کامل + m³ */}
            <Tooltip
              {...commonTooltipProps}
              formatter={(value) => [
                `${formatFaNumber(value)} m³`,
                'آب مصرفی',
              ]}
            />

            <Bar
              dataKey="value"
              radius={[0, 6, 6, 0]}
              barSize={24}
            >
              {chartData.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={`url(#waterGradient-${i})`}
                />
              ))}

              {/* ✅ LabelList با فرمت compact */}
              <LabelList
                dataKey="value"
                position="right"
                formatter={(val) => formatCompactFaNumber(val)}
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

export default WaterByCropChart;