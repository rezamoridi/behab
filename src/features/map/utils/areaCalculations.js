// src/features/map/utils/areaCalculations.js
import * as turf from '@turf/turf';

/**
 * محاسبه مساحت چندضلعی به هکتار
 */
export const calculateAreaInHectares = (geojson) => {
  if (!geojson) return 0;

  try {
    const areaSquareMeters = turf.area(geojson);
    const areaHectares = areaSquareMeters / 10000;
    return Number(areaHectares.toFixed(4));
  } catch (error) {
    console.error('خطا در محاسبه مساحت:', error);
    return 0;
  }
};

/**
 * محاسبه حجم آب
 */
export const calculateWaterVolume = (areaHa, waterRequirement = 5000) => {
  if (!areaHa || areaHa <= 0) return 0;
  return Number((areaHa * waterRequirement).toFixed(2));
};

/**
 * فرمت عدد با جداکننده فارسی
 */
export const formatNumber = (number, decimals = 2) => {
  if (number === undefined || number === null) return '۰';
  return Number(number).toLocaleString('fa-IR', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
};