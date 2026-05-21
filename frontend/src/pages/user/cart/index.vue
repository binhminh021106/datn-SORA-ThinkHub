<template>
  <div class="cart-wrapper pb-5" style="min-height: 100vh; font-family: 'Lato', sans-serif;">

    <main class="container mt-5">
      <div class="d-flex flex-wrap align-items-center justify-content-between mb-5 gap-3">
        <div>
          <h2 class="fs-1 text-dark mb-0" style="font-family: 'Playfair Display', serif;">Giỏ hàng của bạn</h2>
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

      <div v-if="isLoading" class="d-flex justify-content-center align-items-center py-5">
        <div class="spinner-border" style="color: #9f273b; width: 3rem; height: 3rem;" role="status"></div>
      </div>

      <div v-else-if="cartItems.length === 0" class="text-center py-5 bg-white shadow-sm rounded-0 border-top border-4 border-danger-custom">
        <div class="py-5">
          <i class="bi bi-cart-x fs-1 text-muted opacity-50 mb-3 d-block" style="font-size: 4rem !important;"></i>
          <p class="fs-5 text-secondary mb-4" style="font-family: 'Playfair Display', serif;">Giỏ hàng của bạn đang trống.</p>
          <button @click="router.push('/shop')" class="btn btn-primary-custom rounded-pill px-5 py-3 text-uppercase text-white shadow-sm fw-bold">
            Tiếp tục mua sắm
          </button>
        </div>
      </div>

      <div v-else class="row g-5">
        
        <!-- Cột trái: Danh sách sản phẩm -->
        <div class="col-lg-8">
          <!-- FIX BLIND SPOT: Đổi lưới từ 6-2-2-2 thành 5-2-2-3 để nhường không gian cho số tiền lớn -->
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
                <h3 class="fs-5 text-dark mb-1 fw-bold" style="font-family: 'Playfair Display', serif;">{{ getItemName(item) }}</h3>
                
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
            <!-- FIX BLIND SPOT: Đổi col-2 thành col-3, thêm text-nowrap để giá tiền lớn không bị đè lên nút + -->
            <div class="col-3 d-none d-md-flex justify-content-end align-items-center gap-3">
              <span class="fs-5 fw-bold text-primary-custom text-nowrap" >
                {{ formatPrice(item.quantity * getItemPrice(item)) }}
              </span>
              <button @click="removeItem(item.id)" :disabled="item.isUpdating" class="btn-remove-item flex-shrink-0" title="Xóa khỏi giỏ">
                <i class="bi bi-x-lg fw-bold text-danger"></i>
              </button>
            </div>
          </div>
          
          <div class="mt-5">
            <label class="form-label small text-secondary fw-bold text-uppercase"><i class="bi bi-pencil-square me-1"></i> Ghi chú đơn hàng (Tùy chọn)</label>
            <textarea class="form-control rounded-3 shadow-sm border-light-subtle bg-white p-3" rows="3" placeholder="Ví dụ: Đóng gói quà tặng, giao giờ hành chính..."></textarea>
          </div>
        </div>

        <!-- Cột phải: Summary -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-lg rounded-4 p-4 sticky-top summary-card" style="top: 100px;">
            <h3 class="fs-4 text-white mb-4 pb-3 border-bottom border-light border-opacity-25" style="font-family: 'Playfair Display', serif;"><i class="bi bi-receipt me-2"></i> Tổng quan</h3>
            
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

            <router-link to="/checkout" class="btn btn-gold w-100 rounded-pill py-3 fw-bold text-uppercase shadow-lg btn-checkout d-flex align-items-center justify-content-center gap-2">
                Thanh toán an toàn <i class="bi bi-shield-lock-fill fs-5"></i>
            </router-link>

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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';
import Toast from '@/utils/toastConfig';
import defaultPlaceholder from '@/assets/images/defaults/placeholder.png';

const router = useRouter();
const isLoading = ref(true);
const cartItems = ref([]);
const backendSummary = ref(null);

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/client/cart`;

const soraAlert = Swal.mixin({
  buttonsStyling: true,
  confirmButtonColor: '#9f273b',
  cancelButtonColor: '#6c757d',
  customClass: {
    confirmButton: 'px-4 py-2 mx-2 rounded-pill shadow-sm fw-bold',
    cancelButton: 'px-4 py-2 mx-2 rounded-pill fw-bold'
  }
});

const getHeaders = () => {
  const headers = { 'Accept': 'application/json' };
  const token = localStorage.getItem('auth_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  let sid = localStorage.getItem('cart_session_id');
  if (!sid && !token) { 
    sid = 'session_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('cart_session_id', sid);
  }
  if (sid) headers['X-Cart-Session-Id'] = sid;
  return headers;
};

// ==================== THÊM MỚI: TỰ ĐỘNG MERGE ====================
const checkAndMergeCart = async () => {
  const token = localStorage.getItem('auth_token');
  const sessionId = localStorage.getItem('cart_session_id');
  
  // Chỉ merge khi ĐÃ LOGIN mà vẫn còn session cart (tức là có giỏ guest)
  if (!token || !sessionId) return;

  try {
    const response = await axios.post(`${API_BASE_URL}/merge`, {}, { 
      headers: getHeaders() 
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
    // Không báo lỗi cho user để tránh làm gián đoạn trải nghiệm
  }
};
// ============================================================

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
    const response = await axios.get(API_BASE_URL, { headers: getHeaders() });
    if (response.data && response.data.success) {
      cartItems.value = (response.data.data || []).map(item => ({ ...item, isUpdating: false }));
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
    const response = await axios.put(`${API_BASE_URL}/${item.id}`, 
      { quantity: newQty }, 
      { headers: getHeaders() }
    );
    
    if (response.data.success) {
      item.quantity = newQty;
      await fetchCart(true);
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
    title: 'Xóa khỏi giỏ hàng?',
    text: "Bạn có chắc chắn muốn bỏ mặt hàng này không?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Đồng ý xóa',
    cancelButtonText: 'Hủy bỏ',
    reverseButtons: true 
  }).then(async (result) => {
    if (result.isConfirmed) {
      const index = cartItems.value.findIndex(i => i.id === itemId);
      if (index === -1) return;

      cartItems.value[index].isUpdating = true;
      try {
        const response = await axios.delete(`${API_BASE_URL}/${itemId}`, { headers: getHeaders() });
        if (response.data.success) {
          cartItems.value.splice(index, 1);
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
    title: 'Làm trống giỏ hàng?',
    text: "Toàn bộ sản phẩm sẽ bị xóa khỏi giỏ. Bạn không thể hoàn tác hành động này!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Làm trống ngay',
    cancelButtonText: 'Giữ lại',
    reverseButtons: true
  }).then(async (result) => {
    if (result.isConfirmed) {
      isLoading.value = true;
      try {
        const response = await axios.post(`${API_BASE_URL}/clear`, {}, { headers: getHeaders() });
        if (response.data.success) {
          cartItems.value = [];
          backendSummary.value = { total_items: 0, subtotal: 0 };
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
});
</script>

<style scoped>

.cart-wrapper { background-color: #fcfcfc; }

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