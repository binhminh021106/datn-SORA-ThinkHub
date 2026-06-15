<template>
  <div class="luxury-related-card bg-white d-flex flex-column group position-relative overflow-hidden border border-light-subtle h-100">
    
    <div class="position-relative bg-light text-center border-bottom border-light-subtle sora-img-container" :class="{'has-hover-image': showHoverImage && hasHoverImage(product)}">
      
      <!-- Compare Button -->
      <button
        type="button"
        v-if="showCompare"
        @click.stop="handleCompareClick"
        class="compare-btn position-absolute top-0 start-0 m-3 z-index-2 border-0 bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center"
        style="width: 38px; height: 38px; z-index: 10;"
        :class="{ 'active': isInCompare }"
        :title="isInCompare ? 'Bỏ so sánh' : 'Thêm so sánh'"
      >
        <i class="bi bi-arrow-left-right fs-6 transition-colors" style="margin-top: 2px;"></i>
      </button>

      <!-- Wishlist Button -->
      <button
        type="button"
        v-if="showWishlist"
        @click.stop="$emit('toggle-wishlist', product)"
        class="wishlist-btn position-absolute top-0 end-0 m-3 z-index-2 border-0 bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center"
        style="width: 38px; height: 38px; z-index: 10;"
        :aria-label="isInWishlist ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'"
        :aria-pressed="isInWishlist"
      >
        <i :class="heartIconClass" class="fs-5 transition-colors" style="margin-top: 2px;"></i>
      </button>

      <div v-if="showBadges" class="position-absolute start-0 d-flex flex-column gap-2 z-index-2 pointer-events-none text-start" :style="{ top: showCompare ? '60px' : '15px', left: '15px' }">
        <span v-if="product.is_new" class="badge bg-white text-dark border border-light-subtle shadow-sm font-oswald tracking-widest px-2 py-1 rounded-0" style="font-size: 0.65rem;">MỚI</span>
        <span v-if="product.promotional_price" class="badge text-white shadow-sm font-oswald tracking-widest px-2 py-1 rounded-0" style="background-color: #cc1e2e; font-size: 0.65rem;">SALE</span>
      </div>

      <router-link
        :to="{ name: 'productDetail', params: { shop_slug: shopSlug, slug: product.slug } }"
        class="d-block w-100 text-decoration-none"
      >
        <div class="ratio ratio-1x1 w-100 overflow-hidden">
          <img
            :src="getImageUrl(product.thumbnail_image)"
            :alt="product.name"
            class="sora-main-img object-fit-cover w-100 h-100 bg-white"
            style="object-position: center;"
            @error="handleImageError"
          >
          <img
            v-if="showHoverImage && hasHoverImage(product)"
            :src="getImageUrl(product.hover_image)"
            :alt="product.name + ' hover'"
            class="sora-hover-img position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
            style="object-position: center;"
          >
        </div>
      </router-link>

      <div class="theme-bar position-absolute bottom-0 start-0 bg-sora-primary z-index-2"></div>
    </div>

    <div class="position-relative flex-grow-1 bg-white d-flex flex-column">
      <div class="p-4 text-start d-flex flex-column flex-grow-1" style="padding-bottom: 64px !important;">
        <router-link
          :to="{ name: 'productDetail', params: { shop_slug: shopSlug, slug: product.slug } }"
          class="text-decoration-none flex-grow-1 d-flex flex-column justify-content-center"
        >
          <h6 class="text-dark font-oswald text-uppercase tracking-widest fw-bold mb-2 text-truncate-2 fs-5 lh-base">{{ product.name }}</h6>
          
          <div class="d-flex justify-content-between align-items-center mb-2">
            <p class="font-serif fst-italic text-muted small mb-0">{{ product.category?.name || 'Trang sức SORA' }}</p>
            
            <!-- Luxury constraint: Show only one badge (Scarcity > Sold Count > In Stock) -->
            <span v-if="product.stock_quantity > 0 && product.stock_quantity <= 5" class="small font-oswald text-uppercase tracking-widest" style="font-size: 0.7rem; color: #cc1e2e;">
              Còn {{ product.stock_quantity }}
            </span>
            <span v-else-if="product.sold_count > 0" class="small text-muted font-oswald text-uppercase tracking-widest" style="font-size: 0.7rem;">
              Đã bán {{ product.sold_count }}
            </span>
            <span v-else class="small text-success font-oswald text-uppercase tracking-widest opacity-75" style="font-size: 0.7rem;">
              Sẵn hàng
            </span>
          </div>
          
          <div class="d-flex justify-content-start align-items-center mb-3 gap-1" style="color: #e7ce7d; font-size: 0.9rem;">
            <i v-for="n in 5" :key="n" class="bi" :class="n <= Math.round(getProtectedRating(product.rating_avg || product.rating, product.reviews_count || product.reviews?.length)) ? 'bi-star-fill' : 'bi-star text-muted'"></i>
            <span class="small text-muted ms-1 font-oswald">({{ getProtectedRating(product.rating_avg || product.rating, product.reviews_count || product.reviews?.length).toFixed(1) }})</span>
          </div>
        </router-link>

        <div class="mt-auto">
          <div class="d-flex align-items-center justify-content-between">
            <template v-if="priceInfo.isRange">
              <div class="d-flex align-items-baseline gap-2 flex-wrap w-100">
                <span class="text-sora-primary fw-bold font-oswald fs-5 text-truncate" :title="`${formatCurrency(priceInfo.min)} - ${formatCurrency(priceInfo.max)}`" style="font-size: 1.1rem !important;">{{ formatCompactPrice(priceInfo.min) }} - {{ formatCompactPrice(priceInfo.max) }}</span>
              </div>
            </template>
            <template v-else>
              <div class="d-flex align-items-baseline gap-2 flex-wrap">
                <span class="text-sora-primary fw-bold font-oswald fs-5">{{ formatCurrency(priceInfo.price) }}</span>
                <span v-if="priceInfo.oldPrice" class="text-muted text-decoration-line-through small fw-light font-oswald" style="font-size: 0.85rem;">
                  {{ formatCurrency(priceInfo.oldPrice) }}
                </span>
              </div>
              
              <div v-if="priceInfo.discount" class="badge text-white font-oswald tracking-widest px-2 py-1 rounded-0" style="background-color: #cc1e2e; font-size: 0.65rem;">
                -{{ priceInfo.discount }}%
              </div>
            </template>
          </div>
        </div>

        <!-- Add to Cart Button -->
        <div v-if="showAddToCart" :class="['related-btn-add', { 'hover-only': hoverAddToCart }]">
          <button
            type="button"
            @click.stop="handleQuickAddClick"
            class="btn luxury-btn-solid w-100 rounded-0 py-3 font-oswald tracking-widest text-uppercase fw-bold shadow-none fs-6 d-flex align-items-center justify-content-center"
          >
            <span class="cart-icon-wrapper d-flex align-items-center justify-content-center overflow-hidden">
              <i class="bi bi-cart-plus fs-5 text-white"></i>
            </span>
            <span>Thêm vào giỏ</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import { globalModalState } from '@/stores/modalState';
