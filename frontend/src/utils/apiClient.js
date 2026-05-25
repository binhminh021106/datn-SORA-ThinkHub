import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

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
    const token = localStorage.getItem('admin_token') || 
                  localStorage.getItem('auth_token') || 
                  localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors và unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - xóa token và redirect phù hợp cho admin hoặc client
      localStorage.removeItem('admin_token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');

      if (error.config?.ignoreAuthRedirect) {
        return Promise.reject(error);
      }

      const requestUrl = error.config?.url || '';
      const currentPath = window.location.pathname || '';
      const isAdminRequest = requestUrl.includes('/admin/') || currentPath.startsWith('/admin');
      
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
