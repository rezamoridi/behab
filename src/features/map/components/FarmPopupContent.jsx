// src/features/map/components/FarmPopupContent.jsx
import React, { useState } from "react";
import {
  Edit2,
  X,
  MapPin,
  Droplet,
  Wheat,
  User,
  Pencil,
  Trash2,
  CreditCard,
} from "lucide-react";
import {
  DEFAULT_FARM_COLOR,
  normalizeHex,
} from "../../settings/constants/cropColors";

// ============================================================
// InfoRow
// ============================================================
const InfoRow = ({ icon: Icon, label, value, valueClass = "" }) => (
  <div className="flex items-center justify-between gap-2 text-xs">
    <span className="flex items-center gap-1 text-gray-700 font-medium">
      <Icon size={11} />
      {label}:
    </span>
    <span className={`font-semibold text-gray-900 ${valueClass}`}>{value}</span>
  </div>
);

// ============================================================
// FarmPopupContent
// ============================================================
const FarmPopupContent = ({
  farm,
  farmer = null,
  onEdit,
  onEditGeometry,
  onClose,
  onDelete,
}) => {
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

  const area = typeof farm.area_ha === "number" ? farm.area_ha : 0;
  const crop = farm.crop || "نامشخص";
  const irrigationSystem = farm.irrigation_system || "نامشخص";
  const village = farm.village || "نامشخص";
  const dehestan = farm.dehestan || "نامشخص";

  // ✅ نام و فامیل کشاورز
  const fullName =
    farmer && (farmer.fname || farmer.lname)
      ? `${farmer.fname || ""} ${farmer.lname || ""}`.trim()
      : "بدون نام";

  const phone = farmer?.phone_number || null;
  const nationalId = farmer?.national_id || null;

  const cropColor = normalizeHex(farm.crop_color) || DEFAULT_FARM_COLOR;

  const handleEditClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof onEdit === "function") onEdit();
  };

  const handleEditGeometryClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof onEditGeometry === "function") onEditGeometry();
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof onClose === "function") onClose();
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (typeof onDelete !== "function" || isDeleting) return;

    const confirmed = window.confirm(
      `آیا از حذف مزرعه «${fullName}» اطمینان دارید؟\nاین عمل قابل بازگشت نیست.`,
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
      className="
        relative p-3.5 min-w-[240px] max-w-[300px] font-vazir
        rounded-2xl overflow-hidden
        bg-white/25 backdrop-blur-xl
        border border-white/50
        shadow-[0_8px_32px_rgba(31,38,135,0.15),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(255,255,255,0.3)]
      "
      dir="rtl"
    >
      {/* گرادیانت نامحسوس شیشه‌ای */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.02) 100%)",
        }}
        aria-hidden="true"
      />

      {/* درخشش بالا */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent"
        aria-hidden="true"
      />

      {/* محتوا */}
      <div className="relative z-10">
        {/* دکمه‌های گوشه */}
        <div className="absolute top-0 left-0 flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="
              p-1 rounded-md text-red-500
              hover:bg-red-50/70 hover:text-red-700
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
            className="p-1 rounded-md text-gray-600 hover:bg-white/50 hover:text-gray-800 transition-colors"
            aria-label="بستن"
          >
            <X size={14} />
          </button>
        </div>

        {/* هدر: نام و فامیل */}
        <div className="flex items-center gap-2 mb-2.5 pr-1">
          <div className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm border border-white/80 flex items-center justify-center flex-shrink-0 shadow-sm">
            <User size={14} className="text-primary-700" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm text-gray-900 drop-shadow-sm truncate">
              {fullName}
            </h4>
            {phone && (
              <div
                className="text-[10px] text-gray-800 font-medium mt-0.5"
                style={{ direction: "ltr", textAlign: "right" }}
              >
                {phone}
              </div>
            )}
          </div>
        </div>

        {/* اطلاعات */}
        <div className="flex flex-col gap-1.5">
          {nationalId && (
            <InfoRow
              icon={CreditCard}
              label="کد ملی"
              value={nationalId}
              valueClass="text-gray-900 font-mono text-[11px] font-semibold"
            />
          )}

          <InfoRow
            icon={MapPin}
            label="مساحت"
            value={`${area.toFixed(2)} هکتار`}
            valueClass="text-primary-700 font-bold"
          />

          <InfoRow
            icon={Wheat}
            label="محصول"
            value={
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full border border-white/70 shadow-sm"
                  style={{ backgroundColor: cropColor }}
                />
                <span>{crop}</span>
              </span>
            }
            valueClass="text-gray-900 font-bold"
          />

          <InfoRow
            icon={Droplet}
            label="آبیاری"
            value={irrigationSystem}
            valueClass="text-gray-900 font-bold"
          />

          <InfoRow
            icon={MapPin}
            label="روستا"
            value={village}
            valueClass="text-gray-900 font-bold"
          />

          <InfoRow
            icon={MapPin}
            label="دهستان"
            value={dehestan}
            valueClass="text-gray-900 font-bold"
          />
        </div>

        {/* دکمه‌ها */}
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={handleEditClick}
            className="
              flex-1 px-2.5 py-2 bg-primary-600/90 backdrop-blur-sm
              text-white rounded-lg text-xs font-semibold
              border border-white/20 shadow-sm
              hover:bg-primary-700/90 transition-colors
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
              flex-1 px-2.5 py-2 bg-blue-600/90 backdrop-blur-sm
              text-white rounded-lg text-xs font-semibold
              border border-white/20 shadow-sm
              hover:bg-blue-700/90 transition-colors
              flex items-center justify-center gap-1.5
            "
            title="ویرایش لایه روی نقشه"
          >
            <Pencil size={12} />
            ویرایش لایه
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(FarmPopupContent);