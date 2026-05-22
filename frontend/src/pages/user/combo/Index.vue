<template>
  <div class="combo-client-page bg-light-custom pb-5">
    
    <div class="sora-banner position-relative d-flex align-items-center justify-content-center overflow-hidden">
      <div class="banner-overlay"></div>
      <div class="position-relative z-index-2 text-center px-3" style="max-width: 800px;">
        <p class="text-gold font-oswald tracking-widest mb-2 text-uppercase small"><i class="bi bi-stars me-2"></i>SORA Exclusive</p>
        <h1 class="display-3 fw-bold font-serif mb-3 text-white text-uppercase" style="letter-spacing: 2px;">Gói Quà Tặng & Ưu Đãi</h1>
        <p class="text-white opacity-75 fw-light fs-5 mb-0 font-serif">Những sự kết hợp hoàn hảo được tuyển chọn bởi các nghệ nhân SORA.</p>
      </div>
    </div>

    <div class="container py-5">
      <div class="d-flex justify-content-center mb-5">
        <div class="filter-group shadow-sm bg-white p-1 rounded-pill d-inline-flex border border-gold-light">
          <button class="filter-btn" :class="{'active': activeFilter === 'all'}" @click="filterCombo('all')">Tất Cả</button>
          <button class="filter-btn" :class="{'active': activeFilter === 'female'}" @click="filterCombo('female')">Cho Nàng</button>
          <button class="filter-btn" :class="{'active': activeFilter === 'male'}" @click="filterCombo('male')">Cho Chàng</button>
          <button class="filter-btn" :class="{'active': activeFilter === 'couple'}" @click="filterCombo('couple')">Cặp Đôi</button>
        </div>
      </div>

      <!-- HIỆU ỨNG SKELETON KHI ĐANG LOAD TRANG -->
      <div v-if="isLoading" class="combo-list-container fade-in">
        <div v-for="i in 2" :key="i" class="combo-row-card card border-0 shadow-sm rounded-4 overflow-hidden mb-5 bg-white skeleton-card">
          <div class="row g-0 h-100">
            <!-- Cột trái Skeleton -->
            <div class="col-lg-4 position-relative p-0 border-end border-gold-light d-flex flex-column">
              <div class="p-4 p-lg-5 position-relative z-index-2 d-flex flex-column h-100 text-center text-md-start">
                <div class="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start mb-3">
                  <div class="skeleton-box shimmer" style="width: 80px; height: 38px;"></div>
                  <div class="skeleton-box shimmer" style="width: 100px; height: 38px;"></div>
                </div>

                <div class="skeleton-box skeleton-title w-75 mb-3 shimmer mx-auto mx-md-0" style="height: 38px;"></div>
                <div class="skeleton-box skeleton-text w-100 mb-2 shimmer mx-auto mx-md-0"></div>
                <div class="skeleton-box skeleton-text w-75 mb-4 shimmer mx-auto mx-md-0"></div>

                <div class="timer-section mb-4 mt-auto">
                    <div class="skeleton-box skeleton-text w-50 mb-3 shimmer mx-auto mx-md-0" style="height: 20px;"></div>
                    <div class="d-flex justify-content-center justify-content-md-start gap-2">
                        <div class="skeleton-box shimmer rounded-3" style="width: 60px; height: 65px;"></div>
                        <div class="skeleton-box shimmer rounded-3" style="width: 60px; height: 65px;"></div>
                        <div class="skeleton-box shimmer rounded-3" style="width: 60px; height: 65px;"></div>
                        <div class="skeleton-box shimmer rounded-3" style="width: 60px; height: 65px;"></div>
                    </div>
                </div>

                <div class="d-flex align-items-end justify-content-center justify-content-md-between flex-wrap gap-3 mt-2">
                  <div class="d-flex flex-column gap-2 w-50 align-items-center align-items-md-start">
                    <div class="skeleton-box skeleton-text w-50 shimmer"></div>
                    <div class="skeleton-box skeleton-title w-100 shimmer"></div>
                  </div>
                  <div class="skeleton-box shimmer" style="width: 140px; height: 40px;"></div>
                </div>
              </div>
            </div>

            <!-- Cột phải Skeleton (List Items) -->
            <div class="col-lg-8 p-4 p-lg-5 bg-white position-relative">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <div class="skeleton-box skeleton-title w-25 shimmer"></div>
                <div class="d-flex gap-2">
                  <div class="skeleton-box rounded-circle shimmer" style="width: 36px; height: 36px;"></div>
                  <div class="skeleton-box rounded-circle shimmer" style="width: 36px; height: 36px;"></div>
                </div>
              </div>

              <div class="d-flex gap-4 overflow-hidden pb-3">
                <div class="flex-shrink-0" style="width: 220px;" v-for="j in 3" :key="j">
                  <div class="skeleton-box shimmer rounded-3 mb-3" style="height: 220px; width: 100%;"></div>
                  <div class="skeleton-box skeleton-title w-75 mb-2 shimmer"></div>
                  <div class="skeleton-box skeleton-text w-50 mb-2 shimmer"></div>
                  <div class="skeleton-box skeleton-text w-50 shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- KẾT QUẢ DANH SÁCH THỰC TẾ -->
      <div class="combo-list-container fade-in" v-else-if="processedCombos.length > 0">
        <!-- Render danh sách theo displayLimit -->
        <div class="combo-row-card card border-0 shadow-sm rounded-4 overflow-hidden mb-5 bg-white" v-for="combo in displayCombos" :key="combo.id">
          
          <div class="row g-0 h-100">
            <div class="col-lg-4 position-relative p-0 border-end border-gold-light d-flex flex-column">
              <div v-if="combo.timerData.isEnded" class="ended-overlay d-flex align-items-center justify-content-center flex-column text-center p-4">
                  <i class="bi bi-x-circle fs-1 text-white opacity-75 mb-2"></i>
                  <h3 class="text-white font-oswald tracking-widest m-0">{{ combo.timerData.title }}</h3>
              </div>

              <div class="combo-bg-img" :style="`background-image: url(${getImage(combo.thumbnail_image)})`"></div>
              <div class="combo-bg-gradient"></div>
              
              <div class="p-4 p-lg-5 position-relative z-index-2 d-flex flex-column h-100 text-center text-md-start">
                <div class="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start mb-3">
                  <span class="badge rounded-0 bg-sora-primary text-white px-3 py-2 font-oswald tracking-wide shadow-sm">
                    GIẢM {{ combo.discount_type === 'percentage' ? combo.discount_value + '%' : formatCurrency(combo.discount_value) }}
                  </span>
                  <span v-if="combo.theme" class="badge rounded-0 bg-dark text-white px-3 py-2 font-oswald tracking-wide shadow-sm border border-secondary">{{ combo.theme }}</span>
                </div>

                <h3 class="fw-bold text-dark font-serif mb-2" style="font-size: 2rem;">{{ combo.name }}</h3>
                <p class="text-muted small mb-4 line-clamp-2">{{ combo.description }}</p>

                <div class="timer-section mb-4 mt-auto">
                    <h6 class="text-dark fw-bold font-oswald mb-3 tracking-wide text-uppercase" :class="combo.timerData.type === 'active' ? 'text-sora-red' : ''">
                      <i class="bi bi-clock-history me-1"></i> {{ combo.timerData.title }}
                    </h6>
                    
                    <div v-if="!combo.timerData.isEnded && combo.timerData.type !== 'forever'" class="d-flex justify-content-center justify-content-md-start gap-2">
                        <div class="time-box shadow-sm">
                            <span class="num font-oswald">{{ combo.timerData.d }}</span>
                            <span class="label">Days</span>
                        </div>
                        <div class="time-box shadow-sm">
                            <span class="num font-oswald">{{ combo.timerData.h }}</span>
                            <span class="label">Hr</span>
                        </div>
                        <div class="time-box shadow-sm">
                            <span class="num font-oswald">{{ combo.timerData.m }}</span>
                            <span class="label">Mins</span>
                        </div>
                        <div class="time-box shadow-sm">
                            <span class="num font-oswald text-sora-red">{{ combo.timerData.s }}</span>
                            <span class="label text-sora-red">Sec</span>
                        </div>
                    </div>
                </div>

                <div class="d-flex align-items-end justify-content-center justify-content-md-between flex-wrap gap-3 mt-2">
                  <div>
                    <div class="text-muted text-decoration-line-through small fw-medium">{{ formatCurrency(combo.originalPrice) }}</div>
                    <div class="fs-3 fw-bold text-sora-red font-oswald tracking-wide">{{ formatCurrency(combo.finalPrice) }}</div>
                  </div>
                  <button class="btn btn-sora-primary rounded-0 fw-bold font-oswald tracking-wide px-4 py-2" @click="goToDetail(combo.slug)">
                    XEM CHI TIẾT
                  </button>
                </div>
              </div>
            </div>

            <div class="col-lg-8 p-4 p-lg-5 bg-white position-relative">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="fw-bold font-serif m-0 text-dark">Bao Gồm {{ combo.items?.length || 0 }} Tác Phẩm</h5>
                <div class="d-flex gap-2" v-if="combo.items && combo.items.length > 2">
                  <button class="btn btn-outline-secondary rounded-circle slider-btn" @click="scrollSlider(combo.id, -1)"><i class="bi bi-chevron-left"></i></button>
                  <button class="btn btn-outline-secondary rounded-circle slider-btn" @click="scrollSlider(combo.id, 1)"><i class="bi bi-chevron-right"></i></button>
                </div>
              </div>

              <div class="combo-items-slider d-flex gap-4 overflow-auto hide-scrollbar pb-3" :id="'scroll-container-' + combo.id">
                <div class="combo-item-card flex-shrink-0" style="width: 220px;" v-for="item in combo.items" :key="item.id">
                  <div class="position-relative overflow-hidden border border-gold-light rounded-3 bg-light mb-3">
                    <img :src="getImage(item.product?.thumbnail_image)" class="w-100 object-fit-cover item-img-hover" style="height: 220px;">
                    <div class="position-absolute top-0 end-0 m-2">
                        <span class="badge bg-dark text-white rounded-circle fs-6 shadow-sm border border-light" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">x{{ item.quantity }}</span>
                    </div>
                  </div>
                  <h6 class="fw-bold font-serif text-dark mb-1 text-truncate" :title="item.product?.name">{{ item.product?.name }}</h6>
                  <div class="text-muted small mb-2 d-flex align-items-center">
                      <span v-if="item.product_variant_id" class="badge bg-light text-secondary border me-1"><i class="bi bi-tag-fill me-1"></i>{{ item.variant?.sku }}</span>
                      <span v-else class="text-sora-primary fw-semibold"><i class="bi bi-sliders me-1"></i>Được chọn phân loại</span>
                  </div>
                  <div class="fw-bold font-oswald text-sora-red">{{ formatCurrency(item.computedPrice) }}</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- PHẦN XEM THÊM & XEM TẤT CẢ (LAZY LOAD THEO SỐ LƯỢNG) -->
        <div class="text-center mt-4 mb-5 fade-in" v-if="processedCombos.length > displayLimit">
           <button class="btn btn-outline-dark px-4 py-2 me-2 me-md-3 font-oswald tracking-widest text-uppercase fw-bold rounded-0" @click="loadMore">
              <i class="bi bi-arrow-down-circle me-1"></i> Xem Thêm
           </button>
           <button class="btn btn-sora-primary px-4 py-2 font-oswald tracking-widest text-uppercase fw-bold rounded-0" @click="loadAll">
              <i class="bi bi-grid-fill me-1"></i> Xem Tất Cả ({{ processedCombos.length }})
           </button>
        </div>

      </div>

      <!-- TRẠNG THÁI KHÔNG TÌM THẤY COMBO -->
      <div v-else class="text-center py-5 my-5 fade-in">
        <i class="bi bi-box2-heart fs-1 d-block mb-3 text-gold opacity-50"></i>
        <h5 class="font-serif text-muted">Chưa có gói ưu đãi nào trong danh mục này.</h5>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { usePublicRefreshListener } from '@/composables/usePublicRefreshListener.js';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();
