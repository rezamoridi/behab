// src/services/api/settingsApi.js
import apiClient from './apiClient';

const AGRICULTURE_BASE = '/agriculture-settings';
const CROPS_BASE = '/crops';

export const settingsApi = {
  // Profile
  getProfile: () => apiClient.get('/me'),
  updateProfile: (data) => apiClient.put('/users/me', data),
  changePassword: (passwords) => apiClient.put('/users/me/password', passwords),

  // Agriculture Settings (فقط تنظیمات عمومی)
  getAgricultureSettings: () => apiClient.get(AGRICULTURE_BASE),
  updateAgricultureSettings: (data) => apiClient.put(AGRICULTURE_BASE, data),

  // Users
  getUsers: (params) => apiClient.get('/users/list-users', { params }),
  createUser: (data) => apiClient.post('/users/create', data),
  updateUser: (id, data) => apiClient.put(`/users/update/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/users/delete/${id}`),
};

// ============================================
// Crop API (محصولات + نرخ‌ها)
// ============================================
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