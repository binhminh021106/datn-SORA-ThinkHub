import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { MOBILE_AUTH_URL } from '../config/api';

let isGoogleConfigured = false;
let googleSignInModule = null;

const getGoogleSignInModule = () => {
  if (Constants.appOwnership === 'expo') {
    throw new Error('Đăng nhập Google cần Development Build. Bạn vẫn có thể dùng Expo Go để test các chức năng khác.');
  }

  if (!googleSignInModule) {
    googleSignInModule = require('@react-native-google-signin/google-signin');
  }

  return googleSignInModule;
};

const getGoogleErrorMessage = (error) => {
  const statusCodes = googleSignInModule?.statusCodes || {};

  if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
    return 'Bạn đã hủy đăng nhập Google.';
  }
  if (error?.code === statusCodes.IN_PROGRESS) {
    return 'Google đang xử lý đăng nhập, vui lòng chờ một chút.';
  }
  if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    return 'Thiết bị Android chưa có Google Play Services khả dụng.';
  }
  if (error?.code === statusCodes.SIGN_IN_REQUIRED) {
    return 'Vui lòng chọn tài khoản Google để tiếp tục.';
  }

  return error?.message || 'Không thể đăng nhập bằng Google. Vui lòng thử lại.';
};

export const configureGoogleSignIn = () => {
  if (isGoogleConfigured) return;

  const { GoogleSignin } = getGoogleSignInModule();
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

  if (!webClientId) {
    throw new Error('Thiếu EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID trong mobile/.env.');
  }

  GoogleSignin.configure({
    webClientId,
    iosClientId,
    scopes: ['email', 'profile'],
    offlineAccess: false,
  });

  isGoogleConfigured = true;
};

export const loginWithGoogle = async () => {
  try {
    configureGoogleSignIn();
    const { GoogleSignin } = getGoogleSignInModule();

    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    await GoogleSignin.signOut().catch(() => {});
    const googleUser = await GoogleSignin.signIn();
    const idToken = googleUser?.data?.idToken || googleUser?.idToken;

    if (!idToken) {
      throw new Error('Google chưa trả về idToken. Hãy kiểm tra Web Client ID.');
    }

    const response = await fetch(`${MOBILE_AUTH_URL}/google-login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id_token: idToken }),
    });

    const payload = await response.json();
    if (!response.ok) {
      if (payload.errors) {
        throw new Error(Object.values(payload.errors).flat().join('\n'));
      }
      throw new Error(payload.message || 'Đăng nhập Google không thành công.');
    }

    return payload;
  } catch (error) {
    throw new Error(getGoogleErrorMessage(error));
  }
};