import Toast from '@/utils/toastConfig';
import { getStorageUrl } from '@/utils/env';
import { getProtectedRating, formatCompactPrice } from '@/composables/useUtilities';

const props = defineProps({
  product: { type: Object, required: true },
  showWishlist: { type: Boolean, default: true },
  showAddToCart: { type: Boolean, default: true },
  showCompare: { type: Boolean, default: true }, 
  hoverAddToCart: { type: Boolean, default: false },
  showHoverImage: { type: Boolean, default: true },
  showBadges: { type: Boolean, default: true },
  isInWishlist: { type: Boolean, default: false },
  isInCompare: { type: Boolean, default: false },
  shopSlug: { type: String, default: 'sora' }
});

const emit = defineEmits(['toggle-wishlist']);

const priceInfo = computed(() => {
  const p = props.product;
  if (p.variants && p.variants.length > 0) {
    const prices = p.variants
      .map(v => Number(v.promotional_price ?? v.price ?? p.base_price))
      .filter(v => Number.isFinite(v) && v > 0);

    if (prices.length === 0) {
      return { isRange: false, price: 0, oldPrice: null, discount: 0 };
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min !== max && !isNaN(min) && !isNaN(max)) {
      return { isRange: true, min, max };
    }
    return { isRange: false, price: min, oldPrice: null, discount: 0 };
  }
  return {
    isRange: false,
    price: Number(p.promotional_price || p.base_price || 0),
    oldPrice: Number(p.promotional_price) > 0 && Number(p.promotional_price) < Number(p.base_price) ? Number(p.base_price) : null,
    discount: Number(p.promotional_price) > 0 && Number(p.promotional_price) < Number(p.base_price) ? Math.round((Number(p.base_price) - Number(p.promotional_price)) / Number(p.base_price) * 100) : 0
  };
});

