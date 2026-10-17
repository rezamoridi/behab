// src/features/lands/components/LandsTable.jsx
import {
  MapPin,
  Eye,
  Pencil,
  Trash2,
  Map as MapIcon,
  User,
  Loader2,
  AlertCircle,
  MapPinned,
} from 'lucide-react';

import {
  DEFAULT_FARM_COLOR,
  normalizeHex,
} from '../../settings/constants/cropColors';

// ═══════════════════════════════════════════════════════════
// helpers
// ═══════════════════════════════════════════════════════════
const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
};

const formatArea = (area) => {
  const n = Number(area) || 0;
  return n.toLocaleString('fa-IR', { maximumFractionDigits: 2 });
};

// ═══════════════════════════════════════════════════════════
// ActionButton
// ═══════════════════════════════════════════════════════════
const ActionButton = ({
  icon: Icon,
  onClick,
  disabled = false,
  colorClass = '',
  title,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    className={`
      p-1.5 rounded-md transition-colors
      disabled:opacity-50 disabled:cursor-not-allowed
      ${colorClass}
    `}
  >
    <Icon size={14} />
  </button>
);

// ═══════════════════════════════════════════════════════════
// LandsTable
// ═══════════════════════════════════════════════════════════
const LandsTable = ({
  farms = [],
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onViewOnMap,
  onRowClick,
  selectedFarmId = null,
}) => {
  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={28} className="text-primary-600 animate-spin" />
      </div>
    );
  }

  // ─── Empty ───
  if (!farms.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center mb-3">
          <MapPinned size={24} />
        </div>
        <p className="text-sm font-medium text-gray-600 mb-1">
          زمینی یافت نشد
        </p>
        <p className="text-xs text-gray-400">
          فیلترها را تغییر دهید یا از نقشه زمین جدید ثبت کنید
        </p>
      </div>
    );
  }

  // ─── Table ───
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr className="border-b border-gray-200">
            <th className="text-right px-3 py-3 font-semibold text-[11px] text-gray-500 uppercase w-12">
              #
            </th>
            <th className="text-right px-3 py-3 font-semibold text-[11px] text-gray-500 uppercase min-w-[160px]">
              کشاورز
            </th>
            <th className="text-right px-3 py-3 font-semibold text-[11px] text-gray-500 uppercase min-w-[110px]">
              محصول
            </th>
            <th className="text-right px-3 py-3 font-semibold text-[11px] text-gray-500 uppercase w-24">
              مساحت
            </th>
            <th className="text-right px-3 py-3 font-semibold text-[11px] text-gray-500 uppercase min-w-[160px]">
              موقعیت
            </th>
            <th className="text-right px-3 py-3 font-semibold text-[11px] text-gray-500 uppercase w-28">
              تاریخ ثبت
            </th>
            <th className="text-center px-3 py-3 font-semibold text-[11px] text-gray-500 uppercase w-32">
              عملیات
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {farms.map((farm, index) => {
            const cropColor =
              normalizeHex(farm.crop_color) || DEFAULT_FARM_COLOR;
            const area = Number(farm.area_ha) || 0;
            const isSelected =
              String(farm.farm_id) === String(selectedFarmId);
            const hasMissingInfo =
              !farm.region_id ||
              (!farm.current_owner_id && !farm.created_by_user_id);

            return (
              <tr
                key={farm.farm_id || index}
                onClick={() => onRowClick?.(farm)}
                className={`
                  cursor-pointer transition-colors
                  ${isSelected ? 'bg-primary-50/60' : 'hover:bg-gray-50/80'}
                `}
              >
                {/* # */}
                <td className="px-3 py-3 text-gray-400 text-xs">
                  {(index + 1).toLocaleString('fa-IR')}
                </td>

                {/* کشاورز */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center flex-shrink-0">
                      <User size={11} className="text-primary-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-gray-800 truncate">
                        {farm.farmer_name || 'بدون نام'}
                      </div>
                      <div
                        className="text-[10px] text-gray-400 font-mono truncate"
                        dir="ltr"
                      >
                        {farm.farm_id?.slice(0, 12)}…
                      </div>
                    </div>
                    {hasMissingInfo && (
                      <span
                        className="flex-shrink-0 w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center"
                        title={
                          !farm.region_id
                            ? 'بدون منطقه'
                            : 'بدون مالک'
                        }
                      >
                        <AlertCircle size={9} strokeWidth={2.6} />
                      </span>
                    )}
                  </div>
                </td>

                {/* محصول */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/70 shadow-sm flex-shrink-0"
                      style={{ backgroundColor: cropColor }}
                    />
                    <span className="text-xs text-gray-700 truncate">
                      {farm.crop || '—'}
                    </span>
                  </div>
                </td>

                {/* مساحت */}
                <td className="px-3 py-3">
                  <div className="flex items-baseline gap-1" dir="ltr">
                    <span className="text-xs font-bold text-blue-700 tabular-nums">
                      {formatArea(area)}
                    </span>
                    <span className="text-[10px] text-gray-400">ha</span>
                  </div>
                </td>

                {/* موقعیت */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1 text-[11px] text-gray-600 min-w-0">
                    <MapPin
                      size={10}
                      className="text-gray-400 flex-shrink-0"
                    />
                    <span className="truncate">
                      {farm.province || '—'}
                      {farm.county ? ` / ${farm.county}` : ''}
                      {farm.village ? ` / ${farm.village}` : ''}
                    </span>
                  </div>
                </td>

                {/* تاریخ */}
                <td className="px-3 py-3 text-[11px] text-gray-500 whitespace-nowrap">
                  {formatDate(farm.created_at)}
                </td>

                {/* عملیات */}
                <td className="px-3 py-3">
                  <div className="flex items-center justify-center gap-0.5">
                    <ActionButton
                      icon={Eye}
                      onClick={(e) => {
                        e.stopPropagation();
                        onView?.(farm);
                      }}
                      colorClass="text-gray-600 hover:bg-gray-100"
                      title="جزئیات"
                    />
                    <ActionButton
                      icon={MapIcon}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewOnMap?.(farm);
                      }}
                      colorClass="text-blue-600 hover:bg-blue-50"
                      title="نمایش روی نقشه"
                    />
                    <ActionButton
                      icon={Pencil}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(farm);
                      }}
                      colorClass="text-amber-600 hover:bg-amber-50"
                      title="ویرایش"
                    />
                    <ActionButton
                      icon={Trash2}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(farm);
                      }}
                      colorClass="text-red-600 hover:bg-red-50"
                      title="حذف"
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

export default LandsTable;