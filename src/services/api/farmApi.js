// src/services/api/farmApi.js
import apiClient from './apiClient';

// ============================================================
// نرمال‌سازی پاسخ‌ها — بر اساس ساختار واقعی API
//
// API این پروژه از ساختار مستقیم استفاده می‌کند (بدون wrapper).
// list: { items, total, page, page_size, total_pages }
// read/create/update: شیء FarmCreated مستقیم
// ============================================================

const normalizeListResponse = (response) => {
  const body = response?.data ?? response;

  if (!body || typeof body !== 'object') {
    console.warn('⚠️ Invalid list response:', body);
    return { farms: [], total: 0, totalPages: 1, raw: null };
  }

  // ✅ ساختار مورد انتظار: { items, total, page, page_size, total_pages }
  const farms = Array.isArray(body.items)
    ? body.items
    : Array.isArray(body.farms)
      ? body.farms
      : Array.isArray(body.data)
        ? body.data
        : [];

  return {
    farms,
    total: body.total ?? farms.length,
    totalPages:
      body.total_pages ??
      Math.max(1, Math.ceil((body.total ?? farms.length) / (body.page_size || 20))),
    page: body.page ?? 1,
    pageSize: body.page_size ?? 20,
    raw: body,
  };
};

const normalizeFarmResponse = (response) => {
  const body = response?.data ?? response;

  if (!body || typeof body !== 'object') return null;

  // اگر wrapper داشت (به عنوان fallback)
  if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
    return body.data;
  }
  if (body.item && typeof body.item === 'object') {
    return body.item;
  }

  // ساختار مستقیم FarmCreated
  return body;
};

// ============================================================
// API مزارع — مطابق با backend واقعی
// ============================================================

// POST /api/v1/farms/create
export const createFarm = async (payload) => {
  try {
    const response = await apiClient.post('/farms/create', payload);
    const farm = normalizeFarmResponse(response);

    return {
      ...(farm || {}),
      // fallback: اگر سرور فیلدها را در پاسخ نداد، از payload استفاده کن
      geojson: farm?.geojson ?? payload.geojson,
      area_ha: Number(farm?.area_ha ?? payload.area_ha) || 0,
      polygon_count:
        Number(farm?.polygon_count ?? payload.polygon_count) ||
        payload.polygon_count ||
        1,
      farm_id: farm?.farm_id || payload.farm_id,
      farmer_name: farm?.farmer_name ?? payload.farmer_name,
      province: farm?.province ?? payload.province,
      county: farm?.county ?? payload.county,
      bakhsh: farm?.bakhsh ?? payload.bakhsh,
      dehestan: farm?.dehestan ?? payload.dehestan,
      village: farm?.village ?? payload.village,
      land_type: farm?.land_type ?? payload.land_type,
      crop: farm?.crop ?? payload.crop,
      irrigation_type: farm?.irrigation_type ?? payload.irrigation_type,
      national_id: farm?.national_id ?? payload.national_id,
      phone_number: farm?.phone_number ?? payload.phone_number,
      project_name: farm?.project_name ?? payload.project_name,
      coverage_status: farm?.coverage_status ?? payload.coverage_status,
      water_source: farm?.water_source ?? payload.water_source,
      irrigation_system: farm?.irrigation_system ?? payload.irrigation_system,
    };
  } catch (error) {
    if (error.response?.status === 409) {
      throw new Error('زمینی با این شناسه قبلاً ثبت شده است.');
    }
    throw error;
  }
};

// GET /api/v1/farms?page=1&page_size=20&search=
export const fetchFarms = async ({
  page = 1,
  pageSize = 20,
  search = null,
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  if (search) {
    params.append('search', search);
  }

  try {
    const response = await apiClient.get(`/farms?${params.toString()}`);
    return normalizeListResponse(response);
  } catch (error) {
    console.error('❌ fetchFarms error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    throw error;
  }
};

// GET /api/v1/farms/read/{farm_id}
export const fetchFarmById = async (farmId) => {
  if (!farmId) throw new Error('شناسه مزرعه معتبر نیست');

  const response = await apiClient.get(`/farms/read/${farmId}`);
  return normalizeFarmResponse(response);
};

// PUT /api/v1/farms/update/{farm_id}
export const updateFarm = async (farmId, payload) => {
  if (!farmId) throw new Error('شناسه مزرعه معتبر نیست');

  const response = await apiClient.put(`/farms/update/${farmId}`, payload);
  const farm = normalizeFarmResponse(response);

  return {
    ...(farm || {}),
    geojson: farm?.geojson ?? payload.geojson,
    area_ha: Number(farm?.area_ha ?? payload.area_ha) || 0,
    polygon_count: Number(farm?.polygon_count ?? payload.polygon_count) || 1,
  };
};

// ⚠️ DELETE در backend وجود ندارد!
// اگر بعداً اضافه شد، این تابع را فعال کنید.
export const deleteFarm = async (farmId) => {
  if (!farmId) throw new Error('شناسه مزرعه معتبر نیست');

  // TODO: backend endpoint /farms/delete/{id} را اضافه کند
  // await apiClient.delete(`/farms/delete/${farmId}`);
  throw new Error('حذف مزرعه در حال حاضر پشتیبانی نمی‌شود');
};