const heartIconClass = computed(() => {
  return props.isInWishlist
    ? 'bi bi-suit-heart-fill text-danger'
    : 'bi bi-suit-heart text-muted hover-text-accent';
});

const handleQuickAddClick = () => {
  globalModalState.openQuickAdd(props.product);
};

const handleCompareClick = () => {
  globalModalState.openCompare(props.product);
};

const formatCurrencyNoSymbol = (val) => {
  return new Intl.NumberFormat('vi-VN').format(val || 0);
};

const formatCurrency = (val) => {
  if (!val || isNaN(val)) return 'Liên hệ';
  return `${formatCurrencyNoSymbol(val)} đ`;
};

const getImageUrl = (path) => {
  return getStorageUrl(path);
};

const handleImageError = (e) => {
  e.target.src = '/Sora-placeholder.png';
};

const hasHoverImage = (product) => {
  return product.hover_image && product.hover_image !== product.thumbnail_image;
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

.text-sora-primary { color: #9f273b !important; }
.bg-sora-primary { background-color: #9f273b !important; }
.font-serif { font-family: 'Playfair Display', serif; }
.font-oswald { font-family: 'Oswald', sans-serif; }
.font-luxury { font-family: 'Playfair Display', serif; }
.tracking-widest { letter-spacing: 2px; }
.z-index-2 { z-index: 2; }
.z-index-3 { z-index: 3; }
.pointer-events-none { pointer-events: none; }

.luxury-related-card {
  transition: all 0.4s ease;
  border-color: #eaeaea !important;
}

.luxury-related-card:hover {
  box-shadow: 0 15px 35px rgba(0,0,0,0.06);
  border-color: #d1d5db !important;
}

.sora-main-img, .sora-hover-img {
  transition: transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease-in-out !important;
}

.group:hover .sora-main-img,
.group:hover .sora-hover-img {
  transform: scale(1.08);
}

.sora-hover-img { opacity: 0; z-index: 2; }
.has-hover-image:hover .sora-hover-img { opacity: 1; }

.theme-bar {
  width: 0;
  height: 3px;
  background-color: #9f273b;
  transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  left: 0;
}
.luxury-related-card:hover .theme-bar {
  width: 30%;
}

.wishlist-btn, .compare-btn {
  opacity: 0;
  transition: all 0.25s ease;
  pointer-events: none;
  color: #6c757d;
}
.luxury-related-card:hover .wishlist-btn,
.luxury-related-card:hover .compare-btn {
  opacity: 1;
  pointer-events: auto;
}
.wishlist-btn:hover { color: #cc1e2e; transform: scale(1.1); }
.compare-btn:hover { color: #9f273b; transform: scale(1.1); }

.compare-btn.active { background-color: #9f273b !important; color: #fff !important; opacity: 1; }
.compare-btn.active i { color: #fff !important; }

.related-btn-add {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  z-index: 3;
  background: white;
}
.luxury-related-card:hover .related-btn-add {
  transform: translateY(0);
}

.luxury-btn-solid {
  background-color: #9f273b;
  color: white;
  border: 1px solid #9f273b;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.luxury-btn-solid:hover {
  background-color: #cc1e2e;
  border-color: #cc1e2e;
  color: white;
  box-shadow: 0 8px 20px rgba(204,30,46,0.3);
}

.cart-icon-wrapper {
  max-width: 0;
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.luxury-btn-solid:hover .cart-icon-wrapper {
  max-width: 30px;
  opacity: 1;
  margin-right: 8px;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.8rem;
}
</style>
