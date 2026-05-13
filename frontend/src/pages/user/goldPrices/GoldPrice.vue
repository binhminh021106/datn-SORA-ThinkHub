<template>
  <div class="storefront-wrapper font-luxury bg-sora-cream min-vh-100 pb-5">
    
    <section class="page-header py-5 bg-sora-dark position-relative text-center overflow-hidden">
      <div class="position-absolute inset-0 bg-luxury-pattern opacity-15"></div>
      <div class="position-absolute inset-0 bg-dark-gradient"></div>

      <div class="container position-relative z-index-2 py-4">
        <div class="d-flex flex-column align-items-center">
          <i class="bi bi-gem text-gold display-5 mb-3"></i>
          <h6 class="text-gold tracking-widest text-uppercase fw-semibold mb-3">Thông Tin Thị Trường</h6>
          <h1 class="display-4 font-serif fw-bold text-white mb-3 shadow-text">Bảng Giá Vàng Hôm Nay</h1>
          <div class="divider-gold mx-auto mb-3"></div>
          <p class="text-white opacity-85 mt-2 fst-italic tracking-wide text-sm">
            <i class="bi bi-clock-history me-2"></i>Cập nhật lúc: 
            <span class="text-gold fw-semibold">{{ data.last_updated || 'Đang kết nối...' }}</span>
          </p>
        </div>
      </div>
    </section>

    <div v-if="isLoading" class="container py-6 text-center">
      <div class="d-flex flex-column align-items-center mt-5">
        <div class="spinner-luxury mb-4" role="status"></div>
        <p class="text-gold tracking-widest fw-bold text-uppercase fs-7">Đang kết nối kho dữ liệu SORA Jewelry...</p>
      </div>
    </div>

    <div v-else class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-11 col-xl-10">
          
          <div class="luxury-gold-card border-0 shadow-sora rounded-0 bg-white">
            
            <div class="card-title-section bg-primary-luxury p-4 rounded-0 text-center border-bottom-gold">
              <h5 class="font-serif fw-bold mb-0 tracking-widest text-uppercase text-white d-flex align-items-center justify-content-center">
                <i class="bi bi-bank me-3 text-gold fs-4"></i> Niêm Yết Hệ Thống SORA Jewelry
              </h5>
            </div>
            
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table custom-luxury-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col" class="text-start ps-4 w-50">Loại Vàng / Sản Phẩm</th>
                      <th scope="col" class="text-center border-start-gold w-25">Giá Mua Vào</th>
                      <th scope="col" class="text-center border-start-gold pe-4 w-25">Giá Bán Ra</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="data.prices.length === 0">
                      <td colspan="3" class="py-5 text-center text-muted fst-italic fs-6">
                        <i class="bi bi-exclamation-triangle me-2"></i> Tạm thời chưa có dữ liệu giá vàng. Vui lòng quay lại sau!
                      </td>
                    </tr>
                    
                    <tr v-for="(gold, index) in data.prices" :key="index">
                      <td class="py-3 text-start ps-4">
                        <span class="fw-semibold text-dark font-serif fs-6-plus">{{ gold.name }}</span>
                      </td>
                      <td class="py-3 text-center border-start-gold">
                        <span class="fw-bold text-sora-success price-text">{{ gold.buy }}</span>
                      </td>
                      <td class="py-3 text-center border-start-gold pe-4">
                        <span class="fw-bold text-sora-danger price-text">{{ gold.sell }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div class="card-footer bg-white p-4 rounded-0 border-top-light">
              <div class="d-flex flex-column align-items-center text-center text-muted lh-lg fs-7-plus">
                <p class="mb-1"><i class="bi bi-info-circle me-2 text-gold"></i>Đơn vị tính: Nghìn VNĐ / Chỉ.</p>
                <p class="fst-italic opacity-85 mb-0">
                  <i class="bi bi-shield-lock me-2 text-gold opacity-75"></i>Bảng giá chỉ mang tính chất tham khảo trực tuyến. Vui lòng liên hệ <span class="fw-bold text-primary-luxury">SORA Jewelry</span> để chốt giao dịch.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

const isLoading = ref(true);
const data = reactive({
  prices: [],
  last_updated: ''
});

const API_BASE = import.meta.env.VITE_API_BASE_URL; 

const fetchGoldPrices = async () => {
  try {
    const response = await fetch(`${API_BASE}/client/gold-prices`, {
      headers: { 'Accept': 'application/json' }
    });
    
    const result = await response.json();

    if (result.success) {
      data.prices = result.data.prices || [];
      data.last_updated = result.data.last_updated || '';
    }
  } catch (error) {
    console.error("Lỗi kết nối kho vàng:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchGoldPrices();
});
</script>

<style scoped>
:root {
  --color-sora-maroon: #9f273b; 
  --color-sora-gold: #e7ce7d;    
  --color-sora-dark: #1A1A1A; 
  --color-sora-cream: #FCFBF8; 
  --shadow-sora: 0 10px 40px rgba(0, 0, 0, 0.08);
}

@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');

.font-luxury { font-family: 'Montserrat', sans-serif; }
.font-serif { font-family: 'Playfair Display', serif; }
.bg-sora-cream { background-color: #FCFBF8; }
.bg-sora-dark { background-color: #1A1A1A; }
.text-gold { color: #e7ce7d !important; }
.text-primary-luxury { color: #9f273b !important; }
.bg-primary-luxury { background-color: #9f273b !important; }
.divider-gold { width: 50px; height: 2px; background-color: #e7ce7d; }
.z-index-2 { z-index: 2; }
.shadow-text { text-shadow: 2px 2px 8px rgba(0,0,0,0.5); }
.opacity-15 { opacity: 0.15; }
.opacity-85 { opacity: 0.85; }

.bg-luxury-pattern {
  background-image: url('data:image/svg+xml,%3Csvg width=\'30\' height=\'30\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'1.5\' cy=\'1.5\' r=\'1.5\' fill=\'%23e7ce7d\'/%3E%3C/svg%3E');
}
.bg-dark-gradient {
  background: radial-gradient(circle, rgba(26,26,26,0.6) 0%, rgba(26,26,26,0.95) 100%);
}

.spinner-luxury {
  width: 3.5rem;
  height: 3.5rem;
  border: 0.2rem solid var(--color-sora-gold);
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-luxury-rotate 0.8s linear infinite;
}
@keyframes spinner-luxury-rotate {
  to { transform: rotate(360deg); }
}

.luxury-gold-card {
  box-shadow: var(--shadow-sora);
}
.border-bottom-gold {
  border-bottom: 2px solid #e7ce7d !important;
}
.border-top-light {
  border-top: 1px solid #eaeaea !important;
}

/* ================================================= */
/* BẢNG GIÁ VÀNG - CẤU TRÚC LƯỚI MỚI CHUẨN XA XỈ     */
/* ================================================= */
.custom-luxury-table {
  border-collapse: collapse;
  width: 100%;
}
.custom-luxury-table thead {
  background-color: #f6f4ef; /* Màu kem đậm hơn chút cho Header */
}
.custom-luxury-table th {
  padding: 1.2rem 1rem;
  color: #666;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: 0.85rem;
  border-bottom: 2px solid #e7ce7d; /* Kẻ ngang viền vàng ngăn cách Header */
}
.custom-luxury-table td {
  border-bottom: 1px solid rgba(231, 206, 125, 0.2); /* Kẻ ngang mờ nhẹ */
  vertical-align: middle;
}

/* Vạch kẻ dọc phân chia các cột (Điểm mấu chốt để không bị tạp nham) */
.border-start-gold {
  border-left: 1px dashed rgba(231, 206, 125, 0.6) !important;
}

/* Sọc ngựa vằn (Zebra Striping) giúp mắt dễ gióng hàng ngang */
.custom-luxury-table tbody tr:nth-child(odd) {
  background-color: #ffffff;
}
.custom-luxury-table tbody tr:nth-child(even) {
  background-color: #faf8f5; /* Dòng chẵn màu kem cực nhạt */
}

/* Hover Effect nguyên dòng */
.custom-luxury-table tbody tr:hover td {
  background-color: #f1edd9 !important;
  transition: background-color 0.3s ease;
}

/* Typography cho Giá tiền */
.price-text {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.15rem;
  letter-spacing: 0.5px;
}
.text-sora-success { color: #1e7e34 !important; }
.text-sora-danger { color: #c82333 !important; }

.fs-6-plus { font-size: 1.05rem; }
.fs-7 { font-size: 0.85rem; }
.fs-7-plus { font-size: 0.95rem; }
</style>