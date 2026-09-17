// src/features/settings/constants/cropColors.js

// ✅ رنگ پیش‌فرض برای مزارعی که محصول ندارند یا محصولشان رنگ ندارد
export const DEFAULT_FARM_COLOR = '#9E9E9E'; // خاکستری روشن

// ✅ پالت رنگی برای انتخاب در تنظیمات محصولات
export const CROP_COLOR_PALETTE = [
  '#4CAF50', // سبز
  '#8BC34A', // سبز روشن
  '#CDDC39', // لیمویی
  '#FFC107', // زرد کهربایی
  '#FF9800', // نارنجی
  '#FF5722', // نارنجی تیره
  '#F44336', // قرمز
  '#E91E63', // صورتی
  '#9C27B0', // بنفش
  '#673AB7', // بنفش تیره
  '#3F51B5', // نیلی
  '#2196F3', // آبی
  '#03A9F4', // آبی روشن
  '#00BCD4', // فیروزه‌ای
  '#009688', // سبز آبی
  '#795548', // قهوه‌ای
  '#607D8B', // خاکستری آبی
];

// ✅ اعتبارسنجی hex
export const isValidHexColor = (value) =>
  typeof value === 'string' &&
  /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);

// ✅ نرمال‌سازی (۳ رقمی → ۶ رقمی، uppercase)
export const normalizeHex = (value) => {
  if (!isValidHexColor(value)) return null;
  let hex = value.toUpperCase();
  if (hex.length === 4) {
    hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  return hex;
};

// ✅ رنگ‌های روشن (برای fill) از رنگ اصلی
export const withAlpha = (hex, alpha = 0.25) => {
  const normalized = normalizeHex(hex);
  if (!normalized) return `rgba(158, 158, 158, ${alpha})`;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};