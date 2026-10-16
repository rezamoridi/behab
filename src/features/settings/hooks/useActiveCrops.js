// src/features/settings/hooks/useActiveCrops.js
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import apiClient from "@/services/api/apiClient";

// ============================================================
// Fetcher
// ============================================================
const fetchActiveCrops = async () => {
  const { data } = await apiClient.get("/crops", {
    params: { active_only: true },
  });
  return data;
};

// ============================================================
// Hook
// ============================================================
export const useActiveCrops = () => {
  const {
    data: crops = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["crops", "active"],
    queryFn: fetchActiveCrops,
    staleTime: 5 * 60 * 1000,
  });

  // ── lookup map: name → [crops] ──
  const cropsByName = useMemo(() => {
    const map = Object.create(null);
    for (const c of crops) {
      if (!map[c.name]) map[c.name] = [];
      map[c.name].push(c);
    }
    return map;
  }, [crops]);

  // ── lookup map: `${name}::${irrigation_type}` → crop ──
  const cropsByKey = useMemo(() => {
    const map = Object.create(null);
    for (const c of crops) {
      const key = `${c.name}::${c.irrigation_type || "آبی"}`;
      map[key] = c;
    }
    return map;
  }, [crops]);

  const getCropByName = (cropName, irrigationType) => {
    if (!cropName) return null;
    if (irrigationType) {
      return cropsByKey[`${cropName}::${irrigationType}`] || null;
    }
    const list = cropsByName[cropName];
    return list && list.length > 0 ? list[0] : null;
  };

  const getAllCropsByName = (cropName) => {
    if (!cropName) return [];
    return cropsByName[cropName] || [];
  };

  const getRequirement = (cropName, irrigationType) =>
    getCropByName(cropName, irrigationType)?.requirement ?? null;

  const getPrice = (cropName, irrigationType) =>
    getCropByName(cropName, irrigationType)?.price ?? 0;

  const getNitrogen = (cropName, irrigationType) =>
    getCropByName(cropName, irrigationType)?.nitrogen ?? null;

  const getPhosphate = (cropName, irrigationType) =>
    getCropByName(cropName, irrigationType)?.phosphate ?? null;

  const getPotassium = (cropName, irrigationType) =>
    getCropByName(cropName, irrigationType)?.potassium ?? null;

  const getSeedRate = (cropName, irrigationType) =>
    getCropByName(cropName, irrigationType)?.seed_rate ?? null;

  const getCropYield = (cropName, irrigationType) =>
    getCropByName(cropName, irrigationType)?.crop_yield ?? null;

  return {
    crops,
    cropsByName,
    cropsByKey,
    isLoading,
    isError,
    error,
    refetch,
    getCropByName,
    getAllCropsByName,
    getRequirement,
    getPrice,
    getNitrogen,
    getPhosphate,
    getPotassium,
    getSeedRate,
    getCropYield,
  };
};

export default useActiveCrops;