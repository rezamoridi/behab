// src/features/dashboard/components/charts/chartDefaults.js

/**
 * Chart Constants and Helpers
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
// ✅ رنگ‌های Special — برای مقادیر خاص
// ============================================
export const SPECIAL_COLORS = {
  unknown: '#9e9e9e',       // توسی روشن — «نامشخص»
  others: '#94a3b8',        // slate-400 — «سایر»
  noCrop: '#a1a1aa',        // zinc-400 — «بدون محصول»
};

/**
 * دریافت رنگ برای یک محصول
 * با درنظر گرفتن نام‌های خاص
 */
export const getCropColor = (cropName, colorByCrop, fallbackIndex = 0) => {
  // ✅ نام‌های خاص → رنگ توسی
  if (!cropName || cropName === 'نامشخص' || cropName === 'بدون محصول') {
    return SPECIAL_COLORS.unknown;
  }

  if (cropName === 'سایر' || cropName.startsWith('سایر')) {
    return SPECIAL_COLORS.others;
  }

  // رنگ از DB یا fallback palette
  return (
    colorByCrop?.[cropName] ||
    CHART_COLORS[fallbackIndex % CHART_COLORS.length]
  );
};

// ============================================
// ✅ فرمت اعداد فارسی
// ============================================
export const formatFaNumber = (num, digits = 0) => {
  if (num === null || num === undefined) return '۰';
  return Number(num).toLocaleString('fa-IR', {
    maximumFractionDigits: digits,
  });
};