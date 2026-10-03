// src/features/dashboard/components/charts/chartDefaults.js

/**
 * Chart Constants and Helpers
 *
 * ⚠️ Note: baseChartOptions (ApexCharts config) was removed in Sprint C
 * after migrating to Recharts. Only colors + helpers remain.
 */

// ============================================
// ✅ پالت رنگ برای chart ها
// ============================================
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

// ============================================
// ✅ فرمت اعداد فارسی
// ============================================
export const formatFaNumber = (num, digits = 0) => {
  if (num === null || num === undefined) return '۰';
  return Number(num).toLocaleString('fa-IR', {
    maximumFractionDigits: digits,
  });
};