const combos = ref([]);
const isLoading = ref(true);
const activeFilter = ref('all');

// THÊM: Biến giới hạn số lượng hiển thị (Mặc định 2)
const displayLimit = ref(2);

const currentTime = ref(new Date().getTime());
let timerInterval = null;

const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val || 0);
const getImage = (path) => path ? `${import.meta.env.VITE_STORAGE_URL}/${path}` : 'https://placehold.co/400x400?text=No+Image';

const getItemPrice = (item) => {
    if (item.product_variant_id && item.variant) return parseFloat(item.variant.price);
    return item.product ? parseFloat(item.product.base_price) : 0;
};

const calculateOriginal = (comboItems) => {
  let total = 0;
  comboItems.forEach(item => {
    total += item.computedPrice * item.quantity;
  });
  return total;
};

const calculateFinal = (originalTotal, discountType, discountValue) => {
  let discount = parseFloat(discountValue);
  if (discountType === 'percentage') {
    return originalTotal - (originalTotal * (Math.min(discount, 100) / 100));
  }
  return Math.max(0, originalTotal - discount);
};

const parseDBDate = (dateStr) => {
    if (!dateStr) return null;
    const cleanStr = dateStr.replace(' ', 'T').substring(0, 19);
    return new Date(cleanStr).getTime();
};

