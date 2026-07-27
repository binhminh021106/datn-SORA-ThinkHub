<template>
  <div class="sora-combo-carousel" v-if="formattedCombos.length > 0">
    <!-- Cards Track -->
    <div class="combo-track-new">
      <div v-for="(combo, index) in formattedCombos" :key="combo.id" class="combo-card-wrapper"
        :style="getComboCardStyle(index)" @click="comboGoToSlide(index)">

        <div class="combo-card-inner">

          <div class="combo-left-panel">
            <div class="combo-bg-image" :style="{ backgroundImage: `url(${combo.comboImage})` }"></div>
            <div v-if="combo.discountAmount && combo.discountAmount !== '0 đ'" class="luxury-discount-tag">
              GIẢM {{ combo.discountAmount }}
            </div>
            <div class="combo-bg-overlay"></div>

            <div class="combo-left-content">
              <h2 class="combo-title font-serif">{{ combo.title }}</h2>

              <div class="combo-badges mb-3 d-flex flex-wrap gap-2">
                <span class="badge-red">{{ combo.badge }}</span>
                <span class="badge-light">SỐ LƯỢNG CÓ HẠN</span>
              </div>

              <div class="combo-countdown" v-if="combo.endDate">
                <p class="countdown-label">Thời gian còn lại</p>
                <div class="countdown-boxes">
                  <div class="time-box">
                    <div class="time-value font-sans">{{ String(timeLeft.days).padStart(2, '0') }}</div>
                    <span class="time-label">Ngày</span>
                  </div>
                  <span class="time-separator font-serif">:</span>
                  <div class="time-box">
                    <div class="time-value font-sans">{{ String(timeLeft.hours).padStart(2, '0') }}</div>
                    <span class="time-label">Giờ</span>
                  </div>
                  <span class="time-separator font-serif">:</span>
                  <div class="time-box">
                    <div class="time-value font-sans">{{ String(timeLeft.minutes).padStart(2, '0') }}</div>
                    <span class="time-label">Phút</span>
                  </div>
                  <span class="time-separator font-serif">:</span>
                  <div class="time-box">
                    <div class="time-value font-sans">{{ String(timeLeft.seconds).padStart(2, '0') }}</div>
                    <span class="time-label">Giây</span>
                  </div>
                </div>
              </div>

              <div class="combo-pricing">
                <div class="price-row">
                  <span class="original-price font-sans" v-if="combo.discountAmount && combo.discountAmount !== '0 đ'">{{ combo.originalPrice }}</span>
                  <span class="discount-price font-sans fw-bold">{{ combo.discountPrice }}</span>
                </div>
              </div>

              <router-link :to="{ name: 'client-combo-detail', params: { slug: combo.slug } }"
                class="editorial-btn text-decoration-none mt-2">
                <i class="bi bi-arrow-right-circle btn-icon me-2"></i>
                <span> Xem chi tiết</span>
              </router-link>
            </div>
          </div>

          <div class="combo-right-panel">
            <h3 class="combo-products-title font-serif">
              <span class="diamond">✧</span> Bao gồm {{ combo.products.length }} sản phẩm <span class="diamond">✧</span>
            </h3>

            <div class="combo-products-scroll no-scrollbar scroll-mask">
              <div class="products-stack">
                <div v-for="(product, pIndex) in combo.products" :key="pIndex" class="combo-product-item">

                  <div class="product-img-box">
                    <img :src="product.image" :alt="product.name" @error="handleImageError" />
                    <div class="product-qty">{{ product.quantity }}</div>
                  </div>

                  <div class="product-info">
                    <h4 class="font-serif text-truncate mb-1" style="font-size: 0.95rem;">{{ product.name }}</h4>
                    <p class="text-truncate mb-1"
                      style="font-size: 10px; color: rgba(255, 255, 255, 0.7); font-family: 'Manrope', sans-serif;">{{ product.code
                      }}</p>
                    <strong class="font-sans text-gold-gradient" style="font-size: 14px; font-weight: 700;">{{ product.price
                    }}</strong>
                  </div>

                </div>
              </div>
            </div>

            <div v-if="combo.products.length > 3" class="combo-scroll-hint">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14" />
                <path d="m19 12-7 7-7-7" />
              </svg>
              Cuộn để xem thêm
            </div>
          </div>

        </div>

        <div v-if="comboCurrentIndex !== index" class="combo-overlay"></div>
      </div>
    </div>

    <button @click="comboPrev" class="combo-nav-btn nav-prev group">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="group-hover">
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>
    <button @click="comboNext" class="combo-nav-btn nav-next group">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="group-hover">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  </div>

  <div class="combo-pagination" v-if="formattedCombos.length > 0">
    <button v-for="(_, index) in formattedCombos" :key="'dot' + index" @click="comboGoToSlide(index)"
      :class="['combo-dot', { 'active': comboCurrentIndex === index }]">
    </button>
  </div>
