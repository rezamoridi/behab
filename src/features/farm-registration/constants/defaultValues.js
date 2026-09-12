// src/features/farm-registration/constants/defaultValues.js

// ============================================
// مقادیر پیش‌فرض فرم
// ============================================
export const DEFAULT_FARM_FORM_VALUES = {
  province: '',
  county: '',
  bakhsh: '',
  dehestan: '',
  village: '',
  farmerName: '',
  nationalId: '',
  phone: '',
  landType: '',
  crop: '',
  irrigationType: '',
  waterSources: [],
  irrigationSystems: [],
  studyArea: '',
  coverageStatus: 'تحت پوشش شبکه آب رسانی',
};

// ============================================
// تبدیل داده API به فرم
// ============================================
export const apiToForm = (apiData) => {
  if (!apiData) return { ...DEFAULT_FARM_FORM_VALUES };

  const waterSources = apiData.water_source
    ? String(apiData.water_source)
        .split(/[،,]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const irrigationSystems = apiData.irrigation_system
    ? String(apiData.irrigation_system)
        .split(/[،,]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return {
    province: apiData.province || '',
    county: apiData.county || '',
    bakhsh: apiData.bakhsh || '',
    dehestan: apiData.dehestan || '',
    village: apiData.village || '',
    farmerName: apiData.farmer_name || '',
    nationalId: apiData.national_id || '',
    phone: apiData.phone_number || '',
    landType: apiData.land_type || '',
    crop: apiData.crop || '',
    irrigationType: apiData.irrigation_type || '',
    waterSources,
    irrigationSystems,
    studyArea: apiData.project_name || '',
    coverageStatus:
      apiData.coverage_status || 'تحت پوشش شبکه آب رسانی',
  };
};

// ============================================
// تبدیل فرم به Payload API
// ============================================
export const formToApi = ({ formData, areaHa, polygonCount, geometry }) => {
  return {
    // موقعیت
    province: formData.province || null,
    county: formData.county || null,
    bakhsh: formData.bakhsh || null,
    dehestan: formData.dehestan || null,
    village: formData.village || null,

    // کشاورز
    farmer_name: formData.farmerName,
    national_id: formData.nationalId,
    phone_number: formData.phone,

    // زمین
    land_type: formData.landType || null,
    crop: formData.crop || null,
    irrigation_type: formData.irrigationType || null,

    // هندسه
    geojson: geometry,
    area_ha: Number(areaHa) || 0,
    polygon_count: polygonCount || 1,

    // شبکه
    project_name: formData.studyArea || null,
    coverage_status: formData.coverageStatus || null,

    // منابع آب
    water_source: formData.waterSources.length
      ? formData.waterSources.join('، ')
      : null,
    irrigation_system: formData.irrigationSystems.length
      ? formData.irrigationSystems.join('، ')
      : null,
  };
};