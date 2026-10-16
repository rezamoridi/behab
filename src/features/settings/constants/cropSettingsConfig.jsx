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
  Wheat,
  TrendingUp,
  Atom,
  FlaskRound,
  Gem,
  Tractor,
  Shovel,
  Sprout as SproutIcon,
  SprayCan,
  Package,
  Combine,
  CloudRain,
  Sun,
} from "lucide-react";

// ============================================================
// ✅ Metric Config — فاز ۶
// ============================================================
// گروه ۱: نیازهای زراعی (نمایش در جدول)
export const METRICS = [
  {
    key: "requirement",
    label: "آب",
    unit: "m³/ha",
    icon: Droplet,
    color: "text-sky-600 bg-sky-50",
    section: "agronomy",
  },
  {
    key: "nitrogen",
    label: "ازت",
    unit: "kg/ha",
    icon: Atom,
    color: "text-emerald-600 bg-emerald-50",
    section: "agronomy",
  },
  {
    key: "phosphate",
    label: "فسفات",
    unit: "kg/ha",
    icon: FlaskRound,
    color: "text-teal-600 bg-teal-50",
    section: "agronomy",
  },
  {
    key: "potassium",
    label: "پتاسیم",
    unit: "kg/ha",
    icon: Gem,
    color: "text-cyan-600 bg-cyan-50",
    section: "agronomy",
  },
  {
    key: "seed_rate",
    label: "بذر",
    unit: "kg/ha",
    icon: Wheat,
    color: "text-amber-600 bg-amber-50",
    section: "agronomy",
  },
  {
    key: "crop_yield",
    label: "عملکرد",
    unit: "ton/ha",
    icon: TrendingUp,
    color: "text-lime-600 bg-lime-50",
    section: "agronomy",
  },
  {
    key: "price",
    label: "قیمت",
    unit: "تومان",
    icon: Wallet,
    color: "text-violet-600 bg-violet-50",
    section: "economic",
  },
];

// ✅ گروه‌بندی فیلدهای فرم (برای EditModal)
export const FORM_SECTIONS = [
  {
    id: "basic",
    title: "اطلاعات پایه",
    icon: Sprout,
    fields: [
      { key: "name", type: "text", label: "نام محصول", required: true },
      {
        key: "irrigation_type",
        type: "radio",
        label: "نوع آبیاری",
        options: [
          { value: "آبی", label: "آبی", icon: Droplet },
          { value: "دیم", label: "دیم", icon: CloudRain },
        ],
      },
      { key: "color", type: "color", label: "رنگ لایه" },
    ],
  },
  {
    id: "agronomy",
    title: "نیازهای زراعی",
    icon: Leaf,
    fields: [
      {
        key: "requirement",
        type: "number",
        label: "آب",
        unit: "m³/ha",
        icon: Droplet,
        color: "text-sky-600 bg-sky-50",
      },
      {
        key: "nitrogen",
        type: "number",
        label: "ازت",
        unit: "kg/ha",
        icon: Atom,
        color: "text-emerald-600 bg-emerald-50",
      },
      {
        key: "phosphate",
        type: "number",
        label: "فسفات",
        unit: "kg/ha",
        icon: FlaskRound,
        color: "text-teal-600 bg-teal-50",
      },
      {
        key: "potassium",
        type: "number",
        label: "پتاسیم",
        unit: "kg/ha",
        icon: Gem,
        color: "text-cyan-600 bg-cyan-50",
      },
      {
        key: "seed_rate",
        type: "number",
        label: "بذر",
        unit: "kg/ha",
        icon: Wheat,
        color: "text-amber-600 bg-amber-50",
      },
      {
        key: "crop_yield",
        type: "number",
        label: "عملکرد",
        unit: "ton/ha",
        icon: TrendingUp,
        color: "text-lime-600 bg-lime-50",
      },
    ],
  },
  {
    id: "economic",
    title: "اقتصادی",
    icon: Wallet,
    fields: [
      {
        key: "price",
        type: "number",
        label: "قیمت",
        unit: "تومان",
        icon: Wallet,
        color: "text-violet-600 bg-violet-50",
      },
    ],
  },
  {
    id: "machinery",
    title: "ماشین‌آلات",
    icon: Tractor,
    hint: "ساعت در هکتار (hours/ha)",
    fields: [
      {
        key: "machinery_primary_tillage",
        type: "number",
        label: "خاکورزی اولیه",
        unit: "h/ha",
        icon: Tractor,
        color: "text-orange-600 bg-orange-50",
      },
      {
        key: "machinery_secondary_tillage",
        type: "number",
        label: "خاکورزی ثانویه",
        unit: "h/ha",
        icon: Shovel,
        color: "text-orange-600 bg-orange-50",
      },
      {
        key: "machinery_planting",
        type: "number",
        label: "کاشت",
        unit: "h/ha",
        icon: SproutIcon,
        color: "text-green-600 bg-green-50",
      },
      {
        key: "machinery_spraying",
        type: "number",
        label: "سم‌پاشی",
        unit: "h/ha",
        icon: SprayCan,
        color: "text-amber-600 bg-amber-50",
      },
      {
        key: "machinery_fertilizing",
        type: "number",
        label: "کوددهی",
        unit: "h/ha",
        icon: Package,
        color: "text-emerald-600 bg-emerald-50",
      },
      {
        key: "machinery_harvesting",
        type: "number",
        label: "برداشت",
        unit: "h/ha",
        icon: Combine,
        color: "text-lime-600 bg-lime-50",
      },
    ],
  },
];

// ============================================================
// ✅ Grid Template — پهن‌تر شد چون ستون‌ها زیاد شدند
// ============================================================
export const GRID_CLASS = `
  grid items-center gap-2
  grid-cols-[1.2fr_repeat(6,72px)_96px_140px]
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
    title: "ویرایش محصول",
    legend: "ویرایش محصول",
    legendBg: "bg-sky-50 text-sky-600",
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