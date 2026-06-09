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
  let json = {};
  const text = await response.text();

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { message: text };
    }
  }

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
  const normalizedCode = String(code || '').trim();
  if (!couponId && !normalizedCode) {
    throw new Error('Vui lòng chọn mã giảm giá cần lưu.');
  }

  const response = await fetch(`${API_BASE_URL}/client/saved-coupons`, {
    method: 'POST',
    headers: await getSavedCouponHeaders(),
    body: JSON.stringify({
      ...(couponId ? { coupon_id: couponId } : {}),
      ...(normalizedCode ? { code: normalizedCode } : {}),
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
