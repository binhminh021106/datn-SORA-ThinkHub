const trimTrailingSlash = (value) => (value || '').replace(/\/+$/, '');
const trimApiSuffix = (value) => trimTrailingSlash(value).replace(/\/api\/?$/, '');

export const API_BASE_URL = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL);
export const BACKEND_URL = trimTrailingSlash(import.meta.env.VITE_BACKEND_URL) || trimApiSuffix(API_BASE_URL);
export const STORAGE_URL = trimTrailingSlash(import.meta.env.VITE_STORAGE_URL) || `${BACKEND_URL}/storage`;
export const FRONTEND_URL = trimTrailingSlash(import.meta.env.VITE_FRONTEND_URL) || window.location.origin;
export const REVERB_APP_KEY = import.meta.env.VITE_REVERB_APP_KEY;
export const REVERB_HOST = import.meta.env.VITE_REVERB_HOST || window.location.hostname;
export const REVERB_PORT = Number(import.meta.env.VITE_REVERB_PORT || 8080);
export const REVERB_SCHEME = import.meta.env.VITE_REVERB_SCHEME || window.location.protocol.replace(':', '') || 'http';

if (!API_BASE_URL) {
  throw new Error('Missing required env: VITE_API_BASE_URL');
}

if (!BACKEND_URL) {
  throw new Error('Missing required env: VITE_BACKEND_URL or derivable VITE_API_BASE_URL');
}

export const getStorageUrl = (path, fallback = '/Sora-placeholder.png') => {
  if (!path) return fallback;
  if (typeof path !== 'string') return fallback;
  if (path.startsWith('http') || path.startsWith('data:image')) return path;

  let cleanPath = path.replace(/^\/+/, '').replace(/^public\//, '');
  if (cleanPath.startsWith('storage/')) {
    cleanPath = cleanPath.substring('storage/'.length);
  }

  return `${STORAGE_URL}/${cleanPath}`;
};
