const DEFAULT_API_URL = 'http://10.0.2.2:8000/api';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

export const MOBILE_AUTH_URL = `${API_BASE_URL}/mobile`;
