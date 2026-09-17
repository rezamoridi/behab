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
// ✅ Metric Config — منبع حقیقت
// برای اضافه کردن فیلد جدید (مثل «نرخ کارگر») فقط یک آیتم
// به این آرایه اضافه کنید و عرض ستون GRID_CLASS رو یک واحد
// ۸۸px افزایش بدید.
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
// ✅ Grid Template — یکسان بین header و body
// ============================================================
export const GRID_CLASS = `
  grid items-center gap-3
  grid-cols-[1fr_88px_88px_88px_88px_140px]
`;

// ============================================================
// ✅ Status Config — سه وضعیت ممکن برای یک محصول
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
// ✅ Action Config — چهار عملیات هر ردیف
// برای اضافه کردن عملیات جدید (مثل «کپی»)، یک آیتم اینجا
// اضافه کنید و در CropRow یک دکمه رندر کنید.
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
// ✅ Stats Config — کارت‌های آماری بالای صفحه
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

// ============================================================
// ✅ Skeleton Components
// ============================================================
export const StatsBarSkeleton = () => (
  <div className="grid grid-cols-3 gap-2">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 px-3 py-2.5 bg-white rounded-xl border border-gray-100"
      >
        <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="h-2.5 w-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse mt-1.5" />
        </div>
      </div>
    ))}
  </div>
);

export const CropRowSkeleton = () => (
  <div
    className={`${GRID_CLASS} px-4 py-3 border-b border-gray-100 last:border-0`}
  >
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="h-3.5 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>

    {METRICS.map((_, i) => (
      <div key={i} className="flex items-center justify-center">
        <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
      </div>
    ))}

    <div className="flex items-center justify-end gap-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse"
        />
      ))}
    </div>
  </div>
);

export const CropSettingsManagerSkeleton = () => (
  <div className="space-y-4" dir="rtl">
    <StatsBarSkeleton />

    <div className="bg-white rounded-2xl border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-200 animate-pulse" />
          <div>
            <div className="h-3.5 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-2.5 w-40 bg-gray-200 rounded animate-pulse mt-1.5" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-9 w-52 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>

      <div
        className={`${GRID_CLASS} px-4 py-2.5 bg-gray-50/70 border-b border-gray-100`}
      >
        <div className="h-2.5 w-16 bg-gray-200 rounded animate-pulse" />
        {METRICS.map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            <div className="h-2.5 w-10 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
        <div className="flex justify-center">
          <div className="h-2.5 w-10 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {Array.from({ length: 6 }).map((_, i) => (
        <CropRowSkeleton key={i} />
      ))}
    </div>
  </div>
);