import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../config/api';
import { showCustomAlert } from '../components/CustomAlert';

const parseApiResponse = async (response) => {
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};

  if (!response.ok || json.status === false || json.success === false) {
    let message = json.message || 'Không thể đổi mật khẩu lúc này.';
    if (json.errors) {
      message = Object.values(json.errors).flat().join('\n');
    }
    throw new Error(message);
  }

  return json;
};

const PasswordField = ({
  label,
  value,
  onChangeText,
  placeholder,
  visible,
  onToggleVisible,
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Ionicons name="lock-closed-outline" size={18} color="#9f273b" style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#b9b0b0"
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
      />
      <TouchableOpacity style={styles.eyeBtn} onPress={onToggleVisible} activeOpacity={0.75}>
        <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={19} color="#8c826e" />
      </TouchableOpacity>
    </View>
  </View>
);

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword.trim()) {
      showCustomAlert('Đổi mật khẩu', 'Vui lòng nhập mật khẩu hiện tại.');
      return;
    }

    if (newPassword.length < 6) {
      showCustomAlert('Đổi mật khẩu', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showCustomAlert('Đổi mật khẩu', 'Xác nhận mật khẩu không khớp.');
      return;
    }

    if (currentPassword === newPassword) {
      showCustomAlert('Đổi mật khẩu', 'Mật khẩu mới nên khác mật khẩu hiện tại.');
      return;
    }

    setIsSaving(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        showCustomAlert('Phiên đăng nhập', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', [
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
        ]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/client/profile/password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });

      const result = await parseApiResponse(response);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showCustomAlert('Thành công', result.message || 'Đổi mật khẩu thành công!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      showCustomAlert('Không thể đổi mật khẩu', error.message || 'Vui lòng thử lại sau.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name="shield-checkmark-outline" size={30} color="#9f273b" />
            </View>
            <Text style={styles.title}>Bảo mật tài khoản</Text>
            <Text style={styles.subtitle}>
              Sử dụng mật khẩu mạnh để bảo vệ tài khoản SORA và lịch sử mua hàng của bạn.
            </Text>

            <PasswordField
              label="MẬT KHẨU HIỆN TẠI"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Nhập mật khẩu hiện tại"
              visible={showCurrent}
              onToggleVisible={() => setShowCurrent((value) => !value)}
            />
            <PasswordField
              label="MẬT KHẨU MỚI"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Ít nhất 6 ký tự"
              visible={showNew}
              onToggleVisible={() => setShowNew((value) => !value)}
            />
            <PasswordField
              label="XÁC NHẬN MẬT KHẨU"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Nhập lại mật khẩu mới"
              visible={showConfirm}
              onToggleVisible={() => setShowConfirm((value) => !value)}
            />

            <TouchableOpacity
              style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
              activeOpacity={0.85}
              disabled={isSaving}
              onPress={handleSubmit}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="key-outline" size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>CẬP NHẬT MẬT KHẨU</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },
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
  headerTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: '#333' },
  headerSpacer: { width: 40, height: 40 },
  keyboard: { flex: 1 },
  container: { padding: 18, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0e9dd',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff5f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: '#222',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 18,
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: '#7a7070',
  },
  inputGroup: { marginBottom: 14 },
  inputLabel: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 12,
    color: '#444',
    marginBottom: 8,
    letterSpacing: 0.7,
  },
  inputWrapper: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eadfdf',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 9 },
  input: {
    flex: 1,
    fontFamily: 'Oswald_400Regular',
    fontSize: 15,
    color: '#222',
    paddingVertical: 12,
  },
  eyeBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
  },
  saveBtn: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#9f273b',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.72 },
  saveBtnText: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 14,
    color: '#fff',
    letterSpacing: 0.8,
  },
});
