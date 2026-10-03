// src/features/dashboard/components/charts/chartDefaults.js

export const CHART_COLORS = [
  '#2e7d32',
  '#1976d2',
  '#f57c00',
  '#9c27b0',
  '#e91e63',
  '#00bcd4',
  '#ff9800',
  '#795548',
];

export const baseChartOptions = {
  chart: {
    fontFamily: 'Vazirmatn, sans-serif',
    toolbar: { show: false },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 500,
      animateGradually: {
        enabled: true,
        delay: 150,
      },
    },
    background: 'transparent',
    // ✅ ریسپانسیو
    redrawOnParentResize: true,
    redrawOnWindowResize: true,
  },
  theme: {
    mode: 'light',
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    fontFamily: 'Vazirmatn, sans-serif',
    fontSize: '12px',
    labels: {
      colors: '#334155',
    },
  },
  tooltip: {
    style: {
      fontFamily: 'Vazirmatn, sans-serif',
      fontSize: '12px',
    },
  },
  grid: {
    borderColor: 'rgba(148, 163, 184, 0.15)',
    strokeDashArray: 4,
    padding: {
      left: 8,
      right: 8,
    },
  },
  xaxis: {
    labels: {
      style: {
        fontFamily: 'Vazirmatn, sans-serif',
        fontSize: '11px',
        colors: '#64748b',
      },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: {
        fontFamily: 'Vazirmatn, sans-serif',
        fontSize: '11px',
        colors: '#64748b',
      },
    },
  },
  responsive: [
    {
      breakpoint: 640,
      options: {
        chart: {
          height: 240,
        },
        legend: {
          fontSize: '10px',
          itemMargin: {
            horizontal: 6,
            vertical: 2,
          },
        },
        xaxis: {
          labels: {
            style: {
              fontSize: '10px',
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              fontSize: '10px',
            },
          },
        },
      },
    },
  ],
};

export const CHART_THEMES = {
  primary: { line: '#2e7d32', gradient: ['#4caf50', '#2e7d32'] },
  blue: { line: '#1976d2', gradient: ['#42a5f5', '#1976d2'] },
  amber: { line: '#f57c00', gradient: ['#ffb74d', '#f57c00'] },
  purple: { line: '#9c27b0', gradient: ['#ba68c8', '#9c27b0'] },
  emerald: { line: '#10b981', gradient: ['#34d399', '#10b981'] },
  rose: { line: '#e91e63', gradient: ['#f06292', '#e91e63'] },
};

export const formatFaNumber = (num, digits = 0) => {
  if (num === null || num === undefined) return '۰';
  return Number(num).toLocaleString('fa-IR', {
    maximumFractionDigits: digits,
  });
};

export default baseChartOptions;