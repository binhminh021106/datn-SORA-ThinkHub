import { ref } from 'vue';
import axios from 'axios';

// 1. Biến State toàn cục: Component nào import biến này đều sẽ tự động React (cập nhật) khi nó thay đổi
export const cartItemCount = ref(0);

// 2. Hàm Action: Đồng bộ dữ liệu giỏ hàng chính xác 100% từ Backend
export const refetchCartCount = async () => {
    try {
        const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem('auth_token');
        const sid = localStorage.getItem('cart_session_id');

        const headers = { 'Accept': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (sid) headers['X-Cart-Session-Id'] = sid;

        // Gọi API lấy dữ liệu Header để lấy chính xác tổng số lượng đang có trong DB
        const res = await axios.get(`${BACKEND_URL}/client/header-data`, { headers });
        
        if (res.data.success && res.data.data.cart_count !== undefined) {
            // Cập nhật giá trị mới -> Header tự động thay đổi theo
            cartItemCount.value = parseInt(res.data.data.cart_count) || 0;
        }
    } catch (error) {
        console.error('Lỗi khi đồng bộ số lượng giỏ hàng toàn cục:', error);
    }
};