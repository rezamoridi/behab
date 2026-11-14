// src/features/sentinel/services/sentinelApi.js
import apiClient from "../../../services/api/apiClient";

export const searchProducts = async (payload) => {
  const res = await apiClient.post("/sentinel/search", payload, {
    timeout: 60_000,
  });
  return res.data;
};

export const createSentinelJob = async (payload) => {
  const res = await apiClient.post("/sentinel/areas", payload);
  return res.data;
};

export const getJobStatus = async (jobId) => {
  const res = await apiClient.get(`/sentinel/jobs/${jobId}`);
  return res.data;
};

export const listAreas = async ({ limit = 50, offset = 0 } = {}) => {
  const res = await apiClient.get("/sentinel/areas", {
    params: { limit, offset },
  });
  return res.data;
};

export const listAreaScenes = async (areaId) => {
  const res = await apiClient.get(`/sentinel/areas/${areaId}/scenes`);
  return res.data;
};

export const fetchPreviewBlob = async (assetId) => {
  const res = await apiClient.get(`/sentinel/assets/${assetId}/preview`, {
    responseType: "blob",
    timeout: 60_000,
  });
  return res.data;
};

export const fetchGeotiffBlob = async (assetId) => {
  const res = await apiClient.get(`/sentinel/assets/${assetId}/geotiff`, {
    responseType: "blob",
    timeout: 300_000,
  });
  return res.data;
};

export const deleteAsset = async (assetId) => {
  const res = await apiClient.delete(`/sentinel/assets/${assetId}`);
  return res.data;
};

export const downloadGeotiffAsFile = async (assetId, filename) => {
  const blob = await fetchGeotiffBlob(assetId);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `sentinel_${assetId}.tif`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

export const downloadGeotiffByJob = async (jobId) => {
  const res = await apiClient.get(`/sentinel/jobs/${jobId}/assets`);
  const assets = res.data;
  const geotiff = assets.find((a) => a.kind === "geotiff");
  if (!geotiff) throw new Error("فایل GeoTIFF یافت نشد.");
  await downloadGeotiffAsFile(
    geotiff.id,
    `sentinel_${geotiff.analysis}_${geotiff.id}.tif`,
  );
};

export const getCdseCredentialStatus = async () => {
  const res = await apiClient.get("/sentinel/credentials");
  return res.data;
};

export const setCdseCredential = async ({ email, password }) => {
  const res = await apiClient.post("/sentinel/credentials", {
    email,
    password,
  });
  return res.data;
};

export const clearCdseCredential = async () => {
  const res = await apiClient.delete("/sentinel/credentials");
  return res.data;
};
export const listFolders = async () => {
  const res = await apiClient.get("/sentinel/folders");
  return res.data;
};

export const createFolder = async ({ name, color = "#64748b" }) => {
  const res = await apiClient.post("/sentinel/folders", { name, color });
  return res.data;
};

export const deleteFolder = async (folderId) => {
  const res = await apiClient.delete(`/sentinel/folders/${folderId}`);
  return res.data;
};

export const moveAssetToFolder = async (assetId, folderId) => {
  const res = await apiClient.patch(`/sentinel/assets/${assetId}/folder`, {
    folder_id: folderId,
  });
  return res.data;
};

export const updateAssetTags = async (assetId, tags) => {
  const res = await apiClient.patch(`/sentinel/assets/${assetId}/tags`, {
    tags,
  });
  return res.data;
};
