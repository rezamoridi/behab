// src/features/dashboard/components/charts/AreaByCropChart.jsx
import { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Ruler } from 'lucide-react';
import ChartCard from './ChartCard';
import { baseChartOptions, CHART_COLORS, formatFaNumber } from './chartDefaults';

/**
 * AreaByCropChart — مساحت به تفکیک محصول
 *
 * props:
 *   data: { "گندم": 25.4, "جو": 12.1, ... }  (هکتار)
 */
const AreaByCropChart = ({ data = {} }) => {
  // مرتب‌سازی نزولی
  const sorted = useMemo(() => {
    return Object.entries(data).sort((a, b) => b[1] - a[1]);
  }, [data]);

  const categories = useMemo(() => sorted.map(([name]) => name), [sorted]);
  const series = useMemo(
    () => [
      {
        name: 'مساحت',
        data: sorted.map(([, area]) => Number(area.toFixed(2))),
      },
    ],
    [sorted],
  );

  const totalArea = useMemo(
    () => sorted.reduce((sum, [, area]) => sum + area, 0),
    [sorted],
  );

  const options = useMemo(
    () => ({
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'bar',
        height: 320,
      },
      colors: [CHART_COLORS[0]], // سبز
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 6,
          borderRadiusApplication: 'end',
          barHeight: '65%',
          distributed: true,
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.3,
          gradientToColors: CHART_COLORS.slice(0, categories.length),
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.85,
          stops: [0, 100],
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => formatFaNumber(val, 1) + ' ha',
        style: {
          fontFamily: 'Vazirmatn, sans-serif',
          fontSize: '11px',
          fontWeight: 600,
          colors: ['#ffffff'],
        },
        offsetX: -6,
      },
      xaxis: {
        ...baseChartOptions.xaxis,
        categories,
        labels: {
          ...baseChartOptions.xaxis.labels,
          formatter: (val) => formatFaNumber(val, 1),
        },
      },
      yaxis: {
        labels: {
          style: {
            fontFamily: 'Vazirmatn, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            colors: '#334155',
          },
        },
      },
      legend: { show: false },
      tooltip: {
        ...baseChartOptions.tooltip,
        y: {
          formatter: (val) => `${formatFaNumber(val, 2)} هکتار`,
        },
      },
    }),
    [categories, series, totalArea],
  );

  // ── حالت خالی ──
  if (categories.length === 0) {
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
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={320}
      />
    </ChartCard>
  );
};

export default AreaByCropChart;