// src/features/settings/components/AgricultureSettings.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Settings2, Droplet } from 'lucide-react';

const AgricultureSettings = ({
  settings,
  waterRates,
  onUpdateSettings,
  onAddWaterRate,
  onUpdateWaterRate,
  onDeleteWaterRate,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    default_area_unit: 'hectare',
    default_water_unit: 'cubic_meter',
    default_map_center_lat: 35.6892,
    default_map_center_lng: 51.389,
    default_map_zoom: 6,
    default_map_layer: 'osm',
    show_saved_farms: true,
  });

  const [editingRate, setEditingRate] = useState(null);
  const [rateForm, setRateForm] = useState({
    province: '',
    city: '',
    price_per_cubic_meter: '',
  });
  const [showRateModal, setShowRateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        default_area_unit: settings.default_area_unit || 'hectare',
        default_water_unit: settings.default_water_unit || 'cubic_meter',
        default_map_center_lat: settings.default_map_center_lat || 35.6892,
        default_map_center_lng: settings.default_map_center_lng || 51.389,
        default_map_zoom: settings.default_map_zoom || 6,
        default_map_layer: settings.default_map_layer || 'osm',
        show_saved_farms:
          settings.show_saved_farms !== undefined
            ? settings.show_saved_farms
            : true,
      });
    }
  }, [settings]);

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

  const handleRateChange = (e) => {
    const { name, value } = e.target;
    setRateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRate = async () => {
    if (!rateForm.province || !rateForm.price_per_cubic_meter) return;

    try {
      if (editingRate) {
        await onUpdateWaterRate(editingRate.id, rateForm);
      } else {
        await onAddWaterRate(rateForm);
      }
      setRateForm({ province: '', city: '', price_per_cubic_meter: '' });
      setEditingRate(null);
      setShowRateModal(false);
    } catch {
      // Error handled in hook
    }
  };

  const handleEditRate = (rate) => {
    setEditingRate(rate);
    setRateForm({
      province: rate.province,
      city: rate.city || '',
      price_per_cubic_meter: String(rate.price_per_cubic_meter),
    });
    setShowRateModal(true);
  };

  const handleDeleteRate = async (id) => {
    if (window.confirm('آیا از حذف این نرخ اطمینان دارید؟')) {
      await onDeleteWaterRate(id);
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
      {/* Settings Form */}
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

      {/* Water Rates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Droplet size={18} className="text-primary-600" />
            <h3 className="text-base font-semibold text-gray-900">
              تعرفه‌های آب منطقه‌ای
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingRate(null);
              setRateForm({
                province: '',
                city: '',
                price_per_cubic_meter: '',
              });
              setShowRateModal(true);
            }}
            className="
              px-4 py-2 bg-primary-600 text-white rounded-lg
              text-xs font-semibold flex items-center gap-1.5
              hover:bg-primary-700 transition-colors
            "
          >
            <Plus size={14} />
            افزودن تعرفه
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-right px-4 py-3 font-semibold text-gray-600 rounded-r-lg">
                  استان
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">
                  شهرستان / منطقه
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">
                  قیمت هر متر مکعب (تومان)
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 rounded-l-lg">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {waterRates && waterRates.length > 0 ? (
                waterRates.map((rate) => (
                  <tr
                    key={rate.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{rate.province}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {rate.city || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {rate.price_per_cubic_meter.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditRate(rate)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="ویرایش"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRate(rate.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-8 text-gray-400 text-sm"
                  >
                    هیچ تعرفه‌ای ثبت نشده است
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rate Modal */}
      {showRateModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">
                {editingRate ? 'ویرایش تعرفه' : 'افزودن تعرفه جدید'}
              </h4>
              <button
                type="button"
                onClick={() => setShowRateModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  استان
                </label>
                <input
                  type="text"
                  name="province"
                  value={rateForm.province}
                  onChange={handleRateChange}
                  placeholder="مثال: لرستان"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  شهرستان / منطقه (اختیاری)
                </label>
                <input
                  type="text"
                  name="city"
                  value={rateForm.city}
                  onChange={handleRateChange}
                  placeholder="مثال: خرم‌آباد"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  قیمت هر متر مکعب (تومان)
                </label>
                <input
                  type="number"
                  name="price_per_cubic_meter"
                  min="0"
                  step="100"
                  value={rateForm.price_per_cubic_meter}
                  onChange={handleRateChange}
                  placeholder="مثال: 5000"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                  style={{ direction: 'ltr' }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowRateModal(false)}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleAddRate}
                disabled={
                  !rateForm.province || !rateForm.price_per_cubic_meter
                }
                className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {editingRate ? 'ویرایش' : 'افزودن'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgricultureSettings;