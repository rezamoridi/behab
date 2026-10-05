// src/features/settings/components/RegionStatsPanel.jsx
import {
  Users,
  Wheat,
  Ruler,
  Droplets,
  TrendingUp,
  CheckCircle2,
  Clock,
  Loader2,
  Sprout,
  X,
} from 'lucide-react';
import { useRegionStatsQuery } from '../../regions/hooks/useRegions';

// ============================================================
// Stat Card
// ============================================================
const StatCard = ({ icon: Icon, label, value, unit, color }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200">
    <span
      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}
    >
      <Icon size={18} strokeWidth={2.2} />
    </span>
    <div className="min-w-0 flex-1">
      <div className="text-[10px] text-gray-500 mb-0.5">{label}</div>
      <div className="flex items-baseline gap-1" dir="ltr">
        <span className="text-lg font-bold text-gray-900 tabular-nums leading-none">
          {value}
        </span>
        {unit && (
          <span className="text-[10px] text-gray-400 font-medium">
            {unit}
          </span>
        )}
      </div>
    </div>
  </div>
);

// ============================================================
// RegionStatsPanel
// ============================================================
const RegionStatsPanel = ({ region, onClose }) => {
  const { data: stats, isLoading } = useRegionStatsQuery(region?.id, {
    enabled: !!region?.id,
  });

  if (!region) return null;

  const formatNumber = (n, digits = 0) =>
    Number(n || 0).toLocaleString('fa-IR', {
      maximumFractionDigits: digits,
    });

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp size={18} strokeWidth={2.4} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                آمار منطقه: {region.name}
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                گزارش تجمیعی
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2
                size={24}
                className="text-purple-600 animate-spin"
              />
            </div>
          ) : !stats ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              آماری یافت نشد
            </div>
          ) : (
            <div className="space-y-5">
              {/* KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                <StatCard
                  icon={Users}
                  label="مسئولان منطقه"
                  value={formatNumber(stats.user_count)}
                  unit="نفر"
                  color="text-blue-700 bg-blue-50"
                />
                <StatCard
                  icon={Wheat}
                  label="کشاورزان"
                  value={formatNumber(stats.farmer_count)}
                  unit="نفر"
                  color="text-emerald-700 bg-emerald-50"
                />
                <StatCard
                  icon={Sprout}
                  label="مزارع"
                  value={formatNumber(stats.farm_count)}
                  unit="زمین"
                  color="text-primary-700 bg-primary-50"
                />
                <StatCard
                  icon={Ruler}
                  label="مساحت کل"
                  value={formatNumber(stats.total_area_ha, 2)}
                  unit="هکتار"
                  color="text-amber-700 bg-amber-50"
                />
                <StatCard
                  icon={Droplets}
                  label="آب مصرفی سالانه"
                  value={formatNumber(stats.total_water_m3 / 1000, 1)}
                  unit="هزار m³"
                  color="text-sky-700 bg-sky-50"
                />
                <StatCard
                  icon={Sprout}
                  label="تنوع محصولات"
                  value={formatNumber(stats.crop_count)}
                  unit="نوع"
                  color="text-violet-700 bg-violet-50"
                />
              </div>

              {/* کشاورزان — تفکیک */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-px flex-1 bg-gray-200" />
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                    وضعیت کشاورزان
                  </span>
                  <span className="h-px flex-1 bg-gray-200" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-emerald-200">
                    <CheckCircle2
                      size={14}
                      className="text-emerald-600 flex-shrink-0"
                    />
                    <div>
                      <div className="text-[10px] text-gray-500">
                        فعال
                      </div>
                      <div className="text-sm font-bold text-emerald-700">
                        {formatNumber(stats.active_farmers)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-amber-200">
                    <Clock
                      size={14}
                      className="text-amber-600 flex-shrink-0"
                    />
                    <div>
                      <div className="text-[10px] text-gray-500">
                        در انتظار
                      </div>
                      <div className="text-sm font-bold text-amber-700">
                        {formatNumber(stats.pending_farmers)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* محصولات برتر */}
              {stats.top_crops.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sprout size={14} className="text-primary-600" />
                    <span className="text-xs font-bold text-gray-800">
                      محصولات برتر منطقه
                    </span>
                  </div>
                  <div className="space-y-2">
                    {stats.top_crops.map((crop, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 py-1.5 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-primary-50 text-primary-700 text-[10px] font-bold flex-shrink-0">
                            {(i + 1).toLocaleString('fa-IR')}
                          </span>
                          <span className="text-xs font-medium text-gray-800 truncate">
                            {crop.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-[10px] text-gray-500">
                            {formatNumber(crop.count)} زمین
                          </span>
                          <span
                            className="text-xs font-bold text-blue-700 tabular-nums"
                            dir="ltr"
                          >
                            {formatNumber(crop.area_ha, 1)}
                            <span className="text-[9px] text-gray-400 mr-1">
                              ha
                            </span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 py-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegionStatsPanel;