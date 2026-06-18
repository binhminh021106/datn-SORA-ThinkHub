import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const getRecommendationHeaders = async () => {
  const token = await AsyncStorage.getItem('auth_token');

  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchPersonalizedRecommendations = async ({ limit = 10 } = {}) => {
  const headers = await getRecommendationHeaders();
  const response = await fetch(`${API_BASE_URL}/client/recommendations/personalized?limit=${limit}`, {
    headers,
  });
  const text = await response.text();
  let json = {};

  try {
    json = text ? JSON.parse(text) : {};
  } catch (error) {
    const apiError = new Error('Máy chủ trả về phản hồi không hợp lệ.');
    apiError.status = response.status;
    apiError.raw = text;
    throw apiError;
  }

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Không thể tải gợi ý sản phẩm.');
  }

  return json.data || { products: [] };
};
