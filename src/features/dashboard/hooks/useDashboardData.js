// src/features/dashboard/hooks/useDashboardData.js
import { useMemo } from 'react';
import {
  useFarmsQuery,
  useFarmersQuery,
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
  getCropDistribution,
  getAreaByCrop,
  getWaterByCrop,
  getFarmsTrend,
  getProvinceDistribution,
  getFarmerStatusBreakdown,
  getRecentFarms,
  getRecentFarmers,
} from '../utils/analytics';

const FARM_PARAMS = { page: 1, pageSize: 500, search: null };
const FARMER_PARAMS = { page: 1, pageSize: 500, search: null };

export const useDashboardData = () => {
  const farmsQuery = useFarmsQuery(FARM_PARAMS);
  const farmersQuery = useFarmersQuery(FARMER_PARAMS);
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

  // ✅ جدید: Map از farmer_id به farmer
  const farmersById = useMemo(() => {
    const map = {};
    farmers.forEach((f) => {
      if (f?.id != null) {
        map[String(f.id)] = f;
      }
    });
    return map;
  }, [farmers]);

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
      farmerStatus: getFarmerStatusBreakdown(farmers),
    }),
    [farms, farmers, crops],
  );

  // ── Recent ──
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

  return {
    farms,
    farmers,
    crops,
    farmersById, // ✅ جدید

    kpis,
    chartData,
    recent,

    isLoading,
    isError:
      farmsQuery.isError ||
      farmersQuery.isError ||
      cropsQuery.isError,
  };
};

export default useDashboardData;