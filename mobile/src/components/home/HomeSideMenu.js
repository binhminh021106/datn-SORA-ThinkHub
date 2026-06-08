import React from 'react';
import {
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import SmartImage from '../SmartImage';

const TIER_CONFIG = {
  silver: { icon: 'medal-outline' },
  gold: { icon: 'trophy-outline' },
  diamond: { icon: 'diamond-outline' },
  default: { icon: 'person-circle-outline' },
};

const TIER_THEMES = {
  silver: {
    bg: '#f8f9fa',
    border: '#cbd5e1',
    text: '#475569',
    iconWrapBg: '#e2e8f0',
    avatarBorder: '#cbd5e1',
    labelColor: '#64748b',
    nameColor: '#334155',
  },
  gold: {
    bg: '#fffdf6',
    border: '#ebd5a3',
    text: '#92400e',
    iconWrapBg: '#fef4cb',
    avatarBorder: '#ebd5a3',
    labelColor: '#8c826e',
    nameColor: '#1a1a1a',
  },
  diamond: {
    bg: '#f4fdff',
    border: '#a5f3fc',
    text: '#0369a1',
    iconWrapBg: '#e0f7fa',
    avatarBorder: '#a5f3fc',
    labelColor: '#0e7490',
    nameColor: '#0f172a',
  },
  default: {
    bg: '#fafafa',
    border: '#e5e7eb',
    text: '#555555',
    iconWrapBg: '#f3f4f6',
    avatarBorder: '#d1d5db',
    labelColor: '#6b7280',
    nameColor: '#1f2937',
  },
};

const getTierKey = (tierName) => {
  if (!tierName) return 'default';
  const name = tierName.toLowerCase();
  if (name.includes('kim') || name.includes('diamond')) return 'diamond';
  if (name.includes('vàng') || name.includes('gold')) return 'gold';
  if (name.includes('bạc') || name.includes('silver')) return 'silver';
  return 'default';
};

const TierBadge = ({ tierName }) => {
  const key = getTierKey(tierName);
  const cfg = TIER_CONFIG[key];
  const theme = TIER_THEMES[key];

  return (
    <View style={[styles.tierBadge, { backgroundColor: theme.iconWrapBg, borderColor: theme.border }]}>
      <Ionicons name={cfg.icon} size={13} color={theme.text} />
      <Text style={[styles.tierBadgeTxt, { color: theme.text }]}>{tierName || 'Thành viên'}</Text>
    </View>
  );
};

export default function HomeSideMenu({
  visible,
  width,
  translateX,
  isLoggedIn,
  user,
  navigation,
  onClose,
  onOpenGold,
  getStorageUrl,
}) {
  if (!visible) return null;

  const closeAndNavigate = (routeName) => {
    onClose();
    navigation.navigate(routeName);
  };

  const tierKey = getTierKey(user?.tier?.name);
  const theme = TIER_THEMES[tierKey];
  const avatarUri = user?.avatar_url
    ? getStorageUrl(user.avatar_url)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=9f273b&color=fff&size=200`;

  return (
    <View style={styles.menuOverlayWrapper}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.menuOverlay} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.menuContainer, { width, transform: [{ translateX }] }]}>
        <SafeAreaView style={styles.flex}>
          <View style={styles.menuHeader}>
            <Image source={require('../../../assets/logo1.png')} style={styles.menuLogo} resizeMode="contain" />
            <TouchableOpacity onPress={onClose} style={styles.menuCloseBtn}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.menuBody} showsVerticalScrollIndicator={false}>
            {isLoggedIn ? (
              <TouchableOpacity
                style={[
                  styles.heroCard,
                  { backgroundColor: theme.bg, borderColor: theme.border, shadowColor: theme.border },
                ]}
                activeOpacity={0.8}
                onPress={() => closeAndNavigate('Profile')}
              >
                <View style={[styles.heroAvatarWrap, { borderColor: theme.avatarBorder }]}>
                  <SmartImage source={{ uri: avatarUri }} style={styles.heroAvatar} resizeMode="cover" />
                </View>
                <View style={styles.heroInfo}>
                  <Text style={[styles.heroName, { color: theme.nameColor }]} numberOfLines={1}>
                    {user?.fullName || 'Thành viên SORA'}
                  </Text>
                  <Text style={[styles.heroEmail, { color: theme.labelColor }]} numberOfLines={1}>
                    {user?.email}
                  </Text>
                  <TierBadge tierName={user?.tier?.name} />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.menuUserSection} onPress={() => closeAndNavigate('Login')}>
                <View style={styles.menuAvatar}>
                  <Ionicons name="person" size={30} color="#9f273b" />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.menuUserName}>Đăng nhập / Đăng ký</Text>
                  <Text style={styles.menuUserSub}>Nhận ưu đãi hạng thành viên</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#ccc" />
              </TouchableOpacity>
            )}

            <View style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>KHÁM PHÁ</Text>
              <TouchableOpacity style={styles.menuItem} onPress={() => closeAndNavigate('Shop')}>
                <Ionicons name="diamond-outline" size={22} color="#555" style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>Cửa hàng Trang sức</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => closeAndNavigate('Collections')}>
                <Ionicons name="sparkles-outline" size={22} color="#555" style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>Bộ Sưu Tập Giới Hạn</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  onOpenGold();
                }}
              >
                <MaterialCommunityIcons name="gold" size={22} color="#555" style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>Bảng Giá Vàng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => closeAndNavigate('News')}>
                <Ionicons name="newspaper-outline" size={22} color="#555" style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>Tin tức</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => closeAndNavigate('StaffAttendance')}>
                <Ionicons name="qr-code-outline" size={22} color="#555" style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>Chấm công nhân viên</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>HỖ TRỢ & DỊCH VỤ</Text>
              <TouchableOpacity style={styles.menuItem} onPress={() => closeAndNavigate('About')}>
                <Ionicons name="information-circle-outline" size={22} color="#555" style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>Về SORA</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => closeAndNavigate('Warranty')}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#555" style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>Chính sách bảo hành</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => closeAndNavigate('ContactCSKH')}>
                <Ionicons name="call-outline" size={22} color="#555" style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>Liên hệ CSKH</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.menuFooter}>
            <Text style={styles.menuFooterText}>SORA JEWELRY v1.0.0</Text>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  menuOverlayWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    flexDirection: 'row',
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuLogo: { height: 40, width: 150 },
  menuCloseBtn: { padding: 5 },
  menuBody: { flex: 1 },
  menuUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fbf9f6',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e7ce7d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  menuUserName: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#333',
    marginBottom: 4,
  },
  menuUserSub: {
    fontSize: 12,
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    color: '#9f273b',
  },
  menuSection: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuSectionTitle: {
    fontSize: 12,
    fontFamily: 'Oswald_500Medium',
    color: '#999',
    letterSpacing: 1.5,
    paddingHorizontal: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuItemIcon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  menuItemText: {
    fontSize: 14,
    fontFamily: 'Oswald_400Regular',
    color: '#333',
  },
  menuFooter: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  menuFooterText: {
    fontSize: 11,
    fontFamily: 'Oswald_400Regular',
    color: '#aaa',
    letterSpacing: 1,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 10,
  },
  heroAvatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    overflow: 'hidden',
    marginRight: 12,
  },
  heroAvatar: { width: '100%', height: '100%' },
  heroInfo: { flex: 1 },
  heroName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    marginBottom: 2,
  },
  heroEmail: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 11,
    marginBottom: 6,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  tierBadgeTxt: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
