<template>
  <div class="luxury-related-card d-flex flex-column group position-relative overflow-hidden h-100" style="background-color: #ffffff !important; border: 1px solid #eaeaea; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); transition: all 0.35s ease;">
    
    <div class="position-relative bg-white text-center border-bottom sora-img-container" style="border-color: #f8f9fa !important;" :class="{'has-hover-image': showHoverImage && hasHoverImage(product)}">
      
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
        @click.stop="handleWishlistClick"
        class="wishlist-btn position-absolute top-0 end-0 m-3 z-index-2 border-0 bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center"
        style="width: 38px; height: 38px; z-index: 10;"
        :aria-label="isInWishlist ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'"
        :aria-pressed="isInWishlist"
      >
        <i :class="heartIconClass" class="fs-5 transition-colors" style="margin-top: 2px;"></i>
      </button>

      <div v-if="showBadges" class="position-absolute start-0 d-flex flex-column gap-2 z-index-3 pointer-events-none text-start" :style="{ top: showCompare ? '60px' : '15px', left: '15px' }">
        <span v-if="product.is_new && !isOutOfStock" class="badge bg-white text-dark border border-light-subtle shadow-sm font-oswald tracking-widest px-2 py-1 rounded-0" style="font-size: 0.65rem;">MỚI</span>
        <span v-if="product.promotional_price && !isOutOfStock" class="badge text-white shadow-sm font-oswald tracking-widest px-2 py-1 rounded-0" style="background-color: #cc1e2e; font-size: 0.65rem;">SALE</span>
      </div>

      <router-link
        :to="{ name: 'productDetail', params: { shop_slug: shopSlug, slug: product.slug } }"
        class="d-block w-100 text-decoration-none"
      >
        <div class="ratio ratio-1x1 w-100 overflow-hidden position-relative">
          <div v-if="isOutOfStock" class="position-absolute w-100 h-100 d-flex align-items-center justify-content-center pointer-events-none" style="background-color: rgba(255, 255, 255, 0.4); z-index: 3; top: 0; left: 0;">
             <div class="sold-out-overlay font-oswald tracking-widest text-uppercase px-4 py-2 shadow-sm" style="background-color: rgba(42, 24, 16, 0.85); color: #e7ce7d; font-size: 0.85rem; letter-spacing: 4px; border: 1px solid rgba(231, 206, 125, 0.3);">
               ĐÃ BÁN HẾT
             </div>
          </div>
          <img
            :src="getImageUrl(product.thumbnail_image)"
            :alt="product.name"
            class="sora-main-img object-fit-cover w-100 h-100 bg-white"
            :class="{ 'opacity-75': isOutOfStock }"
            style="object-position: center;"
            @error="handleImageError"
          >
          <img
            v-if="showHoverImage && hasHoverImage(product) && !isOutOfStock"
            :src="getImageUrl(product.hover_image)"
            :alt="product.name + ' hover'"
            class="sora-hover-img position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
            style="object-position: center;"
          >
        </div>
      </router-link>

      <div class="theme-bar position-absolute bottom-0 start-0 bg-sora-primary z-index-2"></div>
    </div>

    <div class="position-relative flex-grow-1 d-flex flex-column" style="background-color: #ffffff !important;">
      <div class="p-4 text-start d-flex flex-column flex-grow-1 product-card-body">
        <router-link
          :to="{ name: 'productDetail', params: { shop_slug: shopSlug, slug: product.slug } }"
          class="text-decoration-none flex-grow-1 d-flex flex-column justify-content-center"
        >
          <h6 class="text-dark font-oswald text-uppercase fw-normal mb-2 text-truncate-2 product-name" style="font-size: 1.05rem; letter-spacing: 1px; line-height: 1.4;">{{ product.name }}</h6>
          
          <div class="d-flex justify-content-between align-items-center mb-2">
            <p class="font-oswald text-secondary small fw-light mb-0" style="letter-spacing: 0.8px; font-size: 0.75rem; opacity: 0.7;">{{ product.category?.name || 'TRANG SỨC SORA' }}</p>
            
            <!-- Luxury constraint: Show only one badge (Out of Stock > Scarcity > Sold Count > In Stock) -->
            <span v-if="isOutOfStock" class="small font-oswald text-uppercase tracking-widest text-secondary" style="font-size: 0.7rem; opacity: 0.8;">
              <i class="bi bi-slash-circle me-1"></i>Hết hàng
            </span>
            <span v-else-if="effectiveStock > 0 && effectiveStock <= 5" class="small font-oswald text-uppercase tracking-widest" style="font-size: 0.7rem; color: #cc1e2e;">
              Còn {{ effectiveStock }}
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
                <span class="text-main fw-normal font-oswald text-truncate" :title="`${formatCurrency(priceInfo.min)} - ${formatCurrency(priceInfo.max)}`" style="font-size: 1.15rem; letter-spacing: 0.5px;">{{ formatCompactPrice(priceInfo.min) }} - {{ formatCompactPrice(priceInfo.max) }}</span>
              </div>
            </template>
            <template v-else>
              <div class="d-flex align-items-baseline gap-2 flex-wrap">
                <span class="text-main fw-normal font-oswald product-price" style="font-size: 1.15rem; letter-spacing: 0.5px;">{{ formatCurrency(priceInfo.price) }}</span>
                <span v-if="priceInfo.oldPrice" class="text-muted text-decoration-line-through small fw-light font-oswald product-old-price" style="font-size: 0.85rem;">
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
            @click.stop="isOutOfStock ? null : handleQuickAddClick()"
            class="btn w-100 rounded-0 font-oswald tracking-widest text-uppercase fw-light shadow-none d-flex align-items-center justify-content-center btn-add-cart"
            style="padding: 14px 0; font-size: 0.85rem; border: none;"
            :class="isOutOfStock ? 'luxury-btn-sold-out' : 'luxury-btn-solid'"
            :disabled="isOutOfStock"
            :style="isOutOfStock ? 'cursor: not-allowed;' : ''"
          >
            <span v-if="!isOutOfStock" class="cart-icon-wrapper d-flex align-items-center justify-content-center overflow-hidden">
              <i class="bi bi-cart-plus fs-5 text-white"></i>
            </span>
            <span>{{ isOutOfStock ? 'Đã bán hết' : 'Thêm vào giỏ' }}</span>
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
import soraAlert from '@/utils/soraAlertConfig';
import { getStorageUrl } from '@/utils/env';
import { getProtectedRating, formatCompactPrice, getUserToken } from '@/composables/useUtilities';

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

