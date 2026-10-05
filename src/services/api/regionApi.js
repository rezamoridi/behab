// src/services/api/regionApi.js
import apiClient from "./apiClient";

export const regionApi = {
  // ═══════════════════════════════════════════════════════
  // Regions — CRUD
  // ═══════════════════════════════════════════════════════
  list: async ({ activeOnly = false } = {}) => {
    const params = new URLSearchParams();
    if (activeOnly) params.append("active_only", "true");

    const response = await apiClient.get(
      `/regions${params.toString() ? `?${params}` : ""}`,
    );
    return response.data;
  },

  my: async () => {
    const response = await apiClient.get("/regions/my");
    return response.data;
  },

  get: async (regionId) => {
    if (!regionId) throw new Error("شناسه منطقه معتبر نیست");
    const response = await apiClient.get(`/regions/${regionId}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post("/regions", data);
    return response.data;
  },

  update: async (regionId, data) => {
    if (!regionId) throw new Error("شناسه منطقه معتبر نیست");
    const response = await apiClient.put(`/regions/${regionId}`, data);
    return response.data;
  },

  delete: async (regionId) => {
    if (!regionId) throw new Error("شناسه منطقه معتبر نیست");
    const response = await apiClient.delete(`/regions/${regionId}`);
    return response.data;
  },

  // ═══════════════════════════════════════════════════════
  // Assignment
  // ═══════════════════════════════════════════════════════
  assignRegionsToUser: async (userId, regionIds) => {
    if (!userId) throw new Error("شناسه کاربر معتبر نیست");
    const response = await apiClient.put(`/regions/users/${userId}/regions`, {
      region_ids: regionIds,
    });
    return response.data;
  },

  assignUsersToRegion: async (regionId, userIds) => {
    if (!regionId) throw new Error("شناسه منطقه معتبر نیست");
    const response = await apiClient.put(`/regions/${regionId}/users`, {
      user_ids: userIds,
    });
    return response.data;
  },
  // در regionApi:

  exportExcel: async ({ activeOnly = false } = {}) => {
    const params = new URLSearchParams();
    if (activeOnly) params.append("active_only", "true");

    const response = await apiClient.get(
      `/regions/export/excel${params.toString() ? `?${params}` : ""}`,
      { responseType: "blob" },
    );
    return response;
  },
  // در regionApi:

  // ═══════════════════════════════════════════════════════
  // ✅ Stats
  // ═══════════════════════════════════════════════════════
  getStats: async (regionId) => {
    if (!regionId) throw new Error("شناسه منطقه معتبر نیست");
    const response = await apiClient.get(`/regions/${regionId}/stats`);
    return response.data;
  },

  // ═══════════════════════════════════════════════════════
  // ✅ Compare
  // ═══════════════════════════════════════════════════════
  compare: async ({ regionIds = null, activeOnly = false } = {}) => {
    const params = new URLSearchParams();
    if (regionIds && regionIds.length > 0) {
      params.append("region_ids", regionIds.join(","));
    }
    if (activeOnly) params.append("active_only", "true");

    const response = await apiClient.get(
      `/regions/compare${params.toString() ? `?${params}` : ""}`,
    );
    return response.data;
  },
};

export default regionApi;
