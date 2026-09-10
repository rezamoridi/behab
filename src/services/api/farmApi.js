// src/services/api/farmApi.js
import apiClient from './apiClient';

// ============================================================
// ✅ نرمال‌سازی پاسخ سرور
//
// سرور ممکن است پاسخ را در یکی از این ساختارها بفرستد:
//   - { success: true, data: {...} }
//   - { data: {...}, item: {...} }
//   - { item: {...} }
//   - { farm: {...} }
//   - خود شیء مستقیم
//
// این تابع همیشه یک شیء farm برمی‌گرداند یا null.
// ============================================================
const normalizeFarmResponse = (response) => {
  if (!response) return null;

  const body = response.data || response;

  // اگر بدنه دارای success + data باشد
  if (body && typeof body === 'object') {
    if (body.data && typeof body.data === 'object') {
      return body.data;
    }
    if (body.item && typeof body.item === 'object') {
      return body.item;
    }
    if (body.farm && typeof body.farm === 'object') {
      return body.farm;
    }
  }

  return body;
};

// ============================================================
// ✅ نرمال‌سازی پاسخ لیست
//
// سرور ممکن است پاسخ را در یکی از این ساختارها بفرستد:
//   - { success: true, data: { items: [...], total: N } }
//   - { data: [...] }
//   - { items: [...], total: N }
//   - { farms: [...], total: N }
//   - [...]
// ============================================================
const normalizeListResponse = (response) => {
  if (!response) {
    return { farms: [], total: 0, totalPages: 1, raw: null };
  }

  const body = response.data || response;

  // اگر بدنه دارای wrapper باشد
  if (body && typeof body === 'object') {
    // حالت { success, data: { items, total } } یا { data: { farms, total } }
    if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
      const inner = body.data;
      const farms = inner.items || inner.farms || inner.data || [];
      return {
        farms: Array.isArray(farms) ? farms : [],
        total: inner.total || inner.total_count || farms.length,
        totalPages:
          inner.total_pages || inner.pages || Math.ceil((inner.total || farms.length) / 20) || 1,
        raw: body,
      };
    }

    // حالت { data: [...] }
    if (Array.isArray(body.data)) {
      return {
        farms: body.data,
        total: body.total || body.total_count || body.data.length,
        totalPages:
          body.total_pages || body.pages || Math.ceil(body.data.length / 20) || 1,
        raw: body,
      };
    }

    // حالت { items: [...], total: N } یا { farms: [...], total: N }
    if (Array.isArray(body.items) || Array.isArray(body.farms)) {
      const farms = body.items || body.farms || [];
      return {
        farms,
        total: body.total || body.total_count || farms.length,
        totalPages:
          body.total_pages || body.pages || Math.ceil(farms.length / 20) || 1,
        raw: body,
      };
    }
  }

  // حالت آرایه‌ی مستقیم
  if (Array.isArray(body)) {
    return {
      farms: body,
      total: body.length,
      totalPages: 1,
      raw: body,
    };
  }

  // fallback
  return { farms: [], total: 0, totalPages: 1, raw: body };
};

// ============================================================
// API مزارع
// ============================================================

// ------------------------------------------------------------
// ✅ ایجاد مزرعه
// ------------------------------------------------------------
export const createFarm = async (payload) => {
  try {
    const response = await apiClient.post('/farms/create', payload);
    const farm = normalizeFarmResponse(response);

    // اگر سرور فیلدهای هندسی را در پاسخ نداد، از payload استفاده کن
    return {
      ...(farm || {}),
      geojson: farm?.geojson || payload.geojson,
      area_ha: Number(farm?.area_ha ?? payload.area_ha) || 0,
      polygon_count: Number(farm?.polygon_count ?? payload.polygon_count) || 1,
      farmer_name: farm?.farmer_name || payload.farmer_name,
      national_id: farm?.national_id || payload.national_id,
      phone_number: farm?.phone_number || payload.phone_number,
      province: farm?.province || payload.province,
      county: farm?.county || payload.county,
      bakhsh: farm?.bakhsh || payload.bakhsh,
      dehestan: farm?.dehestan || payload.dehestan,
      village: farm?.village || payload.village,
      land_type: farm?.land_type || payload.land_type,
      crop: farm?.crop || payload.crop,
      irrigation_type: farm?.irrigation_type || payload.irrigation_type,
      project_name: farm?.project_name || payload.project_name,
      coverage_status: farm?.coverage_status || payload.coverage_status,
      water_source: farm?.water_source || payload.water_source,
      irrigation_system: farm?.irrigation_system || payload.irrigation_system,
    };
  } catch (error) {
    if (error.response?.status === 409) {
      throw new Error('زمینی با این شناسه قبلاً ثبت شده است.');
    }
    throw error;
  }
};

// ------------------------------------------------------------
// ✅ دریافت لیست مزارع با Pagination
// ------------------------------------------------------------
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

  const response = await apiClient.get(`/farms/list?${params.toString()}`);
  return normalizeListResponse(response);
};

// ------------------------------------------------------------
// ✅ دریافت مزرعه با شناسه
// ------------------------------------------------------------
export const fetchFarmById = async (farmId) => {
  if (!farmId) {
    throw new Error('شناسه مزرعه معتبر نیست');
  }

  const response = await apiClient.get(`/farms/read/${farmId}`);
  return normalizeFarmResponse(response);
};

// ------------------------------------------------------------
// ✅ به‌روزرسانی مزرعه (کامل)
// ------------------------------------------------------------
export const updateFarm = async (farmId, payload) => {
  if (!farmId) {
    throw new Error('شناسه مزرعه معتبر نیست');
  }

  const response = await apiClient.put(`/farms/update/${farmId}`, payload);
  const farm = normalizeFarmResponse(response);

  // اگر پاسخ خالی بود، حداقل payload را برگردان
  if (!farm) {
    return { farm_id: farmId, ...payload };
  }

  return {
    ...farm,
    geojson: farm.geojson || payload.geojson,
    area_ha: Number(farm.area_ha ?? payload.area_ha) || 0,
    polygon_count: Number(farm.polygon_count ?? payload.polygon_count) || 1,
  };
};

// ------------------------------------------------------------
// ✅ حذف مزرعه
// ------------------------------------------------------------
export const deleteFarm = async (farmId) => {
  if (!farmId) {
    throw new Error('شناسه مزرعه معتبر نیست');
  }

  await apiClient.delete(`/farms/delete/${farmId}`);
  return { success: true, farm_id: farmId };
};