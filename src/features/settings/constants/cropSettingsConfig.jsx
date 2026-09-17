// src/features/settings/constants/cropSettingsConfig.jsx
import {
  Sprout,
  Droplet,
  FlaskConical,
  Bug,
  Wallet,
  CircleCheck,
  CircleSlash,
  Power,
  Pencil,
  Leaf,
  Trash2,
} from "lucide-react";

// ============================================================
// ✅ Metric Config
// ============================================================
export const METRICS = [
  {
    key: "requirement",
    label: "آب",
    unit: "m³/ha",
    icon: Droplet,
    color: "text-sky-600 bg-sky-50",
  },
  {
    key: "fertilizer",
    label: "کود",
    unit: "kg/ha",
    icon: FlaskConical,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    key: "pesticide",
    label: "سم",
    unit: "L/ha",
    icon: Bug,
    color: "text-amber-600 bg-amber-50",
  },
  {
    key: "price",
    label: "قیمت",
    unit: "تومان",
    icon: Wallet,
    color: "text-violet-600 bg-violet-50",
  },
];

// ============================================================
// ✅ Grid Template
// ============================================================
export const GRID_CLASS = `
  grid items-center gap-3
  grid-cols-[1fr_88px_88px_88px_88px_140px]
`;

// ============================================================
// ✅ Status Config
// ============================================================
export const STATUS_CONFIG = {
  active: {
    label: "تعریف شده",
    icon: CircleCheck,
    className:
      "bg-primary-50 text-primary-700 border border-primary-200",
  },
  missingRate: {
    label: "بدون نرخ",
    icon: CircleSlash,
    className:
      "bg-amber-50 text-amber-700 border border-amber-200",
  },
  inactive: {
    label: "غیرفعال",
    icon: CircleSlash,
    className: "bg-gray-100 text-gray-500",
  },
};

// ============================================================
// ✅ Action Config
// ============================================================
export const ACTION_CONFIG = {
  edit: {
    icon: Pencil,
    color: "text-sky-600 hover:bg-sky-50",
    title: "ویرایش نرخ‌ها",
    legend: "ویرایش نرخ‌ها",
    legendBg: "bg-sky-50 text-sky-600",
  },
  rename: {
    icon: Leaf,
    color: "text-gray-500 hover:bg-gray-100",
    title: "تغییر نام",
    legend: "تغییر نام",
    legendBg: "bg-gray-100 text-gray-500",
  },
  toggle: {
    icon: Power,
    color: "text-green-600 hover:bg-green-50",
    title: "فعال / غیرفعال",
    legend: "فعال / غیرفعال",
    legendBg: "bg-green-50 text-green-600",
  },
  delete: {
    icon: Trash2,
    color: "text-red-500 hover:bg-red-50",
    title: "حذف محصول",
    legend: "حذف محصول",
    legendBg: "bg-red-50 text-red-500",
  },
};

// ============================================================
// ✅ Stats Config
// ============================================================
export const STATS_CONFIG = [
  {
    key: "total",
    label: "کل",
    icon: Sprout,
    color: "text-gray-700 bg-gray-100",
  },
  {
    key: "active",
    label: "فعال",
    icon: Power,
    color: "text-green-700 bg-green-50",
  },
  {
    key: "withoutRate",
    label: "بدون نرخ",
    icon: CircleSlash,
    getColor: (value) =>
      value > 0 ? "text-amber-700 bg-amber-50" : "text-gray-400 bg-gray-50",
  },
];