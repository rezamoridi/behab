// src/features/dashboard/DashboardContainer.jsx
import { useNavigate } from 'react-router-dom';
import {
  Wheat,
  Users,
  Ruler,
  Droplets,
  TrendingUp,
  UserCheck,
  ArrowLeft,
} from 'lucide-react';

import { useDashboardData } from './hooks/useDashboardData';
import { formatNumber } from './utils/analytics';
import DashboardHero from './components/DashboardHero';
import KpiCard from './components/KpiCard';
import CropDistributionChart from './components/charts/CropDistributionChart';
import FarmsTrendChart from './components/charts/FarmsTrendChart';
import AreaByCropChart from './components/charts/AreaByCropChart';
import WaterByCropChart from './components/charts/WaterByCropChart';
import RecentFarmsTable from './components/RecentFarmsTable';
import RecentFarmersTable from './components/RecentFarmersTable';
import { getUserData } from '../../services/api/authApi';

const DashboardContainer = () => {
  const navigate = useNavigate();
  const { kpis, chartData, recent, farmersById, isLoading } =
    useDashboardData();

  const user = getUserData();
  const userName = user?.fname || user?.username || 'کاربر';

  // ── Loading Skeleton ──
  if (isLoading) {
    return (
      <div
        className="h-full overflow-y-auto pt-20 md:pt-24 pb-32 px-4 md:px-6"
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto space-y-5">
          <div className="h-36 md:h-44 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/70 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="h-28 md:h-32 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/70 animate-pulse"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-80 md:h-96 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/70 animate-pulse"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-80 md:h-96 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/70 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full overflow-y-auto pt-20 md:pt-24 pb-32 px-4 md:px-6"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Hero */}
        <DashboardHero userName={userName} />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <KpiCard
            icon={Wheat}
            label="کل مزارع"
            value={formatNumber(kpis.totalFarms)}
            color="primary"
            delayClass="animate-delay-1"
          />
          <KpiCard
            icon={Users}
            label="کل کشاورزان"
            value={formatNumber(kpis.totalFarmers)}
            color="blue"
            delayClass="animate-delay-2"
          />
          <KpiCard
            icon={Ruler}
            label="مساحت کل"
            value={formatNumber(kpis.totalArea, 1)}
            unit="هکتار"
            color="amber"
            delayClass="animate-delay-3"
          />
          <KpiCard
            icon={Droplets}
            label="آب مصرفی سالانه"
            value={formatNumber(kpis.totalWater)}
            unit="m³"
            color="purple"
            delayClass="animate-delay-4"
          />
          <KpiCard
            icon={TrendingUp}
            label="مزارع این ماه"
            value={formatNumber(kpis.farmsThisMonth)}
            color="emerald"
            delayClass="animate-delay-5"
          />
          <KpiCard
            icon={Wheat}
            label="محصولات فعال"
            value={formatNumber(kpis.activeCrops)}
            color="primary"
            delayClass="animate-delay-6"
          />
          <KpiCard
            icon={UserCheck}
            label="کشاورزان فعال"
            value={formatNumber(kpis.activeFarmers)}
            color="blue"
            delayClass="animate-delay-7"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <CropDistributionChart data={chartData.cropDistribution} />
          <FarmsTrendChart data={chartData.farmsTrend} />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <AreaByCropChart data={chartData.areaByCrop} />
          <WaterByCropChart data={chartData.waterByCrop} />
        </div>

        {/* Recent Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <RecentFarmsTable
            farms={recent.farms}
            farmersById={farmersById}
          />
          <RecentFarmersTable farmers={recent.farmers} />
        </div>

        {/* Quick Access to Farmers */}
        <button
          type="button"
          onClick={() => navigate('/farmers')}
          className="
            group
            flex items-center justify-between gap-4
            w-full p-4 rounded-2xl
            bg-white/60 backdrop-blur-xl
            border border-white/70
            shadow-[0_4px_20px_rgba(31,38,135,0.08),inset_0_1px_0_rgba(255,255,255,0.95)]
            hover:bg-white/85
            hover:shadow-[0_8px_32px_rgba(31,38,135,0.14),inset_0_1px_0_rgba(255,255,255,0.95)]
            card-hover-lift
            transition-all
            cursor-pointer
            text-right
            animate-fadeInUp
          "
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-700/5 border border-primary-300/40 flex items-center justify-center">
              <Users size={20} className="text-primary-600" strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                مدیریت کشاورزان
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                مشاهده، ویرایش و مدیریت لیست کامل کشاورزان
              </div>
            </div>
          </div>
          <ArrowLeft
            size={18}
            className="text-slate-400 group-hover:text-primary-600 group-hover:-translate-x-1 transition-all"
          />
        </button>
      </div>
    </div>
  );
};

export default DashboardContainer;