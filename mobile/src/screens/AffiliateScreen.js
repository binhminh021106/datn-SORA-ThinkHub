import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar,
  ScrollView, Platform, Modal, TextInput, KeyboardAvoidingView,
  ActivityIndicator, RefreshControl, Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import { showCustomAlert } from '../components/CustomAlert';
import { PRICE_FONT_FAMILY, PRICE_FONT_WEIGHT } from '../styles/typography';

const Alert = {
  alert: (title, message, buttons) => showCustomAlert(title, message, buttons),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatCurrency = (v) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v) || 0);

const WITHDRAW_MIN = 200000;
const SOCIAL_PLATFORMS = ['TikTok', 'Facebook', 'Instagram', 'YouTube', 'Shopee', 'Khác'];
const createSocialChannel = () => ({
  id: `channel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  platform: 'TikTok',
  value: '',
});
const isUrl = (value) => /^https?:\/\//i.test(value);
const normalizeSocialChannelValue = (platform, value) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return '';
  if (isUrl(trimmedValue)) return trimmedValue;

  if (platform === 'TikTok') {
    const username = trimmedValue.replace(/^@+/, '').replace(/^tiktok\.com\/@?/i, '').split(/[/?#]/)[0];
    return username ? `https://www.tiktok.com/@${username}?lang=en` : trimmedValue;
  }

  if (platform === 'Facebook') {
    const username = trimmedValue.replace(/^\/+/, '').replace(/^facebook\.com\/?/i, '').split(/[/?#]/)[0];
    return username ? `https://www.facebook.com/${username}` : trimmedValue;
  }

  if (platform === 'YouTube') {
    const username = trimmedValue.replace(/^@+/, '').replace(/^youtube\.com\/@?/i, '').split(/[/?#]/)[0];
    return username ? `https://www.youtube.com/@${username}` : trimmedValue;
  }

  if (platform === 'Instagram') {
    const username = trimmedValue.replace(/^@+/, '').replace(/^instagram\.com\/?/i, '').split(/[/?#]/)[0];
    return username ? `https://www.instagram.com/${username}/` : trimmedValue;
  }

  return trimmedValue;
};

// Status badge config for commission histories
const STATUS_CONFIG = {
  pending:   { label: 'Chờ duyệt',   color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  approved:  { label: 'Đã duyệt',    color: '#2e7d32', bg: '#f0fdf4', border: '#bbf7d0' },
  withdrawn: { label: 'Đã rút',      color: '#0e7490', bg: '#ecfeff', border: '#a5f3fc' },
  rejected:  { label: 'Từ chối',     color: '#cc1e2e', bg: '#fff4f4', border: '#fecaca' },
};
const getStatusCfg = (s) => STATUS_CONFIG[s] || { label: s, color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' };

// ─── Reusable header ─────────────────────────────────────────────────────────
function Header({ navigation }) {
  return (
    <View style={s.header}>
      <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={22} color="#111" />
      </TouchableOpacity>
      <Text style={s.headerTitle}>Tiếp Thị Liên Kết</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AffiliateScreen() {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Data từ GET /client/affiliate/status
  const [info, setInfo] = useState({ is_affiliate: false, affiliate_code: null, commission_balance: 0 });
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [stats, setStats] = useState({ available_balance: 0, pending_balance: 0, total_withdrawn: 0 });
  const [histories, setHistories] = useState([]);
  const [showApplyForm, setShowApplyForm] = useState(false); // nút "Đăng ký lại"

  // Forms
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', bank_name: '', account_number: '', account_holder_name: '' });
  const [apply, setApply] = useState({ introduce_message: '' });
  const [socialChannels, setSocialChannels] = useState([createSocialChannel()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const hasLoaded = useRef(false);

  // ── Fetch status ──
  const fetchStatus = useCallback(async ({ showOverlay = true, showRefresh = false } = {}) => {
    if (showOverlay) setIsLoading(true);
    if (showRefresh) setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) { setIsLoggedIn(false); return; }
      setIsLoggedIn(true);

      const res = await fetch(`${API_BASE_URL}/client/affiliate/status`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      if (res.status === 401) { setIsLoggedIn(false); return; }

      const result = await res.json();
      if (result.success && result.data) {
        const d = result.data;
        setInfo({
          is_affiliate: !!d.is_affiliate,
          affiliate_code: d.affiliate_code,
          commission_balance: d.commission_balance,
        });

        if (d.application) {
          setApplicationStatus(d.application.status);
          setAdminNotes(d.application.admin_notes || '');
        } else {
          setApplicationStatus(null);
          setAdminNotes('');
        }

        if (d.is_affiliate) {
          setStats(d.dashboard_stats || { available_balance: 0, pending_balance: 0, total_withdrawn: 0 });
          setHistories(d.histories || []);
        }
      }
    } catch (e) {
      Alert.alert('Lỗi kết nối', 'Không thể tải dữ liệu tiếp thị liên kết. Vui lòng thử lại sau.');
    } finally {
      if (showOverlay) setIsLoading(false);
      if (showRefresh) setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content');
      fetchStatus({ showOverlay: !hasLoaded.current });
      hasLoaded.current = true;
    }, [fetchStatus])
  );

  const onRefresh = useCallback(() => fetchStatus({ showOverlay: false, showRefresh: true }), [fetchStatus]);

  const addSocialChannel = () => {
    setSocialChannels((prev) => [...prev, createSocialChannel()]);
  };

  const removeSocialChannel = (id) => {
    setSocialChannels((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  };

  const updateSocialChannel = (id, patch) => {
    setSocialChannels((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  // ── Actions ──
  const handleShare = async () => {
    if (!info.affiliate_code) return;
    try {
      await Share.share({
        message: `Mua sắm trang sức tại SORA và dùng mã giới thiệu của tôi: ${info.affiliate_code} để cùng nhận ưu đãi nhé!`,
      });
    } catch { /* user cancelled */ }
  };

  const handleCopy = () => {
    if (!info.affiliate_code) return;
    Alert.alert('Mã giới thiệu của bạn', `${info.affiliate_code}\n\nHãy chia sẻ mã này với khách hàng của bạn để nhận hoa hồng.`);
  };

  const submitApplication = async () => {
    const cleanedChannels = socialChannels
      .map((item) => ({ platform: item.platform, value: normalizeSocialChannelValue(item.platform, item.value) }))
      .filter((item) => item.value);
    const socialLinks = cleanedChannels.map((item) => `${item.platform}: ${item.value}`).join('\n');

    if (!socialLinks || !apply.introduce_message.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập liên kết mạng xã hội và lời giới thiệu.');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/client/affiliate/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, Accept: 'application/json' },
        body: JSON.stringify({ social_links: socialLinks, introduce_message: apply.introduce_message.trim() }),
      });
      const result = await res.json();
      if (result.success) {
        Alert.alert('Thành công!', result.message || 'Nộp đơn đăng ký thành công! Vui lòng chờ SORA xét duyệt.');
        setApply({ introduce_message: '' });
        setSocialChannels([createSocialChannel()]);
        setApplicationStatus('pending');
        setShowApplyForm(false);
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể nộp đơn. Vui lòng thử lại.');
      }
    } catch {
      Alert.alert('Lỗi hệ thống', 'Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitWithdraw = async () => {
    const amount = Number(withdrawForm.amount);
    if (!amount || amount < WITHDRAW_MIN) {
      Alert.alert('Chú ý', `Số tiền rút tối thiểu phải từ ${formatCurrency(WITHDRAW_MIN)} trở lên.`);
      return;
    }
    if (amount > Number(stats.available_balance)) {
      Alert.alert('Thất bại', 'Số dư tài khoản của bạn không đủ để rút số tiền này.');
      return;
    }
    if (!withdrawForm.bank_name.trim() || !withdrawForm.account_number.trim() || !withdrawForm.account_holder_name.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ thông tin ngân hàng.');
      return;
    }
    setIsWithdrawing(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/client/affiliate/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, Accept: 'application/json' },
        body: JSON.stringify({ ...withdrawForm, amount }),
      });
      const result = await res.json();
      if (result.success) {
        setShowWithdraw(false);
        Alert.alert('Đã gửi yêu cầu!', result.message || 'Yêu cầu rút tiền đã được gửi thành công!');
        setWithdrawForm({ amount: '', bank_name: '', account_number: '', account_holder_name: '' });
        fetchStatus({ showOverlay: false });
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể gửi yêu cầu rút tiền.');
      }
    } catch {
      Alert.alert('Lỗi kết nối', 'Không thể kết nối tới máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const openWithdraw = () => {
    if (Number(stats.available_balance) < WITHDRAW_MIN) {
      Alert.alert('Hạn mức không đủ', `Số dư ví khả dụng phải có tối thiểu ${formatCurrency(WITHDRAW_MIN)} để thực hiện lệnh rút tiền.`);
      return;
    }
    setShowWithdraw(true);
  };

  // ── GUEST: chưa đăng nhập ──
  const renderGuest = () => (
    <View style={s.centerState}>
      <View style={[s.stateIconWrap, { backgroundColor: '#fdf5f6', borderColor: '#e7ce7d' }]}>
        <Ionicons name="lock-closed-outline" size={40} color="#9f273b" />
      </View>
      <Text style={s.stateTitle}>Bạn chưa đăng nhập</Text>
      <Text style={s.stateSub}>Đăng nhập tài khoản SORA để tham gia chương trình tiếp thị liên kết và nhận hoa hồng.</Text>
      <TouchableOpacity style={[s.primaryBtn, { width: '70%', marginTop: 8 }]} activeOpacity={0.85} onPress={() => navigation.navigate('Login')}>
        <Ionicons name="log-in-outline" size={16} color="#fff" />
        <Text style={s.primaryBtnTxt}>ĐĂNG NHẬP</Text>
      </TouchableOpacity>
    </View>
  );

  // ── APPLY: form đăng ký ──
  const renderApplyForm = () => (
    <KeyboardAvoidingView
      style={s.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <ScrollView
        contentContainerStyle={s.applyScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#9f273b']} tintColor="#9f273b" />}
      >
      <LinearGradient
        colors={['#9f273b', '#7d1d2e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.applyHero}
      >
        <View style={s.applyHeroGlow} />
        <View style={s.applyHeroTop}>
          <View style={s.applyHeroIconWrap}>
            <Ionicons name="diamond-outline" size={27} color="#e7ce7d" />
          </View>
          <View style={s.applyHeroText}>
            <Text style={s.applyHeroKicker}>SORA PARTNER</Text>
            <Text style={s.applyHeroTitle}>Trở thành đối tác giới thiệu</Text>
          </View>
        </View>
        <Text style={s.applyHeroSub}>
          Chia sẻ sản phẩm SORA bằng mã riêng của bạn và nhận hoa hồng khi đơn hàng hoàn tất.
        </Text>
      </LinearGradient>

      <View style={s.applyStepsCard}>
        {[
          { icon: 'create-outline', title: 'Gửi hồ sơ', desc: 'Điền kênh mạng xã hội và vài dòng giới thiệu.' },
          { icon: 'shield-checkmark-outline', title: 'SORA duyệt', desc: 'Đội ngũ kiểm tra sự phù hợp của hồ sơ.' },
          { icon: 'cash-outline', title: 'Nhận hoa hồng', desc: 'Có mã riêng để chia sẻ và theo dõi thu nhập.' },
        ].map((step, index) => (
          <View key={step.title} style={s.applyStepItem}>
            <View style={s.applyStepIconWrap}>
              <Ionicons name={step.icon} size={18} color="#9f273b" />
            </View>
            <View style={s.applyStepText}>
              <Text style={s.applyStepTitle}>{step.title}</Text>
              <Text style={s.applyStepDesc}>{step.desc}</Text>
            </View>
            {index < 2 && <View style={s.applyStepDivider} />}
          </View>
        ))}
      </View>

      <View style={s.applySectionHeader}>
        <View>
          <Text style={s.applySectionKicker}>QUYỀN LỢI</Text>
          <Text style={s.applySectionTitle}>Bạn sẽ nhận được gì?</Text>
        </View>
        <Ionicons name="sparkles-outline" size={22} color="#e7ce7d" />
      </View>
      <View style={s.applyBenefitGrid}>
        {[
          { icon: 'cash-outline', title: 'Hoa hồng theo đơn', desc: 'Nhận phần trăm hoa hồng khi khách mua qua mã của bạn.' },
          { icon: 'wallet-outline', title: 'Rút tiền linh hoạt', desc: `Rút về tài khoản ngân hàng từ ${formatCurrency(WITHDRAW_MIN)}.` },
          { icon: 'stats-chart-outline', title: 'Theo dõi minh bạch', desc: 'Xem số dư và lịch sử hoa hồng ngay trong ứng dụng.' },
        ].map((b) => (
          <View key={b.title} style={s.applyBenefitItem}>
            <View style={s.applyBenefitIconWrap}>
              <Ionicons name={b.icon} size={20} color="#9f273b" />
            </View>
            <Text style={s.applyBenefitTitle}>{b.title}</Text>
            <Text style={s.applyBenefitDesc}>{b.desc}</Text>
          </View>
        ))}
      </View>

      <View style={s.applySectionHeader}>
        <View>
          <Text style={s.applySectionKicker}>HỒ SƠ ĐĂNG KÝ</Text>
          <Text style={s.applySectionTitle}>Thông tin tham gia</Text>
        </View>
        <Ionicons name="create-outline" size={22} color="#e7ce7d" />
      </View>
      <View style={s.applyFormCard}>
        <Text style={s.applyFormHint}>
          Hãy gửi những kênh bạn đang hoạt động. SORA sẽ xem xét phong cách nội dung và mức độ phù hợp với thương hiệu.
        </Text>

        <Text style={s.applyInputLabel}>Kênh mạng xã hội</Text>
        {socialChannels.map((channel, index) => (
          <View key={channel.id} style={s.applyChannelCard}>
            <View style={s.applyChannelHeader}>
              <View style={s.applyChannelTitleWrap}>
                <Ionicons name="share-social-outline" size={16} color="#9f273b" />
                <Text style={s.applyChannelTitle}>Kênh {index + 1}</Text>
              </View>
              {socialChannels.length > 1 && (
                <TouchableOpacity style={s.applyRemoveBtn} activeOpacity={0.75} onPress={() => removeSocialChannel(channel.id)}>
                  <Ionicons name="close" size={16} color="#9f273b" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.platformList}>
              {SOCIAL_PLATFORMS.map((platform) => {
                const isActive = channel.platform === platform;
                return (
                  <TouchableOpacity
                    key={platform}
                    style={[s.platformChip, isActive && s.platformChipActive]}
                    activeOpacity={0.78}
                    onPress={() => updateSocialChannel(channel.id, { platform })}
                  >
                    <Text style={[s.platformChipText, isActive && s.platformChipTextActive]}>{platform}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={s.applyInputBox}>
              <Ionicons name="at-outline" size={18} color="#9f273b" />
              <TextInput
                style={s.applyInput}
                placeholder="Ví dụ: @sora_jewelry, sora_jewelry hoặc dán link"
                placeholderTextColor="#b9b3a6"
                value={channel.value}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={(text) => updateSocialChannel(channel.id, { value: text })}
              />
            </View>
          </View>
        ))}
        <TouchableOpacity style={s.applyAddChannelBtn} activeOpacity={0.8} onPress={addSocialChannel}>
          <Ionicons name="add-circle-outline" size={18} color="#9f273b" />
          <Text style={s.applyAddChannelText}>Thêm kênh khác</Text>
        </TouchableOpacity>

        <Text style={s.applyInputLabel}>Lời giới thiệu</Text>
        <View style={[s.applyInputBox, s.applyTextAreaBox]}>
          <Ionicons name="chatbox-ellipses-outline" size={18} color="#9f273b" style={{ marginTop: 2 }} />
          <TextInput
            style={[s.applyInput, s.applyTextArea]}
            placeholder="Bạn đang xây dựng cộng đồng nào? Vì sao bạn muốn giới thiệu SORA?"
            placeholderTextColor="#b9b3a6"
            multiline
            maxLength={1000}
            value={apply.introduce_message}
            onChangeText={(t) => setApply((p) => ({ ...p, introduce_message: t }))}
          />
        </View>
        <Text style={s.applyCounter}>{apply.introduce_message.length}/1000 ký tự</Text>

        <TouchableOpacity style={[s.applySubmitBtn, isSubmitting && { opacity: 0.65 }]} activeOpacity={0.85} onPress={submitApplication} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="paper-plane-outline" size={16} color="#fff" />}
          <Text style={s.applySubmitTxt}>{isSubmitting ? 'ĐANG GỬI...' : 'NỘP ĐƠN ĐĂNG KÝ'}</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ── PENDING ──
  const renderPending = () => (
    <View style={s.centerState}>
      <View style={[s.stateIconWrap, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
        <Ionicons name="hourglass-outline" size={40} color="#b45309" />
      </View>
      <Text style={s.stateTitle}>Đơn đang được xét duyệt</Text>
      <Text style={s.stateSub}>
        Cảm ơn bạn đã quan tâm! Đơn đăng ký đối tác của bạn đã được gửi tới SORA và đang chờ xét duyệt.
      </Text>
      <View style={s.stateBadge}>
        <Ionicons name="time-outline" size={14} color="#b45309" />
        <Text style={s.stateBadgeTxt}>Đang chờ duyệt</Text>
      </View>
    </View>
  );

  // ── REJECTED ──
  const renderRejected = () => (
    <View style={s.centerState}>
      <View style={[s.stateIconWrap, { backgroundColor: '#fff4f4', borderColor: '#fecaca' }]}>
        <Ionicons name="close-circle-outline" size={40} color="#cc1e2e" />
      </View>
      <Text style={s.stateTitle}>Đơn đăng ký chưa phù hợp</Text>
      {!!adminNotes && (
        <View style={s.rejectBox}>
          <Text style={s.rejectMsg}>{adminNotes}</Text>
        </View>
      )}
      <TouchableOpacity style={[s.primaryBtn, { width: '70%', marginTop: 18 }]} activeOpacity={0.85} onPress={() => setShowApplyForm(true)}>
        <Ionicons name="refresh-outline" size={16} color="#fff" />
        <Text style={s.primaryBtnTxt}>ĐĂNG KÝ LẠI</Text>
      </TouchableOpacity>
    </View>
  );

  // ── APPROVED dashboard ──
  const renderDashboard = () => (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#9f273b']} tintColor="#9f273b" />}
    >
      <LinearGradient colors={['#9f273b', '#7a1d2d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.codeCard}>
        <View style={s.codeGlow} />
        <Text style={s.codeLabel}>MÃ GIỚI THIỆU CỦA BẠN</Text>
        <Text style={s.codeValue}>{info.affiliate_code || '---'}</Text>
        <View style={s.codeActions}>
          <TouchableOpacity style={s.codeBtn} activeOpacity={0.85} onPress={handleCopy}>
            <Ionicons name="copy-outline" size={16} color="#9f273b" />
            <Text style={s.codeBtnTxt}>Xem mã</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.codeBtn, s.codeBtnOutline]} activeOpacity={0.85} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={16} color="#fff" />
            <Text style={[s.codeBtnTxt, { color: '#fff' }]}>Chia sẻ</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={s.balanceCard}>
        <Text style={s.balanceLabel}>SỐ DƯ KHẢ DỤNG</Text>
        <Text style={s.balanceValue}>{formatCurrency(stats.available_balance)}</Text>
        <TouchableOpacity
          style={[s.withdrawBtn, Number(stats.available_balance) < WITHDRAW_MIN && { opacity: 0.5 }]}
          activeOpacity={0.85}
          onPress={openWithdraw}
        >
          <Ionicons name="cash-outline" size={16} color="#fff" />
          <Text style={s.withdrawBtnTxt}>RÚT TIỀN</Text>
        </TouchableOpacity>
        <Text style={s.balanceHint}>Số tiền rút tối thiểu {formatCurrency(WITHDRAW_MIN)}</Text>
      </View>

      <View style={s.statsRow}>
        <View style={s.statBoxSide}>
          <Text style={s.statVal} numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(stats.pending_balance)}</Text>
          <Text style={s.statLabel}>Chờ duyệt</Text>
        </View>
        <View style={[s.statBox, s.statBoxMid]}>
          <Text style={s.statVal} numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(stats.available_balance)}</Text>
          <Text style={s.statLabel}>Khả dụng</Text>
        </View>
        <View style={s.statBoxSide}>
          <Text style={s.statVal} numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(stats.total_withdrawn)}</Text>
          <Text style={s.statLabel}>Đã rút</Text>
        </View>
      </View>

      <View style={s.sectionTitle}>
        <Ionicons name="time-outline" size={18} color="#9f273b" />
        <Text style={s.sectionTitleTxt}>Lịch Sử Giao Dịch</Text>
      </View>
      {histories.length === 0 ? (
        <View style={s.emptyCard}>
          <Ionicons name="document-text-outline" size={34} color="#cbb994" />
          <Text style={s.emptyTxt}>Chưa có giao dịch nào</Text>
        </View>
      ) : (
        <View style={s.historyCard}>
          {histories.map((h, i) => {
            const cfg = getStatusCfg(h.status);
            const isEarn = h.type === 'earn';
            return (
              <View key={h.id} style={[s.historyRow, i === 0 && { borderTopWidth: 0 }]}>
                <View style={[s.historyIconWrap, { backgroundColor: isEarn ? '#f0fdf4' : '#fff4f4' }]}>
                  <Ionicons name={isEarn ? 'arrow-down-outline' : 'arrow-up-outline'} size={18} color={isEarn ? '#2e7d32' : '#cc1e2e'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.historyRef} numberOfLines={1}>
                    {isEarn ? 'Hoa hồng đơn ' : 'Rút tiền '}{h.reference_code}
                  </Text>
                  <Text style={s.historyDate}>{h.created_at}</Text>
                </View>
                <View style={s.historyRight}>
                  <Text style={[s.historyAmount, { color: isEarn ? '#2e7d32' : '#cc1e2e' }]}>
                    {isEarn ? '+' : '−'}{formatCurrency(h.amount)}
                  </Text>
                  <View style={[s.statusPill, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                    <Text style={[s.statusPillTxt, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );

  // ── Chọn view theo trạng thái (giống web) ──
  const renderBody = () => {
    if (!isLoggedIn) return renderGuest();
    if (info.is_affiliate) return renderDashboard();
    if (applicationStatus === 'pending' && !showApplyForm) return renderPending();
    if (applicationStatus === 'rejected' && !showApplyForm) return renderRejected();
    return renderApplyForm();
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Header navigation={navigation} />

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#9f273b" />
          <Text style={s.loadingTxt}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        renderBody()
      )}

      {/* Withdraw Modal */}
      <Modal transparent visible={showWithdraw} animationType="fade" onRequestClose={() => setShowWithdraw(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.modalOverlay}>
          <View style={s.modalContainer}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Yêu cầu rút tiền</Text>
            <Text style={s.modalSub}>Số dư khả dụng: {formatCurrency(stats.available_balance)}</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
              <Text style={s.inputLabel}>Số tiền muốn rút (VND)</Text>
              <TextInput
                style={s.input}
                placeholder={`Tối thiểu ${formatCurrency(WITHDRAW_MIN)}`}
                placeholderTextColor="#b9b3a6"
                keyboardType="numeric"
                value={withdrawForm.amount}
                onChangeText={(t) => setWithdrawForm((p) => ({ ...p, amount: t.replace(/[^0-9]/g, '') }))}
              />
              <Text style={s.inputLabel}>Tên ngân hàng</Text>
              <TextInput
                style={s.input}
                placeholder="VD: Vietcombank, Techcombank, MB Bank..."
                placeholderTextColor="#b9b3a6"
                value={withdrawForm.bank_name}
                onChangeText={(t) => setWithdrawForm((p) => ({ ...p, bank_name: t }))}
              />
              <Text style={s.inputLabel}>Số tài khoản ngân hàng</Text>
              <TextInput
                style={s.input}
                placeholder="Số tài khoản nhận tiền"
                placeholderTextColor="#b9b3a6"
                keyboardType="numeric"
                value={withdrawForm.account_number}
                onChangeText={(t) => setWithdrawForm((p) => ({ ...p, account_number: t }))}
              />
              <Text style={s.inputLabel}>Tên chủ tài khoản (viết hoa không dấu)</Text>
              <TextInput
                style={s.input}
                placeholder="VD: NGUYEN VAN A"
                placeholderTextColor="#b9b3a6"
                autoCapitalize="characters"
                value={withdrawForm.account_holder_name}
                onChangeText={(t) => setWithdrawForm((p) => ({ ...p, account_holder_name: t }))}
              />
            </ScrollView>

            <View style={s.modalBtnRow}>
              <TouchableOpacity style={[s.modalBtn, s.modalBtnCancel]} activeOpacity={0.85} onPress={() => setShowWithdraw(false)} disabled={isWithdrawing}>
                <Text style={s.modalBtnCancelTxt}>HỦY</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn, s.modalBtnConfirm, isWithdrawing && { opacity: 0.6 }]} activeOpacity={0.85} onPress={submitWithdraw} disabled={isWithdrawing}>
                {isWithdrawing ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.modalBtnConfirmTxt}>GỬI YÊU CẦU</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: Platform.OS === 'android' ? 28 : 0 },
  header: { height: 56, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: '#111' },
  loadingTxt: { marginTop: 10, fontFamily: 'Oswald_500Medium', color: '#9f273b', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' },

  // Section headers
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 22, marginBottom: 10 },
  sectionTitleTxt: { fontFamily: 'Oswald_600SemiBold', fontSize: 13, color: '#333', letterSpacing: 1, textTransform: 'uppercase' },

  // Code card (gradient)
  codeCard: { marginHorizontal: 16, marginTop: 16, borderRadius: 18, padding: 22, overflow: 'hidden', shadowColor: '#9f273b', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 6 },
  codeGlow: { position: 'absolute', top: -40, right: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(231, 206, 125, 0.18)' },
  codeLabel: { fontFamily: 'Oswald_500Medium', fontSize: 11, color: '#e7ce7d', letterSpacing: 1.5 },
  codeValue: { fontFamily: PRICE_FONT_FAMILY, fontWeight: PRICE_FONT_WEIGHT, fontSize: 30, color: '#fff', letterSpacing: 0.5, marginTop: 6, marginBottom: 18 },
  codeActions: { flexDirection: 'row', gap: 10 },
  codeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#fff', height: 42, borderRadius: 10 },
  codeBtnOutline: { backgroundColor: 'transparent', borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.5)' },
  codeBtnTxt: { fontFamily: 'Oswald_600SemiBold', fontSize: 13, color: '#9f273b', letterSpacing: 0.5 },

  // Balance card
  balanceCard: { backgroundColor: '#fffdf6', marginHorizontal: 16, marginTop: 14, borderRadius: 16, padding: 22, alignItems: 'center', borderWidth: 1.5, borderColor: '#ebd5a3', shadowColor: '#ebd5a3', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  balanceLabel: { fontFamily: 'Oswald_500Medium', fontSize: 11, color: '#8c826e', letterSpacing: 1 },
  balanceValue: { fontFamily: PRICE_FONT_FAMILY, fontWeight: PRICE_FONT_WEIGHT, fontSize: 30, color: '#9f273b', marginTop: 6, marginBottom: 16 },
  withdrawBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#9f273b', height: 46, borderRadius: 10, width: '100%' },
  withdrawBtnTxt: { fontFamily: 'Oswald_600SemiBold', fontSize: 14, color: '#fff', letterSpacing: 1.5 },
  balanceHint: { fontFamily: 'Oswald_400Regular', fontSize: 11, color: '#8c826e', marginTop: 10 },

  // Stats row
  statsRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 14, backgroundColor: '#fffdf6', borderRadius: 16, overflow: 'hidden', borderWidth: 1.5, borderColor: '#ebd5a3', shadowColor: '#ebd5a3', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 16, paddingHorizontal: 4 },
  statBoxSide: { flex: 1, alignItems: 'center', paddingVertical: 16, paddingHorizontal: 4 },
  statBoxMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#ebd5a3' },
  statVal: { fontFamily: PRICE_FONT_FAMILY, fontWeight: PRICE_FONT_WEIGHT, fontSize: 13, color: '#9f273b', marginBottom: 4, textAlign: 'center' },
  statLabel: { fontFamily: 'Oswald_400Regular', fontSize: 11, color: '#8c826e', letterSpacing: 0.5 },

  // History
  historyCard: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  historyIconWrap: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  historyRef: { fontFamily: 'Oswald_500Medium', fontSize: 13, color: '#333', letterSpacing: 0.3 },
  historyDate: { fontFamily: 'Oswald_400Regular', fontSize: 11, color: '#999', marginTop: 2 },
  historyRight: { alignItems: 'flex-end' },
  historyAmount: { fontFamily: PRICE_FONT_FAMILY, fontWeight: PRICE_FONT_WEIGHT, fontSize: 13, marginBottom: 4 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, borderWidth: 1 },
  statusPillTxt: { fontFamily: 'Oswald_500Medium', fontSize: 10, letterSpacing: 0.3 },

  emptyCard: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, paddingVertical: 36, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  emptyTxt: { fontFamily: 'Oswald_400Regular', fontSize: 13, color: '#9c9c9c', marginTop: 10, letterSpacing: 0.5 },

  // Apply hero banner
  keyboardAvoid: { flex: 1 },
  applyScrollContent: { paddingBottom: 42 },
  applyHero: {
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(231,206,125,0.28)',
    shadowColor: '#9f273b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
  },
  applyHeroGlow: {
    position: 'absolute',
    right: -42,
    top: -48,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(231,206,125,0.16)',
  },
  applyHeroTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  applyHeroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(231,206,125,0.42)',
  },
  applyHeroText: { flex: 1 },
  applyHeroKicker: { color: '#e7ce7d', fontFamily: 'Oswald_500Medium', fontSize: 10, letterSpacing: 1.7, marginBottom: 3 },
  applyHeroTitle: { color: '#fff', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, lineHeight: 30 },
  applyHeroSub: { color: 'rgba(255,255,255,0.84)', fontFamily: 'PlayfairDisplay_400Regular', fontSize: 13, lineHeight: 21 },
  applyStepsCard: {
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee2dd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  applyStepItem: { minHeight: 72, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
  applyStepIconWrap: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: '#fdf5f6' },
  applyStepText: { flex: 1 },
  applyStepTitle: { color: '#2f2929', fontFamily: 'Oswald_600SemiBold', fontSize: 13, letterSpacing: 0.4 },
  applyStepDesc: { marginTop: 2, color: '#817878', fontFamily: 'Oswald_400Regular', fontSize: 12, lineHeight: 17 },
  applyStepDivider: { position: 'absolute', left: 64, right: 14, bottom: 0, height: 1, backgroundColor: '#f3ebe6' },
  applySectionHeader: {
    marginHorizontal: 16,
    marginTop: 22,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  applySectionKicker: { color: '#9f273b', fontFamily: 'Oswald_500Medium', fontSize: 10, letterSpacing: 1.5, marginBottom: 2 },
  applySectionTitle: { color: '#252020', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 21, lineHeight: 27 },
  applyBenefitGrid: { marginHorizontal: 16, gap: 10 },
  applyBenefitItem: {
    padding: 14,
    minHeight: 116,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee2dd',
  },
  applyBenefitIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 10, backgroundColor: '#fdf5f6' },
  applyBenefitTitle: { color: '#2f2929', fontFamily: 'Oswald_600SemiBold', fontSize: 14, letterSpacing: 0.4 },
  applyBenefitDesc: { marginTop: 4, color: '#817878', fontFamily: 'Oswald_400Regular', fontSize: 12, lineHeight: 18 },
  applyFormCard: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee2dd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  applyFormHint: { color: '#7b706d', fontFamily: 'PlayfairDisplay_400Regular', fontSize: 13, lineHeight: 20, marginBottom: 14 },
  applyInputLabel: { color: '#4b4343', fontFamily: 'Oswald_500Medium', fontSize: 11, letterSpacing: 0.9, marginBottom: 8, textTransform: 'uppercase' },
  applyChannelCard: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee2dd',
    backgroundColor: '#fffaf7',
  },
  applyChannelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  applyChannelTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  applyChannelTitle: { color: '#4b4343', fontFamily: 'Oswald_500Medium', fontSize: 12, letterSpacing: 0.5 },
  applyRemoveBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdf0f2',
  },
  platformList: { gap: 8, paddingRight: 4, marginBottom: 10 },
  platformChip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eadfd8',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformChipActive: { borderColor: '#9f273b', backgroundColor: '#9f273b' },
  platformChipText: { color: '#746966', fontFamily: 'Oswald_500Medium', fontSize: 11, letterSpacing: 0.4 },
  platformChipTextActive: { color: '#fff' },
  applyInputBox: {
    minHeight: 50,
    marginBottom: 14,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: '#eadfd8',
    borderRadius: 8,
    backgroundColor: '#fffdfb',
  },
  applyInput: { flex: 1, paddingVertical: 10, color: '#252020', fontFamily: 'Oswald_400Regular', fontSize: 14 },
  applyAddChannelBtn: {
    height: 42,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ead4d8',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  applyAddChannelText: { color: '#9f273b', fontFamily: 'Oswald_600SemiBold', fontSize: 12, letterSpacing: 0.6 },
  applyTextAreaBox: { minHeight: 112, alignItems: 'flex-start', paddingVertical: 10 },
  applyTextArea: { minHeight: 90, textAlignVertical: 'top' },
  applyCounter: { marginTop: -6, marginBottom: 14, textAlign: 'right', color: '#a0938b', fontFamily: 'Oswald_400Regular', fontSize: 11 },
  applySubmitBtn: { height: 48, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#9f273b' },
  applySubmitTxt: { color: '#fff', fontFamily: 'Oswald_600SemiBold', fontSize: 12, letterSpacing: 1.4 },
  heroBanner: { backgroundColor: '#111', marginHorizontal: 16, marginTop: 16, borderRadius: 18, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 5 },
  heroIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(231, 206, 125, 0.12)', borderWidth: 1, borderColor: 'rgba(231, 206, 125, 0.4)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  heroBannerTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: '#e7ce7d', marginBottom: 8, textAlign: 'center' },
  heroBannerSub: { fontFamily: 'Oswald_400Regular', fontSize: 13, color: '#cfcfcf', textAlign: 'center', lineHeight: 20, letterSpacing: 0.3 },

  // Benefit card
  benefitCard: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  benefitIconWrap: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#fdf5f6', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  benefitTitle: { fontFamily: 'Oswald_600SemiBold', fontSize: 14, color: '#333', letterSpacing: 0.3 },
  benefitDesc: { fontFamily: 'Oswald_400Regular', fontSize: 12, color: '#888', marginTop: 2, lineHeight: 17 },

  // Reject box
  rejectBox: { backgroundColor: '#fff4f4', marginHorizontal: 8, marginTop: 14, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#fecaca' },
  rejectMsg: { fontFamily: 'Oswald_400Regular', fontSize: 13, color: '#a33', lineHeight: 19, textAlign: 'center' },

  // Form
  formCard: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  inputLabel: { fontFamily: 'Oswald_500Medium', fontSize: 12, color: '#555', letterSpacing: 0.5, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#faf8f3', borderWidth: 1, borderColor: '#ece5d6', borderRadius: 10, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 9, fontFamily: 'Oswald_400Regular', fontSize: 14, color: '#333' },
  textArea: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#9f273b', height: 48, borderRadius: 10, marginTop: 20 },
  primaryBtnTxt: { fontFamily: 'Oswald_600SemiBold', fontSize: 14, color: '#fff', letterSpacing: 1.5 },

  // Center state
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  stateIconWrap: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, marginBottom: 20 },
  stateTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: '#333', marginBottom: 10, textAlign: 'center' },
  stateSub: { fontFamily: 'Oswald_400Regular', fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20, letterSpacing: 0.3, marginBottom: 18 },
  stateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  stateBadgeTxt: { fontFamily: 'Oswald_500Medium', fontSize: 12, color: '#b45309', letterSpacing: 0.5 },

  // Withdraw modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fffdf9', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 30, maxHeight: '88%', alignItems: 'center' },
  modalHandle: { width: 44, height: 5, borderRadius: 3, backgroundColor: '#e0d8c5', marginBottom: 16 },
  modalTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: '#9f273b', marginBottom: 4 },
  modalSub: { fontFamily: 'Oswald_400Regular', fontSize: 13, color: '#8c826e', marginBottom: 8 },
  modalBtnRow: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 20 },
  modalBtn: { flex: 1, height: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalBtnCancel: { backgroundColor: '#fff', borderWidth: 1.2, borderColor: '#ebd5a3' },
  modalBtnConfirm: { backgroundColor: '#9f273b' },
  modalBtnCancelTxt: { fontFamily: 'Oswald_600SemiBold', fontSize: 13, color: '#8c826e', letterSpacing: 1 },
  modalBtnConfirmTxt: { fontFamily: 'Oswald_600SemiBold', fontSize: 13, color: '#fff', letterSpacing: 1 },
});
