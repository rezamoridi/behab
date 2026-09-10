// src/services/api/authApi.js
import apiClient from './apiClient';

// ============================================
// مدیریت توکن
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
// اطلاعات کاربر
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
// API
// ============================================

export const getCurrentUser = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      removeUserData();
      return null;
    }

    const response = await apiClient.get('/me');
    const userData = response.data;
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
    if (error.response?.status === 401 || error.response?.status === 403) {
      return false;
    }
    return true;
  }
};

export const getCachedUser = () => getUserData();

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

    if (data.access_token) {
      setAuthToken(data.access_token);
    }

    if (data.requires_2fa) {
      return { requires_2fa: true, temp_token: data.temp_token };
    }

    const userData = await getCurrentUser();
    return { success: true, user: userData };
  } catch (error) {
    console.error('خطا در loginWithCredentials:', error);
    throw error;
  }
};

export const verifyOTP = async (tempToken, otpCode) => {
  try {
    const response = await apiClient.post('/login/verify-otp', {
      temp_token: tempToken,
      otp_code: otpCode,
    });

    const data = response.data;

    if (data.access_token) {
      setAuthToken(data.access_token);
    }

    const userData = await getCurrentUser();
    return { success: true, user: userData };
  } catch (error) {
    console.error('خطا در verifyOTP:', error);
    throw error;
  }
};

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