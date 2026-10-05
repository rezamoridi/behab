// src/features/dashboard/DashboardContainer.jsx
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wheat,
  Users,
  Ruler,
  Droplets,
  TrendingUp,
  UserCheck,
  ArrowLeft,
  ArrowUpRight,
  Activity,
  Calendar,
  Sparkles,
  Map as MapIcon,
  Settings2,
  Sprout,
} from 'lucide-react';

import { useDashboardData } from './hooks/useDashboardData';
import { formatNumber } from './utils/analytics';
import { getCropColor } from './components/charts/chartDefaults';
import KpiMini from './components/KpiMini';
import CropDistributionChart from './components/charts/CropDistributionChart';
import FarmsTrendChart from './components/charts/FarmsTrendChart';
import AreaByCropChart from './components/charts/AreaByCropChart';
import WaterByCropChart from './components/charts/WaterByCropChart';
import RecentFarmsTable from './components/RecentFarmsTable';
import RecentFarmersTable from './components/RecentFarmersTable';
import RegionFilterBar from './components/RegionFilterBar';
import ManagerRegionsBar from './components/ManagerRegionsBar';  // ✅ جدید
import { getUserData } from '../../services/api/authApi';
import { usePermissions } from '../auth/hooks/usePermissions';
import useSessionState from '../../shared/hooks/useSessionState';

// ============================================================
// Skeleton
// ============================================================
const FirstLoadSkeleton = () => (
  <div
    className="h-full overflow-y-auto pt-20 md:pt-24 pb-28 px-4 md:px-5"
    dir="rtl"
  >
    <div className="max-w-[1600px] mx-auto space-y-3">
      <div className="h-24 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/70 animate-pulse" />
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-5 h-[340px] rounded-2xl bg-white/40 animate-pulse" />
        <div className="col-span-7 h-[340px] rounded-2xl bg-white/40 animate-pulse" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-2xl bg-white/40 animate-pulse" />
        ))}
      </div>
    </div>
  </div>
);

const RefreshIndicator = ({ visible }) => (
  <div
    className={`
      fixed top-20 left-1/2 -translate-x-1/2 z-40
      flex items-center gap-2
      px-3 py-1.5 rounded-full
      bg-white/90 backdrop-blur-md shadow-lg border border-white/70
      text-xs font-medium text-slate-600
      transition-all duration-300
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}
    `}
    dir="rtl"
  >
    <span className="inline-block w-3 h-3 border-2 border-slate-300 border-t-primary-600 rounded-full animate-spin" />
    <span>به‌روزرسانی...</span>
  </div>
);

// ============================================================
// CompactHero
// ============================================================
const CompactHero = ({ userName, onNavigate }) => {
  const today = useMemo(() => {
    try {
      return new Date().toLocaleDateString("fa-IR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    } catch {
      return "";
    }
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return "شب بخیر";
    if (h < 12) return "صبح بخیر";
    if (h < 17) return "ظهر بخیر";
    if (h < 20) return "عصر بخیر";
    return "شب بخیر";
  }, []);

  const quickAccess = [
    {
      id: "farmers",
      label: "کشاورزان",
      icon: Users,
      onClick: () => onNavigate("/farmers"),
      color:
        "text-blue-700 bg-blue-500/15 border-blue-400/30 hover:bg-blue-500/25",
    },
    {
      id: "map",
      label: "نقشه",
      icon: MapIcon,
      onClick: () => onNavigate("/map"),
      color:
        "text-emerald-700 bg-emerald-500/15 border-emerald-400/30 hover:bg-emerald-500/25",
    },
    {
      id: "crops",
      label: "محصولات",
      icon: Sprout,
      onClick: () => onNavigate("/settings", { state: { activeTab: "crops" } }),
      color:
        "text-amber-700 bg-amber-500/15 border-amber-400/30 hover:bg-amber-500/25",
    },
    {
      id: "settings",
      label: "تنظیمات",
      icon: Settings2,
      onClick: () => onNavigate("/settings"),
      color:
        "text-slate-700 bg-slate-500/15 border-slate-400/30 hover:bg-slate-500/25",
    },
  ];

  return (
    <div
      className="
        relative overflow-hidden
        flex items-center justify-between gap-4 flex-wrap
        px-5 py-4 rounded-3xl
        bg-gradient-to-l from-primary-500/15 via-white/50 to-blue-500/10
        backdrop-blur-xl border border-white/70
        shadow-[0_8px_24px_rgba(31,38,135,0.08)]
      "
      dir="rtl"
    >
      <div className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 rounded-full bg-primary-500/20 blur-3xl" />

      <div className="relative z-10 flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-2xl bg-primary-500/20 border border-primary-300/40 flex items-center justify-center flex-shrink-0">
          <Sparkles size={16} className="text-primary-600" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base md:text-lg font-bold text-slate-900 truncate">
            {greeting}، {userName} 👋
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            خلاصه وضعیت سیستم در یک نگاه
          </p>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-2 flex-wrap">
        {quickAccess.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={`
                group flex items-center gap-1.5
                px-3 py-1.5 rounded-xl
                border backdrop-blur-sm
                text-[11px] font-bold
                transition-all duration-200
                hover:scale-105 hover:shadow-sm
                cursor-pointer
                ${item.color}
              `}
              title={`رفتن به ${item.label}`}
            >
              <Icon size={13} strokeWidth={2.4} />
              <span>{item.label}</span>
              <ArrowUpRight
                size={11}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
          );
        })}
      </div>

      <div className="relative z-10 flex items-center gap-2 flex-shrink-0">
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/70">
          <Calendar size={11} className="text-slate-500" />
          <span className="text-[11px] text-slate-700 font-medium">
            {today}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/70">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <Activity size={11} className="text-slate-500" />
          <span className="text-[11px] text-slate-800 font-bold">فعال</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Panel
