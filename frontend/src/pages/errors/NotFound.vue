<template>
  <div class="not-found-wrapper d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light text-center px-3">
    
    <div class="mb-4">
      <i class="bi bi-diamond fs-1 text-gold"></i>
    </div>

    <h1 class="display-1 fw-bold text-primary-luxury font-serif mb-0" style="font-size: 8rem; text-shadow: 2px 2px 10px rgba(159,39,59,0.1);">
      404
    </h1>
    
    <h3 class="font-serif fw-bold text-dark mb-3 mt-2">Trang Không Tồn Tại</h3>
    <p class="text-muted mb-5 font-luxury" style="max-width: 500px; line-height: 1.6;">
      Dạ, có vẻ như đường dẫn Quý khách đang tìm kiếm không tồn tại, đã bị đổi tên hoặc tạm thời không thể truy cập.
    </p>

    <div class="d-flex gap-3 flex-wrap justify-content-center mt-3">
      <button @click="$router.go(-1)" class="editorial-btn-outline px-4 py-2">
        <i class="bi bi-arrow-left me-2"></i> Quay lại
      </button>
      
      <router-link to="/" class="editorial-btn px-5 py-2 text-decoration-none">
        <i class="bi bi-house-door-fill me-2"></i> Trở về Trang Chủ
      </router-link>
    </div>

  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  document.title = "404 - Không tìm thấy trang | SORA Jewelry";
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');

.font-luxury { font-family: 'Montserrat', sans-serif; }
.font-serif { font-family: 'Playfair Display', serif; }

.bg-light { background-color: #fbf9f6 !important; }
.text-primary-luxury { color: #9f273b !important; }
.text-gold { color: #e7ce7d !important; }

/* Nút Về trang chủ */
.btn-brand-solid {
  background: linear-gradient(135deg, #9f273b, #7a1c2d);
  color: white !important;
  border: none;
}
.btn-brand-solid:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(159, 39, 59, 0.3) !important;
}

/* Nút Quay lại */
.btn-outline-gold {
  color: #9f273b;
  border: 1px solid #9f273b;
  background: transparent;
}
.btn-outline-gold:hover {
  background-color: rgba(159, 39, 59, 0.05);
  transform: translateY(-3px);
}
</style>