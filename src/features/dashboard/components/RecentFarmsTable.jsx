// src/features/dashboard/components/RecentFarmsTable.jsx
import { useMemo } from 'react';
import { Wheat, MapPin, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '../utils/analytics';
import {
  DEFAULT_FARM_COLOR,
  normalizeHex,
} from '../../settings/constants/cropColors';

/**
 * RecentFarmsTable — ۵ مزرعه اخیر
 *
 * props:
 *   farms: آرایه‌ای از مزارع
 *   farmersById: Map از farmer_id به farmer (برای نمایش نام کشاورز)
 */
const RecentFarmsTable = ({ farms = [], farmersById = {} }) => {
  const navigate = useNavigate();

  // فرمت تاریخ
  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const handleRowClick = (farm) => {
    navigate('/map', { state: { focusFarmId: farm.farm_id } });
  };

  if (farms.length === 0) {
    return (
      <div
        className="
          p-5 rounded-2xl
          bg-white/60 backdrop-blur-xl
          border border-white/70
          shadow-[0_4px_20px_rgba(31,38,135,0.08),inset_0_1px_0_rgba(255,255,255,0.95)]
        "
        dir="rtl"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500/15 to-primary-700/5 border border-primary-300/40 flex items-center justify-center">
              <Wheat size={16} className="text-primary-600" strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                مزارع اخیر
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ۵ مزرعه اخیر ثبت‌شده
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
            <Wheat size={20} />
          </div>
          <p className="text-xs text-slate-500">هنوز مزرعه‌ای ثبت نشده</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        p-5 rounded-2xl
        bg-white/60 backdrop-blur-xl
        border border-white/70
        shadow-[0_4px_20px_rgba(31,38,135,0.08),inset_0_1px_0_rgba(255,255,255,0.95)]
      "
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500/15 to-primary-700/5 border border-primary-300/40 flex items-center justify-center">
            <Wheat size={16} className="text-primary-600" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              مزارع اخیر
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              ۵ مزرعه اخیر ثبت‌شده
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/map')}
          className="
            flex items-center gap-1.5
            text-[11px] font-semibold
            text-primary-600 hover:text-primary-700
            transition-colors cursor-pointer
          "
        >
          <span>مشاهده همه</span>
          <ArrowLeft size={12} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/60">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-white/50 border-b border-slate-200/60">
              <th className="text-right px-3 py-2.5 font-semibold text-slate-500">
                کشاورز
              </th>
              <th className="text-right px-3 py-2.5 font-semibold text-slate-500 hidden md:table-cell">
                روستا
              </th>
              <th className="text-right px-3 py-2.5 font-semibold text-slate-500">
                محصول
              </th>
              <th className="text-left px-3 py-2.5 font-semibold text-slate-500">
                مساحت
              </th>
              <th className="text-left px-3 py-2.5 font-semibold text-slate-500 hidden lg:table-cell">
                تاریخ
              </th>
            </tr>
          </thead>
          <tbody>
            {farms.map((farm) => {
              const farmer = farm.farmer_id
                ? farmersById[String(farm.farmer_id)]
                : null;
              const fullName =
                farmer && (farmer.fname || farmer.lname)
                  ? `${farmer.fname || ''} ${farmer.lname || ''}`.trim()
                  : 'بدون نام';

              const cropColor =
                normalizeHex(farm.crop_color) || DEFAULT_FARM_COLOR;

              return (
                <tr
                  key={farm.farm_id}
                  onClick={() => handleRowClick(farm)}
                  className="
                    border-b border-slate-200/40 last:border-0
                    hover:bg-primary-50/40
                    transition-colors cursor-pointer
                  "
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-primary-100 border border-primary-200 flex items-center justify-center flex-shrink-0">
                        <User size={11} className="text-primary-700" />
                      </div>
                      <span className="font-semibold text-slate-800 truncate">
                        {fullName}
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-2.5 text-slate-600 hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <MapPin size={10} className="text-slate-400" />
                      <span className="truncate">
                        {farm.village || '—'}
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/70 shadow-sm flex-shrink-0"
                        style={{ backgroundColor: cropColor }}
                      />
                      <span className="font-medium text-slate-700 truncate">
                        {farm.crop || 'نامشخص'}
                      </span>
                    </div>
                  </td>

                  <td
                    className="px-3 py-2.5 text-left font-bold text-primary-700 tabular-nums"
                    dir="ltr"
                  >
                    {formatNumber(farm.area_ha, 1)}
                    <span className="text-[10px] mr-1 text-slate-400">ha</span>
                  </td>

                  <td className="px-3 py-2.5 text-left text-slate-500 hidden lg:table-cell">
                    {formatDate(farm.created_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentFarmsTable;