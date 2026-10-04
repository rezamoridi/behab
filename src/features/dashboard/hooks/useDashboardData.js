// src/features/dashboard/hooks/useDashboardData.js
import { useMemo } from 'react';
import {
  useAllFarmsQuery,
  useAllFarmersQuery,
} from '../../farm-registration/hooks/useFarmsQuery';
import { useCropsQuery } from '../../settings/hooks/useAgricultureSettings';

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

export const useDashboardData = () => {
  const farmsQuery = useAllFarmsQuery();
  const farmersQuery = useAllFarmersQuery();
  const cropsQuery = useCropsQuery({ activeOnly: false });

  const farms = useMemo(() => farmsQuery.data?.farms || [], [farmsQuery.data]);
  const farmers = useMemo(() => farmersQuery.data?.items || [], [farmersQuery.data]);
  const crops = useMemo(() => cropsQuery.data || [], [cropsQuery.data]);

  const farmersById = useMemo(() => {
    const map = {};
    farmers.forEach((f) => {
      if (f?.id != null) map[String(f.id)] = f;
    });
    return map;
  }, [farmers]);

  // ✅ colorByCrop — رنگ هر محصول از DB
  const colorByCrop = useMemo(() => {
    const map = {};
    crops.forEach((c) => {
      if (c?.name && c?.color) map[c.name] = c.color;
    });
    return map;
  }, [crops]);

  // ── KPI با trend ──
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
      colorByCrop, // ✅ اضافه شد
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
    farmsQuery.isLoading || farmersQuery.isLoading || cropsQuery.isLoading;

  const isFetching =
    farmsQuery.isFetching || farmersQuery.isFetching || cropsQuery.isFetching;

  const hasData =
    farmsQuery.data !== undefined ||
    farmersQuery.data !== undefined ||
    cropsQuery.data !== undefined;

  return {
    farms,
    farmers,
    crops,
    farmersById,
    colorByCrop, // ✅ اضافه شد
    kpis,
    chartData,
    recent,
    isLoading,
    isFetching,
    hasData,
    isError:
      farmsQuery.isError || farmersQuery.isError || cropsQuery.isError,
  };
};

export default useDashboardData;