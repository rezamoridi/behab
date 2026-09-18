// src/features/map/components/FarmPopupContent.jsx
import React, { useState } from 'react';
import {
  Edit2,
  X,
  MapPin,
  Droplet,
  Wheat,
  User,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  DEFAULT_FARM_COLOR,
  normalizeHex,
} from '../../settings/constants/cropColors';

// ============================================================
// ✅ InfoRow — بیرون از کامپوننت اصلی تعریف می‌شود
// ============================================================
const InfoRow = ({ icon: Icon, label, value, valueClass = '' }) => (
  <div className="flex items-center justify-between gap-2 text-xs">
    <span className="flex items-center gap-1 text-gray-400">
      <Icon size={11} />
      {label}:
    </span>
    <span className={`font-medium text-gray-800 ${valueClass}`}>
      {value}
    </span>
  </div>
);

// ============================================================
// FarmPopupContent
// ============================================================
const FarmPopupContent = ({
  farm,
  onEdit,
  onEditGeometry,
  onClose,
  onDelete,
}) => {
  // ✅ state قبل از هر return شرطی
  const [isDeleting, setIsDeleting] = useState(false);

  if (!farm) {
    return (
      <div className="p-3 text-center" dir="rtl">
        <span className="text-red-600 text-sm">
          ❌ اطلاعات مزرعه موجود نیست
        </span>
      </div>
    );
  }

  const area = typeof farm.area_ha === 'number' ? farm.area_ha : 0;
  const farmerName = farm.farmer_name || 'بدون نام';
  const crop = farm.crop || 'نامشخص';
  const irrigationSystem = farm.irrigation_system || 'نامشخص';
  const village = farm.village || 'نامشخص';
  const dehestan = farm.dehestan || 'نامشخص';

  const cropColor = normalizeHex(farm.crop_color) || DEFAULT_FARM_COLOR;

  const handleEditClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof onEdit === 'function') onEdit();
  };

  const handleEditGeometryClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof onEditGeometry === 'function') onEditGeometry();
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof onClose === 'function') onClose();
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (typeof onDelete !== 'function' || isDeleting) return;

    const confirmed = window.confirm(
      `آیا از حذف مزرعه «${farmerName}» اطمینان دارید؟\nاین عمل قابل بازگشت نیست.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(farm);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="relative p-3.5 min-w-[220px] max-w-[280px] font-vazir bg-white"
      dir="rtl"
    >
      {/* ✅ دکمه‌های گوشه — مینیمال */}
      <div className="absolute top-1 left-1 flex items-center gap-0.5">
        <button
          type="button"
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="
            p-1 rounded-md text-gray-300
            hover:bg-red-50 hover:text-red-600
            transition-colors
            disabled:opacity-50 disabled:cursor-wait
          "
          aria-label="حذف مزرعه"
          title="حذف مزرعه"
        >
          {isDeleting ? (
            <span className="block w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
        </button>

        <button
          type="button"
          onClick={handleCloseClick}
          className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="بستن"
        >
          <X size={14} />
        </button>
      </div>

      {/* Farmer Name */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
          <User size={14} className="text-primary-600" />
        </div>
        <h4 className="font-bold text-sm text-gray-900 truncate">
          {farmerName}
        </h4>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1.5">
        <InfoRow
          icon={MapPin}
          label="مساحت"
          value={`${area.toFixed(2)} هکتار`}
          valueClass="text-primary-700"
        />

        <InfoRow
          icon={Wheat}
          label="محصول"
          value={
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full border border-gray-300"
                style={{ backgroundColor: cropColor }}
              />
              <span>{crop}</span>
            </span>
          }
          valueClass="text-gray-900"
        />

        <InfoRow
          icon={Droplet}
          label="آبیاری"
          value={irrigationSystem}
          valueClass="text-gray-900"
        />

        <InfoRow
          icon={MapPin}
          label="روستا"
          value={village}
          valueClass="text-gray-900"
        />

        <InfoRow
          icon={MapPin}
          label="دهستان"
          value={dehestan}
          valueClass="text-gray-900"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={handleEditClick}
          className="
            flex-1 px-2.5 py-2 bg-primary-600 text-white
            rounded-lg text-xs font-semibold
            hover:bg-primary-700 transition-colors
            flex items-center justify-center gap-1.5
          "
          title="ویرایش اطلاعات مزرعه"
        >
          <Edit2 size={12} />
          ویرایش فرم
        </button>

        <button
          type="button"
          onClick={handleEditGeometryClick}
          className="
            flex-1 px-2.5 py-2 bg-blue-600 text-white
            rounded-lg text-xs font-semibold
            hover:bg-blue-700 transition-colors
            flex items-center justify-center gap-1.5
          "
          title="ویرایش لایه روی نقشه"
        >
          <Pencil size={12} />
          ویرایش لایه
        </button>
      </div>
    </div>
  );
};

export default React.memo(FarmPopupContent);