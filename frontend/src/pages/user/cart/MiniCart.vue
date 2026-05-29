<template>
  <Teleport to="body">
    <div class="mini-cart-container">
      <!-- Overlay xuyên thấu -->
      <transition name="fade">
        <div 
          v-if="isOpen" 
          class="mini-cart-overlay"
          @click="closeCart"
        ></div>
      </transition>

      <div class="cart-wrapper d-flex" :class="isOpen ? 'open' : ''">
        
        <!-- ========================================== -->
        <!-- BẢNG GỢI Ý SẢN PHẨM BÊN TRÁI -->
        <!-- ========================================== -->
        <div class="featured-products-panel bg-transparent d-none d-lg-flex flex-column align-items-center justify-content-center p-4">
          
          <!-- HỘP TRẮNG CHỨA SẢN PHẨM Ở GIỮA -->
          <div class="suggested-products-box bg-white p-4 shadow w-100 position-relative" style="max-width: 950px;" v-show="featuredProducts.length > 0 || isProductsLoading">
            <div class="text-center mb-4 mt-2">
               <h4 class="m-0 tracking-wide fw-medium text-dark font-oswald" style="font-size: 1.5rem;">Bạn có thể quan tâm</h4>
            </div>
            
            <div class="swiper-wrapper-container w-100 position-relative">
              
              <!-- SKELETON LOADING ĐỒNG BỘ LAYOUT PRODUCT CARD -->
              <div v-if="isProductsLoading" class="d-flex px-2 pb-5" style="gap: 20px;">
                <div v-for="i in 3" :key="'skel-prod-'+i" class="d-flex flex-column border border-light-subtle bg-white" style="width: calc((100% - 40px) / 3);">
                  <!-- Skeleton Khung Ảnh Tỉ lệ 1:1 -->
                  <div class="ratio ratio-1x1 w-100 skeleton border-bottom border-light-subtle"></div>
                  <!-- Skeleton Nội dung thẻ -->
                  <div class="p-4 d-flex flex-column flex-grow-1 text-center" style="padding-bottom: 64px !important;">
                    <div class="skeleton mx-auto mb-2" style="width: 80%; height: 24px; border-radius: 4px;"></div>
                    <div class="skeleton mx-auto mb-3" style="width: 50%; height: 18px; border-radius: 4px;"></div>
                    <div class="mt-auto d-flex flex-column align-items-center justify-content-center">
                      <div class="skeleton mb-1" style="width: 40%; height: 16px; border-radius: 4px;"></div>
                      <div class="skeleton" style="width: 60%; height: 24px; border-radius: 4px;"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- SWIPER SẢN PHẨM THỰC TẾ -->
              <div v-else class="position-relative w-100">
                <Swiper
                  :modules="swiperModules"
                  :slides-per-view="3"
                  :space-between="20"
                  :pagination="{ clickable: true }"
                  :navigation="{ nextEl: '.sora-swiper-next', prevEl: '.sora-swiper-prev' }"
                  :grab-cursor="true"
                  class="pb-5 px-2 custom-swiper"
                >
                  <SwiperSlide v-for="product in featuredProducts" :key="product.id" class="d-flex justify-content-center h-auto">
                    <div class="w-100 h-100" @click.capture="handleCardAction($event)">
                      <ProductCard 
                        :product="product"
                        :showWishlist="true" 
                        :showCompare="true"
                        :showAddToCart="true"
                        :hoverAddToCart="true"
                        :isInWishlist="isFavourited(product.id)"
                        @toggle-wishlist="handleToggleWishlist"
                        class="cursor-pointer h-100"
                      />
                    </div>
                  </SwiperSlide>
                </Swiper>
                
                <div class="sora-swiper-prev"><i class="bi bi-chevron-left"></i></div>
                <div class="sora-swiper-next"><i class="bi bi-chevron-right"></i></div>
              </div>

            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- SLIDE-OUT CART -->
        <!-- ========================================== -->
        <div class="mini-cart-panel bg-white d-flex flex-column border-start border-light-subtle shadow">
          <div class="p-4 border-bottom border-light-subtle position-relative">
            <div class="d-flex align-items-center justify-content-center position-relative">
              <h5 class="m-0 font-oswald tracking-wide fw-bold text-uppercase" style="font-size: 1.2rem; font-weight: 500;">Giỏ hàng của bạn</h5>
              <button @click="closeCart" class="btn border-0 text-dark fs-4 p-0 position-absolute end-0 hover-primary transition-color" style="top: -5px;">&times;</button>
            </div>
          </div>

          <div class="flex-grow-1 overflow-auto p-4 custom-scrollbar">
            
            <div v-if="isLoading" class="d-flex flex-column gap-4">
              <div v-for="i in 3" :key="'skel-cart-'+i" class="d-flex gap-3 position-relative cart-item border-0">
                <div class="skeleton" style="width: 85px; height: 105px; flex-shrink: 0; border-radius: 4px;"></div>
                <div class="d-flex flex-column flex-grow-1 py-1">
                  <div class="skeleton" style="width: 90%; height: 18px; border-radius: 4px; margin-bottom: 8px;"></div>
                  <div class="skeleton" style="width: 60%; height: 14px; border-radius: 4px; margin-bottom: 12px;"></div>
                  <div class="skeleton" style="width: 40%; height: 20px; border-radius: 4px;"></div>
                  <div class="mt-auto d-flex justify-content-between align-items-center">
                    <div class="skeleton" style="width: 70px; height: 25px; border-radius: 4px;"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else-if="cartItems.length === 0" class="text-center text-muted mt-5 py-5 d-flex flex-column align-items-center">
              <i class="bi bi-bag-x mb-3" style="font-size: 3.5rem; color: #ddd;"></i>
              <p class="mt-2 font-oswald tracking-wide fs-5">GIỎ HÀNG TRỐNG</p>
              <button @click="closeCart" class="btn btn-outline-brand rounded-3 px-4 py-2 mt-3 font-oswald tracking-widest text-uppercase">Tiếp tục mua sắm</button>
            </div>

            <div v-else class="d-flex flex-column gap-4">
              <div 
                v-for="item in cartItems" 
                :key="item.id" 
                class="d-flex gap-3 position-relative cart-item"
              >
                <div class="bg-light cursor-pointer border border-light-subtle rounded-1" style="width: 85px; height: 105px; flex-shrink: 0;" @click="goToProduct(item.variant?.product?.slug || item.combo?.slug, !!item.combo_id)">
                  <img 
                    loading="lazy"
                    :src="getImage(item.variant?.image_url || item.combo?.thumbnail_image)" 
                    alt="Product" 
                    class="w-100 h-100 object-fit-cover transition-transform hover-scale p-1 rounded-1"
                    @error="handleImageError"
                  >
                </div>

                <div class="d-flex flex-column justify-content-between flex-grow-1 overflow-hidden py-1">
                  <div class="pe-4">
                    <h6 class="mb-1 text-dark fw-bold text-truncate cursor-pointer hover-primary font-oswald text-uppercase" style="font-size: 0.95rem; transition: color 0.2s;" :title="item.variant?.product?.name || item.combo?.name || 'Tên sản phẩm'" @click="goToProduct(item.variant?.product?.slug || item.combo?.slug, !!item.combo_id)">
                      {{ item.variant?.product?.name || item.combo?.name || 'Tên sản phẩm' }}
                    </h6>
                    
                    <template v-if="item.combo_id">
                      <div class="mt-1 mb-1">
                        <span class="badge bg-light text-secondary border border-light-subtle fw-normal px-2 py-1 font-oswald tracking-wide" style="font-size: 0.7rem;">
                          <i class="bi bi-stars text-warning me-1"></i> GÓI COMBO ({{ item.combo_selections?.length || 0 }} MÓN)
                        </span>
                      </div>
                    </template>
                    <template v-else-if="item.variant?.attributes">
                      <p class="text-muted small mb-1 text-truncate font-serif fst-italic" style="font-size: 0.85rem;">
                        {{ Object.values(item.variant.attributes).join(' / ') }}
                      </p>
                    </template>
                    
                    <p class="text-sora-primary fw-bold m-0 mt-1 font-serif" style="font-size: 1.05rem;">
                      {{ formatPrice(item.price) }}
                    </p>
                  </div>

                  <div class="d-flex justify-content-between align-items-center mt-2">
                    <div class="quantity-control d-flex align-items-center border border-light-subtle bg-white rounded-2 overflow-hidden">
                      <button 
                        @click="updateQuantity(item, item.quantity - 1)" 
                        class="btn btn-sm border-0 px-2 py-0 text-muted"
                        :disabled="item.quantity <= 1"
                      >-</button>
                      <input 
                        type="text" 
                        class="form-control border-0 text-center px-0 py-0 fw-medium bg-transparent shadow-none" 
                        style="width: 35px; font-size: 0.85rem;"
                        :value="item.quantity"
                        readonly
                      >
                      <button 
                        @click="updateQuantity(item, item.quantity + 1)" 
                        class="btn btn-sm border-0 px-2 py-0 text-muted"
                      >+</button>
                    </div>
                  </div>

                  <div v-if="updatingItemId === item.id" class="position-absolute bottom-0 end-0 mb-1 me-4">
                     <div class="spinner-border text-secondary" style="width: 1rem; height: 1rem; border-width: 0.15em;" role="status"></div>
                  </div>

                  <button @click="removeItem(item.id)" class="btn border-0 p-1 position-absolute top-0 end-0 hover-primary transition-color" title="Xóa" style="font-size: 1.1rem; color: #a0a0a0;">
                    <i class="bi bi-trash3"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 bg-light border-top border-light-subtle">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <span class="tracking-widest font-oswald text-uppercase fw-bold text-dark">Tổng cộng:</span>
              <span class="fs-5 fw-bold text-sora-primary font-serif">{{ formatPrice(summary.subtotal) }}</span>
            </div>
            
            <div class="d-flex flex-column gap-2">
              <button @click="goToCheckout" class="btn btn-brand w-100 py-3 font-oswald tracking-widest text-uppercase fw-bold rounded-3 shadow-sm" :disabled="cartItems.length === 0">
                Thanh toán ngay
              </button>
              <button @click="goToCart" class="btn btn-outline-brand w-100 py-2 font-oswald tracking-widest text-uppercase fw-bold rounded-3">
                Xem giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';
