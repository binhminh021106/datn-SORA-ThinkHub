import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, Dimensions, StatusBar, Alert, ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, MOBILE_AUTH_URL } from '../config/api';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');



  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const response = await fetch(`${MOBILE_AUTH_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Lấy lỗi validation từ Laravel
        if (data.errors) {
          const msgs = Object.values(data.errors).flat().join('\n');
          setErrorMsg(msgs);
        } else {
          setErrorMsg(data.message || 'Email hoặc mật khẩu không chính xác.');
        }
        return;
      }

      setSuccessMsg('Đăng nhập thành công!');
      // Lưu token và user vào AsyncStorage
      await AsyncStorage.setItem('auth_token', data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      setTimeout(() => {
        navigation?.goBack();
      }, 1000);

    } catch (e) {
      setErrorMsg('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocial = (p) => Alert.alert('Thông báo', `Đăng nhập bằng ${p} đang phát triển!`);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#9f273b" />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.banner}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Image source={require('../../assets/logo1.png')} style={s.bannerLogo} resizeMode="contain" />
          <Text style={s.bannerSlogan}>VẺ ĐẸP VƯỢT THỜI GIAN</Text>
        </View>

        <View style={s.card}>
          <Text style={s.title}>Chào Mừng Trở Lại</Text>
          <Text style={s.subtitle}>Đăng nhập để trải nghiệm mua sắm tuyệt vời</Text>

          {!!errorMsg && <View style={s.alertErr}><Ionicons name="alert-circle-outline" size={15} color="#cc1e2e"/><Text style={s.alertErrTxt}> {errorMsg}</Text></View>}
          {!!successMsg && <View style={s.alertOk}><Ionicons name="checkmark-circle-outline" size={15} color="#166534"/><Text style={s.alertOkTxt}> {successMsg}</Text></View>}

          <Text style={s.label}>EMAIL</Text>
          <View style={s.inputRow}>
            <Ionicons name="mail-outline" size={18} color="#aaa" style={s.icon} />
            <TextInput style={s.input} placeholder="Nhập email của bạn" placeholderTextColor="#bbb"
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={s.labelRow}>
            <Text style={s.label}>MẬT KHẨU</Text>
            <TouchableOpacity><Text style={s.forgot}>Quên mật khẩu?</Text></TouchableOpacity>
          </View>
          <View style={s.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color="#aaa" style={s.icon} />
            <TextInput style={s.input} placeholder="Nhập mật khẩu" placeholderTextColor="#bbb"
              value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#aaa" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[s.primaryBtn, isLoading && s.primaryBtnOff]} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryTxt}>ĐĂNG NHẬP</Text>}
          </TouchableOpacity>

          <View style={s.divider}>
            <View style={s.line}/><Text style={s.divTxt}>Hoặc tiếp tục với</Text><View style={s.line}/>
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
            <Text style={s.switchTxt}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation?.navigate('Register')}>
              <Text style={s.switchLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fcf9f5' },
  scroll: { flexGrow: 1, alignItems: 'center', paddingBottom: 40 },
  banner: { width: '100%', height: 200, backgroundColor: '#9f273b', alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  bannerLogo: { width: 200, height: 80, tintColor: '#fff', marginBottom: 8 },
  bannerSlogan: { fontFamily: 'Oswald_400Regular', fontSize: 11, letterSpacing: 3, color: '#e7ce7d' },
  card: { width: width - 32, backgroundColor: '#fff', borderRadius: 16, padding: 28, marginTop: -30, shadowColor: '#9f273b', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 10 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, color: '#9f273b', marginBottom: 6 },
  subtitle: { fontFamily: 'Oswald_400Regular', fontSize: 12, color: '#888', letterSpacing: 0.5, marginBottom: 24 },
  alertErr: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fcf0f0', borderLeftWidth: 4, borderLeftColor: '#cc1e2e', padding: 12, borderRadius: 6, marginBottom: 16 },
  alertErrTxt: { fontFamily: 'Oswald_400Regular', fontSize: 13, color: '#cc1e2e' },
  alertOk: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', borderLeftWidth: 4, borderLeftColor: '#22c55e', padding: 12, borderRadius: 6, marginBottom: 16 },
  alertOkTxt: { fontFamily: 'Oswald_400Regular', fontSize: 13, color: '#166534' },
  label: { fontFamily: 'Oswald_500Medium', fontSize: 12, color: '#555', letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgot: { fontFamily: 'Oswald_400Regular', fontSize: 12, color: '#9f273b', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 12, marginBottom: 18 },
  icon: { marginRight: 8 },
  input: { flex: 1, height: 48, fontFamily: 'Oswald_400Regular', fontSize: 14, color: '#333' },
  primaryBtn: { backgroundColor: '#9f273b', height: 50, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 4, marginBottom: 24 },
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
