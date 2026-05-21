import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, Dimensions, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, MOBILE_AUTH_URL } from '../config/api';

const { width } = Dimensions.get('window');

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fcf9f5' },
  scroll: { flexGrow: 1, alignItems: 'center', paddingBottom: 40 },
  banner: { width: '100%', height: 180, backgroundColor: '#9f273b', alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  bannerLogo: { width: 200, height: 75, tintColor: '#fff', marginBottom: 8 },
  bannerSlogan: { fontFamily: 'Oswald_400Regular', fontSize: 11, letterSpacing: 3, color: '#e7ce7d' },
  card: { width: width - 32, backgroundColor: '#fff', borderRadius: 16, padding: 28, marginTop: -30, shadowColor: '#9f273b', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 10 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, color: '#9f273b', marginBottom: 6 },
  subtitle: { fontFamily: 'Oswald_400Regular', fontSize: 12, color: '#888', letterSpacing: 0.5, marginBottom: 24 },
  alertErr: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fcf0f0', borderLeftWidth: 4, borderLeftColor: '#cc1e2e', padding: 12, borderRadius: 6, marginBottom: 16 },
  alertErrTxt: { fontFamily: 'Oswald_400Regular', fontSize: 13, color: '#cc1e2e' },
  alertOk: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', borderLeftWidth: 4, borderLeftColor: '#22c55e', padding: 12, borderRadius: 6, marginBottom: 16 },
  alertOkTxt: { fontFamily: 'Oswald_400Regular', fontSize: 13, color: '#166534' },
  label: { fontFamily: 'Oswald_500Medium', fontSize: 12, color: '#555', letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 12 },
  icon: { marginRight: 8 },
  input: { flex: 1, height: 48, fontFamily: 'Oswald_400Regular', fontSize: 14, color: '#333' },
  primaryBtn: { backgroundColor: '#9f273b', height: 50, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 24 },
  primaryBtnOff: { backgroundColor: '#d39aa2' },
  primaryTxt: { fontFamily: 'Oswald_600SemiBold', fontSize: 15, color: '#fff', letterSpacing: 2 },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#eee' },
  divTxt: { fontFamily: 'Oswald_400Regular', fontSize: 12, color: '#aaa', marginHorizontal: 12 },
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8 },
  socialLogo: { width: 20, height: 20 },
  socialTxt: { fontFamily: 'Oswald_500Medium', fontSize: 13, color: '#444' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  switchTxt: { fontFamily: 'Oswald_400Regular', fontSize: 13, color: '#666' },
  switchLink: { fontFamily: 'Oswald_600SemiBold', fontSize: 13, color: '#9f273b' },
});

// ⚠️ Phải đặt NGOÀI component để tránh re-create mỗi lần render → bàn phím tự tắt
function Field({ label, field, placeholder, keyboard, secure, showState, toggleShow, value, onChangeText }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={s.label}>{label}</Text>
      <View style={s.inputRow}>
        <Ionicons
          name={
            field === 'email' ? 'mail-outline'
              : field.includes('pass') || field.includes('confirm') ? 'lock-closed-outline'
              : 'person-outline'
          }
          size={18}
          color="#aaa"
          style={s.icon}
        />
        <TextInput
          style={s.input}
          placeholder={placeholder}
          placeholderTextColor="#bbb"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboard || 'default'}
          autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
          secureTextEntry={secure && !showState}
        />
        {secure && (
          <TouchableOpacity onPress={toggleShow}>
            <Ionicons name={showState ? 'eye-off-outline' : 'eye-outline'} size={18} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');



  // useCallback để tránh tạo lại hàm mỗi render
  const set = useCallback((k) => (v) => setForm(prev => ({ ...prev, [k]: v })), []);

  const handleRegister = async () => {
    if (!form.fullName || !form.email || !form.password) {
      setErrorMsg('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    if (form.password !== form.password_confirmation) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (form.password.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${MOBILE_AUTH_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const msgs = Object.values(data.errors).flat().join('\n');
          setErrorMsg(msgs);
        } else {
          setErrorMsg(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        }
        return;
      }

      setSuccessMsg('Đăng ký thành công! Đang tự động đăng nhập...');
      // Lưu token và user vào AsyncStorage
      await AsyncStorage.setItem('auth_token', data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      setTimeout(() => {
        navigation?.goBack();
      }, 1500);

    } catch (e) {
      setErrorMsg('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocial = (p) => Alert.alert('Thông báo', `Đăng ký bằng ${p} đang phát triển!`);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#9f273b" />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.banner}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Image source={require('../../assets/logo1.png')} style={s.bannerLogo} resizeMode="contain" />
          <Text style={s.bannerSlogan}>THÀNH VIÊN SORA JEWELRY</Text>
        </View>

        <View style={s.card}>
          <Text style={s.title}>Tạo Tài Khoản Mới</Text>
          <Text style={s.subtitle}>Trở thành thành viên của SORA ngay hôm nay</Text>

          {!!errorMsg && <View style={s.alertErr}><Ionicons name="alert-circle-outline" size={15} color="#cc1e2e"/><Text style={s.alertErrTxt}> {errorMsg}</Text></View>}
          {!!successMsg && <View style={s.alertOk}><Ionicons name="checkmark-circle-outline" size={15} color="#166534"/><Text style={s.alertOkTxt}> {successMsg}</Text></View>}

          <Field label="HỌ VÀ TÊN *" field="fullName" placeholder="Nhập họ và tên của bạn" value={form.fullName} onChangeText={set('fullName')} />
          <Field label="EMAIL *" field="email" placeholder="Nhập email của bạn" keyboard="email-address" value={form.email} onChangeText={set('email')} />
          <Field label="MẬT KHẨU *" field="password" placeholder="Tạo mật khẩu (ít nhất 6 ký tự)" secure showState={showPass} toggleShow={() => setShowPass(!showPass)} value={form.password} onChangeText={set('password')} />
          <Field label="XÁC NHẬN MẬT KHẨU *" field="password_confirmation" placeholder="Nhập lại mật khẩu" secure showState={showConfirm} toggleShow={() => setShowConfirm(!showConfirm)} value={form.password_confirmation} onChangeText={set('password_confirmation')} />

          <TouchableOpacity style={[s.primaryBtn, isLoading && s.primaryBtnOff]} onPress={handleRegister} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryTxt}>ĐĂNG KÝ TÀI KHOẢN</Text>}
          </TouchableOpacity>

          <View style={s.divider}>
            <View style={s.line}/><Text style={s.divTxt}>Hoặc đăng ký bằng</Text><View style={s.line}/>
          </View>

          <View style={s.socialRow}>
            <TouchableOpacity style={s.socialBtn} onPress={() => handleSocial('Google')}>
              <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1280px-Google_%22G%22_logo.svg.png' }} style={s.socialLogo} resizeMode="contain" />
              <Text style={s.socialTxt}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.socialBtn} onPress={() => handleSocial('Facebook')}>
              <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/250px-Facebook_Logo_%282019%29.png' }} style={s.socialLogo} resizeMode="contain" />
              <Text style={s.socialTxt}>Facebook</Text>
            </TouchableOpacity>
          </View>

          <View style={s.switchRow}>
            <Text style={s.switchTxt}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation?.navigate('Login')}>
              <Text style={s.switchLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
