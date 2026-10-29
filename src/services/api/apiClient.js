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

// ═══════════════════════════════════════════════════════════
// Request interceptor — افزودن توکن
// ═══════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════
// وضعیت refresh — جلوگیری از چند refresh همزمان
// ═══════════════════════════════════════════════════════════
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((pending) => {
    if (error) {
      pending.reject(error);
    } else {
      pending.resolve(token);
    }
  });
  failedQueue = [];
};

const clearSession = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
};

const redirectToLogin = () => {
  if (
    typeof window !== 'undefined' &&
    !window.location.pathname.includes('/login')
  ) {
    window.location.href = '/login';
  }
};

// تابع refresh داخلی — از axios خالص استفاده می‌کند تا از import دایره‌ای
// با authApi و همچنین از interceptor خود apiClient در امان باشد.
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await axios.post(
    `${API_BASE_URL}/login/refresh`,
    { refresh_token: refreshToken },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    }
  );

  const data = response.data;
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
  }
  if (data.refresh_token) {
    localStorage.setItem('refresh_token', data.refresh_token);
  }

  return data.access_token;
};

// ═══════════════════════════════════════════════════════════
// Response interceptor — مدیریت خطاها
//
//   - 401 → تلاش برای refresh، سپس تکرار request اصلی
//   - 403 → فقط error (توکن معتبر است، دسترسی نیست)
// ═══════════════════════════════════════════════════════════
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;
    const url = originalRequest?.url || '';

    if (import.meta.env.DEV && error.response) {
      console.error(`❌ API Error: ${status} on ${url}`, {
        data: error.response.data,
        fullURL: `${originalRequest?.baseURL}${url}`,
      });
    }

    // endpointهای احراز هویت نباید refresh را دوباره صدا بزنند
    const isAuthEndpoint =
      url.includes('/login') ||
      url.includes('/logout') ||
      url.includes('/refresh') ||
      url.includes('/password-reset');

    if (status !== 401 || isAuthEndpoint || !originalRequest) {
      return Promise.reject(error);
    }

    if (!localStorage.getItem('refresh_token') || originalRequest._retry) {
      clearSession();
      redirectToLogin();
      return Promise.reject(error);
    }

    // اگر refresh در جریان است، این درخواست را در صف نگه دار
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((queueError) => Promise.reject(queueError));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await refreshAccessToken();
      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearSession();
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
