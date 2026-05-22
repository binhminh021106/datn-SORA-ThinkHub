<template>
  <Teleport to="body">
    <div class="mini-cart-container">
      <!-- Overlay -->
      <transition name="fade">
        <div 
          v-if="isOpen" 
          class="mini-cart-overlay"
          @click="closeCart"
        ></div>
      </transition>

      <div class="cart-wrapper d-flex" :class="isOpen ? 'open' : ''">
        
        <!-- ========================================== -->
        <!-- BẢNG GỢI Ý SẢN PHẨM BÊN TRÁI (FULL MÀN HÌNH) -->
        <!-- ========================================== -->
        <div class="featured-products-panel bg-white d-none d-lg-flex flex-column p-4" v-if="featuredProducts.length > 0">
          <div class="text-center mb-4 mt-2">
             <h4 class="m-0 tracking-wide fw-medium text-dark font-oswald text-uppercase" style="font-size: 1.5rem;">Sản phẩm yêu thích nhất</h4>
             <p class="text-muted font-serif fst-italic mt-1">Gợi ý 4 sản phẩm bán chạy dành riêng cho bạn</p>
          </div>
          
          <div class="flex-grow-1 d-flex flex-column justify-content-center overflow-hidden pb-4 position-relative w-100">
            <div class="d-flex flex-nowrap overflow-x-auto overflow-y-hidden custom-scrollbar pb-4 align-items-center w-100 sora-drag-container sora-evenly-spaced"
                 ref="featuredScrollContainer"
                 @mousedown="startDrag"
                 @mouseleave="stopDrag"
                 @mouseup="stopDrag"
                 @mousemove="onDrag">
              
              <div v-for="product in featuredProducts.slice(0, 4)" :key="product.id" style="min-width: 300px; width: 300px; flex-shrink: 0;" class="py-2" @click.capture="handleCardAction($event)">
                <ProductCard 
                  :product="product"
                  :showWishlist="true" 
                  :showCompare="true"
                  :showAddToCart="true"
                  :hoverAddToCart="true"
                  :isInWishlist="isFavourited(product.id)"
                  @toggle-wishlist="handleToggleWishlist"
                  class="cursor-pointer shadow-sm"
                />
              </div>

            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- SLIDE-OUT CART (GIỎ HÀNG BÊN PHẢI)           -->
        <!-- ========================================== -->
        <div class="mini-cart-panel bg-white d-flex flex-column border-start border-light-subtle shadow">
          <div class="p-4 border-bottom border-light-subtle position-relative">
            <div class="d-flex align-items-center justify-content-center mb-3 position-relative">
              <h5 class="m-0 font-oswald tracking-wide fw-bold text-uppercase" style="font-size: 1.2rem; font-weight: 500;">Giỏ hàng của bạn</h5>
              <button @click="closeCart" class="btn border-0 text-dark fs-4 p-0 position-absolute end-0 hover-primary transition-color" style="top: -5px;">&times;</button>
            </div>
            
            <div class="text-center small text-muted mb-3 font-serif" style="font-size: 0.9rem;">
              <span v-if="amountToFreeShipping > 0">
                Thêm <span class="fw-bold text-sora-primary">{{ formatPrice(amountToFreeShipping) }}</span> nữa để được <span class="fw-bold text-dark">miễn phí vận chuyển!</span>
              </span>
              <span v-else class="text-sora-primary fw-bold">
                Chúc mừng! Đơn hàng của bạn đã được miễn phí vận chuyển.
              </span>
            </div>
            
            <div class="progress rounded-pill bg-light" style="height: 4px;">
              <div class="progress-bar bg-success transition-all" role="progressbar" :style="{ width: progressPercentage + '%' }"></div>
            </div>
          </div>

          <div class="flex-grow-1 overflow-auto p-4 custom-scrollbar">
            <div v-if="isLoading" class="text-center py-5 text-muted">
              <div class="spinner-border spinner-border-sm text-sora-primary me-2" role="status"></div> Đang tải...
            </div>
            
            <div v-else-if="cartItems.length === 0" class="text-center text-muted mt-5 py-5 d-flex flex-column align-items-center">
              <i class="bi bi-bag-x mb-3" style="font-size: 3.5rem; color: #ddd;"></i>
              <p class="mt-2 font-oswald tracking-wide fs-5">GIỎ HÀNG TRỐNG</p>
              <button @click="closeCart" class="btn btn-outline-brand rounded-0 px-4 py-2 mt-3 font-oswald tracking-widest text-uppercase">Tiếp tục mua sắm</button>
            </div>

            <div v-else class="d-flex flex-column gap-4">
              <div 
                v-for="item in cartItems" 
                :key="item.id" 
                class="d-flex gap-3 position-relative cart-item"
              >
                <!-- Ảnh sản phẩm trong giỏ -->
                <div class="bg-light cursor-pointer border border-light-subtle" style="width: 85px; height: 105px; flex-shrink: 0;" @click="goToProduct(item.variant?.product?.slug || item.combo?.slug, !!item.combo_id)">
                  <!-- THÊM LOADING LAZY ĐỂ TỐI ƯU HIỆU NĂNG LOAD -->
                  <img 
                    loading="lazy"
                    :src="getImage(item.variant?.image_url || item.combo?.thumbnail_image)" 
                    alt="Product" 
                    class="w-100 h-100 object-fit-cover transition-transform hover-scale p-1"
                    @error="handleImageError"
                  >
                </div>

                <!-- Thông tin sản phẩm trong giỏ -->
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

                  <!-- Số lượng và Xóa -->
                  <div class="d-flex justify-content-between align-items-center mt-2">
                    <div class="quantity-control d-flex align-items-center border border-light-subtle bg-white">
                      <!-- LOẠI BỎ :disabled="isUpdating" để user có thể bấm nhiều lần liên tục -->
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

                  <!-- Thêm trạng thái Spinner nhỏ nếu đang update item này -->
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
              <button @click="goToCheckout" class="btn btn-brand w-100 py-3 font-oswald tracking-widest text-uppercase fw-bold rounded-0 shadow-sm" :disabled="cartItems.length === 0">
                Thanh toán ngay
              </button>
              <button @click="goToCart" class="btn btn-outline-brand w-100 py-2 font-oswald tracking-widest text-uppercase fw-bold rounded-0">
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
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';
import ProductCard from '@/components/ui/ProductCard.vue';
import { useWishlist } from '@/composables/useWishlist.js';

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

