// src/features/settings/constants/cropColors.js

export const DEFAULT_FARM_COLOR = '#9E9E9E';

export const CROP_COLOR_PALETTE = [
  '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722',
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
  '#03A9F4', '#00BCD4', '#009688', '#795548', '#607D8B',
];

export const isValidHexColor = (value) =>
  typeof value === 'string' &&
  /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);

export const normalizeHex = (value) => {
  if (!isValidHexColor(value)) return null;
  let hex = value.toUpperCase();
  if (hex.length === 4) {
    hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  return hex;
};

export const withAlpha = (hex, alpha = 0.25) => {
  const normalized = normalizeHex(hex);
  if (!normalized) return `rgba(158, 158, 158, ${alpha})`;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// ✅ جدید: رنگ بر اساس نوع آبیاری
export const IRRIGATION_TYPE_STYLES = {
  'آبی': {
    color: '#2196F3',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
  },
  'دیم': {
    color: '#FF9800',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
};

export const getIrrigationStyle = (type) =>
  IRRIGATION_TYPE_STYLES[type] || IRRIGATION_TYPE_STYLES['آبی'];