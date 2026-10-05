// src/services/api/adminApi.js
import apiClient from "./apiClient";

export const adminApi = {
  // ═══════════════════════════════════════════════════════
  // Summary
  // ═══════════════════════════════════════════════════════
  getSummary: async () => {
    const response = await apiClient.get("/admin/orphans/summary");
    return response.data;
  },

  // ═══════════════════════════════════════════════════════
  // Lists
  // ═══════════════════════════════════════════════════════
  listOrphanFarms: async ({
    page = 1,
    pageSize = 20,
    search = null,
    missing = "either",
  } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      missing,
    });
    if (search) params.append("search", search);

    const response = await apiClient.get(
      `/admin/orphans/farms?${params.toString()}`,
    );
    return response.data;
  },

  listOrphanFarmers: async ({
    page = 1,
    pageSize = 20,
    search = null,
    missing = "either",
  } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      missing,
    });
    if (search) params.append("search", search);

    const response = await apiClient.get(
      `/admin/orphans/farmers?${params.toString()}`,
    );
    return response.data;
  },

  // ═══════════════════════════════════════════════════════
  // Bulk assign
  // ═══════════════════════════════════════════════════════
  bulkAssignRegion: async ({ farmIds = [], farmerIds = [], regionId }) => {
    const response = await apiClient.post("/admin/orphans/assign-region", {
      farm_ids: farmIds,
      farmer_ids: farmerIds,
      region_id: regionId,
    });
    return response.data;
  },

  bulkAssignOwner: async ({ farmIds = [], farmerIds = [], userId }) => {
    const response = await apiClient.post("/admin/orphans/assign-owner", {
      farm_ids: farmIds,
      farmer_ids: farmerIds,
      user_id: userId,
    });
    return response.data;
  },
  getTrashSummary: async () => {
    const response = await apiClient.get("/admin/orphans/trash/summary");
    return response.data;
  },

  listDeletedFarms: async ({ page = 1, pageSize = 20, search = null } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });
    if (search) params.append("search", search);
    const response = await apiClient.get(
      `/admin/orphans/deleted/farms?${params}`,
    );
    return response.data;
  },

  listDeletedFarmers: async ({
    page = 1,
    pageSize = 20,
    search = null,
  } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });
    if (search) params.append("search", search);
    const response = await apiClient.get(
      `/admin/orphans/deleted/farmers?${params}`,
    );
    return response.data;
  },

  restoreFarm: async (farmId) => {
    const response = await apiClient.post(
      `/admin/orphans/restore/farm/${farmId}`,
    );
    return response.data;
  },

  restoreFarmer: async (farmerId) => {
    const response = await apiClient.post(
      `/admin/orphans/restore/farmer/${farmerId}`,
    );
    return response.data;
  },
};

export default adminApi;