const isOpen = ref(false);
const isLoading = ref(false);
const updatingItemId = ref(null); // Lưu ID của item đang được update

const cartItems = ref([]);
const summary = ref({ total_items: 0, subtotal: 0 });
const featuredProducts = ref([]);

const FREE_SHIPPING_THRESHOLD = 1000000;

// Gợi ý: Sau này bạn nên chuyển phần getHeaders này vào thư mục utils/axios.js (Tạo file cấu hình axios riêng)
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

const featuredScrollContainer = ref(null);
const isDragging = ref(false);
const startX = ref(0);
const scrollLeft = ref(0);
const dragDistance = ref(0);

const startDrag = (e) => {
  if (!featuredScrollContainer.value) return;
  isDragging.value = true;
  dragDistance.value = 0;
  startX.value = e.pageX - featuredScrollContainer.value.offsetLeft;
  scrollLeft.value = featuredScrollContainer.value.scrollLeft;
};

const stopDrag = () => {
  setTimeout(() => {
    isDragging.value = false;
  }, 50);
};

const onDrag = (e) => {
  if (!isDragging.value || !featuredScrollContainer.value) return;
  e.preventDefault();
  const x = e.pageX - featuredScrollContainer.value.offsetLeft;
  const walk = (x - startX.value) * 1.5; 
  dragDistance.value = walk;
  featuredScrollContainer.value.scrollLeft = scrollLeft.value - walk;
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
  if (isDragging.value && Math.abs(dragDistance.value) > 10) return;

  closeCart();
  const shopSlug = route?.params?.shop_slug || 'aurora-jewelry'; 
  
  if (isCombo) {
    router.push({ name: 'client-combo-detail', params: { slug: slug } });
  } else {
    router.push({ name: 'productDetail', params: { shop_slug: shopSlug, slug: slug } });
  }
};

