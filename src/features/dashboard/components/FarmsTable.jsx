// src/features/dashboard/components/FarmsTable.jsx
import React, { useEffect, useRef } from 'react';
import {
  MapPin,
  Loader2,
  Map as MapIcon,
  Pencil,
  Trash2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import {
  DEFAULT_FARM_COLOR,
  normalizeHex,
} from '../../settings/constants/cropColors';

// ============================================================
// FarmerAvatar — حرف اول نام کشاورز
// ============================================================
const FarmerAvatar = ({ name }) => {
  const initial = (name || '؟').trim().charAt(0);
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center flex-shrink-0 border border-primary-200/50">
      <span className="text-xs font-bold text-primary-700">
        {initial}
      </span>
    </div>
  );
};

// ============================================================
// CropBadge — badge محصول با رنگ
// ============================================================
const CropBadge = ({ crop, color }) => {
  if (!crop) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] border border-amber-200 whitespace-nowrap">
        <AlertCircle size={10} strokeWidth={2.4} />
        بدون محصول
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border whitespace-nowrap"
      style={{
        backgroundColor: `${color}15`,
        borderColor: `${color}40`,
        color: color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {crop}
    </span>
  );
};

// ============================================================
// ActionButton
// ============================================================
const ActionButton = ({
  icon: Icon,
  onClick,
  disabled,
  colorClass,
  title,
  loading = false,
  tabIndex = -1,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    tabIndex={tabIndex}
    className={`
      p-1.5 rounded-md transition-colors
      disabled:opacity-50 disabled:cursor-not-allowed
      ${colorClass}
    `}
    title={title}
    aria-label={title}
  >
    {loading ? (
      <Loader2 size={15} className="animate-spin" />
    ) : (
      <Icon size={15} />
    )}
  </button>
);

// ============================================================
// FarmsTable
// ============================================================
const FarmsTable = ({
  farms = [],
  isLoading = false,
  selectedFarmId = null,
  deletingFarmId = null,
  onRowClick,
  onViewOnMap,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const rowRefsRef = useRef(new Map());

  // ============================================================
  // Keyboard navigation: ↑ ↓ Enter Delete Escape
  // ============================================================
  useEffect(() => {
    if (!farms.length) return undefined;

    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return;
      }

      const currentIndex = farms.findIndex(
        (f) => String(f.farm_id) === String(selectedFarmId)
      );

      // فلش پایین
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex =
          currentIndex < 0
            ? 0
            : Math.min(currentIndex + 1, farms.length - 1);
        onRowClick?.(farms[nextIndex]);
        rowRefsRef.current.get(farms[nextIndex]?.farm_id)?.focus();
        return;
      }

      // فلش بالا
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex =
          currentIndex < 0
            ? 0
            : Math.max(currentIndex - 1, 0);
        onRowClick?.(farms[prevIndex]);
        rowRefsRef.current.get(farms[prevIndex]?.farm_id)?.focus();
        return;
      }

      if (currentIndex < 0) return;

      const currentFarm = farms[currentIndex];

      // Enter → ویرایش
      if (e.key === 'Enter') {
        e.preventDefault();
        onEdit?.(currentFarm);
        return;
      }

      // Delete → حذف
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDelete?.(currentFarm);
        return;
      }

      // Escape → لغو انتخاب
      if (e.key === 'Escape') {
        onRowClick?.(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [farms, selectedFarmId, onRowClick, onEdit, onDelete]);

  // ============================================================
  // Loading
  // ============================================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="text-primary-600 animate-spin" />
      </div>
    );
  }

  // ============================================================
  // Empty state با CTA
  // ============================================================
  if (!farms.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center mb-3">
          <MapPin size={24} />
        </div>
        <p className="text-sm font-medium text-gray-600 mb-1">
          زمینی یافت نشد
        </p>
        <p className="text-xs text-gray-400 mb-4">
          از نقشه، زمین جدید ثبت کنید
        </p>

        {onAddNew && (
          <button
            type="button"
            onClick={onAddNew}
            className="
              inline-flex items-center gap-1.5 px-4 py-2
              bg-primary-600 text-white rounded-lg
              text-xs font-semibold
              hover:bg-primary-700 transition-colors
            "
          >
            <Plus size={14} />
            ثبت زمین جدید
          </button>
        )}
      </div>
    );
  }

  // ============================================================
  // Table
  // ============================================================
  return (
    <div className="w-full">
      <table className="w-full text-sm">
        {/* ✅ Header sticky */}
        <thead className="sticky top-0 z-10 bg-gray-50">
          <tr className="border-b border-gray-200">
            <th className="text-right px-4 py-3 font-semibold text-[11px] text-gray-500 uppercase tracking-wide w-12">
              #
            </th>
            <th className="text-right px-4 py-3 font-semibold text-[11px] text-gray-500 uppercase tracking-wide min-w-[180px]">
              کشاورز
            </th>
            <th className="text-right px-4 py-3 font-semibold text-[11px] text-gray-500 uppercase tracking-wide min-w-[120px]">
              محصول
            </th>
            <th className="text-right px-4 py-3 font-semibold text-[11px] text-gray-500 uppercase tracking-wide w-24">
              مساحت
            </th>
            <th className="text-right px-4 py-3 font-semibold text-[11px] text-gray-500 uppercase tracking-wide min-w-[180px]">
              موقعیت
            </th>
            <th className="text-center px-4 py-3 font-semibold text-[11px] text-gray-500 uppercase tracking-wide w-28 print:hidden">
              عملیات
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {farms.map((farm, index) => {
            const isSelected =
              String(farm.farm_id) === String(selectedFarmId);
            const isDeleting =
              String(farm.farm_id) === String(deletingFarmId);
            const cropColor =
              normalizeHex(farm.crop_color) || DEFAULT_FARM_COLOR;
            const area = Number(farm.area_ha) || 0;

            return (
              <tr
                key={farm.farm_id || index}
                ref={(el) => {
                  if (el) {
                    rowRefsRef.current.set(farm.farm_id, el);
                  } else {
                    rowRefsRef.current.delete(farm.farm_id);
                  }
                }}
                onClick={() => onRowClick?.(farm)}
                tabIndex={0}
                className={`
                  group cursor-pointer outline-none
                  transition-colors duration-150
                  focus:ring-2 focus:ring-primary-500 focus:ring-inset
                  ${
                    isSelected
                      ? 'bg-primary-50/60'
                      : 'hover:bg-gray-50/80'
                  }
                  ${isDeleting ? 'opacity-50' : ''}
                `}
              >
                {/* # */}
                <td className="px-4 py-3">
                  <span
                    className={`
                      inline-flex items-center justify-center w-6 h-6 rounded-md
                      text-[11px] font-semibold
                      ${
                        isSelected
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                      }
                    `}
                  >
                    {index + 1}
                  </span>
                </td>

                {/* کشاورز */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FarmerAvatar name={farm.farmer_name} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-800 truncate">
                        {farm.farmer_name || 'بدون نام'}
                      </div>
                      {farm.national_id && (
                        <div
                          className="text-[10px] text-gray-400 font-mono truncate"
                          dir="ltr"
                        >
                          {farm.national_id}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* محصول */}
                <td className="px-4 py-3">
                  <CropBadge crop={farm.crop} color={cropColor} />
                </td>

                {/* مساحت */}
                <td className="px-4 py-3">
                  <div className="flex items-baseline gap-1" dir="ltr">
                    <span className="text-sm font-bold text-blue-700 whitespace-nowrap">
                      {area.toLocaleString('fa-IR', {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      ha
                    </span>
                  </div>
                </td>

                {/* موقعیت */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-700 min-w-0">
                      <MapPin
                        size={11}
                        className="text-gray-400 flex-shrink-0"
                      />
                      <span className="truncate">
                        {farm.province || '—'}
                      </span>
                    </div>
                    {(farm.county || farm.village) && (
                      <div className="text-[10px] text-gray-400 truncate pr-4">
                        {[farm.county, farm.village]
                          .filter(Boolean)
                          .join(' • ')}
                      </div>
                    )}
                  </div>
                </td>

                {/* عملیات */}
                <td className="px-4 py-3 print:hidden">
                  <div className="flex items-center justify-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <ActionButton
                      icon={MapIcon}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewOnMap?.(farm);
                      }}
                      disabled={isDeleting}
                      colorClass="text-blue-600 hover:bg-blue-50"
                      title="نمایش روی نقشه"
                    />
                    <ActionButton
                      icon={Pencil}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(farm);
                      }}
                      disabled={isDeleting}
                      colorClass="text-amber-600 hover:bg-amber-50"
                      title="ویرایش"
                    />
                    <ActionButton
                      icon={Trash2}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(farm);
                      }}
                      disabled={isDeleting}
                      colorClass="text-red-600 hover:bg-red-50"
                      title="حذف"
                      loading={isDeleting}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(FarmsTable);