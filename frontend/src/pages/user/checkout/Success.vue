<template>
  <div class="vh-100 d-flex align-items-center justify-content-center bg-light-custom font-luxury">
    <div class="text-center bg-white p-5 shadow-sm border border-light-subtle rounded border-top border-success border-4" style="max-width: 600px; width: 90%;">
      
      <div class="mb-4">
        <i class="bi bi-check-circle-fill text-success" style="font-size: 5.5rem;"></i>
      </div>
      
      <h2 class="font-serif fw-bold text-dark mb-3">Thanh Toán Thành Công!</h2>
      
      <p class="text-muted mb-4 fs-6 lh-lg">
        Cảm ơn bạn đã lựa chọn trang sức SORA. Đơn hàng của bạn đã được xác nhận và đang được xử lý.<br>
        Mã đơn hàng: <strong class="text-sora-primary font-monospace fs-5 ms-1">{{ orderCode }}</strong>
      </p>

      <div v-if="orderTotal !== null" class="bg-light border rounded-3 px-4 py-3 mb-4">
        <div class="text-muted small font-oswald tracking-widest text-uppercase mb-1">Tổng thanh toán</div>
        <div class="fs-3 fw-bold text-sora-primary font-oswald">{{ formatCurrency(orderTotal) }}</div>
      </div>
      
      <div class="d-flex justify-content-center gap-3 mt-5">
        <router-link to="/shop" class="editorial-btn-outline px-4 py-3">
          Tiếp Tục Mua Sắm
        </router-link>
        <router-link to="/order" class="editorial-btn px-4 py-3">
          Xem Đơn Hàng
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import clientApiClient from '@/utils/clientApiClient';

const route = useRoute();
const orderCode = computed(() => route.query.order || 'N/A');
const orderTotal = ref(null);

const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);

onMounted(async () => {
    if (orderCode.value && orderCode.value !== 'N/A') {
        try {
            const res = await clientApiClient.get(`/client/orders/${orderCode.value}`, {
                ignoreAuthRedirect: true,
            });
            const order = res.data?.data || res.data;
            orderTotal.value = order?.total_amount ?? null;
        } catch (error) {
            console.error('Không thể tải tổng tiền đơn hàng:', error);
        }
    }

    // Chỉ khi khách hàng đến được trang Success này (nghĩa là tiền đã vào tài khoản)
    // Thì mới tiến hành gọi API xóa sạch Giỏ hàng.
    try {
        // Gọi API dọn dẹp giỏ hàng (dùng clientApiClient để gắn token/session tự động)
        await clientApiClient.post('/client/cart/clear', {}, { ensureCartSession: true, ignoreAuthRedirect: true });
        
        // Xóa Session ID lưu ở LocalStorage để hệ thống cấp Giỏ hàng mới cho lần mua sau
        localStorage.removeItem('cart_session_id');
        
    } catch (error) {
        console.error('Không thể dọn dẹp giỏ hàng:', error);
    }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Oswald:wght@400;500;600&family=Josefin+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');

.bg-light-custom { background-color: #faf9f6; }
.font-luxury { font-family: 'Manrope', sans-serif; }
.font-serif { font-family: 'Josefin Sans', sans-serif; }
.font-oswald { font-family: 'Oswald', sans-serif; }
.tracking-widest { letter-spacing: 2px; }
.transition-all { transition: all 0.3s ease; }

.text-sora-primary { color: #9f273b; }
.luxury-btn-solid { 
    background-color: #9f273b; 
    border: 1px solid #9f273b; 
}
.luxury-btn-solid:hover { 
    background-color: #7a1c2d; 
    border-color: #7a1c2d;
    transform: translateY(-2px); 
    box-shadow: 0 5px 15px rgba(159, 39, 59, 0.2);
}
.btn-outline-secondary:hover {
    background-color: #f8f9fa;
    color: #333;
    transform: translateY(-2px);
}
</style>
