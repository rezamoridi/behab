// src/services/api/farmApi.js
import apiClient from './apiClient';

// ═══════════════════════════════════════════════════════════
// Normalizers
// ═══════════════════════════════════════════════════════════

const normalizeListResponse = (response) => {
  const body = response?.data ?? response;

  if (!body || typeof body !== 'object') {
    return { farms: [], total: 0, totalPages: 1, raw: null };
  }

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
      body.pages ??
      Math.max(
        1,
        Math.ceil(
          (body.total ?? farms.length) /
            (body.page_size ?? body.size ?? 20),
        ),
      ),
    page: body.page ?? 1,
    pageSize: body.page_size ?? body.size ?? 20,
    raw: body,
  };
};

const normalizeFarmResponse = (response) => {
  const body = response?.data ?? response;
  if (!body || typeof body !== 'object') return null;

  if (
    body.data &&
    typeof body.data === 'object' &&
    !Array.isArray(body.data)
  ) {
    return body.data;
  }
  if (body.item && typeof body.item === 'object') {
    return body.item;
  }
  return body;
};

// ═══════════════════════════════════════════════════════════
// POST /api/v1/farms/create
// ═══════════════════════════════════════════════════════════
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
      farmer_id: farm?.farmer_id ?? payload.farmer_id ?? null,
      region_id: farm?.region_id ?? payload.region_id ?? null, // ✅
      province: farm?.province ?? payload.province,
      county: farm?.county ?? payload.county,
      bakhsh: farm?.bakhsh ?? payload.bakhsh,
      dehestan: farm?.dehestan ?? payload.dehestan,
      village: farm?.village ?? payload.village,
      land_type: farm?.land_type ?? payload.land_type,
      crop: farm?.crop ?? payload.crop,
      crop_id: farm?.crop_id ?? payload.crop_id ?? null,
      crop_color: farm?.crop_color ?? payload.crop_color ?? null,
      irrigation_type: farm?.irrigation_type ?? payload.irrigation_type,
      project_name: farm?.project_name ?? payload.project_name,
      coverage_status: farm?.coverage_status ?? payload.coverage_status,
      water_source: farm?.water_source ?? payload.water_source,
      irrigation_system: farm?.irrigation_system ?? payload.irrigation_system,
      created_by_user_id: farm?.created_by_user_id ?? null, // ✅
    };
  } catch (error) {
    if (error.response?.status === 409) {
      throw new Error('زمینی با این شناسه قبلاً ثبت شده است.');
    }
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════
// GET /api/v1/farms/list
// ═══════════════════════════════════════════════════════════
export const fetchFarms = async ({
  page = 1,
  pageSize = 20,
  search = null,
  createdByUserId = null,
  regionFilter = null, // ✅ جدید
} = {}) => {
  const safePageSize = Math.min(Math.max(1, pageSize), 100);

  const params = new URLSearchParams({
    page: String(page),
    page_size: String(safePageSize),
  });

  if (search) params.append('search', search);

  if (regionFilter !== null && regionFilter !== undefined) {
    params.append('region_filter', String(regionFilter)); // ✅
  }

  // ⚠️ نکته: createdByUserId را به backend نمی‌فرستیم.
  // backend خودش از روی current_user.role فیلتر می‌کند.
  // ولی برای cache key از آن استفاده می‌شود.

  try {
    const response = await apiClient.get(
      `/farms/list?${params.toString()}`,
    );
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

// ═══════════════════════════════════════════════════════════
// fetchAllFarms — pagination خودکار
// ═══════════════════════════════════════════════════════════
export const fetchAllFarms = async ({
  maxItems = 2000,
  search = null,
  createdByUserId = null,
  regionFilter = null, // ✅ جدید
} = {}) => {
  const allFarms = [];
  let page = 1;
  const pageSize = 100; // API max

  while (allFarms.length < maxItems) {
    const result = await fetchFarms({
      page,
      pageSize,
      search,
      createdByUserId,
      regionFilter, // ✅
    });

    const items = result.farms || [];
    if (items.length === 0) break;

    allFarms.push(...items);

    // اگر آخرین صفحه بود، تمام
    if (page >= result.totalPages) break;
    // اگر تعداد کمتر از pageSize برگشت، تمام
    if (items.length < pageSize) break;

    page++;
    // سقف ایمنی
    if (page > 50) break;
  }

  return {
    farms: allFarms,
    total: allFarms.length,
    totalPages: Math.ceil(allFarms.length / pageSize),
  };
};

// ═══════════════════════════════════════════════════════════
// GET /api/v1/farms/read/{farm_id}
// ═══════════════════════════════════════════════════════════
export const fetchFarmById = async (farmId) => {
  if (!farmId) throw new Error('شناسه مزرعه معتبر نیست');
  const response = await apiClient.get(`/farms/read/${farmId}`);
  return normalizeFarmResponse(response);
};

// ═══════════════════════════════════════════════════════════
// PUT /api/v1/farms/update/{farm_id}
// ═══════════════════════════════════════════════════════════
export const updateFarm = async (farmId, payload) => {
  if (!farmId) throw new Error('شناسه مزرعه معتبر نیست');

  const response = await apiClient.put(
    `/farms/update/${farmId}`,
    payload,
  );
  const farm = normalizeFarmResponse(response);

  return {
    ...(farm || {}),
    geojson: farm?.geojson ?? payload.geojson,
    area_ha: Number(farm?.area_ha ?? payload.area_ha) || 0,
    polygon_count:
      Number(farm?.polygon_count ?? payload.polygon_count) || 1,
    farmer_id: farm?.farmer_id ?? payload.farmer_id ?? null,
    region_id: farm?.region_id ?? payload.region_id ?? null, // ✅
    crop_id: farm?.crop_id ?? payload.crop_id ?? null,
    crop_color: farm?.crop_color ?? payload.crop_color ?? null,
    created_by_user_id: farm?.created_by_user_id ?? null, // ✅
  };
};

// ═══════════════════════════════════════════════════════════
// DELETE /api/v1/farms/delete/{farm_id}
// ═══════════════════════════════════════════════════════════
export const deleteFarm = async (farmId) => {
  if (!farmId) throw new Error('شناسه مزرعه معتبر نیست');

  try {
    const response = await apiClient.delete(`/farms/delete/${farmId}`);
    return response.data ?? { success: true };
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('مزرعه یافت نشد یا قبلاً حذف شده است.');
    }
    throw error;
  }
};