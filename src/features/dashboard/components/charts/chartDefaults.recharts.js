// src/features/dashboard/components/charts/chartDefaults.recharts.js

/**
 * معادل Recharts از chartDefaults.js
 * تنظیمات مشترک برای همه chart ها
 */

// ============================================
// Tooltip مشترک
// ============================================
export const commonTooltipProps = {
  contentStyle: {
    fontFamily: 'Vazirmatn, sans-serif',
    fontSize: 12,
    direction: 'rtl',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '8px 12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  labelStyle: {
    fontFamily: 'Vazirmatn, sans-serif',
    fontSize: 12,
    fontWeight: 600,
    color: '#334155',
    marginBottom: 4,
  },
  itemStyle: {
    fontFamily: 'Vazirmatn, sans-serif',
    fontSize: 12,
    color: '#64748b',
  },
  cursor: { fill: 'rgba(148, 163, 184, 0.08)' },
};

// ============================================
// Legend مشترک
// ============================================
export const commonLegendProps = {
  iconType: 'circle',
  iconSize: 8,
  wrapperStyle: {
    fontFamily: 'Vazirmatn, sans-serif',
    fontSize: 12,
    direction: 'rtl',
    color: '#334155',
    paddingTop: 8,
  },
};

// ============================================
// Axis مشترک
// ============================================
export const commonXAxisProps = {
  tick: {
    fontFamily: 'Vazirmatn, sans-serif',
    fontSize: 11,
    fill: '#64748b',
  },
  axisLine: { stroke: 'rgba(148, 163, 184, 0.3)' },
  tickLine: false,
};

export const commonYAxisProps = {
  tick: {
    fontFamily: 'Vazirmatn, sans-serif',
    fontSize: 11,
    fill: '#64748b',
  },
  axisLine: false,
  tickLine: false,
  width: 40,
};

// ============================================
// Grid مشترک
// ============================================
export const commonGridProps = {
  strokeDasharray: '4 4',
  stroke: 'rgba(148, 163, 184, 0.15)',
  vertical: false,
};

// ============================================
// Responsive heights
// ============================================
export const CHART_HEIGHTS = {
  default: 280,
  mobile: 240,
};

// ============================================
// ✅ فرمت اعداد بزرگ (K / M) — فارسی
// ============================================
export const formatCompactFaNumber = (val) => {
  const n = Number(val);
  if (!Number.isFinite(n)) return '۰';
  if (Math.abs(n) >= 1_000_000) {
    return (
      Number(n / 1_000_000).toLocaleString('fa-IR', {
        maximumFractionDigits: 1,
      }) + 'M'
    );
  }
  if (Math.abs(n) >= 1_000) {
    return (
      Number(n / 1_000).toLocaleString('fa-IR', {
        maximumFractionDigits: 1,
      }) + 'K'
    );
  }
  return Number(n).toLocaleString('fa-IR');
};

// ============================================
// Re-export helpers
// ============================================
export { formatFaNumber } from './chartDefaults';