import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const PUSH_TOKEN_STORAGE_KEY = 'sora_expo_push_token';

const parsePushApiResponse = async (response) => {
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
    const apiError = new Error(json.message || 'Không thể đồng bộ push token.');
    apiError.status = response.status;
    apiError.payload = json;
    throw apiError;
  }

  return json;
};

export const getExpoNotificationsModule = async () => {
  try {
    return await import('expo-notifications');
  } catch (error) {
    console.log('expo-notifications is not available:', error?.message || error);
    return null;
  }
};

const getExpoProjectId = async () => {
  try {
    const Constants = await import('expo-constants');
    return (
      Constants.default?.expoConfig?.extra?.eas?.projectId ||
      Constants.default?.easConfig?.projectId ||
      null
    );
  } catch (_) {
    return null;
  }
};

export const registerDevicePushToken = async () => {
  if (Platform.OS === 'web') {
    return null;
  }

  const authToken = await AsyncStorage.getItem('auth_token');
  if (!authToken) {
    return null;
  }

  const Notifications = await getExpoNotificationsModule();
  if (!Notifications) {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'SORA',
      importance: Notifications.AndroidImportance?.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#9f273b',
    });
  }

  const existingPermission = await Notifications.getPermissionsAsync();
  let finalStatus = existingPermission.status;

  if (finalStatus !== 'granted') {
    const requestedPermission = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermission.status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = await getExpoProjectId();
  const pushTokenResult = projectId
    ? await Notifications.getExpoPushTokenAsync({ projectId })
    : await Notifications.getExpoPushTokenAsync();

  const expoPushToken = pushTokenResult?.data;
  if (!expoPushToken) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/client/push-tokens`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      expo_push_token: expoPushToken,
      platform: Platform.OS,
      device_name: Platform.OS,
    }),
  });
  await parsePushApiResponse(response);

  await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, expoPushToken);
  return expoPushToken;
};

export const unregisterDevicePushToken = async () => {
  const authToken = await AsyncStorage.getItem('auth_token');
  const expoPushToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);

  if (!authToken || !expoPushToken) {
    return;
  }

  const response = await fetch(`${API_BASE_URL}/client/push-tokens`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${authToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expo_push_token: expoPushToken }),
  });
  await parsePushApiResponse(response);
  await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
};
