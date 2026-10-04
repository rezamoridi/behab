// src/features/settings/hooks/useActiveCrops.js
import { useCropsQuery } from './useAgricultureSettings';
import { useMemo } from 'react';

/**
 * useActiveCrops
 * لیست محصولات فعال (شامل نرخ‌ها)
 */
export const useActiveCrops = () => {
  const { data: crops = [], isLoading } = useCropsQuery({
    activeOnly: true,
  });

  // ✅ lookup map بر اساس نام
  const cropsByName = useMemo(() => {
    const map = {};
    crops.forEach((c) => {
      map[c.name] = c;
    });
    return map;
  }, [crops]);

  const getCropByName = (cropName) => {
    if (!cropName) return null;
    return cropsByName[cropName] || null;
  };

  const getRequirement = (cropName) => {
    return getCropByName(cropName)?.requirement ?? null;
  };

  const getPrice = (cropName) => {
    return getCropByName(cropName)?.price ?? 0;
  };

  return {
    crops,
    cropsByName,
    isLoading,
    getCropByName,
    getRequirement,
    getPrice,
  };
};

export default useActiveCrops;