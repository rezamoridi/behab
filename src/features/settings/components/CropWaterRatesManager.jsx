// src/features/settings/components/CropWaterRatesManager.jsx
import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, X, Search, Wheat } from 'lucide-react';

// لیست محصولات پیش‌فرض
const DEFAULT_CROPS = [
  'گندم',
  'جو',
  'ذرت',
  'پیاز',
  'عدس',
  'چغندرقند',
  'ذرت دانه ای',
  'آفتابگردان',
  'کلزا',
  'یونجه',
  'کاملینا',
  'هندوانه',
  'ذرت سیلویی',
  'نخود',
  'لوبیا',
  'سیب زمینی',
  'گوجه فرنگی',
  'خربزه',
  'برنج',
  'سبزیجات',
  'پسته',
  'زعفران',
  'کنجد',
  'پنبه',
];

const DEFAULT_REQUIREMENTS = {
  گندم: 5000,
  جو: 4000,
  ذرت: 6000,
  پیاز: 7000,
  عدس: 3500,
  چغندرقند: 8000,
  'ذرت دانه ای': 5500,
  آفتابگردان: 4500,
  کلزا: 4000,
  یونجه: 7000,
  کاملینا: 3000,
  هندوانه: 6000,
  'ذرت سیلویی': 5500,
  نخود: 3500,
  لوبیا: 4000,
  'سیب زمینی': 6000,
  'گوجه فرنگی': 7000,
  خربزه: 5000,
  برنج: 10000,
  سبزیجات: 5000,
  پسته: 8000,
  زعفران: 4000,
  کنجد: 3500,
  پنبه: 6000,
};

