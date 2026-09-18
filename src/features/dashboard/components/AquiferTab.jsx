// src/features/dashboard/components/AquiferTab.jsx
import React, { useMemo } from 'react';
import {
  MapPin,
  Ruler,
  Droplet,
  Home,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { useFarmsQuery } from '../../farm-registration/hooks/useFarmsQuery';
import { useActiveCrops } from '../../settings/hooks/useActiveCrops';
import AquiferKpiCard from './AquiferKpiCard';
import AquiferCharts from './AquiferCharts';   // ✅ جدید

const FARM_LIST_QUERY_PARAMS = {
  page: 1,
  pageSize: 100,
  search: null,
};

const formatNumber = (value, decimals = 0) => {
  const num = Number(value) || 0;
  return num.toLocaleString('fa-IR', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  });
};

const AquiferTab = () => {
  const { data: farmsData, isLoading: farmsLoading } = useFarmsQuery(
    FARM_LIST_QUERY_PARAMS
  );

  const { getRequirement, isLoading: cropsLoading } = useActiveCrops();

  const farms = useMemo(
    () => farmsData?.farms || [],
    [farmsData]
  );

  const isLoading = farmsLoading || cropsLoading;

  // ============================================================
  // KPIها
  // ============================================================
  const kpis = useMemo(() => {
    if (!farms.length) {
      return {
        totalFarms: 0,
        totalArea: 0,
        totalWater: 0,
        villages: 0,
        farmsWithWater: 0,
        farmsMissingRate: 0,
      };
    }

    let totalArea = 0;
    let totalWater = 0;
    let farmsWithWater = 0;
    let farmsMissingRate = 0;

    const villagesSet = new Set();

    farms.forEach((farm) => {
      const area = Number(farm.area_ha) || 0;
      totalArea += area;

      if (farm.village) villagesSet.add(farm.village);

      const requirement = farm.crop
        ? getRequirement(farm.crop)
        : null;

      if (requirement !== null && requirement > 0) {
        totalWater += area * requirement;
        farmsWithWater += 1;
      } else if (area > 0) {
        farmsMissingRate += 1;
      }
    });

    return {
      totalFarms: farms.length,
      totalArea,
      totalWater,
      villages: villagesSet.size,
      farmsWithWater,
      farmsMissingRate,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farms]);

  // ============================================================
  // Loading
  // ============================================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-primary-600 animate-spin" />
          <span className="text-sm text-gray-500">
            در حال محاسبه گزارش...
          </span>
        </div>
      </div>
    );
  }

  // ============================================================
  // Empty
  // ============================================================
  if (!farms.length) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
            <Droplet size={22} />
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">
            هنوز داده‌ای برای نمایش نیست
          </h3>
          <p className="text-xs text-gray-500">
            برای دیدن گزارش، ابتدا از تب «لیست زمین‌ها» زمین ثبت کنید.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="p-4 space-y-4" dir="rtl">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-gray-800">
          خلاصه گزارش آب‌خوان
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          محاسبه بر اساس {formatNumber(kpis.totalFarms)} زمین ثبت‌شده
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <AquiferKpiCard
          icon={MapPin}
          label="تعداد کل زمین‌ها"
          value={formatNumber(kpis.totalFarms)}
          unit="زمین"
          color="text-emerald-700 bg-emerald-50"
        />

        <AquiferKpiCard
          icon={Ruler}
          label="مجموع مساحت"
          value={formatNumber(kpis.totalArea, 2)}
          unit="هکتار"
          color="text-blue-700 bg-blue-50"
        />

        <AquiferKpiCard
          icon={Droplet}
          label="مجموع آب مصرفی"
          value={formatNumber(kpis.totalWater)}
          unit="m³"
          color="text-sky-700 bg-sky-50"
          subtitle={
            kpis.farmsWithWater > 0
              ? `بر اساس نرخ ${formatNumber(kpis.farmsWithWater)} زمین`
              : 'نرخی تعریف نشده'
          }
        />

        <AquiferKpiCard
          icon={Home}
          label="روستاهای تحت پوشش"
          value={formatNumber(kpis.villages)}
          unit="روستا"
          color="text-violet-700 bg-violet-50"
        />
      </div>

      {/* هشدار */}
      {kpis.farmsMissingRate > 0 && (
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle
            size={16}
            className="text-amber-600 flex-shrink-0 mt-0.5"
          />
          <div className="flex-1 text-xs">
            <div className="font-semibold text-amber-800 mb-0.5">
              {formatNumber(kpis.farmsMissingRate)} زمین بدون نرخ آب
            </div>
            <div className="text-amber-700">
              برای این زمین‌ها، محصول تعریف نشده یا نرخ آب محصول در
              تنظیمات ثبت نشده است.
            </div>
          </div>
        </div>
      )}

      {/* خلاصه تفصیلی */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          خلاصه تفصیلی
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-gray-500 mb-1">میانگین مساحت هر زمین</div>
            <div className="font-semibold text-gray-800" dir="ltr">
              {kpis.totalFarms > 0
                ? formatNumber(kpis.totalArea / kpis.totalFarms, 2)
                : '0'}
              <span className="text-[10px] text-gray-400 mr-1">ha</span>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-gray-500 mb-1">میانگین آب هر هکتار</div>
            <div className="font-semibold text-gray-800" dir="ltr">
              {kpis.farmsWithWater > 0 && kpis.totalArea > 0
                ? formatNumber(kpis.totalWater / kpis.totalArea)
                : '—'}
              {kpis.farmsWithWater > 0 && kpis.totalArea > 0 && (
                <span className="text-[10px] text-gray-400 mr-1">m³</span>
              )}
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-gray-500 mb-1">زمین‌های با نرخ</div>
            <div className="font-semibold text-emerald-700" dir="ltr">
              {formatNumber(kpis.farmsWithWater)}
              <span className="text-[10px] text-gray-400 mr-1">
                / {formatNumber(kpis.totalFarms)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-gray-500 mb-1">پوشش نرخ</div>
            <div className="font-semibold text-sky-700" dir="ltr">
              {kpis.totalFarms > 0
                ? formatNumber(
                    (kpis.farmsWithWater / kpis.totalFarms) * 100,
                    1
                  )
                : '0'}
              <span className="text-[10px] text-gray-400 mr-1">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ نمودارها */}
      <AquiferCharts farms={farms} getRequirement={getRequirement} />
    </div>
  );
};

export default AquiferTab;