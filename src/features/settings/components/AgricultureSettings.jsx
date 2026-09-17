// src/features/settings/components/AgricultureSettings.jsx
import { useState } from 'react';
import { Settings2 } from 'lucide-react';

// ============================================================
// تبدیل settings به formData
// این تابع pure است و می‌تواند در initializer یا render استفاده شود
// ============================================================
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
});


const AgricultureSettings = ({
  settings,
  onUpdateSettings,
  isLoading,
}) => {
  // ✅ initializer function — فقط یک بار در mount از settings می‌خواند
  // برای reset شدن با تغییر settings، والد باید key بدهد:
  //   <AgricultureSettings key={settings?.id || 'new'} ... />
  const [formData, setFormData] = useState(() => settingsToForm(settings));

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

        {/* Checkbox */}
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="
            px-6 py-2.5 bg-primary-600 text-white rounded-lg
            text-sm font-semibold
            hover:bg-primary-700 transition-colors
            disabled:opacity-50
          "
        >
          {isSubmitting ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
        </button>
      </form>
    </div>
  );
};

export default AgricultureSettings;