const calculateTimeParts = (diff) => {
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  
  return {
    d: days.toString().padStart(2, '0'),
    h: hours.toString().padStart(2, '0'),
    m: minutes.toString().padStart(2, '0'),
    s: seconds.toString().padStart(2, '0')
  };
};

const computeTimerData = (combo, now) => {
    if (combo.usage_limit !== null && combo.usage_limit <= 0) {
        return { type: 'soldout', title: 'ĐÃ BÁN HẾT SỐ LƯỢNG', isEnded: true };
    }

    const startTime = combo.parsed_start_date;
    const endTime = combo.parsed_end_date;

    if (endTime && endTime < now) return { type: 'ended', title: 'ƯU ĐÃI ĐÃ KẾT THÚC', isEnded: true };
    if (startTime && startTime > now) {
        const diff = startTime - now;
        return { type: 'upcoming', title: 'HÃY NHANH TAY! MỞ BÁN SAU:', isEnded: false, ...calculateTimeParts(diff) };
    }
    if (endTime && endTime >= now) {
        const diff = endTime - now;
        return { type: 'active', title: 'NHANH CHÓNG LÊN! KẾT THÚC TRONG:', isEnded: false, ...calculateTimeParts(diff) };
    }

    return { type: 'forever', title: 'SẢN PHẨM KHÔNG GIỚI HẠN THỜI GIAN', isEnded: false };
};

