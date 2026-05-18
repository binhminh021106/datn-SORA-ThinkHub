<template>
  <div class="favorite-page bg-light-custom font-sans pb-5 min-vh-100 position-relative">
    
    <!-- Tiêu đề trang -->
    <section class="pt-4 pb-5 bg-white text-center shadow-sm mb-5 position-relative">
      <!-- NÚT QUAY VỀ CỬA HÀNG -->
      <div class="container text-start mb-2">
         <router-link to="/shop" class="text-decoration-none text-secondary back-link d-inline-flex align-items-center transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="me-2" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
            </svg>
            <span class="font-serif fw-bold text-uppercase" style="font-size: 0.8rem; letter-spacing: 1px;">Quay lại Cửa hàng</span>
         </router-link>
      </div>

      <div class="container py-2">
        <span class="text-accent text-uppercase fw-bold mb-2 d-block tracking-wide" style="font-size: 0.8rem; letter-spacing: 0.2em;">Tủ Đồ Cá Nhân</span>
        <h1 class="display-6 font-serif text-main mb-3">Sản Phẩm Yêu Thích</h1>
        <div class="divider bg-accent mx-auto"></div>
        <p class="text-secondary fw-light mt-4 mb-0">Những tuyệt tác SORA mà bạn đang lưu giữ</p>
      </div>
    </section>

    <div class="container">
      <!-- CẢNH BÁO NẾU CHƯA ĐĂNG NHẬP -->
      <div v-if="!isLoggedIn" class="text-center py-5 bg-white shadow-sm p-5 border border-light mb-5">
        <h4 class="text-danger-custom mb-3 font-serif">Bạn chưa đăng nhập!</h4>
        <p class="text-secondary mb-4">Vui lòng đăng nhập để xem tủ đồ cá nhân và quản lý các sản phẩm yêu thích.</p>
        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <router-link to="/shop" class="btn btn-outline-secondary px-5 py-2 text-uppercase tracking-wide font-oswald" style="font-size: 0.9rem;">Về Cửa Hàng</router-link>
          <router-link to="/login" class="btn btn-main px-5 py-2 text-uppercase tracking-wide font-oswald" style="font-size: 0.9rem;">Đăng nhập ngay</router-link>
        </div>
      </div>

      <!-- DANH SÁCH SẢN PHẨM YÊU THÍCH -->
      <div v-if="isLoggedIn" class="mb-5 pb-4">
        <h3 class="font-serif text-dark border-bottom pb-3 mb-4">
          Bộ Sưu Tập Của Bạn <span class="badge bg-main text-white rounded-pill ms-2" style="font-size: 0.9rem;">{{ favorites.length }}</span>
        </h3>

        <!-- Trạng thái Loading -->
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-accent" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Đang tải...</span>
          </div>
        </div>

        <!-- Trạng thái trống -->
        <div v-else-if="favorites.length === 0 && !isLoading" class="empty-state text-center py-5 bg-white shadow-sm p-5 border border-light">
          <div class="empty-icon text-muted mb-4 mx-auto d-flex justify-content-center align-items-center rounded-circle" style="width: 80px; height: 80px; background-color: #f8f9fa;">
            <i class="bi bi-heart fs-1 text-secondary opacity-50"></i>
          </div>
          <h4 class="h4 font-serif text-dark mb-3">Danh sách yêu thích trống</h4>
          <p class="text-secondary fw-light mb-4">Hãy thả tim các sản phẩm để lưu chúng vào bộ sưu tập của bạn.</p>
          <router-link to="/shop" class="btn btn-main px-5 py-2 text-uppercase tracking-wide d-inline-flex align-items-center font-oswald" style="font-size: 0.9rem;">
            <i class="bi bi-shop me-2"></i> Khám Phá Cửa Hàng
          </router-link>
        </div>

        <!-- Lưới sản phẩm dùng ProductCard -->
        <div v-else class="row g-4">
          <div v-for="item in favorites" :key="'fav-'+item.id" class="col-6 col-md-4 col-lg-3">
            <ProductCard
              v-if="item.product"
              :product="item.product"
              :is-in-wishlist="true"
              :is-in-compare="isInCompare(item.product.id)"
              :show-wishlist="true"
              :show-compare="true"
              :show-add-to-cart="true"
              @toggle-wishlist="toggleFavorite"
              @toggle-compare="handleToggleCompare"
              @add-to-cart="openQuickAdd"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- TÍCH HỢP COMPONENT COMPARE MODAL -->
    <CompareModal 
      ref="compareModalRef" 
      shop-slug="sora" 
      @update-list="compareList = $event" 
    />

    <!-- MODAL QUICK ADD CHUẨN ĐỒNG BỘ 100% -->
    <div class="modal fade" id="quickAddModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-0 border-0 shadow-lg">
          <div class="modal-header bg-sora-primary text-white rounded-0 border-0 p-4">
            <h5 class="modal-title font-serif fw-bold tracking-wider">Tùy chọn Sản phẩm</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4" v-if="quickAddProduct">
            <div class="d-flex gap-3 mb-4 pb-4 border-bottom border-light-subtle">
               <img :src="quickAddDisplayImage" @error="handleImageError" class="object-fit-cover border shadow-sm" style="width: 80px; height: 80px; border-radius: 4px;">
               <div class="d-flex flex-column justify-content-center">
                  <small class="text-uppercase font-oswald tracking-widest text-gold fw-bold" style="font-size: 0.7rem;">{{ quickAddProduct.category?.name || 'Trang Sức SORA' }}</small>
                  <h6 class="font-serif fw-bold mb-1 text-dark fs-5">{{ quickAddProduct.name }}</h6>
                  <span class="text-sora-primary fw-bold font-serif fs-5">{{ formatCurrency(quickAddSelectedPrice) }}</span>
               </div>
            </div>

            <div v-for="(values, attrName) in quickAddMatrix" :key="attrName" class="mb-4">
               <p class="text-dark font-oswald tracking-wide text-uppercase mb-2 small fw-bold">
                 {{ attrName }}: <span class="fw-normal text-sora-primary ms-1">{{ quickAddSelections[attrName] || '' }}</span>
               </p>
               <div class="d-flex flex-wrap gap-2">
                 <label v-for="val in values" :key="val" class="attr-chip m-0 cursor-pointer transition-all" :class="{'selected': String(quickAddSelections[attrName]) === String(val)}">
                   <input type="radio" class="d-none" :value="val" v-model="quickAddSelections[attrName]" @change="quickAddError = false">
                   <div class="chip-inner px-3 py-2 d-flex flex-column align-items-center justify-content-center text-center shadow-sm">
                     <span class="fw-bold font-oswald tracking-wide small">{{ val }}</span>
                   </div>
                 </label>
               </div>
            </div>
            
            <div class="text-danger small fst-italic mt-2 fw-bold bg-danger bg-opacity-10 p-2 rounded" v-if="quickAddError">
               <i class="bi bi-exclamation-triangle-fill me-1"></i> Vui lòng chọn đầy đủ phân loại.
            </div>
            <div class="text-danger small fst-italic mt-2 fw-bold bg-danger bg-opacity-10 p-2 rounded" v-else-if="quickAddMatrix && Object.keys(quickAddMatrix).length > 0 && !quickAddSelectedVariant && isQuickAddAllSelected">
               <i class="bi bi-x-circle-fill me-1"></i> Phiên bản này đã hết hàng hoặc không tồn tại.
            </div>

            <button @click="confirmQuickAdd" class="btn luxury-btn-solid w-100 py-3 mt-4 font-oswald tracking-widest text-uppercase fw-bold shadow-sm fs-6" style="background-color: #9f273b; color: white; border: none;">
               <i class="bi bi-bag-plus-fill me-2"></i> Xác nhận thêm
            </button>
          </div>
          <div v-else class="p-5 text-center">
             <div class="spinner-border text-sora-primary" role="status"></div>
             <p class="mt-3 text-muted font-oswald tracking-widest text-uppercase small">Đang nạp dữ liệu...</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';
