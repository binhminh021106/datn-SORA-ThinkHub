import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js' 

import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { API_BASE_URL, REVERB_CONFIG, apiClient } from '@/utils/axios';

window.Pusher = Pusher;

// Cấu hình Axios mặc định (keep for backward compatibility)
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Sử dụng apiClient từ axios.js (tất cả config đã được setup)
window.apiClient = apiClient;

// Cấu hình bắt sóng Real-time
window.Echo = new Echo({
    broadcaster: 'reverb',
    key: REVERB_CONFIG.appKey,
    wsHost: REVERB_CONFIG.host,
    wsPort: REVERB_CONFIG.port,
    wssPort: REVERB_CONFIG.port,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                const token = localStorage.getItem('admin_token') || localStorage.getItem('auth_token') || localStorage.getItem('token');
                fetch(`${API_BASE_URL}/broadcasting/auth`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify({
                        socket_id: socketId,
                        channel_name: channel.name
                    })
                })
                .then(response => response.json())
                .then(data => {
                    callback(false, data);
                })
                .catch(error => {
                    callback(true, error);
                });
            }
        };
    },
});

// Khi Echo kết nối thành công, lưu Socket ID vào localStorage để sử dụng trong axios interceptor
window.Echo.connector.pusher.connection.bind('connected', () => {
    const socketId = window.Echo.socketId();
    if (socketId) {
        localStorage.setItem('socket_id', socketId);
        window.axios.defaults.headers.common['X-Socket-Id'] = socketId;
        console.log('✅ Echo connected. Socket ID synced:', socketId);
    }
});

// Auto-subscribe user-specific private channel if user info exists in localStorage
const tryGetStoredUser = () => {
    const keys = ['adminData', 'userData', 'user_info'];
    for (const k of keys) {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        try {
            const obj = JSON.parse(raw);
            if (obj && (obj.id || obj.user_id)) return obj;
        } catch (e) {
            // ignore parse errors
        }
    }
    return null;
};

const storedUser = tryGetStoredUser();
if (window.Echo && storedUser && storedUser.id) {
    try {
        const userId = storedUser.id;
        window.Echo.private(`App.Models.User.${userId}`).listen('.UserAccountUpdated', (data) => {
            window.dispatchEvent(new CustomEvent('user-account-updated', { detail: data }));
        });
    } catch (err) {
        console.warn('Failed to subscribe to user private channel', err);
    }
}

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')