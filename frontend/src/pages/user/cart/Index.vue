<template>
  <div class="cart-wrapper pb-5" style="min-height: 100vh; font-family: 'Manrope', sans-serif;">

    <main class="container mt-5">
      <div class="d-flex flex-wrap align-items-center justify-content-between mb-5 gap-3">
        <div>
          <h2 class="fs-1 text-dark mb-0" style="font-family: 'Manrope', sans-serif; font-weight: 700;">Giỏ hàng của bạn</h2>
          <span class="text-secondary fw-light border-bottom border-danger-custom pb-1">
            {{ totalItems }} Sản phẩm trong danh sách
          </span>
        </div>
        
        <button v-if="cartItems.length > 0" 
                @click="clearCart" 
                class="btn btn-outline-danger btn-sm rounded-pill text-uppercase fw-bold px-3">
          <i class="bi bi-trash3-fill me-1"></i> Làm trống giỏ
        </button>
      </div>

      <div v-if="isLoading" class="row g-5">
        <div class="col-lg-8">
          <SoraListSkeleton :rows="4" image-size="100px" card />
        </div>
        <div class="col-lg-4">
          <div class="summary-skeleton-card">
            <SoraSkeleton width="56%" height="24px" radius="6px" class="mb-4" />
            <SoraSkeleton width="100%" height="16px" class="mb-3" />
            <SoraSkeleton width="86%" height="16px" class="mb-4" />
            <SoraSkeleton width="100%" height="48px" radius="999px" />
          </div>
        </div>
      </div>

      <div v-else-if="cartItems.length === 0" class="text-center py-5 bg-white shadow-sm rounded-0 border-top border-4 border-danger-custom">
        <div class="py-5">
          <i class="bi bi-cart-x fs-1 text-muted opacity-50 mb-3 d-block" style="font-size: 4rem !important;"></i>
          <p class="fs-5 text-secondary mb-4" style="font-family: 'Manrope', sans-serif; font-weight: 500;">Giỏ hàng của bạn đang trống.</p>
          <button @click="router.push('/shop')" class="editorial-btn px-5 py-3">
            Tiếp tục mua sắm
          </button>
        </div>
      </div>

      <div v-else class="row g-5">
        
        <!-- Cột trái: Danh sách sản phẩm -->
        <div class="col-lg-8">
          <div class="row d-none d-md-flex border-bottom pb-3 text-secondary small text-uppercase mb-4 fw-bold" style="letter-spacing: 0.05em;">
            <div class="col-5">Sản phẩm</div>
            <div class="col-2 text-center">Đơn giá</div>
            <div class="col-2 text-center">Số lượng</div>
            <div class="col-3 text-end">Tổng cộng</div>
          </div>

          <div v-for="item in cartItems" :key="item.id" class="row align-items-center border-bottom py-4 position-relative cart-item-row">
            
            <div class="col-12 col-md-5 d-flex align-items-center gap-4">
              <div class="position-relative bg-light rounded shadow-sm border" style="width: 100px; height: 100px; flex-shrink: 0; overflow: hidden;">
                <div v-if="item.isUpdating" class="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center" style="z-index: 10;">
                  <div class="spinner-border spinner-border-sm" style="color: #9f273b;" role="status"></div>
                </div>
                <img :src="getImageUrl(getItemImage(item))" 
                     @error="handleImageError"
                     class="w-100 h-100 object-fit-cover bg-white">
              </div>
              
              <div class="flex-grow-1">
                <h3 class="fs-5 text-dark mb-1 fw-bold" style="font-family: 'Manrope', sans-serif;">{{ getItemName(item) }}</h3>
                
                <p class="small text-secondary text-uppercase mb-2 fw-semibold" style="letter-spacing: 0.05em;">
                  <span v-if="item.combo_id" class="text-sora-primary"><i class="bi bi-stars me-1"></i> GÓI ƯU ĐÃI (COMBO)</span>
                  <span v-else>SKU: {{ item.variant?.sku || 'N/A' }}</span>
                </p>
                
                <div class="d-flex flex-wrap gap-2 mb-2" v-if="item.combo_id">
                  <span class="badge bg-light text-secondary border fw-normal px-2 py-1 rounded-sm shadow-sm">
                    <i class="bi bi-box-seam me-1 text-dark"></i> Gồm {{ item.combo_selections?.length || 0 }} lựa chọn phong cách
                  </span>
                </div>
                <div class="d-flex flex-wrap gap-2 mb-2" v-else-if="item.variant?.attributes">
                  <span v-for="(val, key) in item.variant.attributes" :key="key" 
                        class="badge bg-white text-secondary border fw-normal px-2 py-1 rounded-sm shadow-sm">
                    {{ key }}: <span class="text-sora-primary fw-bold">{{ val }}</span>
                  </span>
                </div>
                
                <div v-if="item.combo_id && item.combo?.status !== 'active'" class="text-danger small fw-bold mt-2"><i class="bi bi-exclamation-triangle"></i> Gói ưu đãi này đã kết thúc. Vui lòng xóa khỏi giỏ.</div>
                <div v-else-if="!item.combo_id && item.variant?.product?.status !== 'published'" class="text-danger small fw-bold mt-2"><i class="bi bi-exclamation-triangle"></i> Sản phẩm đã ngừng kinh doanh. Vui lòng xóa.</div>
                <div v-else-if="!item.combo_id && item.quantity > (item.variant?.stock_quantity || 0)" class="text-danger small fw-bold mt-2"><i class="bi bi-exclamation-triangle"></i> Chỉ còn {{ item.variant?.stock_quantity || 0 }} sản phẩm trong kho.</div>
                
                <div class="d-flex d-md-none justify-content-between align-items-center mt-3">
                  <span class="fw-bold text-primary-custom text-nowrap">{{ formatPrice(getItemPrice(item)) }}</span>
                  <button @click="removeItem(item.id)" class="btn btn-link text-danger p-0 text-decoration-none fw-bold small"><i class="bi bi-trash-fill"></i> Xóa</button>
                </div>
              </div>
            </div>

            <!-- Đơn giá (Desktop) -->
            <div class="col-2 d-none d-md-block text-center text-secondary fw-medium text-nowrap">
              {{ formatPrice(getItemPrice(item)) }}
            </div>

            <!-- Input Số lượng -->
            <div class="col-12 col-md-2 mt-4 mt-md-0 d-flex justify-content-center">
              <div class="quantity-picker shadow-sm">
                <button @click="updateQuantity(item, -1)" 
                        :disabled="item.quantity <= 1 || item.isUpdating"
                        class="qty-btn minus">
                  <i class="bi bi-dash"></i>
                </button>
                <div class="qty-input">{{ item.quantity }}</div>
                <button @click="updateQuantity(item, 1)" 
                        :disabled="(!item.combo_id && item.quantity >= (item.variant?.stock_quantity || 0)) || item.isUpdating"
                        class="qty-btn plus">
                  <i class="bi bi-plus"></i>
                </button>
              </div>
            </div>

            <!-- Tổng và Xóa (Desktop) -->
            <div class="col-3 d-none d-md-flex justify-content-end align-items-center gap-3">
              <span class="fs-5 fw-bold text-primary-custom text-nowrap" >
                {{ formatPrice(item.quantity * getItemPrice(item)) }}
              </span>
              <button @click="removeItem(item.id)" :disabled="item.isUpdating" class="btn-remove-item flex-shrink-0" title="Xóa khỏi giỏ">
                <i class="bi bi-x-lg fw-bold text-danger"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Cột phải: Summary -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-lg rounded-4 p-4 sticky-top summary-card" style="top: 100px;">
            <h3 class="fs-4 text-white mb-4 pb-3 border-bottom border-light border-opacity-25" style="font-family: 'Manrope', sans-serif; font-weight: 700;"><i class="bi bi-receipt me-2"></i> Tổng quan</h3>
            
            <div class="mb-4">
              <div class="d-flex justify-content-between mb-3 text-light text-opacity-75">
                <span>Tạm tính ({{ totalItems }} Món)</span>
                <span class="fw-medium text-white">{{ formatPrice(summary.subtotal) }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center mb-3 text-light text-opacity-75">
                <span>Phí vận chuyển</span>
                <span class="badge bg-gold text-white fw-bold px-2 py-1 rounded-pill shadow-sm">MIỄN PHÍ</span>
              </div>
            </div>

            <div class="border-top border-light border-opacity-25 pt-4 mb-4">
              <div class="d-flex justify-content-between align-items-end mb-1">
                <span class="text-white text-uppercase small fw-bold" style="letter-spacing: 1px;">Tổng cộng</span>
                <span class="fs-2 fw-bold text-gold" >{{ formatPrice(summary.subtotal) }}</span>
              </div>
              <p class="text-end small text-light text-opacity-50 mb-0">Giá đã bao gồm thuế VAT</p>
            </div>

            <router-link v-if="!hasInvalidItems" to="/checkout" class="editorial-btn w-100 py-3 d-flex align-items-center justify-content-center gap-2">
                Thanh toán an toàn <i class="bi bi-shield-lock-fill fs-5"></i>
            </router-link>
            <button v-else disabled class="editorial-btn w-100 py-3 d-flex align-items-center justify-content-center gap-2" style="opacity: 0.6; cursor: not-allowed;" title="Vui lòng xóa các sản phẩm lỗi/hết hàng để tiếp tục">
                Thanh toán an toàn <i class="bi bi-shield-lock-fill fs-5"></i>
            </button>

            <div class="mt-4 pt-4 border-top border-light border-opacity-10 d-flex justify-content-center gap-4 text-gold opacity-75">
              <i class="bi bi-arrow-repeat fs-4" title="Đổi trả 7 ngày"></i>
              <i class="bi bi-shield-check fs-4" title="Bảo hành trọn đời"></i>
              <i class="bi bi-truck fs-4" title="Vận chuyển bảo mật"></i>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Toast from '@/utils/toastConfig';
import { createSoraAlert } from '@/utils/soraAlertConfig';
import defaultPlaceholder from '@/assets/images/defaults/placeholder.png';
import SoraSkeleton from '@/components/ui/SoraSkeleton.vue';
import SoraListSkeleton from '@/components/ui/SoraListSkeleton.vue';
import clientApiClient from '@/utils/clientApiClient';
import { getUserToken } from '@/composables/useUtilities';

const router = useRouter();
const isLoading = ref(true);
const cartItems = ref([]);
const backendSummary = ref(null);

const soraAlert = createSoraAlert({
  customClass: {
    confirmButton: 'px-4 py-2 mx-2 rounded-pill shadow-sm fw-bold',
    cancelButton: 'px-4 py-2 mx-2 rounded-pill fw-bold'
  }
});

const notifyCartUpdate = () => {
  const count = cartItems.value.reduce((t, i) => t + i.quantity, 0);
  window.dispatchEvent(new CustomEvent('update-cart-count', {
    detail: { cart_count: count, source: 'internal' } // Thêm nguồn 'internal'
  }));
};

const handleCartSync = (event) => {
  // Bỏ qua nếu sự kiện xuất phát từ chính trang Giỏ hàng (nội bộ)
  // để tránh việc gọi lại API fetchCart 2 lần liên tiếp
  if (event.detail && event.detail.source === 'internal') {
    return;
  }
  fetchCart(true);
};
const checkAndMergeCart = async () => {
  const token = getUserToken();
  const sessionId = localStorage.getItem('cart_session_id');
  
  // Chỉ merge khi ĐÃ LOGIN mà vẫn còn session cart (tức là có giỏ guest)
  if (!token || !sessionId) return;

  try {
    const response = await clientApiClient.post('/client/cart/merge', {}, { 
      ensureCartSession: true,
      ignoreAuthRedirect: true 
    });

    if (response.data.success) {
      if (response.data.clear_session) {
        localStorage.removeItem('cart_session_id');
      }
      Toast.fire({
        icon: 'success',
        title: 'Giỏ hàng đã được đồng bộ vào tài khoản của bạn'
      });
    }
  } catch (error) {
    console.error('Merge cart error:', error);
  }
};

const getItemName = (item) => {
  if (item.combo_id && item.combo) return item.combo.name;
  if (item.product_variant_id && item.variant) return item.variant.product?.name || 'Sản phẩm Trang sức SORA';
  return 'Sản phẩm không xác định';
};

const getItemImage = (item) => {
  if (item.combo_id && item.combo) return item.combo.thumbnail_image;
  if (item.product_variant_id && item.variant) return item.variant.image_url || item.variant.product?.thumbnail_image;
  return null;
};

const getItemPrice = (item) => {
  if (item.price !== undefined) return parseFloat(item.price);
  if (item.variant) return parseFloat(item.variant.promotional_price || item.variant.price || 0);
  return 0; 
};

const formatPrice = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value || 0);
};

