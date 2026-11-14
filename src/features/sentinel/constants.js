// src/features/sentinel/constants.js

export const SENTINEL_S2_ANALYSES = [
  { id: 'TRUE_COLOR', label: 'رنگ واقعی', resolution: 10, description: 'ترکیب باندهای قرمز، سبز و آبی.' },
  { id: 'NDVI', label: 'NDVI — پوشش گیاهی', resolution: 10, description: 'NDVI = (B08 − B04) / (B08 + B04)' },
  { id: 'NDWI', label: 'NDWI — شاخص آب', resolution: 10, description: 'NDWI = (B03 − B08) / (B03 + B08)' },
  { id: 'MNDWI', label: 'MNDWI — آب اصلاح‌شده', resolution: 20, description: 'MNDWI = (B03 − B11) / (B03 + B11)' },
  { id: 'NDBI', label: 'NDBI — ساخت‌وساز', resolution: 20, description: 'NDBI = (B11 − B08) / (B11 + B08)' },
  { id: 'NBR', label: 'NBR — سوختگی', resolution: 20, description: 'NBR = (B08 − B12) / (B08 + B12)' },
  { id: 'EVI', label: 'EVI — گیاهی ارتقایافته', resolution: 10, description: 'EVI = 2.5 × (B08 − B04) / (B08 + 6·B04 − 7.5·B02 + 1)' },
  { id: 'SAVI', label: 'SAVI — گیاهی تعدیل‌شده', resolution: 10, description: 'SAVI = 1.5 × (B08 − B04) / (B08 + B04 + 0.5)' },
  { id: 'GNDVI', label: 'GNDVI — سبز', resolution: 10, description: 'GNDVI = (B08 − B03) / (B08 + B03)' },
  { id: 'NDRE', label: 'NDRE — Red Edge', resolution: 20, description: 'NDRE = (B8A − B05) / (B8A + B05)' },
  { id: 'NDMI', label: 'NDMI — رطوبت', resolution: 20, description: 'NDMI = (B08 − B11) / (B08 + B11)' },
];

export const SENTINEL_S1_ANALYSES = [
  { id: 'VV', label: 'VV — قطبش عمودی', resolution: 10, description: 'بازتاب راداری VV' },
  { id: 'VH', label: 'VH — قطبش افقی', resolution: 10, description: 'بازتاب راداری VH' },
  { id: 'VV_VH', label: 'VV + VH — رنگی', resolution: 10, description: 'ترکیب VV و VH' },
  { id: 'TRUE_COLOR_S1', label: 'رنگ واقعی S1', resolution: 10, description: 'ترکیب VV و VH با کشش' },
];

export const SENTINEL_SENSORS = [
  { id: 'SENTINEL-2', label: 'Sentinel-2 (نوری)' },
  { id: 'SENTINEL-1', label: 'Sentinel-1 (رادار)' },
];

export const getAnalysesForSensor = (sensor) => {
  return sensor === 'SENTINEL-1' ? SENTINEL_S1_ANALYSES : SENTINEL_S2_ANALYSES;
};