import ProductCard from '@/components/ui/ProductCard.vue';
import CompareModal from '@/components/ui/CompareModal.vue';

const router = useRouter();
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/api\/?$/, '');

const favorites = ref([]);
const isLoading = ref(true);
const isToggling = ref(null);
const isLoggedIn = ref(false);

const soraAlert = Swal.mixin({
  buttonsStyling: true,
  confirmButtonColor: '#9f273b',
  customClass: { confirmButton: 'px-4 py-2 mx-2 rounded shadow-sm fw-bold font-oswald tracking-widest text-uppercase' },
  didOpen: (modal) => { if (modal.parentElement) modal.parentElement.style.zIndex = '10005'; }
});

const Toast = Swal.mixin({
  toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true,
  background: '#fffafa', color: '#9f273b', iconColor: '#9f273b',
  didOpen: (toast) => { if (toast.parentElement) toast.parentElement.style.zIndex = '10005'; }
});

const getToken = () => {
  const commonKeys = ['access_token', 'token', 'auth_token', 'userToken', 'user_token', 'user'];
  for (const k of commonKeys) {
    const rawVal = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (!rawVal) continue;
    if (rawVal.startsWith('{')) {
      try {
        const parsed = JSON.parse(rawVal);
        if (parsed?.access_token) return parsed.access_token;
        if (parsed?.token) return parsed.token;
        if (parsed?.user?.token) return parsed.user.token;
      } catch(e) { }
    } else if (rawVal.length > 15) {
      return rawVal;
    }
  }
  return '';
};

