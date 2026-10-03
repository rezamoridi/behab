// src/features/dashboard/components/charts/WaterByCropChart.jsx
import { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Droplets } from 'lucide-react';
import ChartCard from './ChartCard';
import { baseChartOptions, formatFaNumber } from './chartDefaults';

/**
 * WaterByCropChart — آب مصرفی به تفکیک محصول
 *
 * props:
 *   data: { "گندم": 125000, "جو": 45000, ... }  (m³)
 */
const WaterByCropChart = ({ data = {} }) => {
  const sorted = useMemo(() => {
    return Object.entries(data)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [data]);

  const categories = useMemo(() => sorted.map(([name]) => name), [sorted]);
  const series = useMemo(
    () => [
      {
        name: 'آب مصرفی',
        data: sorted.map(([, water]) => Math.round(water)),
      },
    ],
    [sorted],
  );

  const totalWater = useMemo(
    () => sorted.reduce((sum, [, water]) => sum + water, 0),
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
          gradientToColors: [
            '#0288d1',
            '#039be5',
            '#29b6f6',
            '#4fc3f7',
            '#81d4fa',
            '#b3e5fc',
            '#e1f5fe',
          ],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.9,
          stops: [0, 100],
        },
      },
      colors: [
        '#0288d1',
        '#039be5',
        '#29b6f6',
        '#4fc3f7',
        '#81d4fa',
        '#b3e5fc',
        '#e1f5fe',
      ],
      dataLabels: {
        enabled: true,
        formatter: (val) => {
          // فرمت فشرده برای اعداد بزرگ
          if (val >= 1000000) {
            return formatFaNumber(val / 1000000, 1) + 'M';
          }
          if (val >= 1000) {
            return formatFaNumber(val / 1000, 1) + 'K';
          }
          return formatFaNumber(val);
        },
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
          formatter: (val) => {
            if (val >= 1000000) return formatFaNumber(val / 1000000, 1) + 'M';
            if (val >= 1000) return formatFaNumber(val / 1000) + 'K';
            return formatFaNumber(val);
          },
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
          formatter: (val) =>
            `${formatFaNumber(val)} m³`,
        },
      },
    }),
    [categories, series, totalWater],
  );

  // ── حالت خالی ──
  if (categories.length === 0) {
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

  return (
    <ChartCard
      title="آب مصرفی به تفکیک محصول"
      subtitle="واحد: متر مکعب"
      icon={Droplets}
      color="blue"
      action={
        <div className="text-left">
          <div className="text-[10px] text-slate-500">کل</div>
          <div className="text-sm font-bold text-blue-600 tabular-nums" dir="ltr">
            {totalWater >= 1000000
              ? formatFaNumber(totalWater / 1000000, 1) + 'M'
              : totalWater >= 1000
                ? formatFaNumber(totalWater / 1000, 1) + 'K'
                : formatFaNumber(totalWater)}
            <span className="text-[10px] mr-1 text-blue-500">m³</span>
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

export default WaterByCropChart;