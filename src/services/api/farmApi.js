// src/services/api/farmApi.js
import apiClient from './apiClient';

// ============================================================
// نرمال‌سازی پاسخ‌های API — مطابق با farms.py واقعی
// ============================================================

const normalizeListResponse = (response) => {
  const body = response?.data ?? response;

  if (!body || typeof body !== 'object') {
    return { farms: [], total: 0, totalPages: 1, raw: null };
  }

  // ساختار واقعی: { items, total, page, page_size, total_pages }
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
      Math.max(
        1,
        Math.ceil((body.total ?? farms.length) / (body.page_size || 20))
      ),
    page: body.page ?? 1,
    pageSize: body.page_size ?? 20,
    raw: body,
  };
};

const normalizeFarmResponse = (response) => {
  const body = response?.data ?? response;
  if (!body || typeof body !== 'object') return null;

  if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
    return body.data;
  }
  if (body.item && typeof body.item === 'object') {
    return body.item;
  }
  return body;
};

// ============================================================
// Endpoints — مطابق با farms.py
//
// router = APIRouter(prefix="/farms")
//   POST   /farms/create
//   GET    /farms/read/{farm_id}
//   GET    /farms/list
//   PUT    /farms/update/{farm_id}
// ============================================================

// POST /api/v1/farms/create
export const createFarm = async (payload) => {
  try {
    const response = await apiClient.post('/farms/create', payload);
    const farm = normalizeFarmResponse(response);

    return {
      ...(farm || {}),
      geojson: farm?.geojson ?? payload.geojson,
      area_ha: Number(farm?.area_ha ?? payload.area_ha) || 0,
      polygon_count:
        Number(farm?.polygon_count ?? payload.polygon_count) ||
        payload.polygon_count ||
        1,
      farm_id: farm?.farm_id || payload.farm_id,
      farmer_name: farm?.farmer_name ?? payload.farmer_name,
      national_id: farm?.national_id ?? payload.national_id,
      phone_number: farm?.phone_number ?? payload.phone_number,
      province: farm?.province ?? payload.province,
      county: farm?.county ?? payload.county,
      bakhsh: farm?.bakhsh ?? payload.bakhsh,
      dehestan: farm?.dehestan ?? payload.dehestan,
      village: farm?.village ?? payload.village,
      land_type: farm?.land_type ?? payload.land_type,
      crop: farm?.crop ?? payload.crop,
      irrigation_type: farm?.irrigation_type ?? payload.irrigation_type,
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

// GET /api/v1/farms/list?page=1&page_size=20&search=
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
    const response = await apiClient.get(`/farms/list?${params.toString()}`);
    return normalizeListResponse(response);
  } catch (error) {
    console.error('❌ fetchFarms error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
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

// DELETE در backend وجود ندارد
export const deleteFarm = async (farmId) => {
  if (!farmId) throw new Error('شناسه مزرعه معتبر نیست');
  throw new Error('حذف مزرعه در backend پشتیبانی نمی‌شود');
};