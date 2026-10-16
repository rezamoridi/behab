// src/services/api/inputApi.js
import apiClient from './apiClient';

const INPUTS_BASE = '/inputs';

export const inputApi = {
  list: ({ category = null, activeOnly = false } = {}) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (activeOnly) params.append('active_only', 'true');
    return apiClient.get(
      `${INPUTS_BASE}${params.toString() ? `?${params}` : ''}`
    );
  },

  get: (id) => apiClient.get(`${INPUTS_BASE}/${id}`),
  create: (data) => apiClient.post(INPUTS_BASE, data),
  update: (id, data) => apiClient.put(`${INPUTS_BASE}/${id}`, data),
  delete: (id) => apiClient.delete(`${INPUTS_BASE}/${id}`),
};

export default inputApi;