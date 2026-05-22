import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  SafeAreaView, StatusBar, ScrollView, ActivityIndicator, Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOBILE_AUTH_URL, API_BASE_URL } from '../config/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatCurrency = (v) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

const getStorageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const origin = API_BASE_URL.replace('/api', '');
  return `${origin}/storage/${path}`;
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

// ─── TierBadge ───────────────────────────────────────────────────────────────
function TierBadge({ tierName }) {
  const cfg = getTierConfig(tierName);
  return (
    <View style={[s.tierBadge, { backgroundColor: cfg.from, borderColor: cfg.border }]}>
      <Ionicons name={cfg.icon} size={13} color={cfg.text} />
      <Text style={[s.tierBadgeTxt, { color: cfg.text }]}>{tierName || 'Thành viên'}</Text>
    </View>
  );
}

// ─── TierCard ────────────────────────────────────────────────────────────────
function TierCard({ user, allTiers }) {
  const cfg = getTierConfig(user?.tier?.name);
  const spent = parseFloat(user?.accumulated_spent || 0);

  // Tính tier tiếp theo
  const sortedTiers = [...(allTiers || [])].sort((a, b) => a.min_spent - b.min_spent);
  const nextTier = sortedTiers.find(t => parseFloat(t.min_spent) > spent);
  const progress = nextTier
    ? Math.min(100, (spent / parseFloat(nextTier.min_spent)) * 100)
    : 100;

  return (
    <View style={s.tierCard}>
      {/* Soft Glowing Ambient Light Patches (Simulating Radial Gradient Glow) */}
      <View style={{
        position: 'absolute',
        top: -50,
        right: -30,
        width: 170,
        height: 170,
        borderRadius: 85,
        backgroundColor: '#fde9b8',
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
        backgroundColor: '#fef4cb',
        opacity: 0.3,
        zIndex: 0,
      }} />

      {/* Header */}
      <View style={[s.tierCardHeader, { zIndex: 1 }]}>
        <View style={s.tierCardLeft}>
          <View style={s.tierCardIconWrap}>
            {user?.tier?.icon_url ? (
              <Image
                source={{ uri: getStorageUrl(user.tier.icon_url) }}
                style={s.tierCardIcon}
              />
            ) : (
              <Ionicons name={cfg.icon} size={26} color="#e7a800" />
            )}
          </View>
          <View>
            <Text style={s.tierCardRankLabel}>HẠNG THÀNH VIÊN</Text>
            <Text style={s.tierCardRankName}>{user?.tier?.name || 'Thành viên mới'}</Text>
          </View>
        </View>
        <View style={s.tierCardRight}>
          <Text style={s.tierBenefitVal}>
            {user?.tier?.discount_percent ? `${user.tier.discount_percent}%` : '0%'}
          </Text>
          <Text style={s.tierBenefitLbl}>GIẢM GIÁ</Text>
        </View>
      </View>

      {/* Spent + Progress */}
      <View style={[s.tierCardBody, { zIndex: 1 }]}>
        <View style={s.tierSpentRow}>
          <Text style={s.tierSpentLabel}>Đã chi tiêu</Text>
          <Text style={s.tierSpentVal}>{formatCurrency(spent)}</Text>
        </View>

        {nextTier ? (
          <>
            <View style={s.tierProgressBar}>
              <LinearGradient
                colors={['#9f273b', cfg.from || '#ffd700']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[s.tierProgressFill, { width: `${progress}%` }]}
              />
            </View>
            <Text style={s.tierProgressHint}>
              Còn <Text style={{ fontWeight: '700', color: '#9f273b' }}>
                {formatCurrency(parseFloat(nextTier.min_spent) - spent)}
              </Text> nữa để lên hạng <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', color: '#333' }}>{nextTier.name}</Text>
            </Text>
          </>
        ) : (
          <Text style={[s.tierProgressHint, { color: '#e7a800', fontWeight: '700' }]}>
            ⭐ Bạn đã đạt hạng thành viên cao nhất!
          </Text>
        )}

        {/* Roadmap */}
        {sortedTiers.length > 0 && (
          <View style={s.roadmap}>
            <View style={s.roadmapLine} />
            {/* Điểm gốc */}
            <View style={s.roadmapPoint}>
              <View style={[s.roadmapDot, s.roadmapDotActive]} />
              <Text style={s.roadmapName}>Thành viên</Text>
            </View>
            {sortedTiers.map(t => {
              const achieved = spent >= parseFloat(t.min_spent);
              return (
                <View key={t.id} style={s.roadmapPoint}>
                  <View style={[s.roadmapDot, achieved ? s.roadmapDotActive : s.roadmapDotInactive]} />
                  <Text style={[s.roadmapName, !achieved && { color: '#aaa' }]}>{t.name}</Text>
                  <Text style={s.roadmapSpent}>
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
function MenuItem({ icon, label, onPress, danger }) {
  return (
    <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.menuIconWrap, danger && s.menuIconDanger]}>
        <Ionicons name={icon} size={20} color={danger ? '#cc1e2e' : '#9f273b'} />
      </View>
      <Text style={[s.menuLabel, danger && s.menuLabelDanger]}>{label}</Text>
      {!danger && <Ionicons name="chevron-forward" size={16} color="#ccc" style={{ marginLeft: 'auto' }} />}
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [allTiers, setAllTiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async (showOverlay = true) => {
    if (showOverlay) {
      setIsLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) { setIsLoggedIn(false); return; }

      const res = await fetch(`${MOBILE_AUTH_URL}/me`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      if (!res.ok) {
        // Token hết hạn hoặc không hợp lệ -> xóa token
        await AsyncStorage.multiRemove(['auth_token', 'user']);
        setIsLoggedIn(false);
        return;
      }

      const data = await res.json();
      setUser(data.user);
      setAllTiers(data.user?.all_tiers || []);
      setIsLoggedIn(true);
      // Lưu lại cache user để dùng offline
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
    } catch (e) {
      // Nếu lỗi mạng → lấy từ cache
      try {
        const cached = await AsyncStorage.getItem('user');
        if (cached) {
          const cachedUser = JSON.parse(cached);
          setUser(cachedUser);
          setAllTiers(cachedUser?.all_tiers || []);
          setIsLoggedIn(true);
        }
        else setIsLoggedIn(false);
      } catch { setIsLoggedIn(false); }
    } finally {
      if (showOverlay) {
        setIsLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }, []);

  const onRefresh = useCallback(() => {
    loadProfile(false);
  }, [loadProfile]);

  // Refresh khi quay lại tab
  useFocusEffect(
    useCallback(() => {
      loadProfile(true);
    }, [loadProfile])
  );

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất', style: 'destructive', onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('auth_token');
            if (token) {
              await fetch(`${MOBILE_AUTH_URL}/logout`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
              });
            }
          } catch { }
          await AsyncStorage.multiRemove(['auth_token', 'user']);
          setIsLoggedIn(false);
          setUser(null);
        },
      },
    ]);
  };

  // ── LOADING ──
  if (isLoading) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#9f273b" />
        </View>
      </SafeAreaView>
    );
  }

  // ── GUEST ──
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
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
              { icon: 'receipt-outline', label: 'Lịch sử đơn hàng' },
              { icon: 'heart-outline', label: 'Sản phẩm yêu thích' },
              { icon: 'gift-outline', label: 'Điểm thưởng & Ưu đãi' },
              { icon: 'shield-checkmark-outline', label: 'Chính sách bảo hành' },
              { icon: 'call-outline', label: 'Liên hệ CSKH' },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={s.menuItem} onPress={() => navigation.navigate('Login')}>
                <View style={s.menuIconWrap}>
                  <Ionicons name={item.icon} size={20} color="#9f273b" />
                </View>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#ccc" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── LOGGED IN ──
  const avatarUri = user?.avatar_url
    ? getStorageUrl(user.avatar_url)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=9f273b&color=fff&size=200`;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
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
        <View style={s.heroCard}>
          <View style={s.heroAvatarWrap}>
            <Image source={{ uri: avatarUri }} style={s.heroAvatar} />
          </View>
          <View style={s.heroInfo}>
            <Text style={s.heroName}>{user?.fullName || 'Thành viên SORA'}</Text>
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
        <View style={s.statsRow}>
          <View style={s.statBoxSide}>
            <Text style={s.statVal} numberOfLines={1} adjustsFontSizeToFit>{user?.accumulated_orders || 0}</Text>
            <Text style={s.statLabel}>Đơn hàng</Text>
          </View>
          <View style={[s.statBox, s.statBoxMid]}>
            <Text style={s.statVal} numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(user?.accumulated_spent)}</Text>
            <Text style={s.statLabel}>Đã chi tiêu</Text>
          </View>
          <View style={s.statBoxSide}>
            <Text style={s.statVal} numberOfLines={1} adjustsFontSizeToFit>{user?.tier?.discount_percent ? `${user.tier.discount_percent}%` : '0%'}</Text>
            <Text style={s.statLabel}>Ưu đãi</Text>
          </View>
        </View>

        {/* ── Menu ── */}
        <View style={s.sectionTitle}>
          <Ionicons name="grid-outline" size={18} color="#9f273b" />
          <Text style={s.sectionTitleTxt}>Quản Lý Tài Khoản</Text>
        </View>
        <View style={s.section}>
          <MenuItem icon="person-outline" label="Thông tin cá nhân" onPress={() => navigation.navigate('Login')} />
          <MenuItem icon="receipt-outline" label="Lịch sử đơn hàng" onPress={() => navigation.navigate('Login')} />
          <MenuItem icon="heart-outline" label="Sản phẩm yêu thích" onPress={() => navigation.navigate('Login')} />
          <MenuItem icon="location-outline" label="Sổ địa chỉ" onPress={() => navigation.navigate('Login')} />
          <MenuItem icon="gift-outline" label="Ưu đãi & Thành viên" onPress={() => navigation.navigate('Login')} />
        </View>

        <View style={s.sectionTitle}>
          <Ionicons name="settings-outline" size={18} color="#9f273b" />
          <Text style={s.sectionTitleTxt}>Hỗ Trợ</Text>
        </View>
        <View style={s.section}>
          <MenuItem icon="shield-checkmark-outline" label="Chính sách bảo hành" onPress={() => { }} />
          <MenuItem icon="call-outline" label="Liên hệ CSKH" onPress={() => { }} />
          <MenuItem icon="log-out-outline" label="Đăng xuất" onPress={handleLogout} danger />
        </View>

      </ScrollView>
    </SafeAreaView>
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
    fontSize: 14,
    fontWeight: '700',
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
  statVal: { fontSize: 15, fontWeight: '700', color: '#9f273b', marginBottom: 4, textAlign: 'center' },
  statLabel: { fontFamily: 'Oswald_400Regular', fontSize: 11, color: '#8c826e', letterSpacing: 0.5 },

  // Menu Section
  section: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  menuIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fdf5f6', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuIconDanger: { backgroundColor: '#fff0f0' },
  menuLabel: { fontFamily: 'Oswald_400Regular', fontSize: 14, color: '#333', letterSpacing: 0.3 },
  menuLabelDanger: { color: '#cc1e2e' },
});