const getImageUrl = (path) => {
  if (!path) return '/Sora-placeholder.png';
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  let cleanPath = path.startsWith('/') ? path.substring(1) : path;
  if (cleanPath.startsWith('storage/')) return `${API_BASE_URL}/${cleanPath}`;
  return `${API_BASE_URL}/storage/${cleanPath}`;
};

const handleImageError = (e) => { e.target.src = '/Sora-placeholder.png'; };
const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

const fetchFavorites = async () => {
  if (!isLoggedIn.value) {
    isLoading.value = false;
    return;
  }
  try {
    const response = await axios.get(`${API_BASE_URL}/api/client/favourites`, {
      headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' }
    });
    if (response.data.status) {
      favorites.value = response.data.data;
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      isLoggedIn.value = false;
    }
  } finally {
    isLoading.value = false;
  }
};

const toggleFavorite = async (product) => {
  const currentToken = getToken();
  if (!currentToken) {
    soraAlert.fire({ icon: 'warning', title: 'Phiên đăng nhập hết hạn!', text: 'Vui lòng đăng nhập lại.' });
    isLoggedIn.value = false;
    router.push('/login');
    return;
  }

  isToggling.value = product.id;
  try {
    const response = await axios.post(`${API_BASE_URL}/api/client/favourites/toggle`, {
      product_id: product.id
    }, {
      headers: { Authorization: `Bearer ${currentToken}`, Accept: 'application/json' }
    });

    if (response.data.status) {
      if (response.data.action === 'removed') {
        favorites.value = favorites.value.filter(item => item.product_id !== product.id);
        Toast.fire({ icon: 'info', title: 'Đã gỡ khỏi danh sách yêu thích' });
      }
    }
  } catch (error) {
    Toast.fire({ icon: 'error', title: 'Có lỗi xảy ra, thử lại sau' });
  } finally {
    isToggling.value = null;
  }
};

// ==============================================
// LOGIC COMPARE 
// ==============================================
const compareModalRef = ref(null);
const compareList = ref([]); 

const isInCompare = (id) => compareList.value.some(item => item.id === id);

const handleToggleCompare = (prod) => {
  if (compareModalRef.value) {
    compareModalRef.value.toggleCompare(prod);
  }
};

// ==============================================
// LOGIC QUICK ADD
// ==============================================
const quickAddProduct = ref(null);
const quickAddMatrix = ref({});
const quickAddSelections = ref({});
const quickAddError = ref(false);
let quickAddModalInstance = null;

