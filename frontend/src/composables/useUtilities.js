import { API_BASE_URL, BACKEND_URL, getStorageUrl } from '@/utils/env';

export const ADMIN_AUTH_STORAGE_KEYS = ['admin_token', 'adminToken'];
export const ADMIN_AUTH_STATE_KEYS = ['admin_role', 'admin_level', 'admin_info'];
export const USER_AUTH_STORAGE_KEYS = ['access_token', 'token', 'auth_token', 'userToken', 'user_token'];
export const AUTH_STORAGE_KEYS = [
  ...ADMIN_AUTH_STORAGE_KEYS,
  ...ADMIN_AUTH_STATE_KEYS,
  ...USER_AUTH_STORAGE_KEYS,
];

const readTokenFromStorage = (keys) => {
  for (const k of keys) {
    const val = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (val && val.length > 15) return val;
  }
  return '';
};

export const getAdminToken = () => {
  return readTokenFromStorage(ADMIN_AUTH_STORAGE_KEYS);
};

export const getUserToken = () => {
  return readTokenFromStorage(USER_AUTH_STORAGE_KEYS);
};

export const getToken = () => getAdminToken() || getUserToken();

export const clearAuthStorage = (keys = AUTH_STORAGE_KEYS) => {
  keys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

export const clearAdminAuthStorage = () => {
  clearAuthStorage([...ADMIN_AUTH_STORAGE_KEYS, ...ADMIN_AUTH_STATE_KEYS]);
};

export const clearUserAuthStorage = () => {
  clearAuthStorage([...USER_AUTH_STORAGE_KEYS]);
};

export const getHeaders = () => {
  const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  let sid = localStorage.getItem('cart_session_id');
  if (!sid && !token) {
    try {
      sid = 'session_' + (crypto.randomUUID ? crypto.randomUUID() : 'fallback_' + Date.now());
    } catch {
      sid = 'session_' + Date.now();
    }
    localStorage.setItem('cart_session_id', sid);
  }
  if (sid) headers['X-Cart-Session-Id'] = sid;
  return headers;
};

if (!API_BASE_URL && !BACKEND_URL) {
  throw new Error('VITE_API_BASE_URL or VITE_BACKEND_URL must be defined in environment variables');
}

export const getFullImage = (path) => {
  return getStorageUrl(path);
};

export const formatMoney = (amount) => amount ? new Intl.NumberFormat('vi-VN').format(amount) + ' ₫' : '0 ₫';

export const formatCompactPrice = (amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value) || value === 0) return '0 ₫';
  if (value >= 1e9) {
    const num = +(value / 1e9).toFixed(2);
    return num.toString().replace('.', ',') + ' Tỷ';
  }
  if (value >= 1e6) {
    const num = +(value / 1e6).toFixed(2);
    return num.toString().replace('.', ',') + ' Triệu';
  }
  return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
};
export const getProtectedRating = (avgRating, reviewCount) => {
  const count = Number(reviewCount) || 0;
  const avg = Number(avgRating) || 0;
  if (count === 0) return 5.0;
  
  // Bayesian average formula to protect the rating with M=3 ghost reviews of 5.0
  const M = 3; 
  const defaultRating = 5.0;
  
  const totalStars = (avg * count) + (defaultRating * M);
  const totalReviews = count + M;
  
  return Number((totalStars / totalReviews).toFixed(1));
};
