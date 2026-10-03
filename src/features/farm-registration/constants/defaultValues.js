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
};

// ============================================
// تبدیل داده API به فرم
//
// ⚠️ نکته: API فیلدهای کشاورز را در Farm برنمی‌گرداند.
// در حالت ویرایش، این فیلدها خالی می‌مانند و مهم نیستند
// (چون endpoint ویرایش مزرعه، فیلدهای کشاورز را نادیده می‌گیرد).
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
    // ↓ این‌ها در ویرایش خالی می‌مانند
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
  };
};

// ============================================================
// تبدیل فرم به payload کشاورز (برای register-with-farms)
// ============================================================
export const formToFarmerPayload = (formData) => {
  return {
    national_id: String(formData.nationalId || '').trim(),
    phone_number: String(formData.phone || '').trim(),
    fname: formData.firstName ? String(formData.firstName).trim() : null,
    lname: formData.lastName ? String(formData.lastName).trim() : null,
  };
};

// ============================================================
// تبدیل فرم به payload مزرعه (برای farms/create)
// ============================================================
export const formToFarmPayload = ({
  formData,
  areaHa,
  polygonCount,
  geometry,
  cropId = null,
  farmerId = null,
}) => {
  return {
    // موقعیت
    province: formData.province || null,
    county: formData.county || null,
    bakhsh: formData.bakhsh || null,
    dehestan: formData.dehestan || null,
    village: formData.village || null,

    // کشاورز (اختیاری — فقط برای farms/create)
    farmer_id: farmerId ?? null,

    // زمین
    land_type: formData.landType || null,
    crop: formData.crop || null,
    crop_id: cropId ?? null,
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

// ============================================================
// payload کامل برای register-with-farms
// ============================================================
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
    farmerId: null, // ← بک‌اند خودش پر می‌کند
  });

  // حذف farmer_id از farm (چون بک‌اند override می‌کند)
  delete farm.farmer_id;

  return {
    farmer,
    farms: [farm],
  };
};

// ============================================================
// Backward compatibility
// ============================================================
export const formToApi = formToFarmPayload;

export default DEFAULT_FARM_FORM_VALUES;