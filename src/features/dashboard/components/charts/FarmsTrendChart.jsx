// src/features/dashboard/components/charts/FarmsTrendChart.jsx
import { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { TrendingUp } from 'lucide-react';
import ChartCard from './ChartCard';
import { baseChartOptions } from './chartDefaults';

/**
 * FarmsTrendChart — روند ثبت مزارع در ۶ ماه اخیر
 *
 * props:
 *   data: [{ date: Date, count: number }, ...]
 */
const FarmsTrendChart = ({ data = [] }) => {
  // ── برچسب ماه‌ها به فارسی ──
  const categories = useMemo(
    () =>
      data.map((d) => {
        try {
          return d.date.toLocaleDateString('fa-IR', {
            month: 'long',
          });
        } catch {
          return '';
        }
      }),
    [data],
  );

  const series = useMemo(
    () => [
      {
        name: 'مزارع ثبت‌شده',
        data: data.map((d) => d.count),
      },
    ],
    [data],
  );

  const total = useMemo(
    () => data.reduce((sum, d) => sum + d.count, 0),
    [data],
  );

  const options = useMemo(
    () => ({
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'area',
        height: 280,
        sparkline: { enabled: false },
      },
      colors: ['#2e7d32'],
      stroke: {
        curve: 'smooth',
        width: 3,
        colors: ['#2e7d32'],
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 100],
        },
      },
      markers: {
        size: 5,
        colors: ['#ffffff'],
        strokeColors: '#2e7d32',
        strokeWidth: 2,
        hover: {
          size: 7,
        },
      },
      xaxis: {
        ...baseChartOptions.xaxis,
        categories,
      },
      yaxis: {
        ...baseChartOptions.yaxis,
        labels: {
          ...baseChartOptions.yaxis.labels,
          formatter: (val) => Number(val).toLocaleString('fa-IR'),
        },
      },
      dataLabels: {
        enabled: false,
      },
      grid: {
        ...baseChartOptions.grid,
        padding: {
          left: 8,
          right: 8,
        },
      },
      tooltip: {
        ...baseChartOptions.tooltip,
        y: {
          formatter: (val) =>
            `${Number(val).toLocaleString('fa-IR')} مزرعه`,
        },
      },
    }),
    [categories, series],
  );

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
              {Number(total).toLocaleString('fa-IR')}
            </div>
          </div>
        )
      }
    >
      <ReactApexChart
        options={options}
        series={series}
        type="area"
        height={280}
      />
    </ChartCard>
  );
};

export default FarmsTrendChart;