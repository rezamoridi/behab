// src/features/dashboard/components/charts/CropDistributionChart.jsx
import { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { PieChart } from 'lucide-react';
import ChartCard from './ChartCard';
import { CHART_COLORS, baseChartOptions } from './chartDefaults';

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

  const options = useMemo(
    () => ({
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'donut',
        height: 280,
      },
      labels,
      colors: CHART_COLORS,
      stroke: {
        width: 2,
        colors: ['#ffffff'],
      },
      plotOptions: {
        pie: {
          donut: {
            size: '68%',
            labels: {
              show: true,
              name: {
                fontFamily: 'Vazirmatn, sans-serif',
                fontSize: '12px',
                color: '#64748b',
              },
              value: {
                fontFamily: 'Vazirmatn, sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                color: '#0f172a',
                formatter: (val) => {
                  return Number(val).toLocaleString('fa-IR');
                },
              },
              total: {
                show: true,
                showAlways: true,
                label: 'کل مزارع',
                fontFamily: 'Vazirmatn, sans-serif',
                fontSize: '12px',
                color: '#64748b',
                formatter: () => {
                  return Number(total).toLocaleString('fa-IR');
                },
              },
            },
          },
        },
      },
      legend: {
        ...baseChartOptions.legend,
        position: 'bottom',
        horizontalAlign: 'center',
        markers: {
          width: 8,
          height: 8,
          radius: 4,
        },
        itemMargin: {
          horizontal: 8,
          vertical: 4,
        },
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        ...baseChartOptions.tooltip,
        y: {
          formatter: (val) => {
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            return `${Number(val).toLocaleString('fa-IR')} مزرعه (${pct}٪)`;
          },
        },
      },
    }),
    [labels, series, total],
  );

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
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        height={280}
      />
    </ChartCard>
  );
};

export default CropDistributionChart;