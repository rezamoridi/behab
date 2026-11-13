// src/features/sentinel/constants.js

/**
 * شاخص‌های Sentinel-2 — منبع واحد.
 *
 * ⚠️ ID باید با EVALSCRIPTS در app-backend/app/services/sentinel/download.py
 *    یکسان باشد. تغییر در یکی، نیازمند تغییر در دیگری است.
 *
 * resolution: وضوح مؤثر خروجی (متر). باندهای ۲۰ متری (B05, B8A, B11, B12)
 * در صورت استفاده، خروجی مؤثر ۲۰ متر می‌شود حتی اگر resample به ۱۰ متر شود.
 */
export const SENTINEL_S2_ANALYSES = [
  {
    id: 'TRUE_COLOR',
    label: 'رنگ واقعی',
    resolution: 10,
    description: 'ترکیب باندهای قرمز، سبز و آبی — تصویر طبیعی ماهواره‌ای.',
  },
  {
    id: 'NDVI',
    label: 'NDVI — شاخص پوشش گیاهی',
    resolution: 10,
    description:
      'NDVI = (B08 − B04) / (B08 + B04) — مقادیر بالاتر، پوشش گیاهی متراکم‌تر.',
  },
  {
    id: 'NDWI',
    label: 'NDWI — شاخص آب',
    resolution: 10,
    description:
      'NDWI = (B03 − B08) / (B03 + B08) — تفکیک آب از خشکی.',
  },
  {
    id: 'MNDWI',
    label: 'MNDWI — شاخص آب اصلاح‌شده',
    resolution: 20,
    description:
      'MNDWI = (B03 − B11) / (B03 + B11) — حساس‌تر به آب در نواحی شهری.',
  },
  {
    id: 'NDBI',
    label: 'NDBI — شاخص ساخت‌وساز',
    resolution: 20,
    description:
      'NDBI = (B11 − B08) / (B11 + B08) — تفکیک نواحی ساخته‌شده.',
  },
  {
    id: 'NBR',
    label: 'NBR — شاخص سوختگی',
    resolution: 20,
    description:
      'NBR = (B08 − B12) / (B08 + B12) — ارزیابی آسیب آتش‌سوزی.',
  },
  {
    id: 'EVI',
    label: 'EVI — شاخص گیاهی ارتقایافته',
    resolution: 10,
    description:
      'EVI = 2.5 × (B08 − B04) / (B08 + 6·B04 − 7.5·B02 + 1) — مقاوم‌تر به اشباع در پوشش متراکم.',
  },
  {
    id: 'SAVI',
    label: 'SAVI — شاخص گیاهی تعدیل‌شده',
    resolution: 10,
    description:
      'SAVI = 1.5 × (B08 − B04) / (B08 + B04 + 0.5) — مناسب مناطق خشک با خاک نمایان.',
  },
  {
    id: 'GNDVI',
    label: 'GNDVI — شاخص سبز',
    resolution: 10,
    description:
      'GNDVI = (B08 − B03) / (B08 + B03) — حساس‌تر به کلروفیل از NDVI.',
  },
  {
    id: 'NDRE',
    label: 'NDRE — Red Edge',
    resolution: 20,
    description:
      'NDRE = (B8A − B05) / (B8A + B05) — حساس به کلروفیل و تنش نیتروژن.',
  },
  {
    // ⚠️ NDMI در SENTINEL_S2_ANALYSES — از MapSettingsControl فعلی حفظ شده
    id: 'NDMI',
    label: 'NDMI — رطوبت پوشش گیاهی',
    resolution: 20,
    description:
      'NDMI = (B08 − B11) / (B08 + B11) — رطوبت برگ و تنش آبی.',
  },
];

export const SENTINEL_SENSORS = [
  { id: 'SENTINEL-2', label: 'Sentinel-2 (نوری)' },
  { id: 'SENTINEL-1', label: 'Sentinel-1 (راداری)' },
];

/**
 * آیا این شاخص برای سنسور پشتیبانی می‌شود؟
 * S1 (راداری) شاخص نوری ندارد.
 */
export const isAnalysisSupported = (sensor, analysisId) => {
  if (sensor !== 'SENTINEL-2') return false;
  return SENTINEL_S2_ANALYSES.some((a) => a.id === analysisId);
};

/**
 * get analysis metadata by id.
 */
export const getAnalysisMeta = (analysisId) =>
  SENTINEL_S2_ANALYSES.find((a) => a.id === analysisId) || null;