const amountToFreeShipping = computed(() => {
  const remaining = FREE_SHIPPING_THRESHOLD - summary.value.subtotal;
  return remaining > 0 ? remaining : 0;
});

const progressPercentage = computed(() => {
  const percentage = (summary.value.subtotal / FREE_SHIPPING_THRESHOLD) * 100;
  return percentage > 100 ? 100 : percentage;
});

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
  try {
    const res = await axios.get(`${BACKEND_URL}/client/home-data`);
    if (res.data.success && res.data.data.products) {
      featuredProducts.value = res.data.data.products;
    }
  } catch (error) {
    console.error('Lỗi khi tải sản phẩm nổi bật', error);
  }
};

// CƠ CHẾ DEBOUNCE: Chống spam request khi người dùng bấm +/- liên tục
let updateTimeout = null;

const updateQuantity = (item, newQuantity) => {
  if (newQuantity < 1) return;
  
  // Cập nhật giao diện ngay lập tức để tạo cảm giác mượt mà (Optimistic UI update)
  item.quantity = newQuantity;
  
  // Clear timeout cũ nếu user nhấn liên tiếp
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updatingItemId.value = item.id;

  // Set timeout mới: Chờ 600ms sau lần click cuối cùng mới gọi API
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
      // Nếu API lỗi, hoàn tác lại data bằng cách gọi lại fetchCart
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
      // Xóa tạm thời trên UI trước để tăng độ mượt
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

.btn-brand { background-color: #9f273b; border: 1px solid #9f273b; color: white !important; transition: all 0.3s ease; }
.btn-brand:hover { background-color: #7a1c2d; border-color: #7a1c2d; color: white !important; box-shadow: 0 5px 15px rgba(159,39,59,0.3); }

.btn-outline-brand { border: 1px solid #222; color: #222; background: transparent; transition: all 0.3s ease; }
.btn-outline-brand:hover { background-color: #222; color: white !important; }

.hover-primary:hover { color: #9f273b !important; }
.transition-color { transition: color 0.2s ease; }
.transition-all { transition: all 0.4s ease; }

.mini-cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px); 
  z-index: 1060;
}

.cart-wrapper {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  z-index: 1061;
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
  background-color: #fcfcfc;
}

.sora-evenly-spaced {
  justify-content: space-evenly;
  gap: 15px; 
}

@media (max-width: 1450px) {
  .sora-evenly-spaced {
    justify-content: flex-start;
    padding-left: 2rem !important;
    padding-right: 2rem !important;
  }
}

.sora-drag-container {
  cursor: grab;
  scroll-behavior: smooth;
}
.sora-drag-container:active {
  cursor: grabbing;
}

.mini-cart-panel {
  width: 100vw;
  max-width: 420px;
  height: 100vh;
  pointer-events: auto;
  flex-shrink: 0;
}

@media (max-width: 991px) {
  .featured-products-panel {
    display: none !important;
  }
}

.cart-item {
  padding-bottom: 1.25rem;
  border-bottom: 1px dashed #e9ecef;
}
.cart-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.quantity-control {
  height: 30px;
}

.custom-scrollbar {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin; 
  scrollbar-color: #e0e0e0 transparent;
}
.custom-scrollbar::-webkit-scrollbar {
  height: 8px; 
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e0e0e0; 
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #c0c0c0; 
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

<style>
.high-z-index-swal {
  z-index: 10000 !important;
}
</style>