import axios from 'axios';

// ========== ENV VARIABLES - TẬP TRUNG TẠI ĐÂY ==========

// 1️⃣ API & Backend URLs
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
export const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');
export const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || `${BACKEND_URL}/storage`;

// 2️⃣ Frontend & Public URLs
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

// 3️⃣ Third-party Tokens
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// 4️⃣ Reverb Config (cho main.js)
export const REVERB_CONFIG = {
  appKey: import.meta.env.VITE_REVERB_APP_KEY || 'sora_super_key',
  host: import.meta.env.VITE_REVERB_HOST || '127.0.0.1',
  port: import.meta.env.VITE_REVERB_PORT || 8080,
  scheme: import.meta.env.VITE_REVERB_SCHEME || 'http',
};

// ========== VALIDATION ==========
if (!API_BASE_URL) {
  console.warn('⚠️ VITE_API_BASE_URL is not defined, using fallback');
}

// ========== HELPER FUNCTIONS ==========

/**
 * Lấy token từ localStorage hoặc sessionStorage
 * Hỗ trợ nhiều key: admin_token, token, auth_token, userToken, user_token, access_token
 */
export const getToken = () => {
  const commonKeys = ['access_token', 'token', 'auth_token', 'userToken', 'user_token', 'admin_token'];
  for (const k of commonKeys) {
    const val = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (val && val.length > 15) return val;
  }
  return '';
};

/**
 * Lấy session ID cho cart, sinh mới nếu chưa có
 */
const getSessionId = () => {
  let sid = localStorage.getItem('cart_session_id');
  if (!sid) {
    try {
      sid = 'session_' + (crypto.randomUUID ? crypto.randomUUID() : 'fallback_' + Date.now());
    } catch {
      sid = 'session_' + Date.now();
    }
    localStorage.setItem('cart_session_id', sid);
  }
  return sid;
};

/**
 * Xây dựng headers cho API request
 * Bao gồm: Authorization, Accept, Content-Type, X-Cart-Session-Id
 */
export const getHeaders = () => {
  const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const sid = getSessionId();
  if (sid) headers['X-Cart-Session-Id'] = sid;
  return headers;
};

/**
 * Xây dựng full image URL từ path
 * Hỗ trợ: null/empty, http URLs, data URLs, storage paths
 */
export const getFullImage = (path) => {
  if (!path) return '/Sora-placeholder.png';
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  if (cleanPath.startsWith('storage/')) return `${BACKEND_URL}/${cleanPath}`;
  return `${STORAGE_URL}/${cleanPath}`;
};

/**
 * Format số tiền theo định dạng Việt Nam
 */
export const formatMoney = (amount) =>
  amount ? new Intl.NumberFormat('vi-VN').format(amount) + ' ₫' : '0 ₫';

// ========== AXIOS INSTANCE ==========

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// ✅ Request Interceptor - Thêm token & special headers tự động
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Thêm Socket ID (từ Echo) nếu có
    const socketId = localStorage.getItem('socket_id');
    if (socketId) {
      config.headers['X-Socket-Id'] = socketId;
    }

    // Thêm Cart Session ID
    const sid = getSessionId();
    if (sid) {
      config.headers['X-Cart-Session-Id'] = sid;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response Interceptor - Handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      // Clear tokens
      const tokenKeys = ['access_token', 'token', 'auth_token', 'userToken', 'user_token', 'admin_token'];
      tokenKeys.forEach(k => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
      // Optionally redirect to login
      // window.location.href = '/login';
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('❌ Access forbidden:', error.response?.data?.message);
    }

    return Promise.reject(error);
  }
);

// ========== EXPORTS ==========
export { apiClient };
export default apiClient;