const totalItems = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0);
});

const summary = computed(() => {
  if (backendSummary.value) return backendSummary.value;
  const subtotal = cartItems.value.reduce((sum, item) => sum + (item.quantity * getItemPrice(item)), 0);
  return { subtotal };
});

const hasInvalidItems = computed(() => {
  return cartItems.value.some(item => {
    if (item.combo_id) return item.combo?.status !== 'active';
    return item.variant?.product?.status !== 'published' || item.quantity > (item.variant?.stock_quantity || 0);
  });
});

const getImageUrl = (path) => {
  if (!path) return defaultPlaceholder;
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_STORAGE_URL}/${path}`;
};

const handleImageError = (e) => {
  e.target.src = defaultPlaceholder;
};

const fetchCart = async (isBackground = false) => {
  if (!isBackground) isLoading.value = true;
  try {
    const response = await clientApiClient.get('/client/cart', {
      ensureCartSession: true,
      ignoreAuthRedirect: true
    });
    if (response.data && response.data.success) {
      const newItems = response.data.data || [];
      
      if (isBackground && cartItems.value.length > 0) {
        let hasIssues = false;
        newItems.forEach(item => {
           if (item.combo_id && item.combo?.status !== 'active') hasIssues = true;
           if (!item.combo_id && item.variant?.product?.status !== 'published') hasIssues = true;
           if (!item.combo_id && item.quantity > (item.variant?.stock_quantity || 0)) hasIssues = true;
        });
        if (hasIssues && !hasInvalidItems.value) {
           Toast.fire({ icon: 'warning', title: 'Giỏ hàng vừa được cập nhật do kho hàng có thay đổi' });
        }
      }

      cartItems.value = newItems.map(item => ({ ...item, isUpdating: false }));
      if (response.data.summary) backendSummary.value = response.data.summary;
    }
  } catch (error) {
    console.error('Lỗi khi tải giỏ hàng:', error);
  } finally {
    if (!isBackground) isLoading.value = false;
  }
};

const updateQuantity = async (item, change) => {
  const newQty = item.quantity + change;
  if (newQty < 1) return; 
  if (!item.combo_id && newQty > (item.variant?.stock_quantity || 0)) {
      soraAlert.fire({
        icon: 'warning',
        title: 'Kho không đủ',
        text: `Sản phẩm này chỉ còn ${item.variant?.stock_quantity} món trong kho.`,
        confirmButtonText: 'Đã hiểu'
      });
      return;
  }
  
  const originalQty = item.quantity;
  item.isUpdating = true;
  
  try {
    const response = await clientApiClient.put(`/client/cart/${item.id}`, { quantity: newQty }, {
      ensureCartSession: true,
      ignoreAuthRedirect: true
    });
    
    if (response.data.success) {
      item.quantity = newQty;
      await fetchCart(true);
      notifyCartUpdate();
    }
  } catch (error) {
    let errorMsg = 'Không thể cập nhật số lượng.';
    if (error.response?.status === 500) {
      errorMsg = 'Lỗi kết nối máy chủ, vui lòng thử lại sau.';
    } else if (error.response?.data?.errors?.quantity) {
      errorMsg = error.response.data.errors.quantity[0];
    } else if (error.response?.data?.message) {
      errorMsg = error.response.data.message;
    }
    
    soraAlert.fire({
      icon: 'error',
      title: 'Không thể cập nhật',
      text: errorMsg,
      confirmButtonText: 'Đã hiểu'
    });

    item.quantity = originalQty;
    await fetchCart(true);
  } finally {
    if (item) item.isUpdating = false;
  }
};

const removeItem = async (itemId) => {
  soraAlert.fire({
    title: '<span class="font-oswald tracking-wider fs-4 text-dark">XÓA KHỎI GIỎ HÀNG?</span>',
    html: '<p class="text-muted font-sans" style="font-size: 0.95rem;">Bạn có chắc chắn muốn bỏ mặt hàng này không?</p>',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Đồng ý xóa',
    cancelButtonText: 'Hủy bỏ',
    buttonsStyling: false,
    customClass: {
      popup: 'border-0 shadow-lg',
      confirmButton: 'editorial-btn px-4 py-2 ms-2',
      cancelButton: 'editorial-btn-outline px-4 py-2'
    },
    reverseButtons: true 
  }).then(async (result) => {
    if (result.isConfirmed) {
      const index = cartItems.value.findIndex(i => i.id === itemId);
      if (index === -1) return;

      cartItems.value[index].isUpdating = true;
      try {
        const response = await clientApiClient.delete(`/client/cart/${itemId}`, {
          ensureCartSession: true,
          ignoreAuthRedirect: true
        });
        if (response.data.success) {
          cartItems.value.splice(index, 1);
          notifyCartUpdate();
          Toast.fire({ icon: 'success', title: 'Đã xóa sản phẩm thành công' });
          await fetchCart(true);
        }
      } catch (error) {
        soraAlert.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Có lỗi xảy ra khi xóa. Vui lòng thử lại.',
          confirmButtonText: 'Đóng'
        });
        if(cartItems.value[index]) cartItems.value[index].isUpdating = false;
      }
    }
  });
};

const clearCart = async () => {
  soraAlert.fire({
    title: '<span class="font-oswald tracking-wider fs-4 text-dark">LÀM TRỐNG GIỎ HÀNG?</span>',
    html: '<p class="text-muted font-sans" style="font-size: 0.95rem;">Toàn bộ sản phẩm sẽ bị xóa khỏi giỏ. Bạn không thể hoàn tác hành động này!</p>',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Làm trống ngay',
    cancelButtonText: 'Giữ lại',
    buttonsStyling: false,
    customClass: {
      popup: 'border-0 shadow-lg',
      confirmButton: 'editorial-btn px-4 py-2 ms-2',
      cancelButton: 'editorial-btn-outline px-4 py-2'
    },
    reverseButtons: true
  }).then(async (result) => {
    if (result.isConfirmed) {
      isLoading.value = true;
      try {
        const response = await clientApiClient.post('/client/cart/clear', {}, {
          ensureCartSession: true,
          ignoreAuthRedirect: true
        });
        if (response.data.success) {
          cartItems.value = [];
          backendSummary.value = { total_items: 0, subtotal: 0 };
          notifyCartUpdate();
          Toast.fire({ icon: 'success', title: 'Giỏ hàng đã được làm trống' });
        }
      } catch (error) {
        soraAlert.fire({ icon: 'error', title: 'Thất bại', text: 'Không thể làm trống giỏ hàng lúc này.', confirmButtonText: 'Đóng' });
      } finally {
        isLoading.value = false;
      }
    }
  });
};

onMounted(async () => {
  await checkAndMergeCart();   // ← Merge trước (nếu có)
  await fetchCart();           // ← Sau đó load giỏ hàng
  window.addEventListener('update-cart-count', handleCartSync);
});

onUnmounted(() => {
  window.removeEventListener('update-cart-count', handleCartSync);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');

.cart-wrapper { background-color: #fcfcfc; font-family: 'Manrope', sans-serif; }

.quantity-picker {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #eee;
  border-radius: 50px;
  padding: 2px;
  width: 110px;
  height: 40px;
}

.qty-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: #f8f9fa;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.qty-btn:hover:not(:disabled) {
  background: #9f273b;
  color: white;
}

.qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.qty-input { flex-grow: 1; text-align: center; font-weight: bold; font-size: 1rem; }

.btn-remove-item {
  background: none;
  border: none;
  color: #ced4da;
  transition: color 0.2s;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-remove-item:hover i { color: #dc3545 !important; }

.summary-card { background-color: #9f273b; color: white; }
.summary-skeleton-card {
  padding: 24px;
  border: 1px solid rgba(231, 206, 125, 0.24);
  border-radius: 18px;
  background: #9f273b;
  box-shadow: 0 12px 30px rgba(159, 39, 59, 0.16);
}
.btn-gold { background-color: #e7ce7d; color: #9f273b; border: none; transition: all 0.3s ease; }
.btn-gold:hover { background-color: #f1e0a8; box-shadow: 0 4px 15px rgba(231, 206, 125, 0.4); transform: translateY(-2px); }

.btn-primary-custom { background-color: #9f273b; border: none; transition: all 0.3s ease; }
.btn-primary-custom:hover { background-color: #cc1e2e; transform: translateY(-2px); }

.cart-item-row { transition: background-color 0.2s; }
.cart-item-row:hover { background-color: #fffafa; }

textarea:focus { border-color: #9f273b; box-shadow: 0 0 0 0.2rem rgba(159, 39, 59, 0.1); }

/* Toast Timer Bar */
:deep(.swal2-progress-sora) {
  background-color: #9f273b !important;
}
</style>
