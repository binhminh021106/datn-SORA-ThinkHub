<template>
  <div class="modal fade" id="soraGlobalQuickAddModal" tabindex="-1" aria-hidden="true" ref="modalElement">
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
               <!-- Thay thế radio bằng div để kiểm soát hoàn toàn click event và CSS -->
               <div v-for="val in values" :key="val" 
                    class="attr-chip m-0 transition-all cursor-pointer" 
                    :class="{
                      'selected': String(quickAddSelections[attrName]) === String(val),
                      'disabled-option': !isOptionAvailable(attrName, val) && String(quickAddSelections[attrName]) !== String(val)
                    }"
                    @click="handleSelect(attrName, val)">
                 <div class="chip-inner px-3 py-2 d-flex flex-column align-items-center justify-content-center text-center shadow-sm">
                   <span class="fw-bold font-oswald tracking-wide small">{{ val }}</span>
                 </div>
               </div>
             </div>
          </div>
          
          <div class="text-danger small fst-italic mt-2 fw-bold bg-danger bg-opacity-10 p-2 rounded" v-if="quickAddError">
             <i class="bi bi-exclamation-triangle-fill me-1"></i> Vui lòng chọn đầy đủ phân loại.
          </div>
          <div class="text-danger small fst-italic mt-2 fw-bold bg-danger bg-opacity-10 p-2 rounded" v-else-if="quickAddMatrix && Object.keys(quickAddMatrix).length > 0 && !quickAddSelectedVariant && isQuickAddAllSelected">
             <i class="bi bi-x-circle-fill me-1"></i> Phiên bản này đã hết hàng hoặc không tồn tại.
          </div>

          <button @click="confirmQuickAdd" :disabled="isAdding" class="btn luxury-btn-solid w-100 py-3 mt-4 font-oswald tracking-widest text-uppercase fw-bold shadow-sm fs-6" style="background-color: #9f273b; color: white; border: none;">
             <span v-if="isAdding" class="spinner-border spinner-border-sm me-2"></span>
             <i v-else class="bi bi-bag-plus-fill me-2"></i> Xác nhận thêm
          </button>
        </div>
        
        <div v-else class="p-5 text-center">
           <div class="spinner-border text-sora-primary" role="status"></div>
           <p class="mt-3 text-muted font-oswald tracking-widest text-uppercase small">Đang nạp dữ liệu...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import Toast from '@/utils/toastConfig';
import { globalModalState } from '@/stores/modalState';

// CẬP NHẬT: Không dùng hàm replace() xóa /api nữa, khai báo tương tự Index.vue và Detail.vue
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';

const quickAddProduct = ref(null);
const quickAddMatrix = ref({});
const quickAddSelections = ref({});
const quickAddError = ref(false);
const isAdding = ref(false);
let quickAddModalInstance = null;

const soraAlert = Swal.mixin({
  buttonsStyling: true,
  confirmButtonColor: '#9f273b',
  customClass: { confirmButton: 'px-4 py-2 mx-2 rounded shadow-sm fw-bold font-oswald tracking-widest text-uppercase' }
});

watch(() => globalModalState.quickAddTrigger, () => {
    if (globalModalState.quickAddProduct) {
        openModal(globalModalState.quickAddProduct);
    }
});

onMounted(() => {
    quickAddModalInstance = new window.bootstrap.Modal(document.getElementById('soraGlobalQuickAddModal'));
});

const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

// CẬP NHẬT: Hàm lấy URL ảnh sử dụng biến STORAGE_URL
const getImageUrl = (path) => {
  if (!path) return '/Sora-placeholder.png';
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  
  let cleanPath = path.startsWith('/') ? path.substring(1) : path;
  if (cleanPath.startsWith('storage/')) {
      cleanPath = cleanPath.substring(8);
  }
  return `${STORAGE_URL}/${cleanPath}`;
};

const handleImageError = (e) => { e.target.src = '/Sora-placeholder.png'; };

const getToken = () => {
  const commonKeys = ['access_token', 'token', 'auth_token', 'userToken', 'user_token'];
  for (const k of commonKeys) {
    const val = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (val && val.length > 15) return val; 
  }
  return '';
};

const getSafeStorage = (key) => { try { return localStorage.getItem(key); } catch(e) { return null; } };
const setSafeStorage = (key, val) => { try { localStorage.setItem(key, val); } catch(e) { } };

const isQuickAddAllSelected = computed(() => {
    const requiredAttrs = Object.keys(quickAddMatrix.value);
    if (requiredAttrs.length === 0) return true;
    return requiredAttrs.every(attr => quickAddSelections.value[attr]);
});

const isOptionAvailable = (attrName, attrValue) => {
    if (!quickAddProduct.value || !quickAddProduct.value.variants) return false;

    const testSelections = { ...quickAddSelections.value, [attrName]: attrValue };

    return quickAddProduct.value.variants.some(variant => {
        const vAttrs = variant.formatted_attributes;
        if (!vAttrs) return false;

        return Object.entries(testSelections).every(([key, value]) => {
            if (!value) return true; 
            return String(vAttrs[key]) === String(value);
        });
    });
};

