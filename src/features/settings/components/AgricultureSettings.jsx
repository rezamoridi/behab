// src/features/settings/components/AgricultureSettings.jsx
import { useState } from 'react';
import {
  Settings2,
  Palette,
  Sparkles,
  Info,
  MapPin,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// تبدیل settings به formData
// ═══════════════════════════════════════════════════════════
const settingsToForm = (settings) => ({
  default_area_unit: settings?.default_area_unit || 'hectare',
  default_water_unit: settings?.default_water_unit || 'cubic_meter',
  default_map_center_lat: settings?.default_map_center_lat || 35.6892,
  default_map_center_lng: settings?.default_map_center_lng || 51.389,
  default_map_zoom: settings?.default_map_zoom || 6,
  default_map_layer: settings?.default_map_layer || 'osm',
  show_saved_farms:
    settings?.show_saved_farms !== undefined
      ? settings.show_saved_farms
      : true,

  // لایهٔ مرجع
  reference_layer_color:
    settings?.reference_layer_color || '#9E9E9E',
  reference_layer_stroke_weight:
    settings?.reference_layer_stroke_weight ?? 2,
  reference_layer_stroke_style:
    settings?.reference_layer_stroke_style || 'solid',
  reference_layer_fill_opacity:
    settings?.reference_layer_fill_opacity ?? 0.08,
  reference_layer_simplify_tolerance:
    settings?.reference_layer_simplify_tolerance ?? 0,

  // ✅ فاز ۵: لایهٔ روستا
  village_layer_color:
    settings?.village_layer_color || '#10B981',
  village_layer_stroke_weight:
    settings?.village_layer_stroke_weight ?? 2,
  village_layer_stroke_style:
    settings?.village_layer_stroke_style || 'dashed',
  village_layer_fill_opacity:
    settings?.village_layer_fill_opacity ?? 0.06,
});

const LINE_STYLE_OPTIONS = [
  { value: 'solid', label: 'ممتد', dashArray: undefined },
  { value: 'dashed', label: 'تیره', dashArray: '10, 6' },
  { value: 'dotted', label: 'نقطه‌ای', dashArray: '2, 6' },
  { value: 'dashdot', label: 'تیره-نقطه', dashArray: '12, 6, 2, 6' },
  { value: 'longdash', label: 'تیره بلند', dashArray: '20, 8' },
];

const getDashArray = (styleName) => {
  const opt = LINE_STYLE_OPTIONS.find((o) => o.value === styleName);
  return opt?.dashArray ?? undefined;
};

// ═══════════════════════════════════════════════════════════
// SimplifyHint
// ═══════════════════════════════════════════════════════════
const SimplifyHint = ({ tolerance }) => {
  const t = Number(tolerance) || 0;

  if (t === 0) {
    return (
      <div className="flex items-start gap-2 p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-[11px] text-blue-800 leading-relaxed">
        <Info
          size={12}
          className="text-blue-600 flex-shrink-0 mt-0.5"
        />
        <div>
          <strong>بدون ساده‌سازی</strong> — هندسهٔ دقیق مزارع
          دیگران نمایش داده می‌شود.
        </div>
      </div>
    );
  }

  if (t <= 2) {
    return (
      <div className="flex items-start gap-2 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-[11px] text-emerald-800 leading-relaxed">
        <Sparkles
          size={12}
          className="text-emerald-600 flex-shrink-0 mt-0.5"
        />
        <div>
          <strong>ساده‌سازی سبک ({t} متر)</strong> — توصیه می‌شود.
        </div>
      </div>
    );
  }

  if (t <= 10) {
    return (
      <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-[11px] text-amber-800 leading-relaxed">
        <Sparkles
          size={12}
          className="text-amber-600 flex-shrink-0 mt-0.5"
        />
        <div>
          <strong>ساده‌سازی متوسط ({t} متر)</strong> — موقعیت دقیق
          کمتر افشا می‌شود.
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-100 rounded-lg text-[11px] text-red-800 leading-relaxed">
      <Sparkles
        size={12}
        className="text-red-600 flex-shrink-0 mt-0.5"
      />
      <div>
        <strong>ساده‌سازی شدید ({t} متر)</strong> — شکل ممکن است
        تغییر کند.
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════
const AgricultureSettings = ({
  settings,
  onUpdateSettings,
  isLoading,
}) => {
  const [formData, setFormData] = useState(() =>
    settingsToForm(settings),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
            ? Number(value)
            : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdateSettings(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const unitOptions = {
    area: [
      { value: 'hectare', label: 'هکتار' },
      { value: 'sqm', label: 'متر مربع' },
      { value: 'jarib', label: 'جریب' },
    ],
    water: [
      { value: 'cubic_meter', label: 'متر مکعب' },
      { value: 'liter', label: 'لیتر' },
    ],
    mapLayer: [
      { value: 'osm', label: 'OpenStreetMap' },
      { value: 'satellite', label: 'تصاویر ماهواره‌ای' },
      { value: 'terrain', label: 'نقشه توپوگرافی' },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5"
      >
        {/* Header */}
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Settings2 size={18} className="text-primary-600" />
          <h3 className="text-base font-semibold text-gray-900">
            تنظیمات عمومی کشاورزی
          </h3>
        </div>

        {/* Units */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            واحدهای پیش‌فرض
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                واحد مساحت
              </label>
              <select
                name="default_area_unit"
                value={formData.default_area_unit}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              >
                {unitOptions.area.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                واحد مصرف آب
              </label>
              <select
                name="default_water_unit"
                value={formData.default_water_unit}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              >
                {unitOptions.water.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Map Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            تنظیمات پیش‌فرض نقشه
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                لایه پایه نقشه
              </label>
              <select
                name="default_map_layer"
                value={formData.default_map_layer}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              >
                {unitOptions.mapLayer.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                میزان بزرگ‌نمایی پیش‌فرض
              </label>
              <input
                type="number"
                name="default_map_zoom"
                min="1"
                max="22"
                value={formData.default_map_zoom}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                عرض جغرافیایی مرکز
              </label>
              <input
                type="number"
                step="0.0001"
                name="default_map_center_lat"
                value={formData.default_map_center_lat}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                style={{ direction: 'ltr' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                طول جغرافیایی مرکز
              </label>
              <input
                type="number"
                step="0.0001"
                name="default_map_center_lng"
                value={formData.default_map_center_lng}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                style={{ direction: 'ltr' }}
              />
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            name="show_saved_farms"
            checked={formData.show_saved_farms}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">
            نمایش لایه مزارع ثبت‌شده به صورت پیش‌فرض
          </span>
        </label>

        {/* Reference Layer */}
        <div className="pt-5 border-t-2 border-dashed border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Palette size={18} className="text-gray-600" />
            <h4 className="text-sm font-semibold text-gray-800">
              ظاهر لایهٔ مرجع (مزارع دیگران)
            </h4>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 leading-relaxed mb-4">
            💡 این تنظیمات روی <strong>کل وب‌اپ</strong> اعمال می‌شود.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                رنگ لایه
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="reference_layer_color"
                  value={formData.reference_layer_color}
                  onChange={handleChange}
                  className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  name="reference_layer_color"
                  value={formData.reference_layer_color}
                  onChange={handleChange}
                  placeholder="#9E9E9E"
                  maxLength={7}
                  className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm font-mono"
                  style={{ direction: 'ltr' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                نوع خط
              </label>
              <select
                name="reference_layer_stroke_style"
                value={formData.reference_layer_stroke_style}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              >
                {LINE_STYLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                ضخامت خط (پیکسل)
              </label>
              <input
                type="number"
                name="reference_layer_stroke_weight"
                min="0.5"
                max="10"
                step="0.5"
                value={formData.reference_layer_stroke_weight}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                style={{ direction: 'ltr' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                شفافیت داخل (۰ تا ۱)
              </label>
              <input
                type="number"
                name="reference_layer_fill_opacity"
                min="0"
                max="1"
                step="0.01"
                value={formData.reference_layer_fill_opacity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                style={{ direction: 'ltr' }}
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-[10px] font-medium text-gray-500 mb-2">
              پیش‌نمایش:
            </div>
            <svg
              viewBox="0 0 200 80"
              className="w-full h-20 bg-white rounded-md border border-gray-100"
              style={{ direction: 'ltr' }}
            >
              <polygon
                points="40,15 140,10 180,35 160,65 100,72 30,60 20,30"
                fill={formData.reference_layer_color}
                fillOpacity={formData.reference_layer_fill_opacity}
                stroke={formData.reference_layer_color}
                strokeWidth={formData.reference_layer_stroke_weight}
                strokeDasharray={getDashArray(
                  formData.reference_layer_stroke_style,
                )}
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Simplify Tolerance */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-purple-600" />
              <h4 className="text-sm font-semibold text-gray-800">
                ساده‌سازی هندسهٔ لایهٔ مرجع
              </h4>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                آستانهٔ ساده‌سازی (متر)
              </label>
              <input
                type="number"
                name="reference_layer_simplify_tolerance"
                min="0"
                max="100"
                step="0.5"
                value={
                  formData.reference_layer_simplify_tolerance
                }
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                style={{ direction: 'ltr' }}
              />
            </div>

            <div className="mt-3">
              <SimplifyHint
                tolerance={
                  formData.reference_layer_simplify_tolerance
                }
              />
            </div>
          </div>
        </div>

        {/* ✅ فاز ۵: Village Layer */}
        <div className="pt-5 border-t-2 border-dashed border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={18} className="text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-800">
              ظاهر لایهٔ روستاها
            </h4>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 leading-relaxed mb-4">
            💡 این تنظیمات برای نمایش محدودهٔ روستاها روی نقشه
            است. رنگ پیش‌فرض سبز است تا از رنگ مناطق (بنفش)
            متمایز باشد.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Color */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                رنگ لایه
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="village_layer_color"
                  value={formData.village_layer_color}
                  onChange={handleChange}
                  className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  name="village_layer_color"
                  value={formData.village_layer_color}
                  onChange={handleChange}
                  placeholder="#10B981"
                  maxLength={7}
                  className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm font-mono"
                  style={{ direction: 'ltr' }}
                />
              </div>
            </div>

            {/* Line Style */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                نوع خط
              </label>
              <select
                name="village_layer_stroke_style"
                value={formData.village_layer_stroke_style}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              >
                {LINE_STYLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Stroke Weight */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                ضخامت خط (پیکسل)
              </label>
              <input
                type="number"
                name="village_layer_stroke_weight"
                min="0.5"
                max="10"
                step="0.5"
                value={formData.village_layer_stroke_weight}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                style={{ direction: 'ltr' }}
              />
            </div>

            {/* Fill Opacity */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                شفافیت داخل (۰ تا ۱)
              </label>
              <input
                type="number"
                name="village_layer_fill_opacity"
                min="0"
                max="1"
                step="0.01"
                value={formData.village_layer_fill_opacity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                style={{ direction: 'ltr' }}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-[10px] font-medium text-gray-500 mb-2">
              پیش‌نمایش:
            </div>
            <svg
              viewBox="0 0 200 80"
              className="w-full h-20 bg-white rounded-md border border-gray-100"
              style={{ direction: 'ltr' }}
            >
              <polygon
                points="40,15 140,10 180,35 160,65 100,72 30,60 20,30"
                fill={formData.village_layer_color}
                fillOpacity={formData.village_layer_fill_opacity}
                stroke={formData.village_layer_color}
                strokeWidth={formData.village_layer_stroke_weight}
                strokeDasharray={getDashArray(
                  formData.village_layer_stroke_style,
                )}
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="
              px-6 py-2.5 bg-primary-600 text-white rounded-lg
              text-sm font-semibold
              hover:bg-primary-700 transition-colors
              disabled:opacity-50 disabled:cursor-wait
            "
          >
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgricultureSettings;