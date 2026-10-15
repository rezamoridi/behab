// src/services/api/villageApi.js
import apiClient from './apiClient';

const VILLAGES_BASE = '/villages';

export const villageApi = {
  // ═══════════════════════════════════════════════════════
  // CRUD
  // ═══════════════════════════════════════════════════════
  list: async ({ activeOnly = false, regionId = null } = {}) => {
    const params = new URLSearchParams();
    if (activeOnly) params.append('active_only', 'true');
    if (regionId != null) params.append('region_id', String(regionId));

    const response = await apiClient.get(
      `${VILLAGES_BASE}${params.toString() ? `?${params}` : ''}`,
    );
    return response.data;
  },

  my: async () => {
    const response = await apiClient.get(`${VILLAGES_BASE}/my`);
    return response.data;
  },

  get: async (villageId) => {
    if (!villageId) throw new Error('شناسه روستا معتبر نیست');
    const response = await apiClient.get(
      `${VILLAGES_BASE}/${villageId}`,
    );
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post(VILLAGES_BASE, data);
    return response.data;
  },

  update: async (villageId, data) => {
    if (!villageId) throw new Error('شناسه روستا معتبر نیست');
    const response = await apiClient.put(
      `${VILLAGES_BASE}/${villageId}`,
      data,
    );
    return response.data;
  },

  delete: async (villageId) => {
    if (!villageId) throw new Error('شناسه روستا معتبر نیست');
    const response = await apiClient.delete(
      `${VILLAGES_BASE}/${villageId}`,
    );
    return response.data;
  },

  // ═══════════════════════════════════════════════════════
  // ✅ فاز ۵: آمار روستا
  // ═══════════════════════════════════════════════════════
  getStats: async (villageId) => {
    if (!villageId) throw new Error('شناسه روستا معتبر نیست');
    const response = await apiClient.get(
      `${VILLAGES_BASE}/${villageId}/stats`,
    );
    return response.data;
  },

  // ═══════════════════════════════════════════════════════
  // Assignment
  // ═══════════════════════════════════════════════════════
  assignVillagesToUser: async (userId, villageIds) => {
    if (!userId) throw new Error('شناسه کاربر معتبر نیست');
    const response = await apiClient.put(
      `${VILLAGES_BASE}/users/${userId}/villages`,
      { village_ids: villageIds },
    );
    return response.data;
  },

  assignUsersToVillage: async (villageId, userIds) => {
    if (!villageId) throw new Error('شناسه روستا معتبر نیست');
    const response = await apiClient.put(
      `${VILLAGES_BASE}/${villageId}/users`,
      { user_ids: userIds },
    );
    return response.data;
  },

  // ═══════════════════════════════════════════════════════
  // Export Excel
  // ═══════════════════════════════════════════════════════
  exportExcel: async ({ activeOnly = false } = {}) => {
    const params = new URLSearchParams();
    if (activeOnly) params.append('active_only', 'true');

    const response = await apiClient.get(
      `${VILLAGES_BASE}/export/excel${
        params.toString() ? `?${params}` : ''
      }`,
      { responseType: 'blob' },
    );
    return response;
  },
};

export default villageApi;