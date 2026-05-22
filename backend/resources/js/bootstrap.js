import axios from 'axios';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// 1. Gắn Session ID vào mỗi request gửi đi
window.axios.interceptors.request.use(config => {
    const cartSessionId = localStorage.getItem('cart_session_id');
    if (cartSessionId) {
        config.headers['X-Cart-Session-Id'] = cartSessionId;
    }
    return config;
});

// 2. Lắng nghe Session ID từ Backend trả về để lưu lại
window.axios.interceptors.response.use(response => {
    // Lưu session_id khi thêm mới sản phẩm
    if (response.data && response.data.session_id) {
        localStorage.setItem('cart_session_id', response.data.session_id);
    }
    
    // Xóa session_id khi Backend gửi cờ clear_session (VD: lúc Merge Cart)
    if (response.data && response.data.clear_session) {
        localStorage.removeItem('cart_session_id');
    }
    
    return response;
}, error => {
    return Promise.reject(error);
});

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allow your team to quickly build robust real-time web applications.
 */

import './echo';
