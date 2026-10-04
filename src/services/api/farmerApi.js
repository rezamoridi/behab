// src/services/api/farmerApi.js
import apiClient from './apiClient';

export const farmerApi = {
  checkDuplicate: async ({ nationalId, phoneNumber }) => {
    if (!nationalId || !phoneNumber) {
      throw new Error('کد ملی و شماره تلفن الزامی است');
    }
    const response = await apiClient.post('/farmers/check-duplicate', {
      national_id: nationalId,
      phone_number: phoneNumber,
    });
    return response.data;
  },

  registerWithFarms: async ({ farmer, farms }) => {
    if (!farmer || !farms || farms.length === 0) {
      throw new Error('اطلاعات کشاورز و حداقل یک مزرعه الزامی است');
    }
    const response = await apiClient.post('/farmers/register-with-farms', { farmer, farms });
    return response.data;
  },

  resendInvitation: async (farmerId) => {
    if (!farmerId) throw new Error('شناسه کشاورز معتبر نیست');
    const response = await apiClient.post(`/farmers/${farmerId}/resend-invitation`);
    return response.data;
  },

  list: async ({ page = 1, pageSize = 20, search = null } = {}) => {
    const safePageSize = Math.min(Math.max(1, pageSize), 100);
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(safePageSize),
    });
    if (search) params.append('search', search);

    const response = await apiClient.get(`/farmers/list?${params.toString()}`);
    return response.data;
  },

  // ✅ fetch همه کشاورزان با pagination خودکار
  listAll: async ({ maxItems = 2000, search = null } = {}) => {
    const allFarmers = [];
    let page = 1;
    const pageSize = 100;

    while (allFarmers.length < maxItems) {
      const data = await farmerApi.list({ page, pageSize, search });
      const items = data?.items || [];
      if (items.length === 0) break;

      allFarmers.push(...items);

      const totalPages = data?.pages || data?.total_pages || 1;
      if (page >= totalPages) break;
      if (items.length < pageSize) break;

      page++;
      if (page > 50) break;
    }

    return {
      items: allFarmers,
      total: allFarmers.length,
    };
  },

  get: async (farmerId) => {
    if (!farmerId) throw new Error('شناسه کشاورز معتبر نیست');
    const response = await apiClient.get(`/farmers/${farmerId}`);
    return response.data;
  },

  update: async (farmerId, payload) => {
    if (!farmerId) throw new Error('شناسه کشاورز معتبر نیست');
    const response = await apiClient.put(`/farmers/${farmerId}`, payload);
    return response.data;
  },

  delete: async (farmerId) => {
    if (!farmerId) throw new Error('شناسه کشاورز معتبر نیست');
    const response = await apiClient.delete(`/farmers/${farmerId}`);
    return response.data;
  },
};

export const farmerAuthApi = {
  login: async (phoneNumber, password) => {
    const formData = new URLSearchParams();
    formData.append('username', phoneNumber);
    formData.append('password', password);
    formData.append('grant_type', 'password');

    const response = await apiClient.post('/farmers/login/access-token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  changePassword: async (newPassword, currentPassword = null) => {
    const body = currentPassword
      ? { current_password: currentPassword, new_password: newPassword }
      : { new_password: newPassword };

    const response = await apiClient.post('/farmers/change-password', body);
    return response.data;
  },

  me: async () => {
    const response = await apiClient.get('/farmers/me');
    return response.data;
  },
};

export default farmerApi;