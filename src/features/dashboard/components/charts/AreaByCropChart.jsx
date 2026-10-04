// src/features/dashboard/components/charts/AreaByCropChart.jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  getCropColor,
  SPECIAL_COLORS,
  formatFaNumber,
} from './chartDefaults';
import {
  commonTooltipProps,
  commonXAxisProps,
  commonYAxisProps,
  commonGridProps,
  formatCompactFaNumber,
} from './chartDefaults.recharts';

const MAX_VISIBLE = 15;
const OTHERS_LABEL = 'سایر';

const shortenName = (name, maxLen = 12) => {
  if (!name) return '';
  if (name.length <= maxLen) return name;
  return name.slice(0, maxLen - 1) + '…';
};

const AreaByCropChart = ({ data = {}, colorByCrop = {} }) => {
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const totalArea = sorted.reduce((sum, [, area]) => sum + area, 0);

  let chartData;
  if (sorted.length > MAX_VISIBLE) {
    const top = sorted.slice(0, MAX_VISIBLE);
    const othersSum = sorted
      .slice(MAX_VISIBLE)
      .reduce((sum, [, area]) => sum + area, 0);

    chartData = top.map(([name, area], i) => ({
      name: shortenName(name),
      fullName: name,
      value: Number(Number(area).toFixed(2)),
      color: getCropColor(name, colorByCrop, i),
    }));

    if (othersSum > 0) {
      chartData.push({
        name: `${OTHERS_LABEL} (${(sorted.length - MAX_VISIBLE).toLocaleString('fa-IR')})`,
        fullName: OTHERS_LABEL,
        value: Number(Number(othersSum).toFixed(2)),
        color: SPECIAL_COLORS.others,
      });
    }
  } else {
    chartData = sorted.map(([name, area], i) => ({
      name: shortenName(name),
      fullName: name,
      value: Number(Number(area).toFixed(2)),
      color: getCropColor(name, colorByCrop, i),
    }));
  }

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-xs text-slate-500">داده‌ای موجود نیست</p>
      </div>
    );
  }

  const rowHeight = 32;
  const minHeight = 200;
  const chartHeight = Math.max(minHeight, chartData.length * rowHeight + 40);
  const needsScroll = chartHeight > 260;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-baseline justify-between mb-2 flex-shrink-0">
        <span className="text-[10px] text-slate-500">مجموع</span>
        <span
          className="text-sm font-bold text-amber-600 tabular-nums"
          dir="ltr"
        >
          {formatFaNumber(totalArea, 1)}
          <span className="text-[9px] mr-1 text-amber-500">ha</span>
        </span>
      </div>

      <div
        className={`flex-1 min-h-0 ${
          needsScroll ? 'overflow-y-auto overflow-x-hidden pr-1 -mr-1' : ''
        }`}
      >
        <div
          style={{
            height: needsScroll ? `${chartHeight}px` : '100%',
            minHeight: '100%',
            width: '100%',
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
              barCategoryGap="25%"
            >
              <defs>
                {chartData.map((entry, i) => (
                  <linearGradient
                    key={`gradient-${i}`}
                    id={`areaBarGradient-${i}`}
                    x1="1"
                    y1="0"
                    x2="0"
                    y2="0"
                  >
                    <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                    <stop
                      offset="100%"
                      stopColor={entry.color}
                      stopOpacity={0.85}
                    />
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
                tickFormatter={(val) => formatCompactFaNumber(val)}
                tickCount={5}
              />

              <YAxis
                type="category"
                dataKey="name"
                {...commonYAxisProps}
                width={90}
                tickMargin={10}
                tick={{
                  ...commonYAxisProps.tick,
                  fontWeight: 600,
                  fontSize: 11,
                }}
                interval={0}
                orientation="right"
              />

              <Tooltip
                {...commonTooltipProps}
                formatter={(value, name, props) => [
                  `${formatFaNumber(value, 2)} هکتار`,
                  props?.payload?.fullName || name,
                ]}
              />

              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={18}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={`url(#areaBarGradient-${i})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {needsScroll && (
        <div className="flex-shrink-0 flex items-center justify-center gap-1 mt-1.5 text-[9px] text-slate-400">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <span>برای دیدن بقیه، اسکرول کنید</span>
        </div>
      )}
    </div>
  );
};

export default AreaByCropChart;