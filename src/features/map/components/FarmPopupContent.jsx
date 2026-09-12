// src/features/map/components/FarmPopupContent.jsx
import React from 'react';
import { Edit2, X, MapPin, Droplet, Wheat, User, Pencil } from 'lucide-react';

const FarmPopupContent = ({
  farm,
  onEdit,
  onEditGeometry,
  onClose,
}) => {
  if (!farm) {
    return (
      <div className="p-3 text-center" dir="rtl">
        <span className="text-red-600 text-sm">
          ❌ اطلاعات مزرعه موجود نیست
        </span>
      </div>
    );
  }

  const farmId = farm.farm_id || '---';
  const area = typeof farm.area_ha === 'number' ? farm.area_ha : 0;
  const farmerName = farm.farmer_name || 'بدون نام';
  const crop = farm.crop || 'نامشخص';
  const irrigationSystem = farm.irrigation_system || 'نامشخص';
  const village = farm.village || 'نامشخص';
  const dehestan = farm.dehestan || 'نامشخص';

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

  return (
    <div
      className="relative p-3.5 min-w-[220px] max-w-[280px] font-vazir bg-white"
      dir="rtl"
    >
      {/* Close Button */}
      <button
        type="button"
        onClick={handleCloseClick}
        className="absolute top-1 left-1 p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        aria-label="بستن"
      >
        <X size={14} />
      </button>

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
          label="شناسه"
          value={farmId}
          valueClass="text-gray-900"
        />

        <InfoRow
          icon={MapPin}
          label="مساحت"
          value={`${area.toFixed(2)} هکتار`}
          valueClass="text-primary-700"
        />

        <InfoRow
          icon={Wheat}
          label="محصول"
          value={crop}
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