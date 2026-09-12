// src/services/api/settingsApi.js
import apiClient from './apiClient';

export const settingsApi = {
  // Profile
  getProfile: () => apiClient.get('/users/me'),
  updateProfile: (data) => apiClient.put('/users/me', data),
  changePassword: (passwords) => apiClient.put('/users/me/password', passwords),

  // Agriculture settings
  getAgricultureSettings: () => apiClient.get('/settings/agriculture'),
  updateAgricultureSettings: (data) =>
    apiClient.put('/settings/agriculture', data),

  // Water rates
  getWaterRates: () => apiClient.get('/settings/water-rates'),
  createWaterRate: (data) => apiClient.post('/settings/water-rates', data),
  updateWaterRate: (id, data) =>
    apiClient.put(`/settings/water-rates/${id}`, data),
  deleteWaterRate: (id) => apiClient.delete(`/settings/water-rates/${id}`),

  // Crop water rates
  getCropWaterRates: () => apiClient.get('/settings/crop-water-rates'),
  updateCropWaterRate: (crop, data) =>
    apiClient.put(`/settings/crop-water-rates/${crop}`, data),
  getCropWaterRate: (crop) =>
    apiClient.get(`/settings/crop-water-rates/${crop}`),

  // Users
  getUsers: (params) => apiClient.get('/users/list-users', { params }),
  getUser: (id) => apiClient.get(`/users/users/${id}`),
  updateUser: (id, data) => apiClient.put(`/users/update/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/users/delete/${id}`),
  createUser: (data) => apiClient.post('/users/create', data),
};