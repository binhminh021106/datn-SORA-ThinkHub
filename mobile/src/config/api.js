export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error('Thiếu cấu hình biến môi trường EXPO_PUBLIC_API_URL trong file .env');
}

export const MOBILE_AUTH_URL = `${API_BASE_URL}/mobile`;
