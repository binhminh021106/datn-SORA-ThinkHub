import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Linking,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../config/api';
import { showCustomAlert } from '../components/CustomAlert';

const Alert = {
  alert: (title, message, buttons) => showCustomAlert(title, message, buttons)
};

const { width } = Dimensions.get('window');

export default function ContactScreen() {
  const navigation = useNavigation();
  
  // Form State
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Actions
  const handleCallHotline = () => {
    Linking.openURL('tel:0901234567').catch(() => {
      Alert.alert('Thông báo', 'Không thể khởi chạy cuộc gọi trên thiết bị của bạn.');
    });
  };

  const handleOpenZalo = () => {
    Linking.openURL('https://zalo.me/0901234567').catch(() => {
      Alert.alert('Thông báo', 'Không thể mở liên kết Zalo.');
    });
  };

  const handleOpenMessenger = () => {
    Linking.openURL('https://m.me/sorajewelry').catch(() => {
      Alert.alert('Thông báo', 'Không thể mở liên kết Messenger.');
    });
  };

  // Validation
  const validateForm = () => {
    if (!fullname.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ và tên của bạn.');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại liên hệ.');
      return false;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10 || !cleanPhone.startsWith('0')) {
      Alert.alert('Thông báo', 'Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số bắt đầu bằng 0.');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ email.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Thông báo', 'Địa chỉ email không đúng định dạng.');
      return false;
    }
    if (!message.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung tin nhắn.');
      return false;
    }
    return true;
  };

  // Submit contact to backend
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/client/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          fullname: fullname.trim(),
          phone: phone.replace(/[^0-9]/g, ''),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      const result = await response.json();
      if (response.ok && result.status) {
        Alert.alert(
          'Thành công!',
          result.message || 'Tin nhắn của bạn đã được gửi đi thành công. SORA sẽ liên hệ phản hồi sớm nhất!',
          [{ text: 'ĐỒNG Ý', onPress: () => {
            // Reset form
            setFullname('');
            setPhone('');
            setEmail('');
            setMessage('');
          }}]
        );
      } else {
        Alert.alert('Thất bại', result.message || 'Gửi tin nhắn không thành công. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (e) {
      Alert.alert('Lỗi kết nối', 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Kết Nối Cùng SORA</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={s.heroCard}>
          <Text style={s.heroSub}>DỊCH VỤ KHÁCH HÀNG</Text>
          <Text style={s.heroTitle}>Trải Nghiệm Chăm Sóc Độc Bản</Text>
          <View style={s.heroDivider} />
          <Text style={s.heroDesc}>
            Chuyên viên SORA luôn trực tuyến hỗ trợ, sẵn sàng lắng nghe mọi yêu cầu để mang đến trải nghiệm tuyệt hảo nhất dành riêng cho bạn.
          </Text>
        </View>

        {/* Contact Info blocks */}
        <View style={s.infoSection}>
          <Text style={s.sectionHeader}>Thông Tin Hỗ Trợ</Text>

          <View style={s.infoCard}>
            <View style={s.infoRow}>
              <View style={s.iconWrap}>
                <Ionicons name="location-outline" size={20} color="#9f273b" />
              </View>
              <View style={s.infoContent}>
                <Text style={s.infoLabel}>SORA Flagship Store</Text>
                <Text style={s.infoValue}>Khu đô thị cao cấp, Quận 1, TP. Hồ Chí Minh</Text>
              </View>
            </View>

            <TouchableOpacity style={s.infoRow} onPress={handleCallHotline} activeOpacity={0.7}>
              <View style={s.iconWrap}>
                <Ionicons name="call-outline" size={20} color="#9f273b" />
              </View>
              <View style={s.infoContent}>
                <Text style={s.infoLabel}>Hotline CSKH (24/7) - Nhấn để gọi</Text>
                <Text style={[s.infoValue, s.linkValue]}>090 123 4567</Text>
              </View>
            </TouchableOpacity>

            <View style={s.infoRow}>
              <View style={s.iconWrap}>
                <Ionicons name="time-outline" size={20} color="#9f273b" />
              </View>
              <View style={s.infoContent}>
                <Text style={s.infoLabel}>Giờ mở cửa</Text>
                <Text style={s.infoValue}>09:00 - 21:00 (Từ Thứ 2 đến Chủ Nhật)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Direct Chat Integration */}
        <View style={s.chatSection}>
          <Text style={s.chatHeader}>Hỗ Trợ Trực Tuyến Nhanh</Text>
          <View style={s.chatRow}>
            <TouchableOpacity style={s.zaloBtn} onPress={handleOpenZalo} activeOpacity={0.8}>
              <Ionicons name="chatbubble-ellipses" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={s.chatBtnTxt}>CHAT ZALO</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.messengerBtn} onPress={handleOpenMessenger} activeOpacity={0.8}>
              <Ionicons name="logo-facebook" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={s.chatBtnTxt}>MESSENGER</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Form */}
        <View style={s.formSection}>
          <Text style={s.sectionHeader}>Gửi Lời Nhắn Đến SORA</Text>
          
          <View style={s.formCard}>
            {/* Fullname */}
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>HỌ VÀ TÊN *</Text>
              <TextInput
                style={s.textInput}
                value={fullname}
                onChangeText={setFullname}
                placeholder="Nhập danh xưng / họ và tên"
                placeholderTextColor="#bbb"
              />
            </View>

            {/* Phone */}
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>SỐ ĐIỆN THOẠI LIÊN HỆ *</Text>
              <TextInput
                style={s.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại 10 số"
                placeholderTextColor="#bbb"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            {/* Email */}
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>ĐỊA CHỈ EMAIL *</Text>
              <TextInput
                style={s.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Ví dụ: email@domain.com"
                placeholderTextColor="#bbb"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Message */}
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>MỌI MONG MUỐN HOẶC THẮC MẮC CỦA BẠN... *</Text>
              <TextInput
                style={[s.textInput, { height: 100, textAlignVertical: 'top', paddingTop: 10 }]}
                value={message}
                onChangeText={setMessage}
                placeholder="Viết tin nhắn / câu hỏi của bạn tại đây..."
                placeholderTextColor="#bbb"
                multiline={true}
                numberOfLines={4}
              />
            </View>

            {/* Quote of commitment */}
            <View style={s.quoteWrap}>
              <Text style={s.quoteTxt}>
                "Mọi yêu cầu qua Form sẽ được Chuyên viên SORA phản hồi tận tâm muộn nhất trong vòng 2 giờ làm việc."
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={isSubmitting} activeOpacity={0.85}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={16} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={s.submitBtnTxt}>GỬI LỜI NHẮN</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: Platform.OS === 'ios' ? 0 : 28 },
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
    textAlign: 'center',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#fffdf9',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ebd5a3',
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    textAlign: 'center',
  },
  heroSub: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 12,
    color: '#9f273b',
    letterSpacing: 2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroDivider: {
    width: 40,
    height: 2,
    backgroundColor: '#9f273b',
    marginBottom: 12,
  },
  heroDesc: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Contact Info Section
  infoSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    paddingLeft: 4,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 16,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fdf3f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 11,
    color: '#8c826e',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13.5,
    color: '#444',
  },
  linkValue: {
    fontFamily: 'Oswald_600SemiBold',
    color: '#9f273b',
    textDecorationLine: 'underline',
  },

  // Online quick support buttons
  chatSection: {
    marginBottom: 20,
  },
  chatHeader: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 14.5,
    color: '#8c826e',
    marginBottom: 10,
    textAlign: 'center',
  },
  chatRow: {
    flexDirection: 'row',
    gap: 12,
  },
  zaloBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0068FF',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0068FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  messengerBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  chatBtnTxt: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 12,
    color: '#fff',
    letterSpacing: 0.5,
  },

  // Contact Form Card
  formSection: {
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 10.5,
    color: '#8c826e',
    letterSpacing: 1,
    marginBottom: 6,
  },
  textInput: {
    fontFamily: 'Oswald_400Regular',
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    fontSize: 13.5,
    color: '#333',
    paddingHorizontal: 2,
  },
  quoteWrap: {
    backgroundColor: '#fcfaf6',
    borderWidth: 1,
    borderColor: '#f2eae0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  quoteTxt: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 12.5,
    color: '#9f273b',
    textAlign: 'center',
    lineHeight: 18,
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#9f273b',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#9f273b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnTxt: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 13,
    color: '#fff',
    letterSpacing: 1.5,
  },
});
