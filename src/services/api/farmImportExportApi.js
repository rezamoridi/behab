// src/services/api/farmImportExportApi.js
import apiClient from './apiClient';

const FARMS_BASE = '/farms';

export const farmImportExportApi = {
  /** دانلود Template */
  downloadTemplate: () =>
    apiClient.get(`${FARMS_BASE}/import/template`, {
      responseType: 'blob',
    }),

  /** پیش‌نمایش import */
  preview: (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post(
      `${FARMS_BASE}/import/preview`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  },

  /** تأیید و اجرا */
  confirm: ({
    rows,
    regionId = null,
    villageId = null,
    sendSms = false,
    updateExisting = false,
  }) =>
    apiClient.post(`${FARMS_BASE}/import/confirm`, {
      rows,
      region_id: regionId,
      village_id: villageId,
      send_sms: sendSms,
      update_existing: updateExisting,
    }),

  /** خروجی Excel */
  export: ({
    regionId = null,
    villageId = null,
    crop = null,
    search = null,
    includeInputs = true,
  } = {}) => {
    const params = new URLSearchParams();
    if (regionId != null) params.append('region_id', regionId);
    if (villageId != null) params.append('village_id', villageId);
    if (crop) params.append('crop', crop);
    if (search) params.append('search', search);
    params.append('include_inputs', include_inputs);

    return apiClient.get(
      `${FARMS_BASE}/export/excel?${params.toString()}`,
      { responseType: 'blob' }
    );
  },
};

export default farmImportExportApi;