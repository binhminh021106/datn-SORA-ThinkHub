import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/api';
import { showCustomAlert } from '../components/CustomAlert';
import SmartImage from '../components/SmartImage';

const BRAND_RED = '#9f273b';
const BRAND_GOLD = '#e7ce7d';
const PAGE_MAX_WIDTH = 680;
const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_INFO_KEY = 'admin_info';

const getStorageUrl = (path) => {
  if (!path) return '';
  const origin = API_BASE_URL.replace(/\/api$/, '');
  if (path.startsWith('http')) {
    return path
      .replace('http://127.0.0.1:8000', origin)
      .replace('http://localhost:8000', origin)
      .replace('https://127.0.0.1:8000', origin)
      .replace('https://localhost:8000', origin);
  }
  if (path.startsWith('/storage/')) return `${origin}${path}`;
  if (path.startsWith('storage/')) return `${origin}/${path}`;
  return `${origin}/storage/${path.startsWith('/') ? path.slice(1) : path}`;
};

const getApiMessage = async (response) => {
  try {
    const payload = await response.json();
    return payload?.message || payload?.error || 'Máy chủ đang từ chối yêu cầu.';
  } catch {
    return 'Máy chủ đang từ chối yêu cầu.';
  }
};

const parseQrToken = (rawValue) => {
  const value = String(rawValue || '').trim();
  if (!value) return '';

  const queryMatch = value.match(/[?&](?:qr_token|token)=([^&#]+)/);
  if (queryMatch?.[1]) {
    return decodeURIComponent(queryMatch[1]).trim();
  }

  if (/^https?:\/\//i.test(value)) {
    const pathToken = value.split(/[/?#]/).filter(Boolean).pop();
    return decodeURIComponent(pathToken || value).trim();
  }

  return value;
};

const getAttendanceStatusConfig = (status) => {
  switch (status?.state) {
    case 'ready':
      if (!status?.shift_assignment) {
        return {
          label: 'Chưa có ca làm',
          icon: 'calendar-clear-outline',
          color: '#8b6f43',
          bg: '#fff8e6',
          border: '#f1ddb2',
        };
      }
      return {
        label: 'Chưa check-in',
        icon: 'time-outline',
        color: '#9f273b',
        bg: '#fff4f6',
        border: '#f0cdd3',
      };
    case 'working':
    case 'hanging':
      return {
        label: 'Đang trong ca làm',
        icon: 'play-circle-outline',
        color: '#15803d',
        bg: '#f0fdf4',
        border: '#bbf7d0',
      };
    case 'completed':
      return {
        label: 'Đã check-in',
        icon: 'checkmark-circle-outline',
        color: '#2563eb',
        bg: '#eff6ff',
        border: '#bfdbfe',
      };
    case 'loading':
      return {
        label: 'Đang kiểm tra',
        icon: 'sync-outline',
        color: '#6b7280',
        bg: '#f9fafb',
        border: '#e5e7eb',
      };
    default:
      return {
        label: 'Chưa check-in',
        icon: 'help-circle-outline',
        color: '#6b7280',
        bg: '#f9fafb',
        border: '#e5e7eb',
      };
  }
};

const fetchAdminProfileQuery = async (token) => {
  const response = await fetch(`${API_BASE_URL}/admin/profile`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getApiMessage(response));
  }

  const payload = await response.json();
  const nextAdmin = payload?.data;
  if (!payload?.success || !nextAdmin) {
    throw new Error(payload?.message || 'Không thể tải thông tin nhân viên.');
  }

  await AsyncStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(nextAdmin));
  return nextAdmin;
};

const fetchAttendanceStatusQuery = async (token) => {
  const response = await fetch(`${API_BASE_URL}/admin/attendances/status`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    throw new Error('Phiên đăng nhập nhân viên đã hết hạn.');
  }

  if (!response.ok) {
    throw new Error(await getApiMessage(response));
  }

  const payload = await response.json();
  if (!payload?.success) {
    throw new Error(payload?.message || 'Không thể tải trạng thái chấm công.');
  }

  return {
    state: payload.state,
    data: payload.data || null,
    shift_assignment: payload.shift_assignment || null,
  };
};

export default function StaffAttendanceScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused();
  const queryClient = useQueryClient();
  const isMountedRef = useRef(true);
  const processingRef = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [adminToken, setAdminToken] = useState('');
  const [adminInfo, setAdminInfo] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [lastQrToken, setLastQrToken] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState({ state: 'loading' });
  const pagePadding = width >= 720 ? 24 : 16;

  const adminName = useMemo(() => (
    adminInfo?.fullname || adminInfo?.name || adminInfo?.fullName || adminInfo?.email || 'Nhân viên SORA'
  ), [adminInfo]);
  const adminAvatarUrl = useMemo(() => getStorageUrl(adminInfo?.avatar_url), [adminInfo?.avatar_url]);
  const attendanceStatusConfig = useMemo(() => getAttendanceStatusConfig(attendanceStatus), [attendanceStatus]);

  useEffect(() => {
    if (adminInfo?.avatar_url) {
      console.log('Staff avatar URL:', adminAvatarUrl);
    }
  }, [adminAvatarUrl, adminInfo?.avatar_url]);

  const adminProfileQuery = useQuery({
    queryKey: ['staff', 'profile', adminToken],
    queryFn: () => fetchAdminProfileQuery(adminToken),
    enabled: !!adminToken,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });

  const attendanceStatusQuery = useQuery({
    queryKey: ['staff', 'attendance-status', adminToken],
    queryFn: () => fetchAttendanceStatusQuery(adminToken),
    enabled: !!adminToken,
    staleTime: 1000 * 20,
    gcTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (adminProfileQuery.data) {
      setAdminInfo(adminProfileQuery.data);
    }
  }, [adminProfileQuery.data]);

  useEffect(() => {
    if (attendanceStatusQuery.data) {
      setAttendanceStatus(attendanceStatusQuery.data);
    } else if (!adminToken) {
      setAttendanceStatus({ state: 'ready' });
    }
  }, [adminToken, attendanceStatusQuery.data]);

  useEffect(() => {
    if (attendanceStatusQuery.isError && adminToken) {
      setAttendanceStatus({ state: 'ready' });
    }
  }, [adminToken, attendanceStatusQuery.isError]);

  useEffect(() => {
    if (!isFocused || !adminToken) return;
    adminProfileQuery.refetch();
    attendanceStatusQuery.refetch();
  }, [adminProfileQuery.refetch, adminToken, attendanceStatusQuery.refetch, isFocused]);

  useEffect(() => {
    isMountedRef.current = true;
    const loadSession = async () => {
      try {
        const [storedToken, storedInfo] = await Promise.all([
          AsyncStorage.getItem(ADMIN_TOKEN_KEY),
          AsyncStorage.getItem(ADMIN_INFO_KEY),
        ]);

        if (!isMountedRef.current) return;
        setAdminToken(storedToken || '');
        setAdminInfo(storedInfo ? JSON.parse(storedInfo) : null);
      } catch {
        if (!isMountedRef.current) return;
        setAdminToken('');
        setAdminInfo(null);
      } finally {
        if (isMountedRef.current) setIsBooting(false);
      }
    };

    loadSession();
    return () => {
      isMountedRef.current = false;
      processingRef.current = false;
    };
  }, []);

  const loginAdmin = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      showCustomAlert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu nhân viên trước khi chấm công.', [{ text: 'ĐỒNG Ý' }], 'warning-outline');
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.success || !payload?.token) {
        throw new Error(payload?.message || 'Đăng nhập nhân viên không thành công.');
      }

      await AsyncStorage.multiSet([
        [ADMIN_TOKEN_KEY, payload.token],
        [ADMIN_INFO_KEY, JSON.stringify(payload.admin || {})],
      ]);

      if (!isMountedRef.current) return;
      setAdminToken(payload.token);
      setAdminInfo(payload.admin || null);
      queryClient.setQueryData(['staff', 'profile', payload.token], payload.admin || null);
      queryClient.invalidateQueries({ queryKey: ['staff', 'profile', payload.token] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'attendance-status', payload.token] });
      setPassword('');
      showCustomAlert('Đăng nhập thành công', 'Bạn có thể quét QR chấm công ngay bây giờ.', [{ text: 'BẮT ĐẦU QUÉT' }], 'checkmark-circle-outline');
    } catch (error) {
      showCustomAlert('Đăng nhập thất bại', error.message || 'Không thể kết nối máy chủ admin.', [{ text: 'THỬ LẠI' }], 'alert-circle-outline');
    } finally {
      if (isMountedRef.current) setIsLoggingIn(false);
    }
  };

  const logoutAdmin = useCallback(async () => {
    await AsyncStorage.multiRemove([ADMIN_TOKEN_KEY, ADMIN_INFO_KEY]);
    setAdminToken('');
    setAdminInfo(null);
    setAttendanceStatus({ state: 'ready' });
    setHasScanned(false);
    setLastQrToken('');
    queryClient.removeQueries({ queryKey: ['staff'] });
  }, [queryClient]);

  const confirmLogoutAdmin = useCallback(() => {
    showCustomAlert(
      'Đăng xuất chấm công',
      'Bạn có chắc muốn đăng xuất khỏi tài khoản nhân viên này không?',
      [
        { text: 'HỦY', style: 'cancel' },
        { text: 'ĐĂNG XUẤT', onPress: logoutAdmin },
      ],
      'exit-outline',
    );
  }, [logoutAdmin]);

  const resetScanner = useCallback(() => {
    processingRef.current = false;
    setIsProcessing(false);
    setHasScanned(false);
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!adminToken) return;
    setRefreshing(true);
    resetScanner();
    try {
      await Promise.all([
        adminProfileQuery.refetch(),
        attendanceStatusQuery.refetch(),
      ]);
    } finally {
      if (isMountedRef.current) setRefreshing(false);
    }
  }, [adminProfileQuery, adminToken, attendanceStatusQuery, resetScanner]);

  const processAttendance = useCallback(async (rawValue) => {
    const qrToken = parseQrToken(rawValue);
    if (!qrToken || processingRef.current || !adminToken) return;

    processingRef.current = true;
    setHasScanned(true);
    setIsProcessing(true);
    setLastQrToken(qrToken);

    try {
      const safeToken = encodeURIComponent(qrToken);
      const statusResponse = await fetch(`${API_BASE_URL}/admin/attendances/status?qr_token=${safeToken}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (statusResponse.status === 401) {
        await logoutAdmin();
        throw new Error('Phiên đăng nhập nhân viên đã hết hạn. Vui lòng đăng nhập lại.');
      }

      if (!statusResponse.ok) {
        throw new Error(await getApiMessage(statusResponse));
      }

      const statusPayload = await statusResponse.json();
      const state = statusPayload?.state;
      let endpoint = '';
      let fallbackMessage = '';

      if (state === 'ready') {
        endpoint = 'check-in';
        fallbackMessage = 'Vào ca thành công.';
      } else if (state === 'working' || state === 'hanging') {
        endpoint = 'check-out';
        fallbackMessage = 'Kết thúc ca thành công.';
      } else {
        throw new Error('Hôm nay bạn đã hoàn thành ca làm việc rồi.');
      }

      if (endpoint === 'check-out') {
        const shouldCheckOut = await new Promise((resolve) => {
          showCustomAlert(
            'Xác nhận tan ca',
            'Bạn đã check-in trước đó. Bạn có chắc muốn check-out và kết thúc ca làm bây giờ không?',
            [
              {
                text: 'HUỶ',
                style: 'cancel',
                onPress: () => {
                  resetScanner();
                  resolve(false);
                },
              },
              {
                text: 'CHECK-OUT',
                onPress: () => resolve(true),
              },
            ],
            'log-out-outline',
          );
        });

        if (!shouldCheckOut) return;
      }

      const attendanceResponse = await fetch(`${API_BASE_URL}/admin/attendances/${endpoint}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ qr_token: qrToken }),
      });

      if (!attendanceResponse.ok) {
        throw new Error(await getApiMessage(attendanceResponse));
      }

      const attendancePayload = await attendanceResponse.json();
      const message = attendancePayload?.message || fallbackMessage;
      if (isMountedRef.current) {
        setAttendanceStatus((current) => ({
          ...current,
          state: endpoint === 'check-in' ? 'working' : 'completed',
          data: attendancePayload?.data || current?.data || null,
        }));
      }
      attendanceStatusQuery.refetch();
      showCustomAlert(
        'Chấm công thành công',
        message,
        [
          { text: 'QUÉT TIẾP', onPress: resetScanner },
          { text: 'VỀ TRANG CHỦ', onPress: () => navigation.navigate('MainTabs', { screen: 'Home' }) },
        ],
        'checkmark-circle-outline',
      );
    } catch (error) {
      showCustomAlert(
        'Lỗi chấm công',
        error.message || 'Mã QR không hợp lệ hoặc đã hết hạn.',
        [{ text: 'QUÉT LẠI', onPress: resetScanner }],
        'alert-circle-outline',
      );
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
      processingRef.current = false;
    }
  }, [adminToken, attendanceStatusQuery.refetch, logoutAdmin, navigation, resetScanner]);

  const handleBarcodeScanned = ({ data }) => {
    if (hasScanned || isProcessing || !data) return;
    processAttendance(data);
  };

  if (isBooting) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={BRAND_RED} />
        <Text style={styles.loadingText}>ĐANG MỞ CỔNG CHẤM CÔNG...</Text>
      </View>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.topSafeArea} />
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={BRAND_RED} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()} activeOpacity={0.75}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerEyebrow}>SORA STAFF</Text>
            <Text style={styles.headerTitle}>CHẤM CÔNG QR</Text>
          </View>
          <View style={styles.headerButton}>
            <Ionicons name="qr-code-outline" size={22} color={BRAND_GOLD} />
          </View>
        </View>

        {!adminToken ? (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={[styles.page, { maxWidth: PAGE_MAX_WIDTH, paddingHorizontal: pagePadding }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.loginCard}>
                <View style={styles.loginCardHeader}>
                  <View style={styles.loginCardTitleRow}>
                    <View style={styles.loginCardBadge}>
                      <Ionicons name="lock-closed-outline" size={15} color={BRAND_RED} />
                    </View>
                    <View style={styles.loginCardTitleText}>
                      <Text style={styles.loginCardKicker}>XÁC THỰC NHÂN VIÊN</Text>
                      <Text style={styles.loginCardTitle}>Đăng nhập tài khoản nhân viên</Text>
                      <Text style={styles.loginCardDesc}>Dùng tài khoản admin/nhân viên để quét QR chấm công.</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email nhân viên</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="mail-outline" size={18} color={BRAND_RED} />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="staff@sora.vn"
                      placeholderTextColor="#aaa"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mật khẩu</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="lock-closed-outline" size={18} color={BRAND_RED} />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Nhập mật khẩu"
                      placeholderTextColor="#aaa"
                      secureTextEntry={!showPassword}
                      style={styles.input}
                    />
                    <TouchableOpacity onPress={() => setShowPassword((value) => !value)} hitSlop={8}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#777" />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, isLoggingIn && styles.primaryButtonDisabled]}
                  onPress={loginAdmin}
                  disabled={isLoggingIn}
                  activeOpacity={0.82}
                >
                  {isLoggingIn ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="log-in-outline" size={18} color="#fff" />
                      <Text style={styles.primaryButtonText}>ĐĂNG NHẬP NHÂN VIÊN</Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.loginSecureNote}>
                  <Ionicons name="information-circle-outline" size={15} color="#9b7d55" />
                  <Text style={styles.loginSecureText}>
                    Phiên đăng nhập này chỉ dùng cho chấm công, không ảnh hưởng tài khoản mua hàng.
                  </Text>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.page, { maxWidth: PAGE_MAX_WIDTH, paddingHorizontal: pagePadding }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[BRAND_RED]}
                tintColor={BRAND_RED}
              />
            }
          >
            <View style={styles.staffCard}>
              <View style={styles.staffIcon}>
                {adminAvatarUrl ? (
                  <SmartImage source={{ uri: adminAvatarUrl }} style={styles.staffAvatar} resizeMode="cover" />
                ) : (
                  <Ionicons name="person-circle-outline" size={30} color={BRAND_RED} />
                )}
              </View>
              <View style={styles.staffInfo}>
                <Text style={styles.staffLabel}>Đang chấm công với</Text>
                <Text style={styles.staffName} numberOfLines={1}>{adminName}</Text>
                <Text style={styles.staffRole} numberOfLines={1}>
                  {adminInfo?.role?.label || adminInfo?.role?.value || 'Nhân viên'}
                </Text>
                <View
                  style={[
                    styles.staffStatusPill,
                    {
                      backgroundColor: attendanceStatusConfig.bg,
                      borderColor: attendanceStatusConfig.border,
                    },
                  ]}
                >
                  <Ionicons name={attendanceStatusConfig.icon} size={13} color={attendanceStatusConfig.color} />
                  <Text style={[styles.staffStatusText, { color: attendanceStatusConfig.color }]}>
                    {attendanceStatusConfig.label}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={confirmLogoutAdmin}
                activeOpacity={0.78}
              >
                <Ionicons name="exit-outline" size={18} color={BRAND_RED} />
              </TouchableOpacity>
            </View>

            <View style={styles.scannerCard}>
              <View style={styles.scannerHeader}>
                <Text style={styles.scannerKicker}>QUÉT MÃ TỪ WEB ADMIN</Text>
                <Text style={styles.scannerTitle}>Hướng camera vào QR</Text>
              </View>

              <View style={styles.cameraShell}>
                {!permission ? (
                  <View style={styles.cameraState}>
                    <ActivityIndicator color={BRAND_GOLD} />
                    <Text style={styles.cameraStateText}>Đang kiểm tra quyền camera...</Text>
                  </View>
                ) : !permission.granted ? (
                  <View style={styles.cameraState}>
                    <Ionicons name="camera-outline" size={38} color={BRAND_GOLD} />
                    <Text style={styles.cameraStateTitle}>Cần quyền camera</Text>
                    <Text style={styles.cameraStateText}>Cho phép SORA sử dụng camera để quét mã QR chấm công.</Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={requestPermission} activeOpacity={0.82}>
                      <Text style={styles.permissionButtonText}>CẤP QUYỀN CAMERA</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <CameraView
                      style={styles.camera}
                      facing="back"
                      active={isFocused}
                      barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                      onBarcodeScanned={hasScanned || isProcessing ? undefined : handleBarcodeScanned}
                    />
                    <View pointerEvents="none" style={styles.scanOverlay}>
                      <View style={styles.scanCornerTopLeft} />
                      <View style={styles.scanCornerTopRight} />
                      <View style={styles.scanCornerBottomLeft} />
                      <View style={styles.scanCornerBottomRight} />
                      <View style={styles.scanLine} />
                    </View>
                    {isProcessing && (
                      <View style={styles.processingOverlay}>
                        <ActivityIndicator size="large" color={BRAND_GOLD} />
                        <Text style={styles.processingText}>ĐANG XỬ LÝ CHẤM CÔNG...</Text>
                      </View>
                    )}
                  </>
                )}
              </View>

              <View style={styles.hintBox}>
                <Ionicons name="shield-checkmark-outline" size={18} color={BRAND_RED} />
                <Text style={styles.hintText}>
                  Mã QR chỉ dùng trong vài phút. Nếu quét không được, hãy nhờ quản lý mở mã mới rồi thử lại.
                </Text>
              </View>

              {!!lastQrToken && (
                <TouchableOpacity style={styles.secondaryButton} onPress={resetScanner} activeOpacity={0.78}>
                  <Ionicons name="refresh-outline" size={17} color={BRAND_RED} />
                  <Text style={styles.secondaryButtonText}>QUÉT LẠI</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topSafeArea: { flex: 0, backgroundColor: BRAND_RED },
  safe: { flex: 1, backgroundColor: '#fff' },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 12, color: BRAND_RED, fontFamily: 'Oswald_500Medium', fontSize: 12, letterSpacing: 1.1 },
  header: {
    height: 68,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BRAND_RED,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(231,206,125,0.25)',
  },
  headerTitleWrap: { flex: 1, alignItems: 'center' },
  headerEyebrow: { color: BRAND_GOLD, fontFamily: 'Oswald_500Medium', fontSize: 10, letterSpacing: 1.8 },
  headerTitle: { color: '#fff', fontFamily: 'Oswald_600SemiBold', fontSize: 19, letterSpacing: 1.2, marginTop: 1 },
  scroll: { flex: 1, backgroundColor: '#f8f6f3' },
  page: { width: '100%', alignSelf: 'center', paddingTop: 24, paddingBottom: 34 },
  loginCard: {
    marginTop: 12,
    padding: 18,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee2dd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  loginCardHeader: {
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3ebe6',
  },
  loginCardTitleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  loginCardTitleText: { flex: 1 },
  loginCardKicker: { color: BRAND_RED, fontFamily: 'Oswald_500Medium', fontSize: 10, letterSpacing: 1.4, marginBottom: 2 },
  loginCardTitle: { color: '#211d1d', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 23, lineHeight: 29 },
  loginCardDesc: { marginTop: 5, color: '#7a7272', fontFamily: 'Oswald_400Regular', fontSize: 12, lineHeight: 18 },
  loginCardBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    backgroundColor: '#fdf5f6',
    borderWidth: 1,
    borderColor: '#ecd5d9',
  },
  inputGroup: { marginBottom: 15 },
  inputLabel: { color: '#494343', fontFamily: 'Oswald_500Medium', fontSize: 11, letterSpacing: 0.9, marginBottom: 8, textTransform: 'uppercase' },
  inputBox: {
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#eadfd8',
    borderRadius: 8,
    backgroundColor: '#fffdfb',
  },
  input: { flex: 1, paddingVertical: 10, color: '#222', fontFamily: 'Oswald_400Regular', fontSize: 14 },
  primaryButton: {
    height: 50,
    marginTop: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: BRAND_RED,
    shadowColor: BRAND_RED,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonDisabled: { opacity: 0.75 },
  primaryButtonText: { color: '#fff', fontFamily: 'Oswald_600SemiBold', fontSize: 12, letterSpacing: 1.4 },
  loginSecureNote: {
    marginTop: 14,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fff8ed',
    borderWidth: 1,
    borderColor: '#efdfc0',
    borderRadius: 8,
  },
  loginSecureText: { flex: 1, color: '#806b50', fontFamily: 'Oswald_400Regular', fontSize: 12, lineHeight: 18 },
  staffCard: {
    marginBottom: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee2dd',
  },
  staffIcon: { width: 45, height: 45, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fdf5f6', marginRight: 12 },
  staffAvatar: { width: '100%', height: '100%', borderRadius: 23 },
  staffInfo: { flex: 1 },
  staffLabel: { color: '#8b7d7d', fontFamily: 'Oswald_400Regular', fontSize: 11, letterSpacing: 0.5 },
  staffName: { color: '#2b2525', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, marginTop: 1 },
  staffRole: { color: BRAND_RED, fontFamily: 'Oswald_500Medium', fontSize: 11, letterSpacing: 0.5, marginTop: 3 },
  staffStatusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 7,
  },
  staffStatusText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 10,
    letterSpacing: 0.35,
  },
  logoutButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff5f6' },
  scannerCard: {
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee2dd',
  },
  scannerHeader: { marginBottom: 12 },
  scannerKicker: { color: BRAND_RED, fontFamily: 'Oswald_500Medium', fontSize: 10, letterSpacing: 1.5, marginBottom: 2 },
  scannerTitle: { color: '#211d1d', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, lineHeight: 30 },
  cameraShell: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#191414',
  },
  camera: { width: '100%', height: '100%' },
  cameraState: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  cameraStateTitle: { marginTop: 10, color: '#fff', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20 },
  cameraStateText: { marginTop: 8, color: 'rgba(255,255,255,0.76)', textAlign: 'center', fontFamily: 'Oswald_400Regular', fontSize: 12, lineHeight: 18 },
  permissionButton: { marginTop: 16, paddingHorizontal: 18, paddingVertical: 11, backgroundColor: BRAND_RED, borderRadius: 5 },
  permissionButtonText: { color: '#fff', fontFamily: 'Oswald_600SemiBold', fontSize: 11, letterSpacing: 1.1 },
  scanOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  scanLine: { width: '58%', height: 2, backgroundColor: BRAND_GOLD, shadowColor: BRAND_GOLD, shadowOpacity: 0.8, shadowRadius: 8 },
  scanCornerTopLeft: { position: 'absolute', top: '21%', left: '21%', width: 36, height: 36, borderLeftWidth: 3, borderTopWidth: 3, borderColor: BRAND_GOLD },
  scanCornerTopRight: { position: 'absolute', top: '21%', right: '21%', width: 36, height: 36, borderRightWidth: 3, borderTopWidth: 3, borderColor: BRAND_GOLD },
  scanCornerBottomLeft: { position: 'absolute', bottom: '21%', left: '21%', width: 36, height: 36, borderLeftWidth: 3, borderBottomWidth: 3, borderColor: BRAND_GOLD },
  scanCornerBottomRight: { position: 'absolute', bottom: '21%', right: '21%', width: 36, height: 36, borderRightWidth: 3, borderBottomWidth: 3, borderColor: BRAND_GOLD },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20, 11, 13, 0.72)',
  },
  processingText: { marginTop: 10, color: '#fff', fontFamily: 'Oswald_600SemiBold', fontSize: 12, letterSpacing: 1.1 },
  hintBox: {
    marginTop: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#fff8ed',
    borderWidth: 1,
    borderColor: '#efdfc0',
    borderRadius: 6,
  },
  hintText: { flex: 1, color: '#776565', fontFamily: 'Oswald_400Regular', fontSize: 12, lineHeight: 18 },
  secondaryButton: {
    height: 42,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ead4d8',
    backgroundColor: '#fff',
  },
  secondaryButtonText: { color: BRAND_RED, fontFamily: 'Oswald_600SemiBold', fontSize: 11, letterSpacing: 1.1 },
});
