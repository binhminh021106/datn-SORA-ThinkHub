import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js' 

import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getAdminToken, getUserToken } from '@/composables/useUtilities';
import { API_BASE_URL, REVERB_APP_KEY, REVERB_HOST, REVERB_PORT, REVERB_SCHEME } from '@/utils/env';

// 1. IMPORT VUE QUERY VÀO ĐÂY
import { VueQueryPlugin } from '@tanstack/vue-query';

window.Pusher = Pusher;

// Cấu hình Axios mặc định
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const REVERB_FORCE_TLS = REVERB_SCHEME === 'https';

const broadcasterType = import.meta.env.VITE_BROADCASTER || 'reverb';

// Cấu hình bắt sóng Real-time
let echoConfig = {
    broadcaster: broadcasterType,
    key: import.meta.env.VITE_PUSHER_APP_KEY || REVERB_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap1',
    forceTLS: REVERB_FORCE_TLS,
    disableStats: true,
};

// Nếu dùng Reverb (tự host) thì mới truyền wsHost, wsPort
// Nếu dùng Pusher thật thì TUYỆT ĐỐI KHÔNG truyền wsHost để nó tự trỏ về server của Pusher
if (broadcasterType === 'reverb') {
    echoConfig.wsHost = REVERB_HOST;
    echoConfig.wsPort = REVERB_PORT;
    echoConfig.wssPort = REVERB_PORT;
    echoConfig.enabledTransports = REVERB_FORCE_TLS ? ['wss'] : ['ws'];
}

window.Echo = new Echo({
    ...echoConfig,
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                let token = null;
                const adminChannels = ['admin-notifications', 'admin-orders', 'admin.chat', 'App.Models.Admin'];
                const isAdminChannel = adminChannels.some(prefix => channel.name.includes(prefix));
                
                if (isAdminChannel) {
                    token = getAdminToken();
                } else {
                    token = getUserToken();
                }

                if (!token) {
                    callback(true, { message: 'Missing auth token' });
                    return;
                }

                fetch(`${API_BASE_URL}/broadcasting/auth`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        socket_id: socketId,
                        channel_name: channel.name
                    })
                })
                .then(async (response) => {
                    const data = await response.json().catch(() => ({}));
                    if (!response.ok) {
                        throw { status: response.status, data };
                    }
                    return data;
                })
                .then((data) => {
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
    const keys = ['userData', 'user_info'];
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
const userAuthToken = getUserToken();
const hasAdminSession = !!getAdminToken();
if (window.Echo && storedUser && storedUser.id && userAuthToken && !hasAdminSession) {
    try {
        const userId = storedUser.id;
        window.Echo.private(`App.Models.User.${userId}`).listen('.UserAccountUpdated', (data) => {
            window.dispatchEvent(new CustomEvent('user-account-updated', { detail: data }));
        });
    } catch (err) {
        console.warn('Failed to subscribe to user private channel', err);
    }
} else if (storedUser && storedUser.id && !userAuthToken && !hasAdminSession) {
    console.warn('Skipping Echo subscribe because auth token is missing');
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(VueQueryPlugin)

app.mount('#app')
