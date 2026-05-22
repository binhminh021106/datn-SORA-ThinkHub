// Cấu hình API base URL cho mobile app
// ⚠️ Khi dùng Expo Go trên điện thoại thật, PHẢI dùng IP LAN của máy tính
// KHÔNG dùng 127.0.0.1 vì 127.0.0.1 trên điện thoại = chính điện thoại đó

// IP LAN hiện tại của máy: 192.168.1.218
// (Nếu đổi mạng WiFi thì chạy lại: ipconfig | findstr IPv4 để lấy IP mới)

// Khi test trên Android emulator dùng: http://10.0.2.2:8000/api
// Khi test trên iOS simulator dùng:    http://127.0.0.1:8000/api
// Khi test trên thiết bị thật dùng:   http://192.168.1.218:8000/api

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.218:8000/api';

// Route auth riêng cho Mobile App (controller MobileAuthController)
// Không yêu cầu số điện thoại khi đăng ký
export const MOBILE_AUTH_URL = `${API_BASE_URL}/mobile`;

