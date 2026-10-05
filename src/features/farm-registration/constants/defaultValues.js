// src/features/farm-registration/constants/defaultValues.js

// ═══════════════════════════════════════════════════════════
// مقادیر پیش‌فرض فرم
// ═══════════════════════════════════════════════════════════
export const DEFAULT_FARM_FORM_VALUES = {
  province: '',
  county: '',
  bakhsh: '',
  dehestan: '',
  village: '',
  firstName: '',
  lastName: '',
  nationalId: '',
  phone: '',
  landType: '',
  crop: '',
  cropId: null,
  irrigationType: '',
  waterSources: [],
  irrigationSystems: [],
  studyArea: '',
  coverageStatus: 'تحت پوشش شبکه آب رسانی',
  regionId: null,   // ✅ جدید
};

// ═══════════════════════════════════════════════════════════
// تبدیل داده API به فرم
// ═══════════════════════════════════════════════════════════
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
    firstName: apiData.fname || '',
    lastName: apiData.lname || '',
    nationalId: apiData.national_id || '',
    phone: apiData.phone_number || '',
    landType: apiData.land_type || '',
    crop: apiData.crop || '',
    cropId: apiData.crop_id ?? null,
    irrigationType: apiData.irrigation_type || '',
    waterSources,
    irrigationSystems,
    studyArea: apiData.project_name || '',
    coverageStatus:
      apiData.coverage_status || 'تحت پوشش شبکه آب رسانی',
    regionId: apiData.region_id ?? null,   // ✅
  };
};

// ═══════════════════════════════════════════════════════════
// تبدیل فرم به payload کشاورز
// ═══════════════════════════════════════════════════════════
export const formToFarmerPayload = (formData) => {
  return {
    national_id: String(formData.nationalId || '').trim(),
    phone_number: String(formData.phone || '').trim(),
    fname: formData.firstName ? String(formData.firstName).trim() : null,
    lname: formData.lastName ? String(formData.lastName).trim() : null,
    region_id: formData.regionId ?? null,   // ✅
  };
};

// ═══════════════════════════════════════════════════════════
// تبدیل فرم به payload مزرعه
// ═══════════════════════════════════════════════════════════
export const formToFarmPayload = ({
  formData,
  areaHa,
  polygonCount,
  geometry,
  cropId = null,
  farmerId = null,
}) => {
  return {
    province: formData.province || null,
    county: formData.county || null,
    bakhsh: formData.bakhsh || null,
    dehestan: formData.dehestan || null,
    village: formData.village || null,

    farmer_id: farmerId ?? null,

    land_type: formData.landType || null,
    crop: formData.crop || null,
    crop_id: cropId ?? null,
    irrigation_type: formData.irrigationType || null,

    // ✅ منطقه
    region_id: formData.regionId ?? null,

    geojson: geometry,
    area_ha: Number(areaHa) || 0,
    polygon_count: polygonCount || 1,

    project_name: formData.studyArea || null,
    coverage_status: formData.coverageStatus || null,

    water_source: formData.waterSources.length
      ? formData.waterSources.join('، ')
      : null,
    irrigation_system: formData.irrigationSystems.length
      ? formData.irrigationSystems.join('، ')
      : null,
  };
};

// ═══════════════════════════════════════════════════════════
// payload کامل برای register-with-farms
// ═══════════════════════════════════════════════════════════
export const formToRegisterPayload = ({
  formData,
  areaHa,
  polygonCount,
  geometry,
  cropId = null,
}) => {
  const farmer = formToFarmerPayload(formData);

  const farm = formToFarmPayload({
    formData,
    areaHa,
    polygonCount,
    geometry,
    cropId,
    farmerId: null,
  });

  delete farm.farmer_id;

  return {
    farmer,
    farms: [farm],
  };
};

// ═══════════════════════════════════════════════════════════
// Backward compatibility
// ═══════════════════════════════════════════════════════════
export const formToApi = formToFarmPayload;

export default DEFAULT_FARM_FORM_VALUES;