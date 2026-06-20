<template>
  <div class="vh-100 d-flex align-items-center justify-content-center bg-light-custom font-luxury">
    <div class="text-center bg-white p-5 shadow-sm border border-light-subtle rounded border-top border-danger border-4" style="max-width: 600px; width: 90%;">
      
      <div class="mb-4">
        <i class="bi bi-x-circle-fill text-danger" style="font-size: 5.5rem;"></i>
      </div>
      
      <h2 class="font-serif fw-bold text-dark mb-3">Giao Dịch Chưa Hoàn Tất</h2>
      
      <p class="text-muted mb-4 fs-6 lh-lg">
        Quá trình thanh toán cho đơn hàng <strong class="text-dark font-monospace">{{ orderCode }}</strong> đã bị hủy hoặc gặp sự cố từ phía ngân hàng/ví điện tử.<br>
        Đừng lo lắng, <strong class="text-sora-primary fw-bold">giỏ hàng của bạn vẫn được giữ nguyên</strong>. Bạn có thể kiểm tra lại số dư hoặc quay lại để chọn phương thức thanh toán khác.
      </p>
      
      <div class="d-flex justify-content-center gap-3 mt-5">
        <router-link to="/cart" class="editorial-btn-outline px-4 py-3">
          Về Giỏ Hàng
        </router-link>
        <router-link to="/checkout" class="editorial-btn px-4 py-3">
          Thử Thanh Toán Lại
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const orderCode = computed(() => route.query.order || 'N/A');

// Ở trang Thất bại này, chúng ta KHÔNG gọi API xóa giỏ hàng
// Để khách hàng bấm nút "Về Giỏ Hàng" là thấy đồ của họ vẫn còn nguyên.
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