const isQuickAddAllSelected = computed(() => {
    const requiredAttrs = Object.keys(quickAddMatrix.value);
    if (requiredAttrs.length === 0) return true;
    return requiredAttrs.every(attr => quickAddSelections.value[attr]);
});

const quickAddSelectedVariant = computed(() => {
    if (!quickAddProduct.value || !quickAddProduct.value.variants) return null;
    const requiredAttrs = Object.keys(quickAddMatrix.value);
    if (requiredAttrs.length === 0) return quickAddProduct.value.variants[0];
    if (!isQuickAddAllSelected.value) return null;
    return quickAddProduct.value.variants.find(v => {
        return requiredAttrs.every(attr => v.formatted_attributes && String(v.formatted_attributes[attr]) === String(quickAddSelections.value[attr]));
    });
});

const quickAddDisplayImage = computed(() => {
    if (!quickAddProduct.value) return getImageUrl(null);
    const selectedVar = quickAddSelectedVariant.value;
    if (selectedVar && selectedVar.image_url) return getImageUrl(selectedVar.image_url);
    if (quickAddProduct.value.thumbnail_image) return getImageUrl(quickAddProduct.value.thumbnail_image);
    return getImageUrl(quickAddProduct.value.fallback_image);
});

const quickAddSelectedPrice = computed(() => {
    if (!quickAddProduct.value) return 0;
    const selectedVar = quickAddSelectedVariant.value;
    if (selectedVar) return selectedVar.promotional_price || selectedVar.price;
    return quickAddProduct.value.promotional_price || quickAddProduct.value.base_price || quickAddProduct.value.fallback_price || 0;
});

const openQuickAdd = async (prod) => {
    quickAddProduct.value = null;
    quickAddError.value = false;
    quickAddSelections.value = {};
    quickAddMatrix.value = {};

    if (!quickAddModalInstance) {
        quickAddModalInstance = new window.bootstrap.Modal(document.getElementById('quickAddModal'));
    }
    quickAddModalInstance.show();

    try {
        const res = await axios.get(`${API_BASE_URL}/api/shop/all/products/${prod.slug}`);
        if (res.data && res.data.data) {
            quickAddProduct.value = {
                ...res.data.data,
                fallback_image: prod.thumbnail_image,
                fallback_price: prod.base_price 
            };
            
            const matrix = {};
            if (quickAddProduct.value.variants) {
                quickAddProduct.value.variants.forEach(variant => {
                    let attrs = {};
                    let attrVals = variant.attribute_values || variant.attributeValues;
                    if (attrVals) { 
                        attrVals.forEach(av => { if (av.attribute) attrs[av.attribute.name] = av.value; });
                    } else if (variant.attributes) {
                        attrs = typeof variant.attributes === 'string' ? JSON.parse(variant.attributes) : variant.attributes;
                    }
                    variant.formatted_attributes = attrs;
                    Object.entries(attrs).forEach(([attrName, attrValue]) => {
                        if (!matrix[attrName]) matrix[attrName] = new Set();
                        matrix[attrName].add(attrValue);
                    });
                });
            }
            
            const finalMatrix = {};
            Object.keys(matrix).forEach(key => { finalMatrix[key] = Array.from(matrix[key]); });
            quickAddMatrix.value = finalMatrix;
            
            if (quickAddProduct.value.variants && quickAddProduct.value.variants.length === 1) {
                const singleVariant = quickAddProduct.value.variants[0];
                if (singleVariant.formatted_attributes) {
                    Object.entries(singleVariant.formatted_attributes).forEach(([attrName, attrValue]) => {
                        quickAddSelections.value[attrName] = attrValue;
                    });
                }
            }
        }
    } catch (e) {
        quickAddModalInstance.hide();
        soraAlert.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể tải thông tin sản phẩm' });
    }
};

