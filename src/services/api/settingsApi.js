// src/services/api/settingsApi.js
import apiClient from './apiClient';

const AGRICULTURE_BASE = '/agriculture-settings';
const CROPS_BASE = '/crops';
const USERS_BASE = '/users';

export const settingsApi = {
  // Profile
  getProfile: () => apiClient.get('/me'),
  updateProfile: (data) => apiClient.put('/users/me', data),
  changePassword: (passwords) => apiClient.put('/users/me/password', passwords),

  // Agriculture Settings
  getAgricultureSettings: () => apiClient.get(AGRICULTURE_BASE),
  updateAgricultureSettings: (data) => apiClient.put(AGRICULTURE_BASE, data),

  // ═══════════════════════════════════════════════════════
  // Users
  // ═══════════════════════════════════════════════════════
  getUsers: (params) => apiClient.get(`${USERS_BASE}/list-users`, { params }),
  createUser: (data) => apiClient.post(`${USERS_BASE}/create`, data),
  updateUser: (id, data) => apiClient.put(`${USERS_BASE}/update/${id}`, data),
  deleteUser: (id) => apiClient.delete(`${USERS_BASE}/delete/${id}`),

  // ✅ جدید
  getUserStats: (id) => apiClient.get(`${USERS_BASE}/${id}/stats`),
  getUserDetails: (id) => apiClient.get(`${USERS_BASE}/${id}/details`),
  changeUserRole: (id, role) =>
    apiClient.put(`${USERS_BASE}/${id}/role`, { role }),
  toggleUserActive: (id, is_active) =>
    apiClient.put(`${USERS_BASE}/${id}/active`, { is_active }),
  updateUserRegions: (id, region_ids) =>
    apiClient.put(`${USERS_BASE}/${id}/regions`, { region_ids }),
  resetUserPassword: (id, new_password) =>
    apiClient.post(`${USERS_BASE}/${id}/reset-password`, { new_password }),

  // ✅ Bulk
  bulkToggleActive: (user_ids, is_active) =>
    apiClient.post(`${USERS_BASE}/bulk/active`, { user_ids, is_active }),
  bulkChangeRole: (user_ids, role) =>
    apiClient.post(`${USERS_BASE}/bulk/role`, { user_ids, role }),
};

// ═══════════════════════════════════════════════════════
// Crop API
// ═══════════════════════════════════════════════════════
export const cropApi = {
  list: (activeOnly = false) =>
    apiClient.get(CROPS_BASE, {
      params: { active_only: activeOnly },
    }),

  get: (id) => apiClient.get(`${CROPS_BASE}/${id}`),
  create: (data) => apiClient.post(CROPS_BASE, data),
  update: (id, data) => apiClient.put(`${CROPS_BASE}/${id}`, data),
  delete: (id) => apiClient.delete(`${CROPS_BASE}/${id}`),
};