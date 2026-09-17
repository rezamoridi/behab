// src/features/settings/hooks/useActiveCrops.js
import { useCropsQuery, useCropWaterRatesQuery } from './useAgricultureSettings';
import { useMemo } from 'react';

// ============================================================
// ✅ useActiveCrops
// لیست محصولات فعال + نرخ آب هر کدام
// استفاده در: LandSection، FarmFormContainer، MapViewPage
// ============================================================
export const useActiveCrops = () => {
  const { data: crops = [], isLoading: cropsLoading } = useCropsQuery({
    activeOnly: true,
  });

  const { data: rates = [], isLoading: ratesLoading } =
    useCropWaterRatesQuery();

  // ✅ merge: هر محصول با نرخ آبش
  const cropsWithRates = useMemo(() => {
    const rateMap = {};
    rates.forEach((r) => {
      rateMap[r.crop] = r;
    });

    return crops.map((crop) => ({
      ...crop,
      rate: rateMap[crop.name] || null,
      requirement: rateMap[crop.name]?.requirement ?? null,
      price: rateMap[crop.name]?.price ?? 0,
    }));
  }, [crops, rates]);

  // ✅ lookup map برای دسترسی سریع
  const ratesByName = useMemo(() => {
    const map = {};
    rates.forEach((r) => {
      map[r.crop] = r;
    });
    return map;
  }, [rates]);

  // ✅ helper: گرفتن نرخ یک محصول خاص
  const getRateByCrop = (cropName) => {
    if (!cropName) return null;
    return ratesByName[cropName] || null;
  };

  // ✅ helper: گرفتن requirement یک محصول
  const getRequirement = (cropName) => {
    return getRateByCrop(cropName)?.requirement ?? null;
  };

  return {
    crops: cropsWithRates,
    ratesByName,
    isLoading: cropsLoading || ratesLoading,
    getRateByCrop,
    getRequirement,
  };
};

export default useActiveCrops;