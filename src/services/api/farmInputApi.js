// src/services/api/farmInputApi.js
import apiClient from './apiClient';

const FARMS_BASE = '/farms';

export const farmInputApi = {
  /** لیست نهاده‌های یک مزرعه */
  list: (farmId) =>
    apiClient.get(`${FARMS_BASE}/${farmId}/inputs`),

  /** افزودن یک نهاده */
  add: (farmId, data) =>
    apiClient.post(`${FARMS_BASE}/${farmId}/inputs`, data),

  /** جایگزینی کامل لیست */
  replaceAll: (farmId, items) =>
    apiClient.put(`${FARMS_BASE}/${farmId}/inputs`, { items }),

  /** ویرایش یک سطر */
  update: (itemId, data) =>
    apiClient.patch(`${FARMS_BASE}/inputs/${itemId}`, data),

  /** حذف یک سطر */
  remove: (itemId) =>
    apiClient.delete(`${FARMS_BASE}/inputs/${itemId}`),
};

export default farmInputApi;