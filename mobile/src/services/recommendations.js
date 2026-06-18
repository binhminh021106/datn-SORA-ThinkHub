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
  const json = text ? JSON.parse(text) : {};

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Không thể tải gợi ý sản phẩm.');
  }

  return json.data || { products: [] };
};