import ProductCard from '@/components/ui/ProductCard.vue';
import { useWishlist } from '@/composables/useWishlist.js';

import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const router = useRouter();
const route = useRoute();

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || BACKEND_URL.replace(/\/api\/?$/, '');

const { isFavourited, toggleFavourite, fetchFavorites } = useWishlist();

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000
});

const swiperModules = [Pagination, Navigation];

const isOpen = ref(false);
const isLoading = ref(false); 
const isProductsLoading = ref(false);
const updatingItemId = ref(null);

const cartItems = ref([]);
const summary = ref({ total_items: 0, subtotal: 0 });
const featuredProducts = ref([]);

const getHeaders = () => {
  const headers = { 'Accept': 'application/json' };
  const token = localStorage.getItem('auth_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const sid = localStorage.getItem('cart_session_id');
  if (sid) headers['X-Cart-Session-Id'] = sid;
  
  return headers;
};

const soraPlaceholder = '/Sora-placeholder.png';
const getImage = (path) => {
  if (!path) return soraPlaceholder;
  const cleaned = path.trim();
  if (cleaned.startsWith('http') || cleaned.startsWith('data:')) return cleaned;
  let normalized = cleaned.replace(/^\//, '');
  if (normalized.startsWith('storage/')) {
    normalized = normalized.replace(/^storage\//, '');
  }
  return `${STORAGE_URL}/${normalized}`;
};
const handleImageError = (e) => { e.target.src = soraPlaceholder; };

watch(() => route.fullPath, () => {
  if (isOpen.value) {
    closeCart();
  }
});

const openCart = () => {
  isOpen.value = true;
  document.body.style.overflow = 'hidden';
  
  fetchCart();
  fetchFeaturedProducts();
  fetchFavorites();
};

const closeCart = () => {
  isOpen.value = false;
  document.body.style.overflow = '';
};

const handleCardAction = (event) => {
  const btn = event.target.closest('button');
  if (btn) {
    if (btn.classList.contains('luxury-btn-solid') || btn.classList.contains('compare-btn') || btn.classList.contains('wishlist-btn')) {
      closeCart(); 
    }
  }
};

const handleToggleWishlist = (product) => {
  toggleFavourite(product, Toast, Swal, router);
};

const goToCart = () => {
  closeCart();
  router.push({ name: 'cart' });
};

const goToCheckout = () => {
  closeCart();
  router.push({ name: 'checkout' });
};

const goToProduct = (slug, isCombo = false) => {
  if (!slug) return;
  closeCart();
  const shopSlug = route?.params?.shop_slug || 'aurora-jewelry'; 
  
  if (isCombo) {
    router.push({ name: 'client-combo-detail', params: { slug: slug } });
  } else {
    router.push({ name: 'productDetail', params: { shop_slug: shopSlug, slug: slug } });
  }
};

const formatPrice = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
};

const fetchCart = async (showLoading = true) => {
  if (showLoading) isLoading.value = true;
  try {
    const res = await axios.get(`${BACKEND_URL}/client/cart`, { headers: getHeaders() });
    if (res.data.success) {
      cartItems.value = res.data.data;
      summary.value = res.data.summary;
    }
  } catch (error) {
    console.error('Lỗi khi tải giỏ hàng', error);
  } finally {
    if (showLoading) isLoading.value = false;
  }
};

const fetchFeaturedProducts = async () => {
  if (featuredProducts.value.length > 0) return;
  isProductsLoading.value = true;
  try {
    const res = await axios.get(`${BACKEND_URL}/client/home-data`);
    if (res.data.success && res.data.data.products) {
      featuredProducts.value = res.data.data.products;
    }
  } catch (error) {
    console.error('Lỗi khi tải sản phẩm nổi bật', error);
  } finally {
    isProductsLoading.value = false;
  }
};

let updateTimeout = null;

const updateQuantity = (item, newQuantity) => {
  if (newQuantity < 1) return;
  item.quantity = newQuantity;
  
  if (updateTimeout) clearTimeout(updateTimeout);
  updatingItemId.value = item.id;

  updateTimeout = setTimeout(async () => {
    try {
      const res = await axios.put(`${BACKEND_URL}/client/cart/${item.id}`, 
        { quantity: item.quantity }, 
        { headers: getHeaders() }
      );
      if (res.data.success) {
        await fetchCart(false); 
        window.dispatchEvent(new CustomEvent('update-cart-count', {
          detail: { cart_count: summary.value.total_items }
        }));
      }
    } catch (error) {
      await fetchCart(false);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: error.response?.data?.message || 'Có lỗi xảy ra',
        showConfirmButton: false,
        timer: 3000
      });
    } finally {
      updatingItemId.value = null;
    }
  }, 600);
};

