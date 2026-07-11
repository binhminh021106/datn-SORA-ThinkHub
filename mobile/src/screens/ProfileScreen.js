import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  SafeAreaView, StatusBar, ScrollView, ActivityIndicator,
  RefreshControl, Platform, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MOBILE_AUTH_URL, API_BASE_URL } from '../config/api';
import { showCustomAlert } from '../components/CustomAlert';
import SmartImage from '../components/SmartImage';
import { PRICE_FONT_FAMILY, PRICE_FONT_WEIGHT } from '../styles/typography';
import { unregisterDevicePushToken } from '../services/pushNotifications';
import { fetchNotifications } from '../services/notifications';

const Alert = {
  alert: (title, message, buttons) => showCustomAlert(title, message, buttons)
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatCurrency = (v) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

const getStorageUrl = (path) => {
  if (!path) return '';
  const origin = API_BASE_URL.replace(/\/api$/, '');
  let formattedPath = path;
  if (path.startsWith('http')) {
    formattedPath = path
      .replace('http://127.0.0.1:8000', origin)
      .replace('http://localhost:8000', origin)
      .replace('https://127.0.0.1:8000', origin)
      .replace('https://localhost:8000', origin);
    return formattedPath;
  }
  return `${origin}/storage/${formattedPath}`;
};

const TIER_CONFIG = {
  silver: { label: 'Bạc', icon: 'medal-outline', from: '#c0c0c0', to: '#a9a9a9', border: '#c8c8c8', text: '#555' },
  gold: { label: 'Vàng', icon: 'trophy-outline', from: '#ffd700', to: '#f5a623', border: '#e7ce7d', text: '#7a5800' },
  diamond: { label: 'Kim cương', icon: 'diamond-outline', from: '#76d7f5', to: '#4dd0e1', border: '#4dd0e1', text: '#006080' },
  default: { label: 'Thành viên', icon: 'person-circle-outline', from: '#e0e0e0', to: '#bdbdbd', border: '#e7ce7d', text: '#555' },
};

const getTierConfig = (tierName) => {
  if (!tierName) return TIER_CONFIG.default;
  const n = tierName.toLowerCase();
  if (n.includes('kim') || n.includes('diamond')) return TIER_CONFIG.diamond;
  if (n.includes('vàng') || n.includes('gold')) return TIER_CONFIG.gold;
  if (n.includes('bạc') || n.includes('silver')) return TIER_CONFIG.silver;
  return TIER_CONFIG.default;
};

const TIER_THEMES = {
  silver: {
    bg: '#f8f9fa',
    safeBg: '#f1f5f9',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    border: '#cbd5e1',
    shadow: 'rgba(71, 85, 105, 0.15)',
    text: '#475569',
    accent: '#475569',
    iconWrapBg: '#e2e8f0',
    glow1: '#e2e8f0',
    glow2: '#f1f5f9',
    progressColors: ['#64748b', '#cbd5e1'],
    avatarBorder: '#cbd5e1',
    labelColor: '#64748b',
    nameColor: '#334155',
  },
  gold: {
    bg: '#fffdf6',
    safeBg: '#fffbf0',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    border: '#ebd5a3',
    shadow: 'rgba(235, 213, 163, 0.5)',
    text: '#92400e',
    accent: '#9f273b',
    iconWrapBg: '#fef4cb',
    glow1: '#fde9b8',
    glow2: '#fef4cb',
    progressColors: ['#9f273b', '#ebd5a3'],
    avatarBorder: '#ebd5a3',
    labelColor: '#8c826e',
    nameColor: '#1a1a1a',
  },
  diamond: {
    bg: '#f4fdff',
    safeBg: '#ecfeff',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    border: '#a5f3fc',
    shadow: 'rgba(6, 182, 212, 0.2)',
    text: '#0369a1',
    accent: '#0891b2',
    iconWrapBg: '#e0f7fa',
    glow1: '#cffafe',
    glow2: '#ecfeff',
    progressColors: ['#0891b2', '#a5f3fc'],
    avatarBorder: '#a5f3fc',
    labelColor: '#0e7490',
    nameColor: '#0f172a',
  },
  default: {
    bg: '#fafafa',
    safeBg: '#f5f5f5',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    border: '#e5e7eb',
    shadow: 'rgba(0, 0, 0, 0.05)',
    text: '#555555',
    accent: '#9f273b',
    iconWrapBg: '#f3f4f6',
    glow1: '#f3f4f6',
    glow2: '#f9fafb',
    progressColors: ['#9f273b', '#d1d5db'],
    avatarBorder: '#d1d5db',
    labelColor: '#6b7280',
    nameColor: '#1f2937',
  },
};

const getTierTheme = (tierName) => {
  if (!tierName) return TIER_THEMES.default;
  const n = tierName.toLowerCase();
  if (n.includes('kim') || n.includes('diamond')) return TIER_THEMES.diamond;
  if (n.includes('vàng') || n.includes('gold')) return TIER_THEMES.gold;
  if (n.includes('bạc') || n.includes('silver')) return TIER_THEMES.silver;
  return TIER_THEMES.default;
};

const fetchProfileQuery = async () => {
  const token = await AsyncStorage.getItem('auth_token');
  if (!token) {
    return { user: null, isLoggedIn: false, token: null };
  }

  try {
    const res = await fetch(`${MOBILE_AUTH_URL}/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });

    if (!res.ok) {
      await AsyncStorage.multiRemove(['auth_token', 'user', 'sora_wishlist_ids', 'sora_wishlist_items']);
      return { user: null, isLoggedIn: false, token: null };
    }

    const data = await res.json();
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    return { user: data.user, isLoggedIn: true, token };
  } catch (error) {
    const cached = await AsyncStorage.getItem('user');
    if (cached) {
      return { user: JSON.parse(cached), isLoggedIn: true, token, fromCache: true };
    }
    throw error;
  }
};

// ─── TierBadge ───────────────────────────────────────────────────────────────
function TierBadge({ tierName }) {
  const cfg = getTierConfig(tierName);
  const theme = getTierTheme(tierName);
  return (
    <View style={[s.tierBadge, { backgroundColor: theme.iconWrapBg, borderColor: theme.border }]}>
      <Ionicons name={cfg.icon} size={13} color={theme.text} />
      <Text style={[s.tierBadgeTxt, { color: theme.text }]}>{tierName || 'Thành viên'}</Text>
    </View>
  );
}

// ─── TierCard ────────────────────────────────────────────────────────────────
function TierCard({ user, allTiers }) {
  const cfg = getTierConfig(user?.tier?.name);
  const theme = getTierTheme(user?.tier?.name);
  const spent = parseFloat(user?.accumulated_spent || 0);

  // Tính tier tiếp theo
  const sortedTiers = [...(allTiers || [])].sort((a, b) => a.min_spent - b.min_spent);
  const nextTier = sortedTiers.find(t => parseFloat(t.min_spent) > spent);
  const progress = nextTier
    ? Math.min(100, (spent / parseFloat(nextTier.min_spent)) * 100)
    : 100;

  return (
    <View style={[s.tierCard, { backgroundColor: theme.bg, borderColor: theme.border, shadowColor: theme.border }]}>
      {/* Soft Glowing Ambient Light Patches (Simulating Radial Gradient Glow) */}
      <View style={{
        position: 'absolute',
        top: -50,
        right: -30,
        width: 170,
        height: 170,
        borderRadius: 85,
        backgroundColor: theme.glow1,
        opacity: 0.45,
        zIndex: 0,
      }} />
      <View style={{
        position: 'absolute',
        bottom: -60,
        left: -30,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: theme.glow2,
        opacity: 0.3,
        zIndex: 0,
      }} />

      {/* Header */}
      <View style={[s.tierCardHeader, { zIndex: 1, borderBottomColor: theme.border }]}>
        <View style={s.tierCardLeft}>
          <View style={[s.tierCardIconWrap, { backgroundColor: theme.iconWrapBg, borderColor: theme.border }]}>
            {user?.tier?.icon_url ? (
              <SmartImage
                source={{ uri: getStorageUrl(user.tier.icon_url) }}
                style={s.tierCardIcon}
              />
            ) : (
              <Ionicons name={cfg.icon} size={26} color={theme.text} />
            )}
          </View>
          <View>
            <Text style={[s.tierCardRankLabel, { color: theme.labelColor }]}>HẠNG THÀNH VIÊN</Text>
            <Text style={[s.tierCardRankName, { color: theme.nameColor }]}>{user?.tier?.name || 'Thành viên mới'}</Text>
          </View>
        </View>
        <View style={s.tierCardRight}>
          <Text style={[s.tierBenefitVal, { color: theme.accent }]}>
            {user?.tier?.discount_percent ? `${user.tier.discount_percent}%` : '0%'}
          </Text>
          <Text style={[s.tierBenefitLbl, { color: theme.labelColor }]}>GIẢM GIÁ</Text>
        </View>
      </View>

      {/* Spent + Progress */}
      <View style={[s.tierCardBody, { zIndex: 1 }]}>
        <View style={s.tierSpentRow}>
          <Text style={[s.tierSpentLabel, { color: theme.labelColor }]}>Đã chi tiêu</Text>
          <Text style={[s.tierSpentVal, { color: theme.accent }]}>{formatCurrency(spent)}</Text>
        </View>

        {nextTier ? (
          <>
            <View style={[s.tierProgressBar, { backgroundColor: theme.glow1 }]}>
              <LinearGradient
                colors={theme.progressColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[s.tierProgressFill, { width: `${progress}%` }]}
              />
            </View>
            <Text style={[s.tierProgressHint, { color: theme.labelColor }]}>
              Còn <Text style={{ fontWeight: '700', color: theme.accent }}>
                {formatCurrency(parseFloat(nextTier.min_spent) - spent)}
              </Text> nữa để lên hạng <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', color: theme.nameColor }}>{nextTier.name}</Text>
            </Text>
          </>
        ) : (
          <Text style={[s.tierProgressHint, { color: theme.text, fontWeight: '700' }]}>
            ⭐ Bạn đã đạt hạng thành viên cao nhất!
          </Text>
        )}

        {/* Roadmap */}
        {sortedTiers.length > 0 && (
          <View style={s.roadmap}>
            <View style={[s.roadmapLine, { backgroundColor: theme.border }]} />
            {/* Điểm gốc */}
            <View style={s.roadmapPoint}>
              <View style={[s.roadmapDot, s.roadmapDotActive, { backgroundColor: theme.accent, borderColor: theme.border }]} />
              <Text style={[s.roadmapName, { color: theme.labelColor }]}>Thành viên</Text>
            </View>
            {sortedTiers.map(t => {
              const achieved = spent >= parseFloat(t.min_spent);
              return (
                <View key={t.id} style={s.roadmapPoint}>
                  <View style={[
                    s.roadmapDot,
                    achieved ? s.roadmapDotActive : s.roadmapDotInactive,
                    achieved && { backgroundColor: theme.accent, borderColor: theme.border }
                  ]} />
                  <Text style={[s.roadmapName, achieved ? { color: theme.nameColor } : { color: '#aaa' }]}>{t.name}</Text>
                  <Text style={[s.roadmapSpent, achieved ? { color: theme.labelColor } : { color: '#bbb' }]}>
                    {parseFloat(t.min_spent) >= 1e9
                      ? `${(parseFloat(t.min_spent) / 1e9).toFixed(0)}tỷ`
                      : `${(parseFloat(t.min_spent) / 1e6).toFixed(0)}tr`}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

// ─── MenuItem ────────────────────────────────────────────────────────────────
function MenuItem({ icon, label, onPress, danger, badge }) {
  return (
    <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.menuIconWrap, danger && s.menuIconDanger]}>
        <Ionicons name={icon} size={20} color={danger ? '#cc1e2e' : '#9f273b'} />
      </View>
      <Text style={[s.menuLabel, danger && s.menuLabelDanger]}>{label}</Text>
      {!!badge && !danger && (
        <View style={s.menuBadge}>
          <Text style={s.menuBadgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
      {!danger && <Ionicons name="chevron-forward" size={16} color="#ccc" style={{ marginLeft: badge ? 0 : 'auto' }} />}
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const {
    data: profileData,
    isLoading,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfileQuery,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const user = profileData?.user || null;
  const allTiers = user?.all_tiers || [];
  const isLoggedIn = !!profileData?.isLoggedIn;
  const notificationsPreviewQuery = useQuery({
    queryKey: ['notifications', 'preview'],
    queryFn: () => fetchNotifications({ page: 1, perPage: 1 }),
    enabled: isLoggedIn,
    staleTime: 30 * 1000,
  });
  const unreadNotifications = notificationsPreviewQuery.data?.unread_count || 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchProfile();
      if (isLoggedIn) {
        await notificationsPreviewQuery.refetch();
      }
    } finally {
      setRefreshing(false);
    }
  }, [isLoggedIn, notificationsPreviewQuery, refetchProfile]);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('transparent');
        StatusBar.setTranslucent(true);
      }

      let isActive = true;
      const syncProfileToken = async () => {
        const token = await AsyncStorage.getItem('auth_token');
        if (isActive && token !== profileData?.token) {
          refetchProfile();
        }
      };

      syncProfileToken();
      return () => {
        isActive = false;
      };
    }, [profileData?.token, refetchProfile])
  );

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await unregisterDevicePushToken();
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        await fetch(`${MOBILE_AUTH_URL}/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
      }
    } catch { }
    await AsyncStorage.multiRemove(['auth_token', 'user', 'sora_wishlist_ids', 'sora_wishlist_items']);
    queryClient.setQueryData(['profile'], { user: null, isLoggedIn: false, token: null });
  };

  // ── LOADING ──
  if (isLoading) {
    return (
      <View style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#9f273b" />
          <Text style={{ marginTop: 10, fontFamily: "Oswald_500Medium", color: "#9f273b", fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>Đang tải hồ sơ SORA...</Text>
          </View>
      </View>
    );
  }

  // ── GUEST ──
  if (!isLoggedIn) {
    return (
      <View style={[s.safe, { paddingTop: Platform.OS === 'ios' ? 47 : (StatusBar.currentHeight || 24) }]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
        <View style={s.header}>
          <Text style={s.headerTitle}>Cá Nhân</Text>
        </View>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#9f273b']}
              tintColor="#9f273b"
            />
          }
        >
          <View style={s.guestCard}>
            <View style={s.avatarCircle}>
              <Ionicons name="person-outline" size={44} color="#9f273b" />
            </View>
            <Text style={s.guestTitle}>Chào mừng đến SORA</Text>
            <Text style={s.guestSub}>Đăng nhập để xem đơn hàng, ưu đãi và tích điểm thành viên</Text>
            <TouchableOpacity style={s.loginBtn} onPress={() => navigation.navigate('Login')}>
              <Text style={s.loginBtnTxt}>ĐĂNG NHẬP</Text>
            </TouchableOpacity>
            <View style={s.switchRow}>
              <Text style={s.switchTxt}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={s.switchLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Links cho guest */}
          <View style={s.section}>
            {[
              { icon: 'receipt-outline', label: 'Lịch sử đơn hàng', route: 'Login' },
              { icon: 'heart-outline', label: 'Sản phẩm yêu thích', route: 'Login' },
              { icon: 'gift-outline', label: 'Điểm thưởng & Ưu đãi', route: 'Login' },
              { icon: 'information-circle-outline', label: 'Về SORA', route: 'About' },
              { icon: 'shield-checkmark-outline', label: 'Chính sách bảo hành', route: 'Warranty' },
              { icon: 'call-outline', label: 'Liên hệ CSKH', route: 'ContactCSKH' },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={s.menuItem} onPress={() => navigation.navigate(item.route)}>
                <View style={s.menuIconWrap}>
                  <Ionicons name={item.icon} size={20} color="#9f273b" />
                </View>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#ccc" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── LOGGED IN ──
  const avatarUri = user?.avatar_url
    ? getStorageUrl(user.avatar_url)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=9f273b&color=fff&size=200`;

  const theme = getTierTheme(user?.tier?.name);

  return (
    <View style={[s.safe, { paddingTop: Platform.OS === 'ios' ? 47 : (StatusBar.currentHeight || 24) }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <View style={s.header}>
        <Text style={s.headerTitle}>Cá Nhân</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#9f273b']}
            tintColor="#9f273b"
          />
        }
      >

        {/* ── Hero Card ── */}
        <View style={[s.heroCard, { backgroundColor: theme.bg, borderColor: theme.border, shadowColor: theme.border }]}>
          <View style={[s.heroAvatarWrap, { borderColor: theme.avatarBorder }]}>
            <SmartImage source={{ uri: avatarUri }} style={s.heroAvatar}
            />
          </View>
          <View style={s.heroInfo}>
            <Text style={[s.heroName, { color: theme.nameColor }]}>{user?.fullName || 'Thành viên SORA'}</Text>
            <Text style={s.heroEmail}>{user?.email}</Text>
            <TierBadge tierName={user?.tier?.name} />
          </View>
        </View>

        {/* ── Thẻ Hạng Thành Viên ── */}
        <View style={s.sectionTitle}>
          <Ionicons name="ribbon-outline" size={18} color="#9f273b" />
          <Text style={s.sectionTitleTxt}>Hạng Thành Viên</Text>
        </View>
        <TierCard user={user} allTiers={allTiers} />

        {/* ── Thống kê nhanh ── */}
        <View style={[s.statsRow, { backgroundColor: theme.bg, borderColor: theme.border, shadowColor: theme.border }]}>
          <View style={s.statBoxSide}>
            <Text style={[s.statVal, { color: theme.accent }]} numberOfLines={1} adjustsFontSizeToFit>{user?.accumulated_orders || 0}</Text>
            <Text style={[s.statLabel, { color: theme.labelColor }]}>Đơn hàng</Text>
          </View>
          <View style={[s.statBox, s.statBoxMid, { borderColor: theme.border }]}>
            <Text style={[s.statVal, { color: theme.accent }]} numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(user?.accumulated_spent)}</Text>
            <Text style={[s.statLabel, { color: theme.labelColor }]}>Đã chi tiêu</Text>
          </View>
          <View style={s.statBoxSide}>
            <Text style={[s.statVal, { color: theme.accent }]} numberOfLines={1} adjustsFontSizeToFit>{user?.tier?.discount_percent ? `${user.tier.discount_percent}%` : '0%'}</Text>
            <Text style={[s.statLabel, { color: theme.labelColor }]}>Ưu đãi</Text>
          </View>
        </View>

        {/* ── Menu ── */}
        <View style={s.sectionTitle}>
          <Ionicons name="grid-outline" size={18} color="#9f273b" />
          <Text style={s.sectionTitleTxt}>Quản Lý Tài Khoản</Text>
        </View>
        <View style={s.section}>
          <MenuItem icon="person-outline" label="Thông tin cá nhân" onPress={() => navigation.navigate('EditProfile')} />
          <MenuItem icon="key-outline" label="Đổi mật khẩu" onPress={() => navigation.navigate('ChangePassword')} />
          <MenuItem icon="notifications-outline" label="Thông báo" badge={unreadNotifications} onPress={() => navigation.navigate('Notifications')} />
          <MenuItem icon="receipt-outline" label="Lịch sử đơn hàng" onPress={() => navigation.navigate('OrderHistory')} />
          <MenuItem icon="heart-outline" label="Sản phẩm yêu thích" onPress={() => navigation.navigate('Wishlist')} />
          <MenuItem icon="location-outline" label="Sổ địa chỉ" onPress={() => navigation.navigate('AddressBook')} />
          <MenuItem icon="ticket-outline" label="Mã giảm giá của tôi" onPress={() => navigation.navigate('SavedCoupons')} />
          <MenuItem icon="megaphone-outline" label="Tiếp thị liên kết" onPress={() => navigation.navigate('Affiliate')} />
        </View>

        <View style={s.sectionTitle}>
          <Ionicons name="settings-outline" size={18} color="#9f273b" />
          <Text style={s.sectionTitleTxt}>Hỗ Trợ</Text>
        </View>
        <View style={s.section}>
          <MenuItem icon="information-circle-outline" label="Về SORA" onPress={() => navigation.navigate('About')} />
          <MenuItem icon="shield-checkmark-outline" label="Chính sách bảo hành" onPress={() => navigation.navigate('Warranty')} />
          <MenuItem icon="call-outline" label="Liên hệ CSKH" onPress={() => navigation.navigate('ContactCSKH')} />
          <MenuItem icon="log-out-outline" label="Đăng xuất" onPress={handleLogout} danger />
        </View>

      </ScrollView>

      {/* Custom Logout Modal */}
      <Modal
        transparent={true}
        visible={showLogoutModal}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContainer}>
            <View style={s.modalIconWrap}>
              <Ionicons name="log-out" size={28} color="#9f273b" />
            </View>
            <Text style={s.modalTitle}>Đăng xuất</Text>
            <Text style={s.modalMessage}>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản SORA không?</Text>
            <View style={s.modalBtnRow}>
              <TouchableOpacity style={[s.modalBtn, s.modalBtnCancel]} onPress={() => setShowLogoutModal(false)} activeOpacity={0.8}>
                <Text style={s.modalBtnCancelTxt}>HỦY</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn, s.modalBtnConfirm]} onPress={confirmLogout} activeOpacity={0.8}>
                <Text style={s.modalBtnConfirmTxt}>ĐĂNG XUẤT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: '#333' },

  // Guest
  guestCard: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 28, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5 },
  avatarCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#fdf5f6', borderWidth: 2, borderColor: '#e7ce7d', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  guestTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: '#333', marginBottom: 8 },
  guestSub: { fontFamily: 'Oswald_400Regular', fontSize: 12, color: '#888', textAlign: 'center', letterSpacing: 0.3, marginBottom: 24, lineHeight: 18 },
  loginBtn: { backgroundColor: '#9f273b', width: '100%', height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  loginBtnTxt: { fontFamily: 'Oswald_600SemiBold', fontSize: 14, color: '#fff', letterSpacing: 2 },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
  switchTxt: { fontFamily: 'Oswald_400Regular', fontSize: 13, color: '#666' },
  switchLink: { fontFamily: 'Oswald_600SemiBold', fontSize: 13, color: '#9f273b' },

  // Hero Card (Logged in)
  heroCard: {
    backgroundColor: '#fffdf6',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ebd5a3',
    shadowColor: '#ebd5a3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  heroAvatarWrap: { width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: '#ebd5a3', overflow: 'hidden', marginRight: 16 },
  heroAvatar: { width: '100%', height: '100%' },
  heroInfo: { flex: 1 },
  heroName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: '#1a1a1a', marginBottom: 3 },
  heroEmail: { fontFamily: 'Oswald_400Regular', fontSize: 12, color: '#888', marginBottom: 8 },

  // Tier Badge (small pill)
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, alignSelf: 'flex-start' },
  tierBadgeTxt: { fontFamily: 'Oswald_500Medium', fontSize: 11, letterSpacing: 0.5 },

  // Section headers
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 20, marginBottom: 8 },
  sectionTitleTxt: { fontFamily: 'Oswald_600SemiBold', fontSize: 13, color: '#333', letterSpacing: 1, textTransform: 'uppercase' },

  // Tier Card
  tierCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#ebd5a3',
    backgroundColor: '#fffdf6',
    shadowColor: '#ebd5a3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  tierCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ebd5a3',
  },
  tierCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tierCardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fef4cb',
    borderWidth: 1,
    borderColor: '#ebd5a3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierCardIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  tierCardRankLabel: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 10,
    color: '#8c826e',
    letterSpacing: 0.5,
  },
  tierCardRankName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: '#333',
    marginTop: 2,
  },
  tierCardRight: {
    alignItems: 'center',
  },
  tierBenefitVal: {
    fontSize: 22,
    fontWeight: '700',
    color: '#9f273b',
    marginBottom: 2,
  },
  tierBenefitLbl: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 10,
    color: '#8c826e',
    letterSpacing: 0.5,
  },
  tierCardBody: {
    padding: 18,
  },
  tierSpentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierSpentLabel: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#8c826e',
  },
  tierSpentVal: {
    fontFamily: PRICE_FONT_FAMILY,
    fontSize: 14,
    fontWeight: PRICE_FONT_WEIGHT,
    color: '#9f273b',
  },
  tierProgressBar: {
    height: 8,
    backgroundColor: 'rgba(235, 213, 163, 0.25)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  tierProgressFill: {
    height: '100%',
    backgroundColor: '#9f273b',
    borderRadius: 4,
  },
  tierProgressHint: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#8c826e',
    marginBottom: 14,
  },

  // Roadmap
  roadmap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
    paddingTop: 4,
  },
  roadmapLine: {
    position: 'absolute',
    top: 10,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: '#ebd5a3',
    zIndex: 0,
  },
  roadmapPoint: {
    flex: 1,
    alignItems: 'center',
    zIndex: 1,
  },
  roadmapDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: '#fffdf6',
  },
  roadmapDotActive: {
    backgroundColor: '#9f273b',
    borderColor: '#ebd5a3',
    borderWidth: 1.5,
  },
  roadmapDotInactive: {
    backgroundColor: '#ddd',
    borderColor: '#eee',
  },
  roadmapName: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 10,
    color: '#8c826e',
    textAlign: 'center',
  },
  roadmapSpent: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 9,
    color: '#bfa780',
    textAlign: 'center',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#fffdf6',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#ebd5a3',
    shadowColor: '#ebd5a3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  statBox: { flex: 1.4, alignItems: 'center', paddingVertical: 18, paddingHorizontal: 4 },
  statBoxSide: { flex: 0.8, alignItems: 'center', paddingVertical: 18, paddingHorizontal: 4 },
  statBoxMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#ebd5a3' },
  statVal: { fontFamily: PRICE_FONT_FAMILY, fontSize: 15, fontWeight: PRICE_FONT_WEIGHT, color: '#9f273b', marginBottom: 4, textAlign: 'center' },
  statLabel: { fontFamily: 'Oswald_400Regular', fontSize: 11, color: '#8c826e', letterSpacing: 0.5 },

  // Menu Section
  section: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  menuIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fdf5f6', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuIconDanger: { backgroundColor: '#fff0f0' },
  menuLabel: { fontFamily: 'Oswald_400Regular', fontSize: 14, color: '#333', letterSpacing: 0.3 },
  menuBadge: { minWidth: 24, height: 22, borderRadius: 11, paddingHorizontal: 7, backgroundColor: '#9f273b', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', marginRight: 8 },
  menuBadgeText: { fontFamily: 'Oswald_600SemiBold', fontSize: 11, color: '#fff' },
  menuLabelDanger: { color: '#cc1e2e' },

  // Custom Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fffdf9',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ebd5a3',
    shadowColor: '#ebd5a3',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fdf5f6',
    borderWidth: 1.5,
    borderColor: '#ebd5a3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: '#9f273b',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#fff',
    borderWidth: 1.2,
    borderColor: '#ebd5a3',
  },
  modalBtnConfirm: {
    backgroundColor: '#9f273b',
  },
  modalBtnCancelTxt: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 13,
    color: '#8c826e',
    letterSpacing: 1,
  },
  modalBtnConfirmTxt: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 13,
    color: '#fff',
    letterSpacing: 1,
  },
});
