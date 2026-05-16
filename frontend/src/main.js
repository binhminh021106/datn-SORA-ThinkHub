import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js' 

import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
window.Pusher = Pusher;

// Cấu hình Axios mặc định
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Cấu hình bắt sóng Real-time
window.Echo = new Echo({
    broadcaster: 'reverb',
    key: 'sorajewelrykey123', // Khớp 100% với backend
    wsHost: '127.0.0.1',
    wsPort: 8080,
    wssPort: 8080,
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

// Khi Echo kết nối thành công, gán Socket ID vào Axios để sử dụng toOthers()
window.Echo.connector.pusher.connection.bind('connected', () => {
    const socketId = window.Echo.socketId();
    if (socketId) {
        window.axios.defaults.headers.common['X-Socket-Id'] = socketId;
        console.log('Echo connected. Socket ID synced to Axios:', socketId);
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