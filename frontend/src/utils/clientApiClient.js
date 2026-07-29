import axios from 'axios';
import { clearUserAuthStorage, createCartSessionId, getUserToken } from '@/composables/useUtilities';
import { API_BASE_URL } from '@/utils/env';
import { logSafeApiError } from '@/utils/safeConsole';

const PROTECTED_CLIENT_PATHS = ['/profile', '/order', '/checkout', '/favourite'];

const getCartSessionId = (ensure = false) => {
  let sessionId = null;

  try {
    sessionId = localStorage.getItem('cart_session_id');

    if (!sessionId && ensure) {
      sessionId = createCartSessionId();
      if (sessionId) localStorage.setItem('cart_session_id', sessionId);
    }
  } catch {
    return null;
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
      logSafeApiError(`[API Error Masked] HTTP ${status} | URL: ${url}`, error);
      
      error.response.data.message = 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau!';
    }
  }
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

clientApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    sanitizeErrorMessage(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest._retry = true;
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return clientApiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE_URL}/refresh-token`, {}, {
          withCredentials: true,
          timeout: 15000,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        localStorage.setItem('auth_token', data.access_token);
        
        clientApiClient.defaults.headers.common['Authorization'] = 'Bearer ' + data.access_token;
        originalRequest.headers['Authorization'] = 'Bearer ' + data.access_token;
        
        processQueue(null, data.access_token);
        isRefreshing = false;
        
        return clientApiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;

        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          clearUserAuthStorage();

          const currentPath = window.location.pathname || '';
          const isProtectedPath = PROTECTED_CLIENT_PATHS.some((path) => currentPath.startsWith(path));

          if (!originalRequest.ignoreAuthRedirect && isProtectedPath && !currentPath.includes('/login')) {
            const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = `/login?redirect=${returnUrl}`;
          }
        }
        
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default clientApiClient;
