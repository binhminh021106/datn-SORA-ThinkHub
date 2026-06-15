<template>
  <main class="combo-client-page">
    <!-- banner combo đầu trang -->
    <section class="sora-banner position-relative d-flex align-items-center justify-content-center overflow-hidden">
      <div class="banner-ambient"></div>
      <div class="banner-glow banner-glow-left"></div>
      <div class="banner-glow banner-glow-right"></div>
      <div class="banner-monogram font-serif">SORA BOUTIQUE</div>
      <div class="banner-line-art banner-line-art-left"></div>
      <div class="banner-line-art banner-line-art-right"></div>

      <div class="position-relative z-index-2 text-center px-3 banner-content">
        <p class="text-champagne font-oswald tracking-widest mb-3 text-uppercase small">
          <i class="bi bi-stars me-2"></i>SORA Exclusive
        </p>
        <h1 class="display-3 fw-bold font-serif mb-3 text-white text-uppercase">GÓI QUÀ TẶNG & ƯU ĐÃI</h1>
        <p class="banner-subtitle fw-light fs-5 mb-0 font-serif">
          Những sự kết hợp hoàn hảo được tuyển chọn bởi các nghệ nhân SORA.
        </p>
      </div>
    </section>

    <section class="combo-content-section">
      <div class="container">
        <div class="d-flex justify-content-center mb-4 mb-lg-5">
          <div class="filter-group d-inline-flex">
            <button class="filter-btn" :class="{ active: activeFilter === 'all' }" @click="filterCombo('all')">TẤT
              CẢ</button>
            <button class="filter-btn" :class="{ active: activeFilter === 'female' }" @click="filterCombo('female')">CHO
              NÀNG</button>
            <button class="filter-btn" :class="{ active: activeFilter === 'male' }" @click="filterCombo('male')">CHO
              CHÀNG</button>
            <button class="filter-btn" :class="{ active: activeFilter === 'couple' }" @click="filterCombo('couple')">CẶP
              ĐÔI</button>
          </div>
        </div>

        <div v-if="isLoading" class="combo-list-container fade-in">
          <div v-for="item in 2" :key="'combo-skeleton-' + item" class="combo-row-card overflow-hidden mb-4 mb-lg-5">
            <div class="row g-0">
              <div class="col-lg-4 combo-offer-panel">
                <SoraListSkeleton :rows="4" :image="false" />
              </div>
              <div class="col-lg-8 combo-products-panel">
                <SoraProductGridSkeleton :count="3" min="180px" />
              </div>
            </div>
          </div>
        </div>

        <div class="combo-list-container fade-in" v-else-if="processedCombos.length > 0">
          <article class="combo-row-card overflow-hidden mb-4 mb-lg-5" v-for="combo in displayCombos" :key="combo.id">
            <div class="row g-0 align-items-stretch">
              <div class="col-lg-4 combo-offer-panel position-relative d-flex flex-column">
                <div v-if="combo.timerData.isEnded"
                  class="ended-overlay d-flex align-items-center justify-content-center flex-column text-center p-4">
                  <i class="bi bi-x-circle fs-1 text-white opacity-75 mb-2"></i>
                  <h3 class="text-white font-oswald tracking-widest m-0">{{ combo.timerData.title }}</h3>
                </div>

                <div class="combo-bg-img" :style="`background-image: url(${getImage(combo.thumbnail_image)})`"></div>
                <div class="combo-bg-gradient"></div>

                <div class="position-relative z-index-2 d-flex flex-column h-100 text-center text-md-start">
                  <div class="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start mb-4">
                    <span class="luxury-badge luxury-badge-discount">
                      GIẢM {{ combo.discount_type === 'percentage' ? combo.discount_value + '%' :
                        formatCurrency(combo.discount_value) }}
                    </span>
                    <span v-if="combo.theme" class="luxury-badge luxury-badge-theme">{{ combo.theme }}</span>
                  </div>

                  <h3 class="combo-title font-serif mb-3">{{ combo.name }}</h3>
                  <p class="combo-description small mb-4 line-clamp-2">{{ combo.description }}</p>

                  <div class="timer-section mb-4 mt-auto">
                    <h6 class="timer-title font-oswald mb-3 tracking-wide text-uppercase"
                      :class="{ active: combo.timerData.type === 'active' }">
                      <i class="bi bi-clock-history me-1"></i> {{ combo.timerData.title }}
                    </h6>

                    <div v-if="!combo.timerData.isEnded && combo.timerData.type !== 'forever'"
                      class="d-flex justify-content-center justify-content-md-start gap-2">
                      <div class="time-box">
                        <span class="num font-oswald">{{ combo.timerData.d }}</span>
                        <span class="label">Days</span>
                      </div>
                      <div class="time-box">
                        <span class="num font-oswald">{{ combo.timerData.h }}</span>
                        <span class="label">Hr</span>
                      </div>
                      <div class="time-box">
                        <span class="num font-oswald">{{ combo.timerData.m }}</span>
                        <span class="label">Mins</span>
                      </div>
                      <div class="time-box">
                        <span class="num font-oswald">{{ combo.timerData.s }}</span>
                        <span class="label">Sec</span>
                      </div>
                    </div>
                  </div>

                  <div
                    class="offer-footer d-flex align-items-end justify-content-center justify-content-md-between flex-wrap gap-3">
                    <div>
                      <div class="old-price text-decoration-line-through">{{ formatCurrency(combo.originalPrice) }}
                      </div>
                      <div class="new-price font-oswald tracking-wide">{{ formatCurrency(combo.finalPrice) }}</div>
                    </div>
                    <button class="btn luxury-cta font-oswald tracking-wide px-4 py-2" @click="goToDetail(combo.slug)">
                      XEM CHI TIẾT
                    </button>
                  </div>
                </div>
              </div>

              <div class="col-lg-8 combo-products-panel position-relative">
                <div class="d-flex justify-content-between align-items-center gap-3 mb-4">
                  <h5 class="included-title font-serif m-0">Bao Gồm {{ combo.items?.length || 0 }} Tác Phẩm</h5>
                  <div class="d-flex gap-2" v-if="combo.items && combo.items.length > 2">
                    <button class="btn slider-btn" @click="scrollSlider(combo.id, -1)"
                      aria-label="Previous combo items">
                      <i class="bi bi-chevron-left"></i>
                    </button>
                    <button class="btn slider-btn" @click="scrollSlider(combo.id, 1)" aria-label="Next combo items">
                      <i class="bi bi-chevron-right"></i>
                    </button>
                  </div>
                </div>

                <div class="combo-items-slider d-flex gap-3 gap-xl-4 overflow-auto hide-scrollbar pt-2 pb-3"
                  :id="'scroll-container-' + combo.id">
                  <div class="combo-item-card flex-shrink-0" v-for="item in combo.items" :key="item.id">
                    <div class="item-image-frame position-relative overflow-hidden">
                      <div class="item-display-surface"></div>
                      <img :src="getImage(item.product?.thumbnail_image)" class="item-img-hover"
                        :alt="item.product?.name || 'SORA jewelry item'">
                      <div class="position-absolute top-0 end-0 m-2 z-index-2">
                        <span class="quantity-badge shadow-sm">x{{ item.quantity }}</span>
                      </div>
                    </div>
                    <h6 class="item-name font-serif mb-2 text-truncate" :title="item.product?.name">{{
                      item.product?.name }}</h6>
                    <div class="item-meta small mb-2 d-flex align-items-center">
                      <span v-if="item.product_variant_id" class="selection-badge">
                        <i class="bi bi-tag-fill me-1"></i>{{ item.variant?.sku }}
                      </span>
                      <span v-else class="selection-text">
                        <i class="bi bi-sliders me-1"></i>Được chọn phân loại
                      </span>
                    </div>
                    <div class="item-price font-oswald">{{ formatCurrency(item.computedPrice) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <div class="text-center mt-4 mb-2 fade-in" v-if="processedCombos.length > displayLimit">
            <button
              class="btn luxury-outline-cta px-4 py-2 me-2 me-md-3 font-oswald tracking-widest text-uppercase fw-bold"
              @click="loadMore">
              <i class="bi bi-arrow-down-circle me-1"></i> Xem Thêm
            </button>
            <button class="btn luxury-cta px-4 py-2 font-oswald tracking-widest text-uppercase fw-bold"
              @click="loadAll">
              <i class="bi bi-grid-fill me-1"></i> Xem Tất Cả ({{ processedCombos.length }})
            </button>
          </div>
        </div>

        <div v-else class="empty-state text-center fade-in">
          <i class="bi bi-box2-heart fs-1 d-block mb-3 text-champagne opacity-75"></i>
          <h5 class="font-serif">Chưa có gói ưu đãi nào trong danh mục này.</h5>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import clientApiClient from '@/utils/clientApiClient';
import { usePublicRefreshListener } from '@/composables/usePublicRefreshListener.js';
import SoraListSkeleton from '@/components/ui/SoraListSkeleton.vue';
import SoraProductGridSkeleton from '@/components/ui/SoraProductGridSkeleton.vue';


const router = useRouter();
const combos = ref([]);
const isLoading = ref(true);
const activeFilter = ref('all');
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
    const params = {};
    if (gender && gender !== 'all') params.gender = gender;
    const res = await clientApiClient.get('/client/combos', { params, ignoreAuthRedirect: true });

    combos.value = res.data.data.data.map(combo => {
      combo.parsed_start_date = parseDBDate(combo.start_date);
      combo.parsed_end_date = parseDBDate(combo.end_date);

      combo.items = combo.items.map(item => ({
        ...item,
        computedPrice: getItemPrice(item)
      }));

      combo.originalPrice = calculateOriginal(combo.items);
      combo.finalPrice = calculateFinal(combo.originalPrice, combo.discount_type, combo.discount_value);

      return combo;
    });

  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

usePublicRefreshListener({
  combos: () => fetchCombos(activeFilter.value),
});

const filterCombo = (gender) => {
  activeFilter.value = gender;
  displayLimit.value = 2;
  fetchCombos(gender);
};

const goToDetail = (slug) => {
  router.push({ name: 'client-combo-detail', params: { slug } });
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const loadMore = () => {
  displayLimit.value += 2;
};

const loadAll = () => {
  displayLimit.value = processedCombos.value.length;
};

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

  return result.map(combo => ({
    ...combo,
    timerData: computeTimerData(combo, now)
  }));
});

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

.combo-client-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 18%, rgba(231, 206, 125, 0.16), transparent 28%),
    linear-gradient(180deg, #fffaf1 0%, #fbf7ee 42%, #f7efe3 100%);
  color: #2d2020;
}