const effectiveStock = computed(() => {
  const p = props.product;
  
  if (p.total_stock !== undefined && p.total_stock !== null) {
      return Number(p.total_stock);
  }

  if (p.variants && p.variants.length > 0) {
    return p.variants.reduce((sum, v) => sum + Number(v.stock_quantity || 0), 0);
  }
  
  return p.stock_quantity !== undefined && p.stock_quantity !== null ? Number(p.stock_quantity) : 0;
});

const isOutOfStock = computed(() => {
  const p = props.product;
  
  // Nếu là Combo (thường nhận biết qua is_combo hoặc thiếu thuộc tính category nhưng có items)
  // và status là inactive hoặc hêt hạn
  if (p.is_combo || (p.items && !p.category)) {
      if (p.status && p.status !== 'active') return true;
      if (p.is_active === false || p.is_active === 0) return true;
      return false; // Mặc định Combo nếu đang active thì coi như còn hàng để user bấm vào xem chi tiết
  }

  return effectiveStock.value <= 0;
});

const heartIconClass = computed(() => {
  return props.isInWishlist
    ? 'bi bi-suit-heart-fill text-danger'
    : 'bi bi-suit-heart text-muted hover-text-accent';
});

const handleQuickAddClick = () => {
  globalModalState.openQuickAdd(props.product);
};

const handleWishlistClick = () => {
  const token = getUserToken();
  if (!token) {
    soraAlert.fire({
      icon: 'warning',
      title: 'Bạn chưa đăng nhập!',
      text: 'Vui lòng đăng nhập để lưu trữ bộ sưu tập yêu thích của mình.',
      confirmButtonText: 'Đăng Nhập Ngay',
      showCancelButton: true,
      cancelButtonText: 'Đóng'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = '/login';
      }
    });
    return;
  }
  emit('toggle-wishlist', props.product);
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
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Josefin+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');


.text-sora-primary { color: #9f273b !important; }
.bg-sora-primary { background-color: #9f273b !important; }
.font-serif { font-family: 'Josefin Sans', sans-serif; }
.font-oswald { font-family: 'Oswald', sans-serif; }
.font-luxury { font-family: 'Josefin Sans', sans-serif; }
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
  color: #ffffff;
  border-top: none;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.luxury-btn-solid:hover {
  background-color: #cc1e2e;
  color: #ffffff;
  box-shadow: 0 -4px 15px rgba(204,30,46,0.15);
}
.luxury-btn-solid i {
  color: #ffffff !important;
}

.luxury-btn-sold-out {
  background-color: #2a1810 !important;
  color: #e7ce7d !important;
  border: 1px solid #2a1810 !important;
  opacity: 0.8;
  transition: all 0.3s ease;
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

.product-card-body {
  padding-bottom: 64px !important;
}

@media (max-width: 767.98px) {
  .product-card-body {
    padding: 0.75rem !important;
    padding-bottom: 48px !important;
  }
  .product-name {
    font-size: 0.85rem !important;
    line-height: 1.3 !important;
    margin-bottom: 0.25rem !important;
    min-height: 2.2rem;
    letter-spacing: 0.5px;
  }
  .product-price {
    font-size: 1rem !important;
  }
  .product-old-price {
    font-size: 0.7rem !important;
  }
  .btn-add-cart {
    padding-top: 0.65rem !important;
    padding-bottom: 0.65rem !important;
    font-size: 0.75rem !important;
    letter-spacing: 1px;
  }
  .cart-icon-wrapper i {
    font-size: 1.1rem !important;
  }
}
</style>
