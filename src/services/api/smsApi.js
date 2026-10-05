// src/services/api/smsApi.js
import apiClient from './apiClient';

export const smsApi = {
  /**
   * ارسال پیامک تستی
   */
  sendTest: async ({ mobile, text }) => {
    const response = await apiClient.post('/sms/test', { mobile, text });
    return response.data;
  },

  /**
   * لیست قالب‌ها
   */
  listTemplates: async () => {
    const response = await apiClient.get('/sms/templates');
    return response.data;
  },

  /**
   * یک قالب
   */
  getTemplate: async (id) => {
    const response = await apiClient.get(`/sms/templates/${id}`);
    return response.data;
  },

  /**
   * ویرایش قالب
   */
  updateTemplate: async (id, data) => {
    const response = await apiClient.put(`/sms/templates/${id}`, data);
    return response.data;
  },

  /**
   * پیش‌نمایش قالب
   */
  previewTemplate: async ({ body, sampleData }) => {
    const response = await apiClient.post('/sms/templates/preview', {
      body,
      sample_data: sampleData,
    });
    return response.data;
  },

  /**
   * تنظیمات پیامک
   */
  getSettings: async () => {
    const response = await apiClient.get('/sms/settings');
    return response.data;
  },

  /**
   * ویرایش تنظیمات
   */
  updateSettings: async (data) => {
    const response = await apiClient.put('/sms/settings', data);
    return response.data;
  },
};

export default smsApi;