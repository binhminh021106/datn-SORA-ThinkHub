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
import Swal from 'sweetalert2';
import { globalModalState } from '@/stores/modalState';
import { apiClient, getFullImage } from '@/utils/axios';

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

const Toast = Swal.mixin({
  toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true,
  background: '#fffafa', color: '#9f273b', iconColor: '#9f273b'
});

// LẮNG NGHE TÍN HIỆU TỪ TRẠNG THÁI TOÀN CỤC
watch(() => globalModalState.quickAddTrigger, () => {
    if (globalModalState.quickAddProduct) {
        openModal(globalModalState.quickAddProduct);
    }
});

onMounted(() => {
    quickAddModalInstance = new window.bootstrap.Modal(document.getElementById('soraGlobalQuickAddModal'));
});

const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

const getImageUrl = (path) => getFullImage(path);

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

const openModal = async (prod) => {
    quickAddProduct.value = null;
    quickAddError.value = false;
    quickAddSelections.value = {};
    quickAddMatrix.value = {};

    quickAddModalInstance.show();

    try {
        const res = await apiClient.get(`/shop/all/products/${prod.slug}`);
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
        const res = await axios.post(`${API_BASE_URL}/api/client/cart`, payload, { headers });

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
.attr-chip.selected .chip-inner { background-color: #9f273b; border-color: #9f273b; color: #fff !important; box-shadow: 0 4px 10px rgba(159, 39, 59, 0.25); }
.attr-chip.selected .chip-inner span { color: #fff !important; }

.luxury-btn-solid { background-color: #9f273b; color: white; border: 1px solid #9f273b; transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); }
.luxury-btn-solid:hover { background-color: #7a1c2d; border-color: #7a1c2d; color: white; box-shadow: 0 8px 20px rgba(159,39,59,0.3); transform: translateY(-2px); }
</style>