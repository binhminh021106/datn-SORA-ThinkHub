import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const getSavedCouponHeaders = async () => {
  const token = await AsyncStorage.getItem('auth_token');
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseApiResponse = async (response) => {
  const json = await response.json();
  if (!response.ok || !json.success) {
    const error = new Error(json.message || 'Không thể xử lý mã giảm giá.');
    error.status = response.status;
    error.payload = json;
    throw error;
  }
  return json;
};

export const fetchSavedCoupons = async () => {
  const response = await fetch(`${API_BASE_URL}/client/saved-coupons`, {
    headers: await getSavedCouponHeaders(),
  });
  const json = await parseApiResponse(response);
  return Array.isArray(json.data) ? json.data : [];
};

export const saveCouponToWallet = async ({ couponId, code }) => {
  const response = await fetch(`${API_BASE_URL}/client/saved-coupons`, {
    method: 'POST',
    headers: await getSavedCouponHeaders(),
    body: JSON.stringify({
      ...(couponId ? { coupon_id: couponId } : {}),
      ...(code ? { code } : {}),
    }),
  });
  return parseApiResponse(response);
};

export const deleteSavedCoupon = async (savedCouponId) => {
  const response = await fetch(`${API_BASE_URL}/client/saved-coupons/${savedCouponId}`, {
    method: 'DELETE',
    headers: await getSavedCouponHeaders(),
  });
  return parseApiResponse(response);
};