</template>

<script setup>
import { reactive, onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { getStorageUrl } from '@/utils/env';

const props = defineProps({
  combos: {
    type: Array,
    required: true,
    default: () => []
  }
});

const soraPlaceholder = '/Sora-placeholder.png';
const windowWidth = ref(window.innerWidth);
const comboCurrentIndex = ref(0);
let comboAutoplayTimer = null;
let comboIntervalTimer = null;
const timeLeft = reactive({ days: 0, hours: 0, minutes: 0, seconds: 0 });

const getImageUrl = (path) => {
  return getStorageUrl(path, soraPlaceholder);
};

const formatPrice = (value) => {
  if (!value) return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace('₫', 'đ');
};

const handleImageError = (e) => {
  e.target.src = soraPlaceholder;
};

const parseDBDate = (dateStr) => {
  if (!dateStr) return null;
  const cleanStr = dateStr.replace(' ', 'T').substring(0, 19);
  return new Date(cleanStr).getTime();
};

const getItemPrice = (item) => {
  if (item.product_variant_id && item.variant) return parseFloat(item.variant.price);
  return item.product ? parseFloat(item.product.base_price) : 0;
};

const formattedCombos = computed(() => {
  if (!props.combos || !Array.isArray(props.combos)) return [];

  const now = new Date().getTime();

  const validCombos = props.combos.filter(c => {
    const endDate = parseDBDate(c.end_date);
    return !endDate || endDate > now;
  });

  return validCombos.map(combo => {
    const rawItems = combo.items || combo.products || [];
    let originalTotal = 0;

    const products = rawItems.map(item => {
      if (item.product || item.variant) {
        const product = item.product || {};
        const variant = item.variant || {};
        const price = getItemPrice(item);
        originalTotal += price * (item.quantity || 1);

        return {
          name: product.name || 'Tác phẩm SORA',
          code: variant.sku || 'Tùy chọn phân loại',
          price: formatPrice(price),
          quantity: item.quantity || 1,
          image: getImageUrl(variant.image_url || product.thumbnail_image)
        };
      }

      const promo = parseFloat(item.promotional_price);
      const base = parseFloat(item.price || item.base_price);
      const price = promo > 0 ? promo : (base > 0 ? base : 0);
      originalTotal += price * (item.quantity || 1);

      return {
        name: item.name || 'Tác phẩm SORA',
        code: item.code || item.sku || 'Tùy chọn phân loại',
        price: formatPrice(price),
        quantity: item.quantity || 1,
        image: getImageUrl(item.thumbnail_image || item.image)
      };
    });

    const basePrice = Number(combo.base_price || originalTotal || 0);
    const promoPrice = Number(combo.promotional_price != null ? combo.promotional_price : basePrice);
    const discountPercent = basePrice > promoPrice ? Math.round(((basePrice - promoPrice) / basePrice) * 100) : 0;
    const discountAmount = discountPercent > 0 ? `${discountPercent}%` : formatPrice(Math.max(0, basePrice - promoPrice));

    return {
      ...combo,
      badge: combo.theme || combo.target_gender || 'Ưu Đãi Đặc Quyền',
      title: combo.name,
      slug: combo.slug,
      originalPrice: formatPrice(basePrice),
      discountPrice: formatPrice(promoPrice),
      discountAmount: discountPercent > 0 ? `${discountPercent}%` : discountAmount,
      products: products,
      endDate: parseDBDate(combo.end_date),
      comboImage: getImageUrl(combo.thumbnail_image || combo.image)
    };
  });
});

const updateCountdown = () => {
  if (formattedCombos.value.length === 0) return;
  const currentCombo = formattedCombos.value[comboCurrentIndex.value];
  if (!currentCombo || !currentCombo.endDate) {
    timeLeft.days = timeLeft.hours = timeLeft.minutes = timeLeft.seconds = 0;
    return;
  }
  const now = new Date().getTime();
  const distance = currentCombo.endDate - now;

  if (distance < 0) {
    timeLeft.days = timeLeft.hours = timeLeft.minutes = timeLeft.seconds = 0;
    return;
  }

  timeLeft.days = Math.floor(distance / (1000 * 60 * 60 * 24));
  timeLeft.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  timeLeft.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  timeLeft.seconds = Math.floor((distance % (1000 * 60)) / 1000);
};

const comboNext = () => {
  if (formattedCombos.value.length === 0) return;
  comboCurrentIndex.value = (comboCurrentIndex.value + 1) % formattedCombos.value.length;
  comboResetAutoplay();
  updateCountdown();
};

const comboPrev = () => {
  if (formattedCombos.value.length === 0) return;
  comboCurrentIndex.value = (comboCurrentIndex.value - 1 + formattedCombos.value.length) % formattedCombos.value.length;
  comboResetAutoplay();
  updateCountdown();
};

const comboGoToSlide = (index) => {
  comboCurrentIndex.value = index;
  comboResetAutoplay();
  updateCountdown();
};

const comboStartAutoplay = () => {
  comboAutoplayTimer = setInterval(comboNext, 6000);
};

const comboResetAutoplay = () => {
  clearInterval(comboAutoplayTimer);
  comboStartAutoplay();
};

const getComboCardStyle = (index) => {
  const total = formattedCombos.value.length;
  if (total === 0) return {};
  const diff = (index - comboCurrentIndex.value + total) % total;
  const isMobile = windowWidth.value < 768;
  const shiftPercent = isMobile ? '12%' : '45%';

  if (diff === 0) {
    return { left: '50%', top: '50%', transform: 'translate(-50%, -50%) scale(1)', zIndex: 30, opacity: 1, boxShadow: '0 25px 50px -12px rgba(var(--sora-primary-rgb), 0.2)' };
  } else if (diff === 1 || (total === 2 && diff === 1)) {
    return { left: '50%', top: '50%', transform: `translate(calc(-50% + ${shiftPercent}), -50%) scale(0.88)`, zIndex: 20, opacity: 0.6, boxShadow: 'none' };
  } else if (diff === total - 1) {
    return { left: '50%', top: '50%', transform: `translate(calc(-50% - ${shiftPercent}), -50%) scale(0.88)`, zIndex: 20, opacity: 0.6, boxShadow: 'none' };
  } else {
    return { left: '50%', top: '50%', transform: 'translate(-50%, -50%) scale(0.75)', zIndex: 10, opacity: 0, pointerEvents: 'none' };
  }
};

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

watch(() => props.combos, (newVal) => {
    clearInterval(comboAutoplayTimer);
    if (Array.isArray(newVal) && newVal.length > 0) {
        comboStartAutoplay();
        updateCountdown();
    }
}, { immediate: true });

onMounted(() => {
  window.addEventListener('resize', handleResize);
  updateCountdown();
  if (!comboIntervalTimer) {
      comboIntervalTimer = setInterval(updateCountdown, 1000);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  clearInterval(comboAutoplayTimer);
  clearInterval(comboIntervalTimer);
});
</script>

<style scoped>

.badge-red {
  padding: 0.35rem 1rem;
  background-color: var(--sora-primary);
  color: #fff;
  border-radius: 50px;
  font-family: 'Manrope', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.badge-light {
  padding: 0.35rem 1rem;
  background-color: rgba(var(--sora-secondary-rgb), 0.2);
  color: #2a1810;
  border-radius: 50px;
  font-family: 'Manrope', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.combo-title {
  color: var(--sora-primary);
  font-size: clamp(1.4rem, 2vw, 1.8rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.combo-countdown {
  margin-bottom: 0.5rem;
}

.countdown-label {
  color: #8b7a6a;
  font-family: 'Manrope', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.countdown-boxes {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.time-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-value {
  width: 56px;
  height: 56px;
  background-color: #fff;
  border: 1px solid rgba(var(--sora-secondary-rgb), 0.6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sora-primary);
  font-size: 1.5rem;
  font-weight: 700;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.time-label {
  margin-top: 0.5rem;
  color: #8b7a6a;
  font-family: 'Manrope', sans-serif;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.time-separator {
  color: var(--sora-secondary);
  font-size: 1.5rem;
  margin-top: -1.25rem;
}

.combo-pricing {
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(var(--sora-secondary-rgb), 0.2);
}

.luxury-discount-tag {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background-color: var(--sora-primary);
  color: #fff;
  padding: 0.4rem 1rem;
  border-radius: 4px;
  font-family: 'Manrope', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  z-index: 5;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.original-price {
  text-decoration: line-through;
  color: #8b7a6a;
  font-size: 1.125rem;
}

.discount-price {
  color: var(--sora-primary);
  font-size: 2rem;
}

.combo-products-title {
  color: var(--sora-primary);
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-bottom: 1px solid rgba(231, 206, 125, 0.3);
  padding-bottom: 0.75rem;
}

.combo-products-title .diamond {
  color: var(--sora-secondary);
  font-size: 1.1rem;
}

.combo-products-scroll {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 0.5rem;
  padding-right: 0.25rem;
  margin-right: -0.25rem;
}

.products-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0.25rem;
}

.combo-product-item {
  background-color: var(--sora-primary);
  color: #fff;
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  border: 1px solid rgba(231, 206, 125, 0.3); /* secondary gold border */
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(159, 39, 59, 0.2);
}

.combo-product-item:hover {
  border-color: var(--sora-secondary);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(159, 39, 59, 0.4);
}

.product-img-box {
  position: relative;
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(135deg, #f9f9f9, #f1f1f1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.product-img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  mix-blend-mode: multiply;
}

.product-qty {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background-color: #fff;
  color: var(--sora-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-info h4 {
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
}

.combo-scroll-hint {
  margin-top: 0.5rem;
  text-align: center;
  color: #8b7a6a;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.combo-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(250, 248, 245, 0.1);
  z-index: 20;
  border-radius: 24px;
}

.combo-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px);
  color: #fff;
  border-radius: 50%;
  border: 1px solid rgba(var(--sora-secondary-rgb), 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 40;
  padding: 0;
}

.combo-nav-btn:hover {
  background: var(--sora-primary);
  color: #fff;
  border-color: var(--sora-secondary);
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.combo-nav-btn .group-hover {
  transition: transform 0.3s ease;
}

.combo-nav-btn.nav-prev:hover .group-hover {
  transform: translateX(-2px);
}

.combo-nav-btn.nav-next:hover .group-hover {
  transform: translateX(2px);
}

.nav-prev {
  left: 2rem;
}

.nav-next {
  right: 2rem;
}

.combo-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-top: 2rem;
}

.combo-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(var(--sora-secondary-rgb), 0.5);
  border: none;
  transition: all 0.3s ease;
  padding: 0;
}

.combo-dot:hover {
  background-color: var(--sora-secondary);
}

.combo-dot.active {
  width: 40px;
  border-radius: 10px;
  background-color: var(--sora-primary);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scroll-mask {
  mask-image: linear-gradient(to bottom, transparent, black 10px, black calc(100% - 10px), transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 10px, black calc(100% - 10px), transparent);
}

.sora-combo-carousel {
  position: relative;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.combo-track-new {
  position: relative;
  width: 100%;
  max-width: 1000px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1200px;
}

.combo-card-wrapper {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100%;
  height: 95%;
  transform: translate(-50%, -50%) scale(0.85);
  transition: transform 0.7s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.7s ease, box-shadow 0.7s ease, z-index 0s;
  cursor: pointer;
  border-radius: 24px;
}

.combo-card-inner {
  background-color: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(var(--sora-secondary-rgb), 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: row;
  height: 100%;
}

.combo-left-panel {
  width: 50%;
  padding: 0;
  position: relative;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;
}

.combo-bg-image {
  position: relative;
  width: 100%;
  height: 52%;
  inset: auto;
  background-size: cover;
  background-position: center;
  z-index: 0;
  transition: transform 0.7s ease;
}

.combo-card-wrapper:hover .combo-bg-image {
  transform: scale(1.05);
}

.combo-bg-overlay {
  display: none;
}

.combo-left-content {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 1.5rem 2.5rem;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.combo-right-panel {
  width: 50%;
  padding: 2.5rem 3.5rem;
  background-color: #faf8f5;
  border-left: 1px solid rgba(var(--sora-secondary-rgb), 0.2);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

@media (max-width: 1199.98px) {
  .nav-prev { left: 1rem; }
  .nav-next { right: 1rem; }
}

@media (max-width: 991.98px) {
  .sora-combo-carousel { height: 700px; }
  .combo-card-wrapper { width: 95%; }
  .combo-left-panel, .combo-right-panel { padding: 1.5rem; }
  .combo-left-content { padding: 1.5rem; padding-top: 4rem; }
  .time-value { width: 48px; height: 48px; font-size: 1.25rem; }
  .nav-prev { left: 0.5rem; }
  .nav-next { right: 0.5rem; }
  .product-img-box { width: 80px; height: 80px; }
}

@media (max-width: 767.98px) {
  .sora-combo-carousel { 
    height: auto; 
    padding: 0;
    margin-bottom: 2rem;
    display: block;
  }
  .combo-track-new {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 1rem;
    padding: 1rem;
    padding-bottom: 2rem;
    -ms-overflow-style: none;
    scrollbar-width: none;
    height: auto;
    perspective: none;
  }
  .combo-track-new::-webkit-scrollbar {
    display: none;
  }
  .combo-card-wrapper {
    position: relative;
    left: auto !important;
    top: auto !important;
    width: 90vw;
    flex: 0 0 auto;
    height: auto;
    transform: none !important;
    scroll-snap-align: center;
    opacity: 1 !important;
    z-index: 1 !important;
    box-shadow: 0 10px 30px rgba(var(--sora-primary-rgb), 0.15) !important;
    pointer-events: auto !important;
  }
  .combo-card-inner { flex-direction: column; height: auto; }
  .combo-left-panel, .combo-right-panel { width: 100%; }
  .combo-left-panel { 
    height: auto; 
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  .combo-bg-image {
    position: relative;
    height: 240px !important;
    width: 100%;
    inset: auto;
  }
  .combo-bg-overlay { display: none !important; }
  .combo-left-content { 
    padding: 1.25rem !important; 
    padding-top: 1rem !important;
    background-color: #ffffff;
  }
  .combo-title {
    font-size: 1.35rem !important;
    margin-bottom: 0.5rem !important;
  }
  .combo-badges {
    margin-bottom: 1rem !important;
  }
  .time-value {
    width: 45px !important;
    height: 45px !important;
    font-size: 1.1rem !important;
    border-radius: 8px !important;
  }
  .countdown-boxes {
    gap: 0.4rem !important;
  }
  .time-separator {
    margin-top: -1rem !important;
  }
  .discount-price {
    font-size: 1.6rem !important;
  }
  .original-price {
    font-size: 1.05rem !important;
  }
  .combo-right-panel {
    border-left: none;
    border-top: 1px dashed rgba(var(--sora-secondary-rgb), 0.3);
    padding: 1.25rem !important;
    height: auto;
  }
  .combo-products-title {
    font-size: 1.15rem !important;
    margin-bottom: 0.75rem !important;
  }
  .product-img-box {
    width: 72px !important;
    height: 72px !important;
  }
  .combo-nav-btn { display: none; }
  .combo-overlay { display: none !important; }
  .combo-products-scroll { height: auto; max-height: 250px; }
}

</style>
