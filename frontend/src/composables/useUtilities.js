export const getToken = () => {
  const commonKeys = ['access_token', 'token', 'auth_token', 'userToken', 'user_token'];
  for (const k of commonKeys) {
    const val = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (val && val.length > 15) return val;
  }
  return '';
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not defined in environment variables');
}
const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');
const soraPlaceholder = '/Sora-placeholder.png';

export const getFullImage = (path) => {
  if (!path) return soraPlaceholder;
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  if (cleanPath.startsWith('storage/')) return `${BACKEND_URL}/${cleanPath}`;
  return `${BACKEND_URL}/storage/${cleanPath}`;
};

export const formatMoney = (amount) => amount ? new Intl.NumberFormat('vi-VN').format(amount) + ' ₫' : '0 ₫';
