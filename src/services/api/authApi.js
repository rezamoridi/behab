// src/services/api/authApi.js
import apiClient from './apiClient';

// ============================================
// Token Management
// ============================================
export const setAuthToken = (token) => {
  localStorage.setItem('access_token', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_data');
};

// ============================================
// User Data
// ============================================
export const setUserData = (userData) => {
  localStorage.setItem('user_data', JSON.stringify(userData));
};

export const getUserData = () => {
  const data = localStorage.getItem('user_data');
  return data ? JSON.parse(data) : null;
};

export const removeUserData = () => {
  localStorage.removeItem('user_data');
};

export const hasUserData = () => {
  return localStorage.getItem('user_data') !== null;
};

// ============================================
// ✅ Permissions
// ============================================
export const fetchMyPermissions = async () => {
  try {
    const response = await apiClient.get('/users/me/permissions');
    return response.data;
  } catch (error) {
    console.error('خطا در fetchMyPermissions:', error);
    return null;
  }
};

/**
 * ✅ گرفتن region_ids و اضافه کردن به userData
 * @param {object} userData - شیء کاربر (از /me)
 * @returns {object} userData با region_ids
 */
const enrichUserWithPermissions = async (userData) => {
  if (!userData) return userData;

  try {
    const perms = await fetchMyPermissions();
    if (perms) {
      return {
        ...userData,
        region_ids: perms.region_ids || [],
      };
    }
  } catch (err) {
    console.warn('Could not enrich user with permissions:', err);
  }

  // fallback
  return {
    ...userData,
    region_ids: userData.region_ids || [],
  };
};

// ============================================
// Current user
// ============================================
export const getCurrentUser = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      removeUserData();
      return null;
    }

    const response = await apiClient.get('/me');
    let userData = response.data;

    // ✅ اضافه کردن region_ids
    userData = await enrichUserWithPermissions(userData);

    setUserData(userData);
    return userData;
  } catch (error) {
    console.error('خطا در getCurrentUser:', error);
    return null;
  }
};

export const validateToken = async () => {
  try {
    const token = getAuthToken();
    if (!token) return false;

    await apiClient.get('/me');
    return true;
  } catch (error) {
    if (
      error.response?.status === 401 ||
      error.response?.status === 403
    ) {
      return false;
    }
    return true;
  }
};

export const getCachedUser = () => getUserData();

/**
 * ✅ بازخوانی کامل کاربر + permissions
 * (برای استفاده بعد از تغییر نقش/مناطق از پنل تنظیمات)
 */
export const refreshUserWithPermissions = async () => {
  try {
    const userData = await getCurrentUser();
    return userData;
  } catch (error) {
    console.error('خطا در refreshUserWithPermissions:', error);
    return null;
  }
};

// ============================================
// Login — Phase 1
// ============================================
export const loginWithCredentials = async (username, password) => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');
    formData.append('scope', '');
    formData.append('client_id', '');
    formData.append('client_secret', '');

    const response = await apiClient.post('/login/access-token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = response.data;

    // ── OTP required ──
    if (data.requires_otp) {
      return {
        requires_otp: true,
        temp_token: data.temp_token,
      };
    }

    // ── Direct login (OTP disabled) ──
    if (data.access_token) {
      setAuthToken(data.access_token);
    }

    let userData = data.user || (await getCurrentUser());

    // ✅ اگر region_ids نداریم، از permissions بگیر
    if (userData && !userData.region_ids) {
      userData = await enrichUserWithPermissions(userData);
    }

    if (userData) setUserData(userData);

    return {
      success: true,
      user: userData,
      requires_otp: false,
    };
  } catch (error) {
    console.error('خطا در loginWithCredentials:', error);
    throw error;
  }
};

// ============================================
// Login — Phase 2: Verify OTP
// ============================================
export const verifyOtp = async (tempToken, code) => {
  try {
    const response = await apiClient.post('/login/verify-otp', {
      temp_token: tempToken,
      code: String(code),
    });

    const data = response.data;

    if (data.access_token) {
      setAuthToken(data.access_token);
    }

    let userData = data.user || (await getCurrentUser());

    // ✅ اگر region_ids نداریم، از permissions بگیر
    if (userData && !userData.region_ids) {
      userData = await enrichUserWithPermissions(userData);
    }

    if (userData) setUserData(userData);

    return {
      success: true,
      user: userData,
    };
  } catch (error) {
    console.error('خطا در verifyOtp:', error);
    throw error;
  }
};

// ============================================
// Login — Resend OTP
// ============================================
export const resendOtp = async (tempToken) => {
  try {
    const response = await apiClient.post('/login/resend-otp', {
      temp_token: tempToken,
    });
    return response.data;
  } catch (error) {
    console.error('خطا در resendOtp:', error);
    throw error;
  }
};

// ============================================
// Forgot Password — Request
// ============================================
export const requestPasswordReset = async (username) => {
  try {
    const response = await apiClient.post('/password-reset/request', {
      username,
    });
    return response.data;
  } catch (error) {
    console.error('خطا در requestPasswordReset:', error);
    throw error;
  }
};

// ============================================
// Forgot Password — Verify
// ============================================
export const verifyPasswordResetOtp = async (username, code) => {
  try {
    const response = await apiClient.post('/password-reset/verify', {
      username,
      code: String(code),
    });
    return response.data;
  } catch (error) {
    console.error('خطا در verifyPasswordResetOtp:', error);
    throw error;
  }
};

// ============================================
// Forgot Password — Confirm
// ============================================
export const confirmPasswordReset = async (resetToken, newPassword) => {
  try {
    const response = await apiClient.post('/password-reset/confirm', {
      reset_token: resetToken,
      new_password: newPassword,
    });
    return response.data;
  } catch (error) {
    console.error('خطا در confirmPasswordReset:', error);
    throw error;
  }
};

// ============================================
// Logout
// ============================================
export const logout = async () => {
  try {
    const token = getAuthToken();
    if (token) {
      await apiClient.post('/logout');
    }
  } catch (error) {
    console.error('خطا در logout:', error);
  } finally {
    removeAuthToken();
  }
};