<template>
  <div class="storefront-wrapper font-luxury bg-sora-cream min-vh-100 pb-5">
    
    <section class="sora-banner position-relative d-flex align-items-center justify-content-center overflow-hidden">
      <div class="banner-ambient"></div>
      <div class="banner-glow banner-glow-left"></div>
      <div class="banner-glow banner-glow-right"></div>
      <div class="banner-monogram font-serif">SORA BOUTIQUE</div>
      <div class="banner-line-art banner-line-art-left"></div>
      <div class="banner-line-art banner-line-art-right"></div>

      <div class="position-relative z-index-2 text-center px-3 banner-content">
        <p class="text-champagne font-oswald tracking-widest mb-3 text-uppercase small">
          <i class="bi bi-stars me-2"></i>Thông Tin Thị Trường
        </p>
        <h1 class="display-3 fw-bold font-serif mb-3 text-white text-uppercase">Bảng Giá Vàng Hôm Nay</h1>
        <p class="banner-subtitle fw-light fs-5 mb-0 font-serif text-white">
          <i class="bi bi-clock-history me-2"></i>Cập nhật lúc: 
          <span class="text-gold fw-semibold">{{ data.last_updated || 'Đang kết nối...' }}</span>
        </p>
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
            
            <!-- Search Bar -->
            <div class="bg-white p-3 px-4 border-bottom-light d-flex align-items-center">
              <i class="bi bi-search text-muted me-3 fs-5"></i>
              <input type="text" v-model="searchQuery" class="form-control border-0 shadow-none font-luxury" placeholder="Tìm kiếm loại vàng (VD: SJC, Nhẫn Tròn...)" style="background: transparent; outline: none; box-shadow: none;">
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
                    <tr v-if="filteredPrices.length === 0">
                      <td colspan="3" class="py-5 text-center text-muted fst-italic fs-6">
                        <i class="bi bi-search me-2"></i> Không tìm thấy loại vàng phù hợp.
                      </td>
                    </tr>
                    
                    <tr v-for="(gold, index) in filteredPrices" :key="index">
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
import { ref, reactive, onMounted, computed } from 'vue';
import clientApiClient from '@/utils/clientApiClient';

const isLoading = ref(true);
const searchQuery = ref('');
const data = reactive({
  prices: [],
  last_updated: ''
});

const filteredPrices = computed(() => {
  if (!searchQuery.value) return data.prices;
  const lowerSearch = searchQuery.value.toLowerCase();
  return data.prices.filter(gold => gold.name.toLowerCase().includes(lowerSearch));
});

const fetchGoldPrices = async () => {
  try {
    const res = await clientApiClient.get('/client/gold-prices', { ignoreAuthRedirect: true, skipCartSession: true });
    const result = res.data;

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
.storefront-wrapper {
  --sora-primary: #9f273b;
  --sora-secondary: #e7ce7d;
  --sora-accent: #cc1e2e;
  --sora-primary-rgb: 159, 39, 59;
  --sora-secondary-rgb: 231, 206, 125;
  --sora-accent-rgb: 204, 30, 46;
}

:root {
  --color-sora-maroon: var(--sora-primary); 
  --color-sora-gold: var(--sora-secondary);    
  --color-sora-dark: #1A1A1A; 
  --color-sora-cream: #FCFBF8; 
  --shadow-sora: 0 10px 40px rgba(0, 0, 0, 0.08);
}

@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');

.font-luxury { font-family: 'Montserrat', sans-serif; }
.font-serif { font-family: 'Playfair Display', serif; }
.bg-sora-cream { background-color: #FCFBF8; }
.bg-sora-dark { background-color: #1A1A1A; }
.text-gold { color: var(--sora-secondary) !important; }
.text-primary-luxury { color: var(--sora-primary) !important; }
.bg-primary-luxury { background-color: var(--sora-primary) !important; }
.divider-gold { width: 50px; height: 2px; background-color: var(--sora-secondary); }
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
  border-bottom: 2px solid var(--sora-secondary) !important;
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
  border-bottom: 2px solid var(--sora-secondary); /* Kẻ ngang viền vàng ngăn cách Header */
}
.custom-luxury-table td {
  border-bottom: 1px solid rgba(var(--sora-secondary-rgb), 0.2); /* Kẻ ngang mờ nhẹ */
  vertical-align: middle;
}

/* Vạch kẻ dọc phân chia các cột (Điểm mấu chốt để không bị tạp nham) */
.border-start-gold {
  border-left: 1px dashed rgba(var(--sora-secondary-rgb), 0.6) !important;
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



/* Banner (Sora Banner Style) */
.text-champagne {
  color: #ead089 !important;
}

.z-index-2 {
  z-index: 2;
}

.sora-banner {
  min-height: 380px;
  background:
    linear-gradient(135deg, rgba(54, 6, 17, 0.98), rgba(114, 20, 38, 0.96) 48%, rgba(74, 9, 24, 0.98)),
    repeating-linear-gradient(120deg, rgba(255, 255, 255, 0.045) 0 1px, transparent 1px 14px);
  isolation: isolate;
}

.sora-banner::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(255, 236, 189, 0.2), transparent 42%),
    linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.08) 44%, transparent 64%);
  opacity: 0.9;
  z-index: 0;
}

