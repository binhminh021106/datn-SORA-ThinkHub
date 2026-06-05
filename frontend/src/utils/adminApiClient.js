import axios from 'axios';
import { clearAdminAuthStorage, getAdminToken } from '@/composables/useUtilities';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '');

if (!API_BASE_URL) {
  throw new Error('Missing required env: VITE_API_BASE_URL');
}

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

adminApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAdminAuthStorage();

      if (!error.config?.ignoreAuthRedirect && !window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }

    return Promise.reject(error);
  },
);

export default adminApiClient;