const removeItem = async (id) => {
  try {
    updatingItemId.value = id;
    const res = await axios.delete(`${BACKEND_URL}/client/cart/${id}`, { headers: getHeaders() });
    if (res.data.success) {
      cartItems.value = cartItems.value.filter(item => item.id !== id);
      await fetchCart(false); 
      window.dispatchEvent(new CustomEvent('update-cart-count', {
        detail: { cart_count: summary.value.total_items }
      }));
    }
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm', error);
  } finally {
    updatingItemId.value = null;
  }
};

defineExpose({ openCart, fetchCart });
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

.font-oswald { font-family: 'Oswald', sans-serif !important; }
.font-serif { font-family: 'Playfair Display', serif !important; }
.tracking-wide { letter-spacing: 0.5px; }
.tracking-widest { letter-spacing: 1.5px; }

.text-sora-primary { color: #9f273b !important; }
.bg-sora-primary { background-color: #9f273b !important; }

/* Nút Thanh toán ngay */
.btn-brand { 
  background-color: #9f273b; 
  border: 1px solid #9f273b; 
  color: white !important; 
  transition: all 0.3s ease; 
}
.btn-brand:hover { 
  background-color: #cc1e2e; /* Đổi sang màu đỏ hover */
  border-color: #cc1e2e; 
  color: white !important; 
  box-shadow: 0 5px 15px rgba(204, 30, 46, 0.3); 
}

/* Nút Xem giỏ hàng */
.btn-outline-brand { 
  border: 1px solid #e7ce7d; /* Viền màu vàng gold (màu phụ) */
  color: #9f273b; /* Chữ màu đỏ để nổi bật */
  background: transparent; 
  transition: all 0.3s ease; 
}
.btn-outline-brand:hover { 
  background-color: #e7ce7d; /* Lấp đầy nền vàng khi hover */
  border-color: #e7ce7d;
  color: #9f273b !important; 
}

.hover-primary:hover { color: #9f273b !important; }
.transition-color { transition: color 0.2s ease; }
.transition-all { transition: all 0.4s ease; }

.mini-cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.45);
  z-index: 999998; /* Tăng Z-index cực cao để đè chat widget */
}

.cart-wrapper {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  z-index: 999999; /* Tăng Z-index cực cao */
  pointer-events: none;
  display: flex;
  justify-content: flex-end;
  width: 100vw;
  transform: translateX(100%);
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.cart-wrapper.open {
  transform: translateX(0);
}

.featured-products-panel {
  flex-grow: 1; 
  height: 100vh; 
  pointer-events: auto;
}

.skeleton {
  background: #f0f0f0;
  background-image: linear-gradient(90deg, #f0f0f0 0px, #f8f8f8 40px, #f0f0f0 80px);
  background-size: 200vw 100%;
  animation: shimmer 1.5s infinite linear;
}

@keyframes shimmer {
  0% { background-position: -20vw 0; }
  100% { background-position: 20vw 0; }
}

.swiper-wrapper-container {
  --swiper-pagination-color: #9f273b;
  position: relative; 
}

:deep(.swiper-pagination) { bottom: 0px !important; }
:deep(.swiper-pagination-bullet) {
  width: 6px; height: 6px; background: #c4c4c4; opacity: 1; transition: all 0.3s ease;
}
:deep(.swiper-pagination-bullet-active) {
  width: 20px; border-radius: 4px; background: #9f273b;
}

.sora-swiper-prev, .sora-swiper-next {
  position: absolute;
  top: 40%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background-color: #fff;
  border-radius: 50%;
  border: 1px solid #eaeaea;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 50; color: #333; transition: all 0.3s ease;
}

.sora-swiper-prev:hover, .sora-swiper-next:hover {
  color: #9f273b;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.sora-swiper-prev i, .sora-swiper-next i { font-size: 16px; font-weight: 900; }
.sora-swiper-prev { left: -10px; }
.sora-swiper-next { right: -10px; }

.sora-swiper-prev.swiper-button-disabled,
.sora-swiper-next.swiper-button-disabled { opacity: 0 !important; pointer-events: none; }

.mini-cart-panel {
  width: 100vw; max-width: 420px; height: 100vh;
  pointer-events: auto; flex-shrink: 0; z-index: 2;
}

@media (max-width: 991px) {
  .featured-products-panel { display: none !important; }
}

.cart-item { padding-bottom: 1.25rem; border-bottom: 1px dashed #e9ecef; }
.cart-item:last-child { border-bottom: none; padding-bottom: 0; }

.quantity-control { height: 30px; }

.custom-scrollbar {
  -webkit-overflow-scrolling: touch; scrollbar-width: thin; scrollbar-color: #e0e0e0 transparent;
}
.custom-scrollbar::-webkit-scrollbar { height: 8px; width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e0e0e0; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #c0c0c0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

<style>
.high-z-index-swal { z-index: 10000 !important; }
</style>