.banner-ambient {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(0deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 84px 84px;
  mask-image: radial-gradient(circle at center, black 0%, transparent 68%);
  z-index: 0;
}

.banner-glow {
  position: absolute;
  width: 330px;
  height: 330px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(231, 206, 125, 0.2), transparent 68%);
  filter: blur(3px);
  z-index: 0;
}

.banner-glow-left {
  left: -120px;
  bottom: -150px;
}

.banner-glow-right {
  right: -100px;
  top: -120px;
}

.banner-monogram {
  position: absolute;
  text-align: center;
  color: rgba(255, 244, 218, 0.038);
  font-size: clamp(3.4rem, 9vw, 8.8rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1;
  white-space: nowrap;
  z-index: 0;
  left: 50%;
  transform: translateX(-50%);
  bottom: 52px;
}

.banner-content {
  max-width: 850px;
}

.banner-content h1 {
  letter-spacing: 0;
  line-height: 1.05;
  text-shadow: 0 10px 35px rgba(0, 0, 0, 0.32);
}

.banner-subtitle {
  color: rgba(255, 248, 231, 0.9);
  line-height: 1.75;
  text-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
}

.banner-line-art {
  position: absolute;
  width: 118px;
  height: 118px;
  border: 1px solid rgba(231, 206, 125, 0.34);
  transform: rotate(45deg);
  z-index: 1;
}

.banner-line-art::before,
.banner-line-art::after {
  content: "";
  position: absolute;
  inset: 18px;
  border: 1px solid rgba(231, 206, 125, 0.2);
}

.banner-line-art-left {
  left: 8%;
  top: 24%;
}

.banner-line-art-right {
  right: 8%;
  bottom: 22%;
}

@media (max-width: 992px) {
  .sora-banner {
    min-height: 340px;
  }

  .banner-line-art {
    opacity: 0.45;
  }
}

@media (max-width: 768px) {
  .sora-banner {
    min-height: 320px;
  }

  .banner-content h1 {
    font-size: 2.45rem;
  }

  .banner-subtitle {
    font-size: 1rem !important;
  }

  .banner-line-art {
    display: none;
  }

  .banner-monogram {
    bottom: 38px;
    font-size: 3.5rem;
  }
}

/* Image wrapper (Border xoắn) */
.img-wrapper {
  padding: 1rem;
}

.img-wrapper img {
  position: relative;
  z-index: 2;
}

.img-border {
  top: 0;
  left: 0;
  right: 2rem;
  bottom: 2rem;
  border: 1px solid #e7ce7d;
  z-index: 1;
}

.custom-img-portrait {
  aspect-ratio: 4/5;
}

/* Đường kẻ ngăn cách (Divider) */
.divider {
  width: 4rem;
  height: 2px;
}

/* Card Mission & Vision */
.card-hover {
  transition: box-shadow 0.3s ease;
}

.card-hover:hover {
  box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .15) !important;
}

.card-indicator {
  width: 4px;
  transition: width 0.3s ease, opacity 0.3s ease;
  opacity: 1;
}

.card-hover:hover .card-indicator {
  width: 100%;
  opacity: 0.05;
}

/* Icon vòng tròn */
.icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1px solid;
}

/* Khối sản phẩm (Fix ảnh vuông tuyệt đối) */
.square-ratio {
  width: 100%;
  padding-bottom: 100%;
  /* Tạo tỷ lệ vuông chuẩn 1:1 */
  display: block;
  overflow: hidden;
}

.img-zoom-wrapper img {
  transition: transform 0.7s ease;
}

.product-card:hover .img-zoom-wrapper img {
  transform: scale(1.1);
}

.product-overlay {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  z-index: 2;
}

/* Link khám phá */
.product-link:hover {
  color: #cc1e2e !important;
}

/* Combo Carousel Container Overrides */
.combos-editorial {
  background-color: #fffafa;
  overflow: hidden;
}

.combos-container {
  max-width: var(--home-container-width, 1400px);
}

.section-heading {
  max-width: 740px;
  margin: 0 auto 3rem;
}

.section-kicker {
  display: block;
  font-family: 'Oswald', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--sora-primary, #9f273b);
  margin-bottom: 0.75rem;
}

.section-heading h2 {
  font-size: clamp(2.3rem, 5vw, 4.4rem);
  line-height: 1.02;
}


</style>
