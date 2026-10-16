// src/features/agri/constants/inputConfig.jsx
import {
  FlaskConical,
  Bug,
  Sprout,
  CircleSlash,
  Power,
  Pencil,
  Trash2,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// دسته‌های نهاده
// ═══════════════════════════════════════════════════════════
export const INPUT_CATEGORIES = [
  {
    value: 'fertilizer',
    label: 'کود',
    icon: FlaskConical,
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    bg: 'emerald',
  },
  {
    value: 'pesticide',
    label: 'سم',
    icon: Bug,
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    bg: 'amber',
  },
  {
    value: 'seed',
    label: 'بذر',
    icon: Sprout,
    color: 'text-sky-700 bg-sky-50 border-sky-200',
    bg: 'sky',
  },
];

export const getCategoryInfo = (value) =>
  INPUT_CATEGORIES.find((c) => c.value === value) ||
  INPUT_CATEGORIES[0];

// ═══════════════════════════════════════════════════════════
// واحدهای اندازه‌گیری
// ═══════════════════════════════════════════════════════════
export const INPUT_UNITS = [
  { value: 'kg', label: 'کیلوگرم' },
  { value: 'L', label: 'لیتر' },
  { value: 'ton', label: 'تن' },
  { value: 'bag', label: 'کیسه' },
];

export const getUnitLabel = (value) =>
  INPUT_UNITS.find((u) => u.value === value)?.label || value;

// ═══════════════════════════════════════════════════════════
// رنگ‌های پیشنهادی برای نهاده‌ها
// ═══════════════════════════════════════════════════════════
export const INPUT_COLOR_PALETTE = [
  '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFC107', '#FF9800', '#FF5722',
  '#F44336', '#E91E63', '#9C27B0',
  '#673AB7', '#3F51B5', '#2196F3',
  '#03A9F4', '#00BCD4', '#009688',
  '#795548', '#607D8B',
];

// ═══════════════════════════════════════════════════════════
// Status config
// ═══════════════════════════════════════════════════════════
export const INPUT_STATUS_CONFIG = {
  active: {
    label: 'فعال',
    icon: Power,
    className:
      'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  inactive: {
    label: 'غیرفعال',
    icon: CircleSlash,
    className: 'bg-gray-100 text-gray-500',
  },
};

// ═══════════════════════════════════════════════════════════
// Action config
// ═══════════════════════════════════════════════════════════
export const INPUT_ACTION_CONFIG = {
  edit: {
    icon: Pencil,
    color: 'text-sky-600 hover:bg-sky-50',
    title: 'ویرایش نهاده',
  },
  toggle: {
    icon: Power,
    color: 'text-green-600 hover:bg-green-50',
    title: 'فعال / غیرفعال',
  },
  delete: {
    icon: Trash2,
    color: 'text-red-500 hover:bg-red-50',
    title: 'حذف نهاده',
  },
};

// ═══════════════════════════════════════════════════════════
// Grid template
// ═══════════════════════════════════════════════════════════
export const INPUTS_GRID_CLASS = `
  grid items-center gap-3
  grid-cols-[1.5fr_100px_100px_120px_120px_140px]
`;