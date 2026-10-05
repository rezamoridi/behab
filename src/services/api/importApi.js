// src/services/api/importApi.js
import apiClient from './apiClient';

export const importApi = {
  // ═══════════════════════════════════════════════════════
  // Template
  // ═══════════════════════════════════════════════════════
  downloadTemplate: async () => {
    const response = await apiClient.get('/import/template', {
      responseType: 'blob',
    });
    return response;
  },

  // ═══════════════════════════════════════════════════════
  // Preview
  // ═══════════════════════════════════════════════════════
  preview: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/import/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ═══════════════════════════════════════════════════════
  // Confirm
  // ═══════════════════════════════════════════════════════
  confirm: async ({ rows, regionId = null, sendSms = false }) => {
    const response = await apiClient.post('/import/confirm', {
      rows,
      region_id: regionId,
      send_sms: sendSms,
    });
    return response.data;
  },
};

// ═══════════════════════════════════════════════════════
// Duplicate API
// ═══════════════════════════════════════════════════════
export const duplicateApi = {
  list: async () => {
    const response = await apiClient.get('/admin/orphans/duplicates/farmers');
    return response.data;
  },

  merge: async ({ primaryId, mergeIds }) => {
    const response = await apiClient.post(
      '/admin/orphans/duplicates/merge',
      {
        primary_id: primaryId,
        merge_ids: mergeIds,
      },
    );
    return response.data;
  },
};

export default importApi;