const CropWaterRatesManager = ({
  cropWaterRates = [],
  onUpdateCropRate,
  onAddCropRate,
  onDeleteCropRate,
  isLoading,
}) => {
  const [editingCrop, setEditingCrop] = useState(null);
  const [rateForm, setRateForm] = useState({
    crop: '',
    requirement: '',
    price: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const ratesMap = useMemo(() => {
    const map = {};
    cropWaterRates.forEach((rate) => {
      map[rate.crop] = rate;
    });
    return map;
  }, [cropWaterRates]);

  const displayedRates = useMemo(() => {
    const allCrops = new Set([
      ...DEFAULT_CROPS,
      ...cropWaterRates.map((r) => r.crop),
    ]);

    const list = Array.from(allCrops).map((crop) => {
      const existing = ratesMap[crop];
      return {
        crop,
        requirement: existing?.requirement ?? DEFAULT_REQUIREMENTS[crop] ?? 0,
        price: existing?.price ?? 0,
        isCustom: !DEFAULT_CROPS.includes(crop),
        exists: !!existing,
      };
    });

    return searchTerm
      ? list.filter((item) => item.crop.includes(searchTerm))
      : list;
  }, [cropWaterRates, ratesMap, searchTerm]);

  const handleEdit = (crop) => {
    const rate = ratesMap[crop] || {
      crop,
      requirement: DEFAULT_REQUIREMENTS[crop] || 0,
      price: 0,
    };
    setEditingCrop(crop);
    setRateForm({
      crop: rate.crop,
      requirement: String(rate.requirement),
      price: String(rate.price),
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingCrop(null);
    setRateForm({ crop: '', requirement: '', price: '' });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { crop, requirement, price } = rateForm;
    if (!crop.trim() || !requirement || parseFloat(requirement) < 0) {
      alert('لطفاً نام محصول و نیاز آبی معتبر وارد کنید.');
      return;
    }

    const data = {
      crop: crop.trim(),
      requirement: parseFloat(requirement),
      price: parseFloat(price) || 0,
    };

    try {
      if (editingCrop) {
        await onUpdateCropRate(editingCrop, data);
      } else {
        await onAddCropRate(data);
      }
      setShowModal(false);
      setRateForm({ crop: '', requirement: '', price: '' });
      setEditingCrop(null);
    } catch {
      // handled in hook
    }
  };

  const handleDelete = async (crop) => {
    if (
      window.confirm(`آیا از حذف نرخ آب محصول "${crop}" اطمینان دارید؟`)
    ) {
      await onDeleteCropRate(crop);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Wheat size={18} className="text-primary-600" />
          <h3 className="text-base font-semibold text-gray-900">
            نرخ آب محصولات
          </h3>
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="جستجوی محصول..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-56 pr-9 pl-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
            />
          </div>
          <button
            type="button"
            onClick={handleAddNew}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary-700 transition-colors whitespace-nowrap"
          >
            <Plus size={14} />
            افزودن محصول
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-right px-4 py-3 font-semibold text-gray-600 rounded-r-lg">
                نام محصول
              </th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">
                نیاز آبی (m³/ha)
              </th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">
                قیمت هر m³ (تومان)
              </th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">
                وضعیت
              </th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 rounded-l-lg">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedRates.length > 0 ? (
              displayedRates.map((item) => (
                <tr
                  key={item.crop}
                  className={`
                    border-b border-gray-100 last:border-0
                    ${item.isCustom ? 'bg-orange-50/50' : 'hover:bg-gray-50'}
                  `}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{item.crop}</span>
                      {item.isCustom && (
                        <span className="text-[10px] px-2 py-0.5 bg-orange-500 text-white rounded-full font-medium">
                          سفارشی
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {item.requirement.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{item.price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`
                        inline-block px-2.5 py-1 rounded-full text-[11px] font-medium
                        ${
                          item.exists
                            ? 'bg-primary-50 text-primary-700'
                            : 'bg-gray-100 text-gray-600 border border-dashed border-gray-300'
                        }
                      `}
                    >
                      {item.exists ? 'ثبت شده' : 'پیش‌فرض'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(item.crop)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="ویرایش"
                      >
                        <Edit2 size={14} />
                      </button>
                      {item.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDelete(item.crop)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-8 text-gray-400 text-sm"
                >
                  محصولی یافت نشد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-100 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-primary-50 border border-primary-200" />
          <span>ثبت شده در دیتابیس</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-gray-100 border border-dashed border-gray-300" />
          <span>پیش‌فرض سیستم</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-orange-100 border border-orange-200" />
          <span>سفارشی</span>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">
                {editingCrop
                  ? `ویرایش نرخ آب "${editingCrop}"`
                  : 'افزودن محصول جدید'}
              </h4>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  نام محصول
                </label>
                <input
                  type="text"
                  name="crop"
                  value={rateForm.crop}
                  onChange={handleChange}
                  placeholder="مثال: گندم"
                  disabled={!!editingCrop}
                  className={`
                    w-full px-3.5 py-2.5 rounded-lg border text-sm
                    focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                    outline-none transition-all
                    ${
                      editingCrop
                        ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                        : 'border-gray-300'
                    }
                  `}
                />
                {editingCrop && (
                  <p className="mt-1 text-xs text-gray-500">
                    نام محصول قابل تغییر نیست
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  نیاز آبی (متر مکعب در هکتار)
                </label>
                <input
                  type="number"
                  name="requirement"
                  min="0"
                  step="100"
                  value={rateForm.requirement}
                  onChange={handleChange}
                  placeholder="مثال: 5000"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                  style={{ direction: 'ltr' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  قیمت هر متر مکعب (تومان)
                </label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="100"
                  value={rateForm.price}
                  onChange={handleChange}
                  placeholder="مثال: 500"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                  style={{ direction: 'ltr' }}
                />
                <p className="mt-1 text-xs text-gray-500">
                  اختیاری - در صورت عدم وارد کردن، صفر در نظر گرفته می‌شود
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!rateForm.crop.trim() || !rateForm.requirement}
                className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {editingCrop ? 'ویرایش' : 'افزودن'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropWaterRatesManager;