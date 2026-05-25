import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Platform,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../config/api';
import { showCustomAlert } from '../components/CustomAlert';

const Alert = {
  alert: (title, message, buttons) => showCustomAlert(title, message, buttons)
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getStorageUrl = (path) => {
  if (!path) return '';
  const origin = API_BASE_URL.replace('/api', '');
  if (path.startsWith('http')) {
    return path
      .replace(/http:\/\/(127\.0\.0\.1|localhost):8000/g, origin)
      .replace(/https:\/\/(127\.0\.0\.1|localhost):8000/g, origin);
  }
  return `${origin}/storage/${path}`;
};

const dbDateToParts = (dbDate) => {
  if (!dbDate) return { day: null, month: null, year: null };
  const parts = dbDate.split('-');
  if (parts.length === 3) {
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10),
      day: parseInt(parts[2], 10),
    };
  }
  return { day: null, month: null, year: null };
};

const partsToDbDate = (day, month, year) => {
  if (!day || !month || !year) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const formatBirthdayLabel = (day, month, year) => {
  if (!day || !month || !year) return 'Chọn ngày sinh';
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
};

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => currentYear - i);

const ITEM_H = 48; // height of each item row
const VISIBLE_ITEMS = 5; // number of visible rows
const PICKER_H = ITEM_H * VISIBLE_ITEMS; // total visible height

// ─── Scroll Picker Column ─────────────────────────────────────────────────────
const SpinColumn = React.memo(({ data, selectedIndex, onSelect, formatLabel }) => {
  const scrollRef = useRef(null);
  const isScrolling = useRef(false);

  // Scroll to initial position
  useEffect(() => {
    if (scrollRef.current && selectedIndex >= 0) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_H, animated: false });
      }, 50);
    }
  }, []);

  const handleMomentumEnd = useCallback((e) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const idx = Math.round(offsetY / ITEM_H);
    const clampedIdx = Math.max(0, Math.min(idx, data.length - 1));
    isScrolling.current = false;
    onSelect(clampedIdx);
  }, [data, onSelect]);

  const handleScrollEnd = useCallback((e) => {
    if (!isScrolling.current) return;
    const offsetY = e.nativeEvent.contentOffset.y;
    const idx = Math.round(offsetY / ITEM_H);
    const clampedIdx = Math.max(0, Math.min(idx, data.length - 1));
    isScrolling.current = false;
    onSelect(clampedIdx);
  }, [data, onSelect]);

  return (
    <View style={spin.col}>
      {/* Top fade overlay */}
      <View style={spin.fadeTop} pointerEvents="none" />
      {/* Center highlight */}
      <View style={spin.highlight} pointerEvents="none" />
      {/* Bottom fade overlay */}
      <View style={spin.fadeBottom} pointerEvents="none" />

      <ScrollView
        ref={scrollRef}
        style={spin.scroll}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
        onScrollBeginDrag={() => { isScrolling.current = true; }}
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollEndDrag={handleScrollEnd}
        scrollEventThrottle={16}
      >
        {data.map((val, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <TouchableOpacity
              key={String(val)}
              style={spin.item}
              onPress={() => {
                onSelect(idx);
                scrollRef.current?.scrollTo({ y: idx * ITEM_H, animated: true });
              }}
              activeOpacity={0.7}
            >
              <Text style={[spin.itemTxt, isSelected && spin.itemTxtActive]}>
                {formatLabel ? formatLabel(val) : String(val).padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const spin = StyleSheet.create({
  col: {
    flex: 1,
    height: PICKER_H,
    overflow: 'hidden',
    position: 'relative',
  },
  scroll: {
    flex: 1,
  },
  item: {
    height: ITEM_H,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTxt: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 17,
    color: '#bbb',
  },
  itemTxtActive: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 20,
    color: '#9f273b',
  },
  highlight: {
    position: 'absolute',
    left: 4,
    right: 4,
    top: ITEM_H * 2,
    height: ITEM_H,
    backgroundColor: 'rgba(159,39,59,0.07)',
    borderRadius: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ebd5a3',
    zIndex: 10,
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_H * 2,
    zIndex: 10,
    backgroundColor: 'transparent',
    // Simulated fade using a semi-transparent overlay
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_H * 2,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EditProfileScreen() {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Nam');

  // Birthday confirmed
  const [bDay, setBDay] = useState(null);
  const [bMonth, setBMonth] = useState(null);
  const [bYear, setBYear] = useState(null);

  // Birthday temp (while picker is open) - stored as index
  const [tmpDayIdx, setTmpDayIdx] = useState(0);
  const [tmpMonthIdx, setTmpMonthIdx] = useState(0);
  const [tmpYearIdx, setTmpYearIdx] = useState(19); // default ~20 years ago

  // Avatar states
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(null);
  const [selectedImageUri, setSelectedImageUri] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const cached = await AsyncStorage.getItem('user');
      if (cached) {
        const u = JSON.parse(cached);
        setFullName(u.fullName || '');
        setEmail(u.email || '');
        setPhone(u.phone || '');
        setGender(u.gender || 'Nam');
        setCurrentAvatarUrl(u.avatar_url || null);

        if (u.birthday) {
          const parts = dbDateToParts(u.birthday);
          setBDay(parts.day);
          setBMonth(parts.month);
          setBYear(parts.year);
        }
      }
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng.');
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  const openDatePicker = () => {
    // Set temp indices from current confirmed values
    const dIdx = bDay ? DAYS.indexOf(bDay) : 0;
    const mIdx = bMonth ? MONTHS.indexOf(bMonth) : 0;
    const yIdx = bYear ? YEARS.indexOf(bYear) : 19;
    setTmpDayIdx(dIdx >= 0 ? dIdx : 0);
    setTmpMonthIdx(mIdx >= 0 ? mIdx : 0);
    setTmpYearIdx(yIdx >= 0 ? yIdx : 19);
    setShowDateModal(true);
  };

  const confirmDate = () => {
    const day = DAYS[tmpDayIdx];
    const month = MONTHS[tmpMonthIdx];
    const year = YEARS[tmpYearIdx];
    // Clamp day to valid range for the month
    const daysInMonth = new Date(year, month, 0).getDate();
    setBDay(Math.min(day, daysInMonth));
    setBMonth(month);
    setBYear(year);
    setShowDateModal(false);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ và tên.');
      return;
    }

    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length !== 10 || !cleanPhone.startsWith('0')) {
        Alert.alert('Thông báo', 'Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số bắt đầu bằng 0.');
        return;
      }
    }

    let dbBirthday = null;
    if (bDay && bMonth && bYear) {
      const bDate = new Date(bYear, bMonth - 1, bDay);
      if (bDate > new Date()) {
        Alert.alert('Thông báo', 'Ngày sinh không được lớn hơn ngày hiện tại.');
        return;
      }
      dbBirthday = partsToDbDate(bDay, bMonth, bYear);
    }

    setIsSaving(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Alert.alert('Lỗi', 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.');
        return;
      }

      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      if (phone) formData.append('phone', phone.replace(/[^0-9]/g, ''));
      if (dbBirthday) formData.append('birthday', dbBirthday);
      if (gender) formData.append('gender', gender);

      if (selectedImageUri) {
        const uriParts = selectedImageUri.split('/');
        const fileName = uriParts[uriParts.length - 1];
        const ext = fileName.split('.').pop().toLowerCase();
        formData.append('avatar', {
          uri: Platform.OS === 'android' ? selectedImageUri : selectedImageUri.replace('file://', ''),
          name: fileName,
          type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        });
      }

      const response = await fetch(`${API_BASE_URL}/client/profile`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      // Always try to parse JSON; fallback gracefully
      let result = null;
      try {
        const rawText = await response.text();
        // Find first JSON object in case response has extra content
        const jsonStart = rawText.indexOf('{');
        const jsonEnd = rawText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          result = JSON.parse(rawText.substring(jsonStart, jsonEnd + 1));
        }
      } catch (parseErr) {
        console.warn('Response parse error:', parseErr);
      }

      if (result && result.status === true) {
        // Update local cache
        try {
          const cached = await AsyncStorage.getItem('user');
          if (cached && result.data) {
            const u = JSON.parse(cached);
            await AsyncStorage.setItem('user', JSON.stringify({ ...u, ...result.data }));
          }
        } catch (_) {}

        Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        // Show meaningful error
        let errorMsg = 'Có lỗi xảy ra. Vui lòng thử lại.';
        if (result?.errors) {
          errorMsg = Object.values(result.errors).flat().join('\n');
        } else if (result?.message && result.message.length < 200) {
          errorMsg = result.message;
        } else if (response.status === 401) {
          errorMsg = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (response.status === 422) {
          errorMsg = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
        }
        Alert.alert('Không thể lưu', errorMsg);
      }
    } catch (e) {
      console.error('handleSave error:', e);
      Alert.alert('Lỗi kết nối', 'Không thể kết nối đến máy chủ. Kiểm tra lại mạng.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#9f273b" />
      </View>
    );
  }

  let avatarSourceUri = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'U')}&background=9f273b&color=fff&size=200`;
  if (selectedImageUri) avatarSourceUri = selectedImageUri;
  else if (currentAvatarUrl) avatarSourceUri = getStorageUrl(currentAvatarUrl);

  const birthdayLabel = formatBirthdayLabel(bDay, bMonth, bYear);
  const hasBirthday = !!(bDay && bMonth && bYear);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── HEADER ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Thông Tin Cá Nhân</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* ── AVATAR ── */}
        <View style={s.avatarSection}>
          <TouchableOpacity style={s.avatarTouchable} onPress={handlePickImage} activeOpacity={0.85}>
            <Image source={{ uri: avatarSourceUri }} style={s.avatarImage} />
            <View style={s.avatarBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={s.avatarSubTxt}>Nhấp vào hình ảnh để thay đổi ảnh đại diện</Text>
        </View>

        {/* ── FORM CARD ── */}
        <View style={s.formCard}>
          {/* Họ tên */}
          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>HỌ VÀ TÊN</Text>
            <View style={s.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="#9f273b" style={s.inputIcon} />
              <TextInput
                style={s.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nhập họ và tên"
                placeholderTextColor="#bbb"
              />
            </View>
          </View>

          {/* Email (chỉ đọc) */}
          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>EMAIL (KHÔNG THỂ THAY ĐỔI)</Text>
            <View style={[s.inputWrapper, s.inputWrapperDisabled]}>
              <Ionicons name="mail-outline" size={18} color="#8c826e" style={s.inputIcon} />
              <TextInput
                style={[s.input, s.inputDisabled]}
                value={email}
                editable={false}
                placeholder="Chưa cập nhật email"
                placeholderTextColor="#aaa"
              />
              <Ionicons name="lock-closed-outline" size={14} color="#ccc" />
            </View>
          </View>

          {/* Số điện thoại */}
          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>SỐ ĐIỆN THOẠI</Text>
            <View style={s.inputWrapper}>
              <Ionicons name="call-outline" size={18} color="#9f273b" style={s.inputIcon} />
              <TextInput
                style={s.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#bbb"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          {/* Ngày sinh */}
          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>NGÀY SINH</Text>
            <TouchableOpacity
              style={[s.inputWrapper, s.rowBetween]}
              onPress={openDatePicker}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={18} color="#9f273b" style={s.inputIcon} />
              <Text style={[s.input, !hasBirthday && { color: '#bbb' }]}>
                {birthdayLabel}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Giới tính */}
          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>GIỚI TÍNH</Text>
            <TouchableOpacity
              style={[s.inputWrapper, s.rowBetween]}
              onPress={() => setShowGenderModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="male-female-outline" size={18} color="#9f273b" style={s.inputIcon} />
              <Text style={[s.input, !gender && { color: '#bbb' }]}>
                {gender || 'Chọn giới tính'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#888" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── NÚT LƯU ── */}
        <TouchableOpacity
          style={[s.saveBtn, isSaving && s.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={s.saveBtnTxt}>LƯU THÔNG TIN</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* ══ DATE PICKER MODAL ══ */}
      <Modal
        visible={showDateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.dateSheet}>
            {/* Header */}
            <View style={s.dateSheetHeader}>
              <TouchableOpacity onPress={() => setShowDateModal(false)} activeOpacity={0.7} style={s.dateSheetBtn}>
                <Text style={s.dateSheetCancel}>Huỷ</Text>
              </TouchableOpacity>
              <Text style={s.dateSheetTitle}>Chọn Ngày Sinh</Text>
              <TouchableOpacity onPress={confirmDate} activeOpacity={0.7} style={s.dateSheetBtn}>
                <Text style={s.dateSheetConfirm}>Xong</Text>
              </TouchableOpacity>
            </View>

            {/* Column labels */}
            <View style={s.dateColLabels}>
              <Text style={s.dateColLabel}>NGÀY</Text>
              <Text style={s.dateColLabel}>THÁNG</Text>
              <Text style={s.dateColLabel}>NĂM</Text>
            </View>

            {/* Picker columns */}
            <View style={s.datePickerRow}>
              <SpinColumn
                data={DAYS}
                selectedIndex={tmpDayIdx}
                onSelect={setTmpDayIdx}
                formatLabel={(v) => String(v).padStart(2, '0')}
              />
              <View style={s.dateDivider} />
              <SpinColumn
                data={MONTHS}
                selectedIndex={tmpMonthIdx}
                onSelect={setTmpMonthIdx}
                formatLabel={(v) => `Tháng ${v}`}
              />
              <View style={s.dateDivider} />
              <SpinColumn
                data={YEARS}
                selectedIndex={tmpYearIdx}
                onSelect={setTmpYearIdx}
                formatLabel={(v) => String(v)}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ══ GENDER MODAL ══ */}
      <Modal
        visible={showGenderModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.genderSheet}>
            <Text style={s.genderTitle}>Chọn Giới Tính</Text>
            {['Nam', 'Nữ', 'Khác'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[s.genderItem, gender === item && s.genderItemActive]}
                onPress={() => { setGender(item); setShowGenderModal(false); }}
                activeOpacity={0.7}
              >
                <Text style={[s.genderItemTxt, gender === item && s.genderItemTxtActive]}>
                  {item}
                </Text>
                {gender === item && <Ionicons name="checkmark-circle" size={20} color="#9f273b" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.genderCancelBtn} onPress={() => setShowGenderModal(false)} activeOpacity={0.8}>
              <Text style={s.genderCancelTxt}>HỦY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? 28 : 0,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },

  header: {
    height: 56,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#333',
  },

  container: { paddingBottom: 48 },

  // Avatar
  avatarSection: { alignItems: 'center', marginVertical: 24 },
  avatarTouchable: { position: 'relative' },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2.5,
    borderColor: '#ebd5a3',
    backgroundColor: '#f0f0f0',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#9f273b',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  avatarSubTxt: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 11,
    color: '#8c826e',
    letterSpacing: 0.5,
    marginTop: 10,
  },

  // Form
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#ebd5a3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: { marginBottom: 18 },
  inputLabel: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 10,
    color: '#8c826e',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    height: 50,
    paddingHorizontal: 12,
  },
  inputWrapperDisabled: { backgroundColor: '#f2f2f2', borderColor: '#e0e0e0' },
  rowBetween: { justifyContent: 'space-between' },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: '#333',
    paddingVertical: 0,
  },
  inputDisabled: { color: '#888' },

  // Save button
  saveBtn: {
    backgroundColor: '#9f273b',
    marginHorizontal: 16,
    marginTop: 28,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9f273b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnDisabled: { backgroundColor: '#ccc', shadowOpacity: 0, elevation: 0 },
  saveBtnTxt: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 13,
    color: '#fff',
    letterSpacing: 2.5,
  },

  // Modal overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  // Date picker sheet
  dateSheet: {
    backgroundColor: '#fffdf9',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#ebd5a3',
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
  },
  dateSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e8d4',
  },
  dateSheetBtn: { paddingHorizontal: 4 },
  dateSheetTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    color: '#333',
  },
  dateSheetCancel: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 15,
    color: '#999',
  },
  dateSheetConfirm: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 15,
    color: '#9f273b',
  },
  dateColLabels: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 2,
  },
  dateColLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 10,
    color: '#8c826e',
    letterSpacing: 1,
  },
  datePickerRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dateDivider: {
    width: 1,
    backgroundColor: '#ebd5a3',
    marginVertical: 8,
  },

  // Gender sheet
  genderSheet: {
    backgroundColor: '#fffdf9',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#ebd5a3',
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  genderTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#9f273b',
    textAlign: 'center',
    marginBottom: 16,
  },
  genderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
    borderRadius: 8,
  },
  genderItemActive: { backgroundColor: '#fff9f0' },
  genderItemTxt: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 16,
    color: '#555',
  },
  genderItemTxtActive: {
    fontFamily: 'Oswald_600SemiBold',
    color: '#9f273b',
  },
  genderCancelBtn: {
    marginTop: 16,
    height: 46,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#ebd5a3',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  genderCancelTxt: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 12,
    color: '#8c826e',
    letterSpacing: 1.5,
  },
});
