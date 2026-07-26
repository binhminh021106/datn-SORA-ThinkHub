import axios from 'axios';
import { clearAdminAuthStorage, getAdminToken, getAdminRefreshToken } from '@/composables/useUtilities';
import { API_BASE_URL } from '@/utils/env';

const adminApiClient = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

adminApiClient.interceptors.request.use(
  (config) => {
    const token = getAdminToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

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

adminApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return adminApiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getAdminRefreshToken();
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/admin/refresh-token`, {}, {
            headers: {
              'Authorization': `Bearer ${refreshToken}`,
              'Accept': 'application/json'
            }
          });
          
          localStorage.setItem('admin_token', data.access_token);
          if (data.refresh_token) {
            localStorage.setItem('admin_refresh_token', data.refresh_token);
          }
          
          adminApiClient.defaults.headers.common['Authorization'] = 'Bearer ' + data.access_token;
          originalRequest.headers['Authorization'] = 'Bearer ' + data.access_token;
          
          processQueue(null, data.access_token);
          isRefreshing = false;
          
          return adminApiClient(originalRequest);
        } catch (err) {
          processQueue(err, null);
          isRefreshing = false;
        }
      }

      clearAdminAuthStorage();

      if (!originalRequest.ignoreAuthRedirect && !window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }

    return Promise.reject(error);
  },
);

export default adminApiClient;
