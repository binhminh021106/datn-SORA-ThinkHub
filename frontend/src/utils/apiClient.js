import axios from 'axios';
import { clearAdminAuthStorage, clearUserAuthStorage, getAdminToken, getUserToken } from '@/composables/useUtilities';
import { API_BASE_URL } from '@/utils/env';

// Tạo axios instance với default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 giây timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Request Interceptor: Thêm token vào tất cả requests
apiClient.interceptors.request.use(
  (config) => {
    const requestUrl = config.url || '';
    const isAdminRequest = requestUrl.includes('/admin/');
    const token = isAdminRequest ? getAdminToken() : getUserToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Lọc lỗi nhạy cảm để không hiển thị ra UI
const sanitizeErrorMessage = (error) => {
  if (error.response?.data && typeof error.response.data.message === 'string') {
    const status = error.response.status;
    const url = error.config?.url || 'unknown_url';
    const msg = error.response.data.message.toLowerCase();
    const isSensitive = 
      status >= 500 ||
      msg.includes('curl error') ||
      msg.includes('pusher error') ||
      msg.includes('sqlstate') ||
      msg.includes('connection refused') ||
      msg.includes('syntax error');

    if (isSensitive) {
      console.error(`[API Error Masked] HTTP ${status} | URL: ${url}`);
      console.error('[Original Error Data]:', error.response.data);
      console.error('[Full Error Object]:', error);
      
      error.response.data.message = 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau!';
    }
  }
};

// Response Interceptor: Handle errors và unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    sanitizeErrorMessage(error);

    if (error.response?.status === 401) {
      // Unauthorized - xóa token và redirect phù hợp cho admin hoặc client
      const requestUrl = error.config?.url || '';
      const currentPath = window.location.pathname || '';
      const isAdminRequest = requestUrl.includes('/admin/');

      if (isAdminRequest) {
        clearAdminAuthStorage();
      } else {
        clearUserAuthStorage();
      }

      if (error.config?.ignoreAuthRedirect) {
        return Promise.reject(error);
      }

      if (isAdminRequest) {
        if (!currentPath.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
      } else {
        const protectedPaths = ['/profile', '/order', '/checkout', '/favourite'];
        const isProtectedPath = protectedPaths.some(p => currentPath.startsWith(p));
        if (isProtectedPath && !currentPath.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