// ============================================================
const Panel = ({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className = "",
}) => (
  <div
    className={`
      flex flex-col
      bg-white/60 backdrop-blur-xl
      rounded-2xl border border-white/70
      shadow-[0_4px_20px_rgba(31,38,135,0.06)]
      overflow-hidden
      ${className}
    `}
  >
    {(title || action) && (
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/60">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && (
            <div className="w-7 h-7 rounded-lg bg-white/70 border border-white/80 flex items-center justify-center flex-shrink-0">
              <Icon size={13} className="text-slate-600" strokeWidth={2.2} />
            </div>
          )}
          <div className="min-w-0">
            {title && (
              <h3 className="text-[13px] font-bold text-slate-800 truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action}
      </div>
    )}
    <div className="flex-1 min-h-0 p-3">{children}</div>
  </div>
);

// ============================================================
// Top Crops List
// ============================================================
const TopCropsList = ({ crops = [], colorByCrop = {} }) => {
  const maxArea = Math.max(...crops.map((c) => c.area), 1);

  if (crops.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xs text-slate-500">داده‌ای موجود نیست</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {crops.map((crop, i) => {
        const pct = (crop.area / maxArea) * 100;
        const color = getCropColor(crop.name, colorByCrop, i);

        return (
          <div key={crop.name} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {crop.name}
                </span>
              </div>
              <div
                className="flex items-baseline gap-1 flex-shrink-0"
                dir="ltr"
              >
                <span className="text-xs font-bold text-slate-700 tabular-nums">
                  {formatNumber(crop.area, 1)}
                </span>
                <span className="text-[9px] text-slate-400">ha</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200/60 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// DashboardContainer
// ============================================================
const DashboardContainer = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isManager } = usePermissions();  // ✅ isManager

  // ✅ Region filter state (sessionStorage)
  const [regionFilter, setRegionFilter] = useSessionState(
    'dashboard_region_filter',
    null,
  );

  const {
    kpis,
    chartData,
    recent,
    farmersById,
    isLoading,
    isFetching,
    hasData,
  } = useDashboardData({
    regionFilter: regionFilter ?? null,
  });

  const userName = useMemo(() => {
    const user = getUserData();
    return user?.fname || user?.username || "کاربر";
  }, []);

  if (isLoading && !hasData) {
    return <FirstLoadSkeleton />;
  }

  const goToFarmers = () => navigate("/farmers");
  const goToMap = () => navigate("/map");
  const goToSettings = (tab) =>
    navigate("/settings", tab ? { state: { activeTab: tab } } : undefined);
  const goToDashboard = () => navigate("/");

  const colorByCrop = chartData.colorByCrop || {};

  // ✅ آیا کاربر دسترسی به کشاورزان دارد؟
  const canSeeFarmers = isSuperAdmin || isManager;

  return (
    <div
      className="h-full overflow-y-auto pt-20 md:pt-24 pb-28 px-4 md:px-5"
      dir="rtl"
    >
      <RefreshIndicator visible={isFetching && hasData} />

      <div className="max-w-[1600px] mx-auto space-y-3">
        {/* 1. Hero */}
        <CompactHero userName={userName} onNavigate={navigate} />

        {/* ✅ Region Filter Bar — فقط super_admin */}
        {isSuperAdmin && (
          <RegionFilterBar
            selectedRegionId={regionFilter}
            onRegionChange={setRegionFilter}
            onClear={() => setRegionFilter(null)}
            isLoading={isLoading}
          />
        )}

        {/* ✅ Manager Regions Bar — فقط manager */}
        {isManager && <ManagerRegionsBar />}

        {/* 2. Row 1: KPI Stack + Trend Chart */}
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 lg:col-span-5 order-2 lg:order-1">
            <Panel
              title="شاخص‌های کلیدی"
              subtitle="کلیک برای مشاهده جزئیات"
              icon={Wheat}
              className="h-[340px]"
            >
              <div className="grid grid-cols-2 gap-1.5 h-full content-start">
                {/* کل مزارع */}
                <KpiMini
                  icon={Wheat}
                  label="کل مزارع"
                  value={formatNumber(kpis.totalFarms)}
                  unit="مزرعه"
                  trend={kpis.farmsTrend}
                  color="primary"
                  onClick={goToMap}
                  actionLabel="مشاهده روی نقشه"
                  compact
                />

                {/* ✅ کل کشاورزان — super_admin و manager */}
                {canSeeFarmers && (
                  <KpiMini
                    icon={Users}
                    label="کل کشاورزان"
                    value={formatNumber(kpis.totalFarmers)}
                    unit="نفر"
                    trend={kpis.farmersTrend}
                    color="blue"
                    onClick={goToFarmers}
                    actionLabel="مشاهده لیست"
                    compact
                  />
                )}

                <KpiMini
                  icon={Ruler}
                  label="مساحت کل"
                  value={formatNumber(kpis.totalArea, 0)}
                  unit="هکتار"
                  color="amber"
                  onClick={goToMap}
                  actionLabel="مشاهده روی نقشه"
                  compact
                />

                <KpiMini
                  icon={Droplets}
                  label="آب مصرفی سالانه"
                  value={formatNumber(kpis.totalWater / 1000, 0)}
                  unit="هزار m³"
                  color="sky"
                  onClick={goToDashboard}
                  actionLabel="مشاهده در داشبورد"
                  compact
                />

                <KpiMini
                  icon={TrendingUp}
                  label="مزارع این ماه"
                  value={formatNumber(kpis.farmsThisMonth)}
                  unit="جدید"
                  color="emerald"
                  onClick={goToMap}
                  actionLabel="ثبت مزرعه جدید"
                  compact
                />

                {/* ✅ کشاورزان فعال — super_admin و manager */}
                {canSeeFarmers && (
                  <KpiMini
                    icon={UserCheck}
                    label="کشاورزان فعال"
                    value={formatNumber(kpis.activeFarmers)}
                    unit="نفر"
                    color="emerald"
                    onClick={goToFarmers}
                    actionLabel="مشاهده لیست"
                    compact
                  />
                )}
              </div>
            </Panel>
          </div>

          <div className="col-span-12 lg:col-span-7 order-1 lg:order-2">
            <Panel
              title="روند ثبت مزارع"
              subtitle="۶ ماه اخیر"
              icon={TrendingUp}
              className="h-[340px]"
              action={
                <button
                  type="button"
                  onClick={goToMap}
                  className="
                    flex items-center gap-1 text-[10px] font-bold
                    text-primary-700 bg-primary-500/10 hover:bg-primary-500/20
                    px-2.5 py-1 rounded-lg
                    transition-colors cursor-pointer
                  "
                >
                  <span>مشاهده در نقشه</span>
                  <ArrowLeft size={10} />
                </button>
              }
            >
              <FarmsTrendChart data={chartData.farmsTrend} />
            </Panel>
          </div>
        </div>

        {/* 3. Row 2: Pie + Area + Water */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <Panel
            title="توزیع محصولات"
            subtitle="سهم از مزارع"
            icon={Wheat}
            className="h-[320px]"
            action={
              isSuperAdmin ? (
                <button
                  type="button"
                  onClick={() => goToSettings("crops")}
                  className="
                    flex items-center gap-1 text-[10px] font-bold
                    text-amber-700 bg-amber-500/10 hover:bg-amber-500/20
                    px-2 py-1 rounded-lg transition-colors cursor-pointer
                  "
                >
                  <span>مدیریت</span>
                  <ArrowLeft size={10} />
                </button>
              ) : null
            }
          >
            <CropDistributionChart
              data={chartData.cropDistribution}
              colorByCrop={colorByCrop}
            />
          </Panel>

          <Panel
            title="مساحت هر محصول"
            subtitle="واحد: هکتار"
            icon={Ruler}
            className="h-[320px]"
          >
            <AreaByCropChart
              data={chartData.areaByCrop}
              colorByCrop={colorByCrop}
            />
          </Panel>

          <Panel
            title="آب مصرفی محصولات"
            subtitle="واحد: متر مکعب"
            icon={Droplets}
            className="h-[320px]"
          >
            <WaterByCropChart
              data={chartData.waterByCrop}
              colorByCrop={colorByCrop}
            />
          </Panel>
        </div>

        {/* 4. Row 3: Top Crops + Recent Farms */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <Panel
            title="محصولات برتر"
            subtitle="بر اساس مساحت"
            icon={Sprout}
            className="h-[360px]"
          >
            <TopCropsList
              crops={chartData.topCrops}
              colorByCrop={colorByCrop}
            />
          </Panel>

          <div className="lg:col-span-2">
            <RecentFarmsTable farms={recent.farms} farmersById={farmersById} />
          </div>
        </div>

        {/* 5. Row 4: Recent Farmers — ✅ super_admin و manager */}
        {canSeeFarmers && <RecentFarmersTable farmers={recent.farmers} />}
      </div>
    </div>
  );
};

export default DashboardContainer;