// src/services/api/farmerApi.js
import apiClient from './apiClient';

// ============================================================
// Farmer API — مدیریت کشاورزان (سمت ادمین/اپراتور)
// همه endpoint ها با auth User محافظت می‌شوند.
// ============================================================

export const farmerApi = {
  // ----------------------------------------------------------
  // چک تکراری بودن کشاورز (امن — بدون افشای اطلاعات)
  // POST /api/v1/farmers/check-duplicate
  //
  // پاسخ: { status: "new" | "existing_match" | "conflict", message: string }
  // ----------------------------------------------------------
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

  // ----------------------------------------------------------
  // ثبت اتمیک کشاورز + مزارع
  // POST /api/v1/farmers/register-with-farms
  //
  // پاسخ: {
  //   action: "created" | "updated",
  //   message: string,
  //   farmer: {...},
  //   farms: [...],
  //   sms_sent: boolean
  // }
  // ----------------------------------------------------------
  registerWithFarms: async ({ farmer, farms }) => {
    if (!farmer || !farms || farms.length === 0) {
      throw new Error('اطلاعات کشاورز و حداقل یک مزرعه الزامی است');
    }

    const response = await apiClient.post(
      '/farmers/register-with-farms',
      { farmer, farms },
    );

    return response.data;
  },

  // ----------------------------------------------------------
  // ارسال مجدد پیامک دعوت
  // POST /api/v1/farmers/{farmer_id}/resend-invitation
  // ----------------------------------------------------------
  resendInvitation: async (farmerId) => {
    if (!farmerId) throw new Error('شناسه کشاورز معتبر نیست');

    const response = await apiClient.post(
      `/farmers/${farmerId}/resend-invitation`,
    );
    return response.data;
  },

  // ----------------------------------------------------------
  // لیست کشاورزان
  // GET /api/v1/farmers/list?page=&page_size=&search=
  // ----------------------------------------------------------
  list: async ({ page = 1, pageSize = 20, search = null } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });
    if (search) params.append('search', search);

    const response = await apiClient.get(
      `/farmers/list?${params.toString()}`,
    );
    return response.data;
  },

  // ----------------------------------------------------------
  // جزئیات کشاورز
  // GET /api/v1/farmers/{farmer_id}
  // ----------------------------------------------------------
  get: async (farmerId) => {
    if (!farmerId) throw new Error('شناسه کشاورز معتبر نیست');
    const response = await apiClient.get(`/farmers/${farmerId}`);
    return response.data;
  },

  // ----------------------------------------------------------
  // ویرایش کشاورز (national_id, fname, lname)
  // PUT /api/v1/farmers/{farmer_id}
  // ----------------------------------------------------------
  update: async (farmerId, payload) => {
    if (!farmerId) throw new Error('شناسه کشاورز معتبر نیست');
    const response = await apiClient.put(
      `/farmers/${farmerId}`,
      payload,
    );
    return response.data;
  },

  // ----------------------------------------------------------
  // حذف کشاورز
  // DELETE /api/v1/farmers/{farmer_id}
  // ----------------------------------------------------------
  delete: async (farmerId) => {
    if (!farmerId) throw new Error('شناسه کشاورز معتبر نیست');
    const response = await apiClient.delete(`/farmers/${farmerId}`);
    return response.data;
  },
};

// ============================================================
// Farmer Auth API — برای لاگین خود کشاورز (آینده)
// ============================================================
export const farmerAuthApi = {
  login: async (phoneNumber, password) => {
    const formData = new URLSearchParams();
    formData.append('username', phoneNumber);
    formData.append('password', password);
    formData.append('grant_type', 'password');

    const response = await apiClient.post(
      '/farmers/login/access-token',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return response.data;
  },

  changePassword: async (newPassword, currentPassword = null) => {
    const body = currentPassword
      ? { current_password: currentPassword, new_password: newPassword }
      : { new_password: newPassword };

    const response = await apiClient.post(
      '/farmers/change-password',
      body,
    );
    return response.data;
  },

  me: async () => {
    const response = await apiClient.get('/farmers/me');
    return response.data;
  },
};

export default farmerApi;