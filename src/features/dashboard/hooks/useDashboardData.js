// src/features/dashboard/hooks/useDashboardData.js
import { useMemo } from 'react';
import {
  useAllFarmsQuery,
  useAllFarmersQuery,
} from '../../farm-registration/hooks/useFarmsQuery';
import { useCropsQuery } from '../../settings/hooks/useAgricultureSettings';
import { usePermissions } from '../../auth/hooks/usePermissions';

import {
  getTotalFarms,
  getTotalFarmers,
  getTotalAreaHa,
  getTotalWaterUsage,
  getActiveCropsCount,
  getFarmsThisMonth,
  getActiveFarmersCount,
  getFarmTrend,
  getFarmerTrend,
  getCropDistribution,
  getAreaByCrop,
  getWaterByCrop,
  getFarmsTrend,
  getProvinceDistribution,
  getTopCrops,
  getFarmerStatusBreakdown,
  getRecentFarms,
  getRecentFarmers,
} from '../utils/analytics';

export const useDashboardData = ({
  regionFilter = null,
} = {}) => {
  const { isSuperAdmin, isManager, user } = usePermissions();

  // ✅ scope برای Query (فقط برای cache key)
  // backend خودش بر اساس role فیلتر می‌کند.
  //
  // - super_admin: createdBy = null
  // - manager: createdBy = null (region_ids از backend)
  // - dehyar: createdBy = user.id
  const createdByFilter =
    isSuperAdmin || isManager ? null : user?.id ?? null;

  // ✅ regionFilter فقط برای super_admin معتبر است
  const effectiveRegionFilter =
    isSuperAdmin && regionFilter ? regionFilter : null;

  const farmsQuery = useAllFarmsQuery({
    createdByUserId: createdByFilter,
    regionFilter: effectiveRegionFilter,
  });

  const farmersQuery = useAllFarmersQuery({
    createdByUserId: createdByFilter,
    regionFilter: effectiveRegionFilter,
  });

  const cropsQuery = useCropsQuery({ activeOnly: false });

  const farms = useMemo(
    () => farmsQuery.data?.farms || [],
    [farmsQuery.data],
  );
  const farmers = useMemo(
    () => farmersQuery.data?.items || [],
    [farmersQuery.data],
  );
  const crops = useMemo(
    () => cropsQuery.data || [],
    [cropsQuery.data],
  );

  const farmersById = useMemo(() => {
    const map = {};
    farmers.forEach((f) => {
      if (f?.id != null) map[String(f.id)] = f;
    });
    return map;
  }, [farmers]);

  const colorByCrop = useMemo(() => {
    const map = {};
    crops.forEach((c) => {
      if (c?.name && c?.color) map[c.name] = c.color;
    });
    return map;
  }, [crops]);

  // ── KPI ──
  const kpis = useMemo(
    () => ({
      totalFarms: getTotalFarms(farms),
      totalFarmers: getTotalFarmers(farmers),
      totalArea: getTotalAreaHa(farms),
      totalWater: getTotalWaterUsage(farms, crops),
      activeCrops: getActiveCropsCount(crops),
      farmsThisMonth: getFarmsThisMonth(farms),
      activeFarmers: getActiveFarmersCount(farmers),
      farmsTrend: getFarmTrend(farms),
      farmersTrend: getFarmerTrend(farmers),
    }),
    [farms, farmers, crops],
  );

  // ── Chart Data ──
  const chartData = useMemo(
    () => ({
      cropDistribution: getCropDistribution(farms),
      areaByCrop: getAreaByCrop(farms),
      waterByCrop: getWaterByCrop(farms, crops),
      farmsTrend: getFarmsTrend(farms, 6),
      provinceDistribution: getProvinceDistribution(farms),
      topCrops: getTopCrops(farms, 5),
      farmerStatus: getFarmerStatusBreakdown(farmers),
      colorByCrop,
    }),
    [farms, farmers, crops, colorByCrop],
  );

  const recent = useMemo(
    () => ({
      farms: getRecentFarms(farms, 5),
      farmers: getRecentFarmers(farmers, 5),
    }),
    [farms, farmers],
  );

  const isLoading =
    farmsQuery.isLoading ||
    farmersQuery.isLoading ||
    cropsQuery.isLoading;

  const isFetching =
    farmsQuery.isFetching ||
    farmersQuery.isFetching ||
    cropsQuery.isFetching;

  const hasData =
    farmsQuery.data !== undefined ||
    farmersQuery.data !== undefined ||
    cropsQuery.data !== undefined;

  return {
    farms,
    farmers,
    crops,
    farmersById,
    colorByCrop,
    kpis,
    chartData,
    recent,
    isLoading,
    isFetching,
    hasData,
    isError:
      farmsQuery.isError ||
      farmersQuery.isError ||
      cropsQuery.isError,
    isSuperAdmin,
    isManager,
  };
};

export default useDashboardData;