const confirmQuickAdd = async () => {
    if (!isQuickAddAllSelected.value) {
        quickAddError.value = true;
        return;
    }
    quickAddError.value = false;

    const selectedVar = quickAddSelectedVariant.value;
    if (!selectedVar) {
         Toast.fire({icon: 'error', title: 'Phiên bản đã hết hàng!'});
         return;
    }

    try {
        const token = getToken();
        let sessionId = localStorage.getItem('cart_session_id');
        if (!sessionId && !token) { 
            sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('cart_session_id', sessionId);
        }
        
        const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (sessionId) headers['X-Cart-Session-Id'] = sessionId;

        const payload = { product_variant_id: selectedVar.id, quantity: 1 };
        const res = await axios.post(`${API_BASE_URL}/api/client/cart`, payload, { headers });

        if (res.data.session_id) {
            localStorage.setItem('cart_session_id', res.data.session_id);
        }
        
        quickAddModalInstance.hide();
        Toast.fire({ icon: 'success', title: 'Đã thêm sản phẩm vào giỏ' });
    } catch (error) {
        const msg = error.response?.data?.message || 'Không thể thêm vào giỏ hàng!';
        soraAlert.fire({icon: 'error', title: 'Lỗi', text: msg});
    }
};

onMounted(() => {
  const token = getToken();
  if (token) {
    isLoggedIn.value = true;
    fetchFavorites();
  } else {
    isLoggedIn.value = false;
    isLoading.value = false;
  }
});

onUnmounted(() => {
  if (quickAddModalInstance) quickAddModalInstance.dispose();
  document.querySelectorAll('.swal2-container').forEach(el => el.remove());
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Oswald:wght@400;500;600;700&display=swap');

/* Màu sắc thương hiệu SORA */
.bg-light-custom { background-color: #faf9f8 !important; }
.bg-sora-primary { background-color: #9f273b !important; }
.text-sora-primary { color: #9f273b !important; }
.bg-main { background-color: #9f273b !important; }
.text-main { color: #9f273b !important; }
.bg-accent { background-color: #e7ce7d !important; }
.text-accent { color: #e7ce7d !important; }
.text-gold { color: #e7ce7d !important; }
.text-danger-custom { color: #cc1e2e !important; }

/* Font chữ */
.font-serif { font-family: "Playfair Display", "Merriweather", serif; }
.font-oswald { font-family: 'Oswald', sans-serif; }
.divider { width: 4rem; height: 2px; }
.object-fit-cover { object-fit: cover !important; }
.tracking-wide { letter-spacing: 0.1em; }
.tracking-widest { letter-spacing: 2px; }

/* Nút Quay Lại */
.back-link { transition: all 0.3s ease; }
.back-link:hover { color: #9f273b !important; transform: translateX(-5px); }

/* Nút main */
.btn-main { background-color: #9f273b; color: white; border: 1px solid #9f273b; transition: all 0.3s ease; }
.btn-main:hover { background-color: #7a1c2d; border-color: #7a1c2d; color: white; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(159,39,59,0.3); }
.btn-outline-secondary:hover { background-color: #e9ecef; color: #2c2c2c; }

/* CSS QUICK ADD MODAL CHIP */
.attr-chip { border-radius: 4px; overflow: hidden; min-width: 55px; }
.attr-chip .chip-inner { border: 1px solid #dee2e6; background-color: #fff; color: #555; border-radius: 4px; transition: all 0.3s ease-in-out; padding: 6px 12px; }
.attr-chip:hover .chip-inner { border-color: #e7ce7d; color: #9f273b; }
.attr-chip.selected .chip-inner { background-color: #9f273b; border-color: #9f273b; color: #fff !important; box-shadow: 0 4px 10px rgba(159, 39, 59, 0.25); }
.attr-chip.selected .chip-inner span { color: #fff !important; }

.luxury-btn-solid { background-color: #9f273b; color: white; border: 1px solid #9f273b; transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); }
.luxury-btn-solid:hover { background-color: #7a1c2d; border-color: #7a1c2d; color: white; box-shadow: 0 8px 20px rgba(159,39,59,0.3); transform: translateY(-2px); }
</style>