.font-serif {
  font-family: 'Playfair Display', serif;
}

.font-oswald {
  font-family: 'Oswald', sans-serif;
}

.tracking-wide {
  letter-spacing: 1px;
}

.tracking-widest {
  letter-spacing: 2px;
}

.z-index-2 {
  z-index: 2;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.text-champagne {
  color: #ead089 !important;
}

.text-sora-primary {
  color: #8f2034 !important;
}

.bg-sora-primary {
  background-color: #8f2034 !important;
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
  inset: auto 0 52px;
  text-align: center;
  color: rgba(255, 244, 218, 0.038);
  font-size: clamp(3.4rem, 9vw, 8.8rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1;
  white-space: nowrap;
  z-index: 0;
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

.combo-content-section {
  padding: 42px 0 48px;
}

.filter-group {
  max-width: 100%;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid rgba(197, 158, 74, 0.42);
  border-radius: 999px;
  background: rgba(255, 252, 245, 0.92);
  box-shadow: 0 18px 40px rgba(86, 48, 24, 0.08);
}

.filter-btn {
  border: 1px solid rgba(197, 158, 74, 0.34);
  color: #6b5451;
  background: linear-gradient(180deg, #fffdf8, #f9f0e2);
  font-family: 'Oswald', sans-serif;
  font-weight: 500;
  letter-spacing: 1px;
  padding: 9px 24px;
  border-radius: 999px;
  transition: all 0.25s ease;
  text-transform: uppercase;
  font-size: 0.84rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.86);
}

.filter-btn:hover {
  color: #8f2034;
  border-color: rgba(197, 158, 74, 0.72);
  transform: translateY(-1px);
}

.filter-btn.active {
  color: #fff6df;
  background: linear-gradient(135deg, #7e172b, #a9283f);
  border-color: rgba(231, 206, 125, 0.82);
  box-shadow: 0 12px 24px rgba(126, 23, 43, 0.26), inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.combo-row-card {
  position: relative;
  border: 1px solid rgba(197, 158, 74, 0.36);
  border-radius: 24px;
  background: #fffbf4;
  box-shadow: 0 24px 60px rgba(65, 35, 24, 0.1);
  transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
}

.combo-row-card:hover {
  transform: translateY(-3px);
  border-color: rgba(197, 158, 74, 0.62);
  box-shadow: 0 30px 72px rgba(65, 35, 24, 0.15);
}

.combo-offer-panel {
  min-height: 520px;
  padding: 34px;
  border-right: 1px solid rgba(197, 158, 74, 0.28);
  background: linear-gradient(160deg, rgba(255, 251, 244, 0.94), rgba(248, 236, 219, 0.92));
}

.combo-bg-img {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.08;
  filter: blur(2px) saturate(0.85);
  z-index: 0;
}

.combo-bg-gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 8%, rgba(231, 206, 125, 0.2), transparent 34%),
    linear-gradient(180deg, rgba(255, 252, 246, 0.92), rgba(255, 250, 241, 0.98));
  z-index: 1;
}

.luxury-badge {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 7px 13px;
  border-radius: 999px;
  font-family: 'Oswald', sans-serif;
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.luxury-badge-discount {
  color: #fff7df;
  background: linear-gradient(135deg, #761527, #a8273e);
  border: 1px solid rgba(231, 206, 125, 0.72);
  box-shadow: 0 10px 20px rgba(126, 23, 43, 0.18);
}

.luxury-badge-theme {
  color: #4d3430;
  background: rgba(255, 252, 246, 0.78);
  border: 1px solid rgba(197, 158, 74, 0.44);
}

.combo-title {
  color: #2f2020;
  font-size: clamp(1.65rem, 3vw, 2.25rem);
  line-height: 1.1;
}

.combo-description {
  color: #776360;
  line-height: 1.75;
}

.timer-title {
  color: #3f2d2b;
  font-size: 0.82rem;
}

.timer-title.active {
  color: #8f2034;
}

.time-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 62px;
  height: 68px;
  border: 1px solid rgba(197, 158, 74, 0.46);
  border-radius: 14px;
  background: linear-gradient(180deg, #fffdf8, #f8eddd);
  box-shadow: 0 10px 24px rgba(72, 42, 28, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.time-box .num {
  font-size: 1.45rem;
  font-weight: 600;
  color: #8f2034;
  line-height: 1;
  margin-bottom: 4px;
}

.time-box .label {
  font-size: 0.66rem;
  color: #8b7771;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.old-price {
  color: #9b8a84;
  font-size: 0.88rem;
  font-weight: 500;
}

.new-price {
  color: #8f2034;
  font-size: clamp(1.75rem, 3vw, 2.35rem);
  font-weight: 700;
  line-height: 1.1;
}

.luxury-cta,
.luxury-outline-cta {
  border-radius: 999px;
  position: relative;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
}

.luxury-cta::after,
.luxury-outline-cta::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(45deg) translateY(-200%);
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.luxury-outline-cta::after {
  background: rgba(126, 23, 43, 0.1);
}

.luxury-cta {
  color: #fff5dc;
  background: linear-gradient(135deg, #761527, #9f273b);
  border: 1px solid rgba(231, 206, 125, 0.72);
  box-shadow: 0 14px 26px rgba(126, 23, 43, 0.22);
}

.luxury-cta:hover {
  color: #fffdf4;
  transform: translateY(-2px);
  box-shadow: 0 18px 34px rgba(126, 23, 43, 0.3);
}

.luxury-cta:hover::after,
.luxury-outline-cta:hover::after {
  transform: rotate(45deg) translateY(200%);
}

.luxury-outline-cta {
  color: #7e172b;
  background: rgba(255, 252, 246, 0.9);
  border: 1px solid rgba(197, 158, 74, 0.62);
}

.luxury-outline-cta:hover {
  color: #fff7df;
  background: #7e172b;
  border-color: rgba(231, 206, 125, 0.78);
}

.combo-products-panel {
  padding: 34px;
  background:
    linear-gradient(180deg, rgba(255, 253, 248, 0.98), rgba(255, 249, 240, 0.98)),
    radial-gradient(circle at 92% 8%, rgba(231, 206, 125, 0.12), transparent 28%);
}

.included-title {
  color: #2f2020;
  font-size: 1.28rem;
  line-height: 1.2;
}

.slider-btn {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 50%;
  color: #7e172b;
  background: #fffbf4;
  border: 1px solid rgba(197, 158, 74, 0.5);
  box-shadow: 0 8px 18px rgba(65, 35, 24, 0.08);
}

.slider-btn:hover {
  color: #fff8e6;
  background: #7e172b;
  border-color: rgba(231, 206, 125, 0.72);
}

.combo-item-card {
  width: 220px;
  padding: 14px;
  border: 1px solid rgba(197, 158, 74, 0.34);
  border-radius: 18px;
  background: linear-gradient(180deg, #fffdf8, #fbf3e8);
  box-shadow: 0 16px 36px rgba(65, 35, 24, 0.08);
  transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
}

.combo-item-card:hover {
  transform: translateY(-4px);
  border-color: rgba(197, 158, 74, 0.62);
  box-shadow: 0 22px 44px rgba(65, 35, 24, 0.13);
}

.item-image-frame {
  height: 210px;
  margin-bottom: 14px;
  border-radius: 14px;
  border: 1px solid rgba(197, 158, 74, 0.28);
  background:
    radial-gradient(circle at 50% 78%, rgba(130, 39, 53, 0.12), transparent 36%),
    linear-gradient(145deg, #fffaf1, #efe1cf);
  position: relative;
  overflow: hidden;
}

.item-display-surface {
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: 17px;
  height: 34px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(122, 87, 74, 0.24), rgba(122, 87, 74, 0));
  filter: blur(2px);
}

.item-img-hover {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  padding: 0;
  transition: transform 0.45s ease;
}

.combo-item-card:hover .item-img-hover {
  transform: scale(1.045);
}

.quantity-badge {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff7df;
  background: #2d2020;
  border: 1px solid rgba(231, 206, 125, 0.78);
  font-family: 'Oswald', sans-serif;
  font-size: 0.86rem;
  box-shadow: 0 8px 18px rgba(45, 32, 32, 0.22);
}

.item-name {
  color: #2f2020;
  font-size: 1rem;
  font-weight: 700;
}

.item-meta {
  min-height: 24px;
  color: #7f6b66;
}

.selection-badge {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 4px 9px;
  border-radius: 999px;
  color: #69534f;
  background: rgba(255, 252, 246, 0.84);
  border: 1px solid rgba(197, 158, 74, 0.38);
}

.selection-text {
  color: #8f2034;
  font-weight: 600;
}

.item-price {
  color: #8f2034;
  font-size: 1.1rem;
  font-weight: 700;
}

.ended-overlay {
  position: absolute;
  inset: 0;
  background: rgba(45, 19, 24, 0.78);
  backdrop-filter: blur(4px);
  z-index: 10;
}

.empty-state {
  padding: 72px 24px;
  color: #7b6560;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.fade-in {
  animation: fadeIn 0.4s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@media (max-width: 991.98px) {
  .sora-banner {
    min-height: 340px;
  }

  .banner-line-art {
    opacity: 0.45;
  }

  .combo-content-section {
    padding-top: 32px;
  }

  .combo-offer-panel {
    min-height: auto;
    border-right: 0;
    border-bottom: 1px solid rgba(197, 158, 74, 0.28);
  }
}

@media (max-width: 767.98px) {
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
    font-size: 3rem;
    white-space: normal;
  }

  .filter-group {
    width: 100%;
    border-radius: 24px;
  }

  .filter-btn {
    flex: 1 1 calc(50% - 8px);
    padding-inline: 12px;
  }

  .combo-row-card {
    border-radius: 20px;
  }

  .combo-offer-panel,
  .combo-products-panel {
    padding: 24px;
  }

  .time-box {
    width: 58px;
    height: 64px;
  }

  .combo-item-card {
    width: 190px;
    padding: 12px;
  }

  .item-image-frame {
    height: 184px;
  }

  .luxury-outline-cta,
  .luxury-cta {
    width: 100%;
    margin: 0 0 10px !important;
  }
}

@media (max-width: 420px) {

  .combo-offer-panel,
  .combo-products-panel {
    padding: 20px;
  }

  .time-box {
    width: 52px;
    height: 60px;
  }

  .time-box .num {
    font-size: 1.25rem;
  }

  .combo-item-card {
    width: 176px;
  }

  .item-image-frame {
    height: 172px;
  }
}
</style>
