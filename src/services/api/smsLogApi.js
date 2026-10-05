// src/services/api/smsLogApi.js
import apiClient from './apiClient';

export const smsLogApi = {
  /**
   * لیست پیامک‌ها با فیلتر
   * GET /sms/logs
   */
  list: async ({
    page = 1,
    pageSize = 20,
    search = null,
    kind = null,
    status = null,
    phone = null,
    fromDate = null,
    toDate = null,
  } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });

    if (search) params.append('search', search);
    if (kind) params.append('kind', kind);
    if (status) params.append('status', status);
    if (phone) params.append('phone', phone);
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);

    const response = await apiClient.get(
      `/sms/logs?${params.toString()}`
    );
    return response.data;
  },

  /**
   * جزئیات یک log
   * GET /sms/logs/{id}
   */
  get: async (logId) => {
    if (!logId) throw new Error('شناسه معتبر نیست');
    const response = await apiClient.get(`/sms/logs/${logId}`);
    return response.data;
  },

  /**
   * حذف
   * DELETE /sms/logs/{id}
   */
  delete: async (logId) => {
    if (!logId) throw new Error('شناسه معتبر نیست');
    const response = await apiClient.delete(`/sms/logs/${logId}`);
    return response.data;
  },

  /**
   * ارسال مجدد
   * POST /sms/logs/{id}/resend
   */
  resend: async (logId) => {
    if (!logId) throw new Error('شناسه معتبر نیست');
    const response = await apiClient.post(`/sms/logs/${logId}/resend`);
    return response.data;
  },

  /**
   * آمار
   * GET /sms/logs/stats
   */
  stats: async ({ fromDate = null, toDate = null } = {}) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);

    const qs = params.toString();
    const response = await apiClient.get(
      `/sms/logs/stats${qs ? `?${qs}` : ''}`
    );
    return response.data;
  },

  /**
   * خروجی CSV
   * GET /sms/logs/export
   */
  export: async ({
    search = null,
    kind = null,
    status = null,
    phone = null,
    fromDate = null,
    toDate = null,
  } = {}) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (kind) params.append('kind', kind);
    if (status) params.append('status', status);
    if (phone) params.append('phone', phone);
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);

    const response = await apiClient.get(
      `/sms/logs/export?${params.toString()}`,
      { responseType: 'blob' }
    );
    return response;
  },
};

export default smsLogApi;