// Hàm xử lý chọn biến thể tích hợp Auto-Resolve Conflict (Tự gỡ xung đột)
const handleSelect = (attrName, val) => {
    if (isOptionAvailable(attrName, val)) {
        quickAddSelections.value = { ...quickAddSelections.value, [attrName]: val };
    } else {
        // Option bị mờ (hết hàng do xung đột) nhưng User vẫn bấm.
        // Ta vẫn set nó làm active, và tự động bỏ chọn Option gây xung đột để User không bị kẹt cứng.
        const newSelections = { [attrName]: val };
        
        Object.keys(quickAddMatrix.value).forEach(key => {
            if (key !== attrName && quickAddSelections.value[key]) {
                const testValid = quickAddProduct.value.variants.some(variant => {
                    const vAttrs = variant.formatted_attributes;
                    if (!vAttrs) return false;
                    return String(vAttrs[attrName]) === String(val) && String(vAttrs[key]) === String(quickAddSelections.value[key]);
                });
                if (testValid) {
                    newSelections[key] = quickAddSelections.value[key];
                } else {
                    newSelections[key] = ''; // Bỏ chọn phần xung đột
                }
            } else if (key !== attrName) {
                 newSelections[key] = '';
            }
        });
        quickAddSelections.value = newSelections;
    }
    quickAddError.value = false;
};

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
    if (selectedVar && selectedVar.image) return getImageUrl(selectedVar.image);
    if (quickAddProduct.value.thumbnail_image) return getImageUrl(quickAddProduct.value.thumbnail_image);
    return getImageUrl(quickAddProduct.value.fallback_image);
});

const quickAddSelectedPrice = computed(() => {
    if (!quickAddProduct.value) return 0;
    const selectedVar = quickAddSelectedVariant.value;
    if (selectedVar) return selectedVar.promotional_price || selectedVar.price;
    return quickAddProduct.value.promotional_price || quickAddProduct.value.base_price || quickAddProduct.value.fallback_price || 0;
});

const openModal = async (prod) => {
    quickAddProduct.value = null;
    quickAddError.value = false;
    quickAddSelections.value = {};
    quickAddMatrix.value = {};

    quickAddModalInstance.show();

    try {
        const res = await axios.get(`${API_BASE_URL}/shop/all/products/${prod.slug}`);
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
                    let attrVals = variant.attributes;
                    // Fix: ProductDetailController API map properties dưới dạng array attributes
                    if (attrVals && typeof attrVals === 'object') {
                        Object.entries(attrVals).forEach(([attrName, attrValId]) => {
                            // API trả ID, nhưng QuickAddMatrix cần Tên, vì vậy ta map qua grouped attributes
                            const foundAttr = quickAddProduct.value.attributes?.[attrName]?.find(a => a.id === attrValId);
                            if (foundAttr) attrs[attrName] = foundAttr.name;
                        });
                    }
                    variant.formatted_attributes = attrs;
                    Object.entries(attrs).forEach(([attrName, attrValue]) => {
                        if (!matrix[attrName]) matrix[attrName] = new Set();
                        matrix[attrName].add(attrValue);
                    });
                });
            }
            
            const finalMatrix = {};
            const initialSelections = {};
            Object.keys(matrix).forEach(key => { 
                finalMatrix[key] = Array.from(matrix[key]); 
                initialSelections[key] = ''; // Khởi tạo rỗng để Vue theo dõi Reactivity
            });
            quickAddMatrix.value = finalMatrix;
            quickAddSelections.value = initialSelections;
            
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
    if (isAdding.value) return;
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

    isAdding.value = true;
    try {
        const token = getToken();
        let sessionId = getSafeStorage('cart_session_id');
        if (!sessionId && !token) { 
            sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
            setSafeStorage('cart_session_id', sessionId);
        }
        
        const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (sessionId) headers['X-Cart-Session-Id'] = sessionId;

        const payload = { product_variant_id: selectedVar.id, quantity: 1 };
        const res = await axios.post(`${API_BASE_URL}/client/cart`, payload, { headers });

        if (res.data.session_id) {
            setSafeStorage('cart_session_id', res.data.session_id);
        }
        
        quickAddModalInstance.hide();
        Toast.fire({ icon: 'success', title: 'Đã thêm sản phẩm vào giỏ' });
    } catch (error) {
        const msg = error.response?.data?.message || 'Không thể thêm vào giỏ hàng!';
        soraAlert.fire({icon: 'error', title: 'Lỗi', text: msg});
    } finally {
        isAdding.value = false;
    }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Oswald:wght@400;500;600;700&display=swap');

.font-serif { font-family: "Playfair Display", serif !important; }
.font-oswald { font-family: "Oswald", sans-serif !important; }
.bg-sora-primary { background-color: #9f273b !important; }
.text-sora-primary { color: #9f273b !important; }
.text-gold { color: #e7ce7d !important; }
.tracking-wide { letter-spacing: 0.1em; }
.tracking-widest { letter-spacing: 2px; }
.transition-all { transition: all 0.3s ease; }

.attr-chip { border-radius: 4px; overflow: hidden; min-width: 55px; }
.attr-chip .chip-inner { border: 1px solid #dee2e6; background-color: #fff; color: #555; border-radius: 4px; transition: all 0.3s ease-in-out; padding: 6px 12px; }
.attr-chip:hover .chip-inner { border-color: #e7ce7d; color: #9f273b; }

/* Bắt buộc phải có !important để không bị đè bởi class mờ phía dưới */
.attr-chip.selected .chip-inner { 
    background-color: #9f273b !important; 
    border-color: #9f273b !important; 
    color: #fff !important; 
    box-shadow: 0 4px 10px rgba(159, 39, 59, 0.25) !important; 
}
.attr-chip.selected .chip-inner span { color: #fff !important; }

/* Hiệu ứng gạch bỏ khi option bị hết hàng do xung đột */
.attr-chip.disabled-option .chip-inner {
  opacity: 0.4;
  background-color: #f8f9fa !important;
  border-color: #e9ecef !important;
  color: #adb5bd !important;
  text-decoration: line-through;
}

.luxury-btn-solid { background-color: #9f273b; color: white; border: 1px solid #9f273b; transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); }
.luxury-btn-solid:hover { background-color: #7a1c2d; border-color: #7a1c2d; color: white; box-shadow: 0 8px 20px rgba(159,39,59,0.3); transform: translateY(-2px); }
</style>