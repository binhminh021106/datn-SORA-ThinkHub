import axios from 'axios';
import { clearUserAuthStorage, getUserToken } from '@/composables/useUtilities';
import { API_BASE_URL } from '@/utils/env';

const PROTECTED_CLIENT_PATHS = ['/profile', '/order', '/checkout', '/favourite'];

const createCartSessionId = () => {
  const randomId = globalThis.crypto?.randomUUID?.();

  if (randomId) {
    return `session_${randomId}`;
  }

  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const getCartSessionId = (ensure = false) => {
  let sessionId = localStorage.getItem('cart_session_id');

  if (!sessionId && ensure) {
    sessionId = createCartSessionId();
    localStorage.setItem('cart_session_id', sessionId);
  }

  return sessionId;
};

const clientApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

clientApiClient.interceptors.request.use(
  (config) => {
    const token = getUserToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!config.skipCartSession) {
      const sessionId = getCartSessionId(config.ensureCartSession === true);

      if (sessionId) {
        config.headers['X-Cart-Session-Id'] = sessionId;
      }
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error),
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

clientApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    sanitizeErrorMessage(error);

    if (error.response?.status === 401) {
      clearUserAuthStorage();

      const currentPath = window.location.pathname || '';
      const isProtectedPath = PROTECTED_CLIENT_PATHS.some((path) => currentPath.startsWith(path));

      if (!error.config?.ignoreAuthRedirect && isProtectedPath && !currentPath.includes('/login')) {
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?redirect=${returnUrl}`;
      }
    }

    return Promise.reject(error);
  },
);

export default clientApiClient;
