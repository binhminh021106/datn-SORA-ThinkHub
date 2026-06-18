import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('auth_token');
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
};

const parseApiResponse = async (response) => {
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

  if (!response.ok || json.success === false) {
    throw new Error(json.message || 'Không thể xử lý thông báo.');
  }

  return json;
};

export const fetchNotifications = async ({ page = 1, perPage = 10, typeGroup = 'all' } = {}) => {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  if (typeGroup && typeGroup !== 'all') {
    params.set('type_group', typeGroup);
  }

  const response = await fetch(`${API_BASE_URL}/client/notifications?${params.toString()}`, {
    headers,
  });

  return parseApiResponse(response);
};

export const markNotificationAsRead = async (id) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/client/notifications/${id}/read`, {
    method: 'PUT',
    headers,
  });

  return parseApiResponse(response);
};

export const markAllNotificationsAsRead = async () => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/client/notifications/read-all`, {
    method: 'PUT',
    headers,
  });

  return parseApiResponse(response);
};

export const deleteNotification = async (id) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/client/notifications/${id}`, {
    method: 'DELETE',
    headers,
  });

  return parseApiResponse(response);
};

export const deleteReadNotifications = async () => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/client/notifications/read`, {
    method: 'DELETE',
    headers,
  });

  return parseApiResponse(response);
};
