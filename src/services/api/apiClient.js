// src/services/api/apiClient.js
import axios from 'axios';

// ✅ از env بخوان — در production به /api/v1 (هم‌دامنه) اشاره می‌کند
// در development، Vite proxy این را به localhost:8000 هدایت می‌کند
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

console.log('🌐 API Base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// افزودن توکن به همه‌ی درخواست‌ها
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// مدیریت خطاهای احراز هویت
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    const isAuthEndpoint =
      url.includes('/auth/') ||
      url.includes('/login') ||
      url.includes('/logout');

    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      console.warn(`🔒 Auth error on ${url}`);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');

      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/login')
      ) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;