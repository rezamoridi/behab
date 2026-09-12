// src/services/api/apiClient.js
import axios from 'axios';

// ✅ در هر دو محیط از /api/v1 استفاده می‌کنیم:
// - Development: Vite Proxy این را به localhost:8000 فوروارد می‌کند
// - Production: nginx این را به 127.0.0.1:8000 فوروارد می‌کند
//
// نتیجه: مرورگر همان دامنه را صدا می‌زند → نیازی به CORS نیست.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// لاگ دیباگ (فقط در development)
if (import.meta.env.DEV) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌐 Environment:', import.meta.env.VITE_APP_ENV || 'unknown');
  console.log('🌐 API Base URL:', API_BASE_URL);
  console.log('🌐 Window Origin:', window.location.origin);
  console.log('🌐 Full API URL:', `${window.location.origin}${API_BASE_URL}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// افزودن توکن
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

// مدیریت خطاها
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // لاگ خطا در development
    if (import.meta.env.DEV && error.response) {
      console.error(`❌ API Error: ${status} on ${url}`, {
        data: error.response.data,
        fullURL: `${error.config?.baseURL}${url}`,
      });
    }

    const isAuthEndpoint =
      url.includes('/auth/') ||
      url.includes('/login') ||
      url.includes('/logout') ||
      url.includes('/me');

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