const scrollSlider = (comboId, direction) => {
    const container = document.getElementById('scroll-container-' + comboId);
    if (container) {
        const scrollAmount = 300; 
        container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
};

const fetchCombos = async (gender = null) => {
  isLoading.value = true;
  try {
    let url = `${API_URL}/client/combos`;
    if (gender && gender !== 'all') url += `?gender=${gender}`;
    const res = await axios.get(url);
    
    // TIỀN XỬ LÝ (PRE-CALCULATE) DATA NGAY KHI VỪA FETCH XONG
    combos.value = res.data.data.data.map(combo => {
        // 1. Parse dates 1 lần duy nhất
        combo.parsed_start_date = parseDBDate(combo.start_date);
        combo.parsed_end_date = parseDBDate(combo.end_date);
        
        // 2. Tính giá tiền của các items
        combo.items = combo.items.map(item => ({
            ...item,
            computedPrice: getItemPrice(item)
        }));
        
        // 3. Tính toán trước Giá gốc và Giá sau giảm
        combo.originalPrice = calculateOriginal(combo.items);
        combo.finalPrice = calculateFinal(combo.originalPrice, combo.discount_type, combo.discount_value);
        
        return combo;
    });

  } catch (error) {
  } finally {
    isLoading.value = false;
  }
};

usePublicRefreshListener({
  combos: () => fetchCombos(activeFilter.value),
});

const filterCombo = (gender) => {
  activeFilter.value = gender;
  displayLimit.value = 2; // THÊM: Reset lại số lượng hiển thị khi đổi bộ lọc
  fetchCombos(gender);
};

const goToDetail = (slug) => {
  router.push({ name: 'client-combo-detail', params: { slug } });
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// CÁC HÀM XỬ LÝ NÚT XEM THÊM VÀ XEM TẤT CẢ
const loadMore = () => {
    displayLimit.value += 2; // Tải thêm 2 combo nữa mỗi lần ấn
};

const loadAll = () => {
    displayLimit.value = processedCombos.value.length; // Hiện toàn bộ
};

// Computed xử lý danh sách gốc (sắp xếp và cập nhật timer)
const processedCombos = computed(() => {
    const now = currentTime.value;
    const oneDayMs = 24 * 60 * 60 * 1000;

    let result = combos.value.filter(combo => {
        if (!combo.parsed_end_date) return true;
        return now - combo.parsed_end_date <= oneDayMs;
    });

    result.sort((a, b) => {
        const aEnded = a.parsed_end_date && a.parsed_end_date < now;
        const bEnded = b.parsed_end_date && b.parsed_end_date < now;

        if (aEnded && !bEnded) return 1; 
        if (!aEnded && bEnded) return -1; 
        return 0;
    });

    // Cập nhật lại chuỗi thời gian dựa vào 'now'
    return result.map(combo => ({
        ...combo,
        timerData: computeTimerData(combo, now)
    }));
});

// Computed trả về mảng con theo Limit để hiển thị (LAZY RENDER)
const displayCombos = computed(() => {
    return processedCombos.value.slice(0, displayLimit.value);
});

onMounted(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchCombos();
    timerInterval = setInterval(() => {
        currentTime.value = new Date().getTime();
    }, 1000);
});

onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

.bg-light-custom { background-color: #faf9f6; min-height: 100vh; }
.font-serif { font-family: 'Playfair Display', serif; }
.font-oswald { font-family: 'Oswald', sans-serif; }
.tracking-wide { letter-spacing: 1px; }
.tracking-widest { letter-spacing: 2px; }
.z-index-2 { z-index: 2; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.text-sora-primary { color: #9f273b !important; }
.text-sora-red { color: #cc1e2e !important; }
.text-gold { color: #e7ce7d !important; }
.bg-sora-primary { background-color: #9f273b !important; }
.border-gold-light { border-color: rgba(231, 206, 125, 0.4) !important; }

.sora-banner { 
  height: 400px;
  background: url('https://placehold.co/1920x600/9f273b/e7ce7d?text=SORA+BOUTIQUE') center/cover no-repeat; 
  background-attachment: fixed;
}
.banner-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(159,39,59,0.95) 0%, rgba(204,30,46,0.6) 100%); z-index: 1; }

.filter-group { border-radius: 50px; }
.filter-btn {
  background: transparent; border: none; color: #6c757d; font-family: 'Oswald', sans-serif; font-weight: 500; letter-spacing: 1px;
  padding: 8px 24px; border-radius: 50px; transition: all 0.3s ease; text-transform: uppercase; font-size: 0.85rem;
}
.filter-btn:hover { color: #9f273b; }
.filter-btn.active { background-color: #9f273b; color: white; box-shadow: 0 4px 10px rgba(159,39,59,0.3); }

.combo-row-card { position: relative; transition: box-shadow 0.3s ease; border: 1px solid rgba(231, 206, 125, 0.2) !important; }
.combo-row-card:hover { box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important; }
.combo-bg-img {
    position: absolute; inset: 0;
    background-size: cover;
    background-position: center;
    opacity: 0.08; 
    filter: blur(2px);
    z-index: 0;
}
.combo-bg-gradient {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 100%);
    z-index: 1;
}

.ended-overlay {
    position: absolute; inset: 0;
    background-color: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    z-index: 10; 
}

.time-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 8px;
    width: 60px;
    height: 65px;
}
.time-box .num { font-size: 1.5rem; font-weight: 500; color: #333; line-height: 1; margin-bottom: 2px; }
.time-box .label { font-size: 0.7rem; color: #666; text-transform: capitalize; }

.btn-sora-primary { background-color: #9f273b; color: white; border: none; transition: 0.3s; }
.btn-sora-primary:hover { background-color: #7a1c2d; color: white; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(159, 39, 59, 0.3); }

.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.slider-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; padding: 0; border-color: #ddd; color: #666; }
.slider-btn:hover { background-color: #9f273b; border-color: #9f273b; color: white; }

.item-img-hover { transition: transform 0.5s ease; }
.combo-item-card:hover .item-img-hover { transform: scale(1.05); }

/* HIỆU ỨNG SKELETON */
.fade-in { animation: fadeIn 0.4s ease-in; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.shimmer { 
    background: #f6f7f8; 
    background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%); 
    background-repeat: no-repeat; 
    background-size: 800px 100%; 
    animation: placeholderShimmer 1.5s linear infinite forwards; 
}
@keyframes placeholderShimmer { 0% { background-position: -468px 0; } 100% { background-position: 468px 0; } }

.skeleton-box { background-color: #eee; border-radius: 4px; }
.skeleton-text { height: 14px; border-radius: 4px; }
.skeleton-title { height: 24px; border-radius: 4px; }
.skeleton-card { pointer-events: none; }
</style>