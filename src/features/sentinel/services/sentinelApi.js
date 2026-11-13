// src/features/sentinel/services/sentinelApi.js
import apiClient from '../../../services/api/apiClient';

// ═══════════════════════════════════════════════════════════
// Search
// ═══════════════════════════════════════════════════════════
export const searchProducts = async (payload) => {
  const res = await apiClient.post('/sentinel/search', payload, {
    timeout: 60_000,
  });
  return res.data;
};

// ═══════════════════════════════════════════════════════════
// Create area + job
// ═══════════════════════════════════════════════════════════
export const createSentinelJob = async (payload) => {
  const res = await apiClient.post('/sentinel/areas', payload);
  return res.data;
};

// ═══════════════════════════════════════════════════════════
// Jobs
// ═══════════════════════════════════════════════════════════
export const getJobStatus = async (jobId) => {
  const res = await apiClient.get(`/sentinel/jobs/${jobId}`);
  return res.data;
};

// ═══════════════════════════════════════════════════════════
// Library
// ═══════════════════════════════════════════════════════════
export const listAreas = async ({ limit = 50, offset = 0 } = {}) => {
  const res = await apiClient.get('/sentinel/areas', {
    params: { limit, offset },
  });
  return res.data;
};

export const listAreaScenes = async (areaId) => {
  const res = await apiClient.get(
    `/sentinel/areas/${areaId}/scenes`,
  );
  return res.data;
};

// ═══════════════════════════════════════════════════════════
// Authenticated blob downloads
// ═══════════════════════════════════════════════════════════
export const fetchPreviewBlob = async (assetId) => {
  const res = await apiClient.get(
    `/sentinel/assets/${assetId}/preview`,
    { responseType: 'blob', timeout: 60_000 },
  );
  return res.data;
};

export const fetchGeotiffBlob = async (assetId) => {
  const res = await apiClient.get(
    `/sentinel/assets/${assetId}/geotiff`,
    { responseType: 'blob', timeout: 300_000 },
  );
  return res.data;
};