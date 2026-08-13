<template>
  <div class="modal fade" id="soraGlobalQuickAddModal" tabindex="-1" aria-hidden="true" ref="modalElement" style="z-index: 10000000 !important;">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg" style="border-radius: 12px; overflow: hidden; background-color: #ffffff !important;">
        <div class="modal-header bg-sora-primary text-white border-0 p-4" style="border-radius: 12px 12px 0 0;">
          <h5 class="modal-title font-serif fw-bold tracking-wider">Tùy chọn Sản phẩm</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        
        <div class="modal-body p-4" v-if="quickAddProduct">
          <div class="d-flex gap-3 mb-4 pb-4 border-bottom border-light-subtle">
             <img :src="quickAddDisplayImage" @error="handleImageError" class="object-fit-cover border shadow-sm" style="width: 80px; height: 80px; border-radius: 4px;">
             <div class="d-flex flex-column justify-content-center">
                <small class="text-uppercase font-oswald tracking-widest text-gold fw-bold" style="font-size: 0.7rem;">{{ quickAddProduct.category?.name || 'Trang Sức SORA' }}</small>
                <h6 class="font-serif fw-bold mb-1 text-dark fs-5">{{ quickAddProduct.name }}</h6>
                <span class="text-sora-primary fw-bold font-oswald fs-5">{{ formatCurrency(quickAddSelectedPrice) }}</span>
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
          
          <div class="mb-4 d-flex align-items-center gap-3">
             <p class="text-dark font-oswald tracking-wide text-uppercase mb-0 small fw-bold">Số lượng:</p>
             <div class="d-flex align-items-center border border-light-subtle rounded-3 bg-white overflow-hidden shadow-sm" style="height: 44px;">
                <button type="button" @click="decreaseQuantity" class="btn btn-light border-0 rounded-0 px-3 h-100 d-flex align-items-center text-secondary hover-bg-light transition-all" style="background: transparent;">-</button>
                <input type="number" v-model="quantity" @change="validateQuantity" class="form-control border-0 text-center text-dark font-oswald fw-bold p-0 shadow-none hide-arrow" style="width: 50px; background: transparent; font-size: 1.1rem;" min="1">
                <button type="button" @click="increaseQuantity" class="btn btn-light border-0 rounded-0 px-3 h-100 d-flex align-items-center text-secondary hover-bg-light transition-all" style="background: transparent;">+</button>
             </div>
             <div v-if="quickAddSelectedVariant && getVariantStock(quickAddSelectedVariant) > 0" class="small text-muted font-oswald">
                 Còn {{ getVariantStock(quickAddSelectedVariant) }} sản phẩm
             </div>
          </div>

          <div class="text-danger small fst-italic mt-2 fw-bold bg-danger bg-opacity-10 p-2 rounded" v-if="quickAddError">
             <i class="bi bi-exclamation-triangle-fill me-1"></i> Vui lòng chọn đầy đủ phân loại.
          </div>
          <div class="text-danger small fst-italic mt-2 fw-bold bg-danger bg-opacity-10 p-2 rounded" v-else-if="quickAddMatrix && Object.keys(quickAddMatrix).length > 0 && !quickAddSelectedVariant && isQuickAddAllSelected">
             <i class="bi bi-x-circle-fill me-1"></i> Phiên bản này không tồn tại.
          </div>
          <div class="text-danger small fst-italic mt-2 fw-bold bg-danger bg-opacity-10 p-2 rounded" v-else-if="quickAddSelectedVariant && getVariantStock(quickAddSelectedVariant) <= 0">
             <i class="bi bi-slash-circle me-1"></i> Phiên bản này đã hết hàng.
          </div>

          <button @click="confirmQuickAdd" :disabled="isAdding || (quickAddSelectedVariant && getVariantStock(quickAddSelectedVariant) <= 0)" class="btn w-100 py-3 mt-4 px-4 font-oswald tracking-widest fw-normal text-white text-uppercase d-flex justify-content-center align-items-center transition-all" :style="(quickAddSelectedVariant && getVariantStock(quickAddSelectedVariant) <= 0) ? 'background-color: #6c757d !important; border-radius: 8px; cursor: not-allowed; opacity: 0.8;' : 'background-color: #9f273b; border-radius: 8px; box-shadow: 0 4px 15px rgba(159,39,59,0.2);'">
             <span v-if="isAdding" class="spinner-border spinner-border-sm me-2"></span>
             <span v-else-if="quickAddSelectedVariant && getVariantStock(quickAddSelectedVariant) <= 0"><i class="bi bi-slash-circle me-2"></i> ĐÃ HẾT HÀNG</span>
             <span v-else><i class="bi bi-bag-plus-fill me-2"></i> Xác nhận thêm</span>
          </button>
        </div>
        
        <div v-else class="modal-body p-4 quick-add-skeleton">
           <div class="d-flex gap-3 mb-4 pb-4 border-bottom border-light-subtle">
             <img
               v-if="quickAddPreviewImage"
               :src="quickAddPreviewImage"
               @error="handleImageError"
               class="object-fit-cover border shadow-sm flex-shrink-0"
               style="width: 80px; height: 80px; border-radius: 4px;"
               alt=""
             >
             <SoraSkeleton v-else variant="image" width="80px" height="80px" radius="4px" class="flex-shrink-0" />
             <div v-if="quickAddPreview" class="flex-grow-1 d-flex flex-column justify-content-center overflow-hidden">
               <small class="text-uppercase font-oswald tracking-widest text-gold fw-bold text-truncate" style="font-size: 0.7rem;">
                 {{ quickAddPreview.category?.name || 'Trang Sức SORA' }}
               </small>
               <h6 class="font-serif fw-bold mb-1 text-dark fs-5 text-truncate">{{ quickAddPreview.name }}</h6>
               <span class="text-sora-primary fw-bold font-oswald fs-5">{{ formatCurrency(quickAddPreview.promotional_price || quickAddPreview.base_price) }}</span>
             </div>
             <div v-else class="flex-grow-1 d-flex flex-column justify-content-center">
               <SoraSkeleton width="38%" height="12px" class="mb-2" />
               <SoraSkeleton width="78%" height="20px" class="mb-2" />
               <SoraSkeleton width="44%" height="20px" />
             </div>
           </div>

           <div v-for="section in 2" :key="section" class="quick-add-skeleton-section mb-4">
             <SoraSkeleton width="26%" height="14px" class="mb-3" />
             <div class="d-flex flex-wrap gap-2">
               <SoraSkeleton v-for="chip in section === 1 ? 3 : 2" :key="chip" :width="chip === 1 ? '118px' : '92px'" height="42px" radius="4px" />
             </div>
           </div>

           <div class="d-flex align-items-center gap-3 mb-4">
             <SoraSkeleton width="84px" height="14px" />
             <SoraSkeleton width="164px" height="44px" radius="8px" />
           </div>
           <SoraSkeleton width="100%" height="72px" radius="8px" />
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
import SoraSkeleton from '@/components/ui/SoraSkeleton.vue';
import { API_BASE_URL, getStorageUrl } from '@/utils/env';
import { createCartSessionId } from '@/composables/useUtilities';

// CẬP NHẬT: Không dùng hàm replace() xóa /api nữa, khai báo tương tự Index.vue và Detail.vue
const quickAddProduct = ref(null);
const quickAddPreview = ref(null);
const quickAddMatrix = ref({});
const quickAddSelections = ref({});
const quickAddError = ref(false);
const isAdding = ref(false);
const quantity = ref(1);
let quickAddModalInstance = null;
let pendingSuccessToast = false;
let activeQuickAddRequest = 0;

const QUICK_ADD_CACHE_TTL = 45 * 1000;
const QUICK_ADD_CACHE_LIMIT = 20;
const quickAddCache = new Map();
const pendingQuickAddRequests = new Map();

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
    const modalElement = document.getElementById('soraGlobalQuickAddModal');
    quickAddModalInstance = new window.bootstrap.Modal(modalElement);

    modalElement.addEventListener('hidden.bs.modal', () => {
        document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');

        if (pendingSuccessToast) {
            pendingSuccessToast = false;
            Toast.fire({ icon: 'success', title: 'Đã thêm sản phẩm vào giỏ' });
        }
    });
});

const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

// CẬP NHẬT: Hàm lấy URL ảnh sử dụng biến STORAGE_URL
const getImageUrl = (path) => {
  return getStorageUrl(path);
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

const getVariantStock = (variant) => {
    if (!variant) return 0;
    return Number(variant.stock_quantity ?? variant.stock ?? 0);
};

const increaseQuantity = () => {
    if (quickAddSelectedVariant.value) {
        const maxStock = getVariantStock(quickAddSelectedVariant.value);
        if (quantity.value < maxStock) {
            quantity.value++;
        } else {
            Toast.fire({ icon: 'warning', title: `Chỉ còn ${maxStock} sản phẩm trong kho` });
        }
    } else {
        quantity.value++;
    }
};

const decreaseQuantity = () => {
    if (quantity.value > 1) {
        quantity.value--;
    }
};

const validateQuantity = () => {
    let val = parseInt(quantity.value);
    if (isNaN(val) || val < 1) {
        quantity.value = 1;
        return;
    }
    if (quickAddSelectedVariant.value) {
        const maxStock = getVariantStock(quickAddSelectedVariant.value);
        if (val > maxStock) {
            quantity.value = maxStock;
            Toast.fire({ icon: 'warning', title: `Chỉ còn ${maxStock} sản phẩm trong kho` });
        } else {
            quantity.value = val;
        }
    } else {
        quantity.value = val;
    }
};

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

        const isMatch = Object.entries(testSelections).every(([key, value]) => {
            if (!value) return true; 
            return String(vAttrs[key]) === String(value);
        });
        
        return isMatch && getVariantStock(variant) > 0;
    });
};

// Hàm xử lý chọn biến thể tích hợp Auto-Resolve Conflict (Tự gỡ xung đột)
const handleSelect = (attrName, val) => {
    // Nếu click lại vào option đang chọn -> bỏ chọn
    if (String(quickAddSelections.value[attrName]) === String(val)) {
        quickAddSelections.value = { ...quickAddSelections.value, [attrName]: '' };
    } else if (isOptionAvailable(attrName, val)) {
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
                    return String(vAttrs[attrName]) === String(val) && String(vAttrs[key]) === String(quickAddSelections.value[key]) && getVariantStock(variant) > 0;
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
    validateQuantity(); // Re-validate quantity when variant changes
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

const quickAddPreviewImage = computed(() => (
    quickAddPreview.value?.thumbnail_image ? getImageUrl(quickAddPreview.value.thumbnail_image) : null
));

const quickAddSelectedPrice = computed(() => {
    if (!quickAddProduct.value) return 0;
    const selectedVar = quickAddSelectedVariant.value;
    if (selectedVar) return selectedVar.promotional_price || selectedVar.price;
    return quickAddProduct.value.promotional_price || quickAddProduct.value.base_price || quickAddProduct.value.fallback_price || 0;
});

const getQuickAddData = (slug) => {
    const cached = quickAddCache.get(slug);
    if (cached && Date.now() - cached.cachedAt < QUICK_ADD_CACHE_TTL) {
        return Promise.resolve(JSON.parse(JSON.stringify(cached.data)));
    }

    if (pendingQuickAddRequests.has(slug)) {
        return pendingQuickAddRequests.get(slug);
    }

    const request = axios.get(`${API_BASE_URL}/shop/all/products/${slug}/quick-add`)
        .then((response) => {
            if (!response.data?.data) {
                throw new Error('Quick Add data is unavailable.');
            }

            quickAddCache.set(slug, { data: response.data.data, cachedAt: Date.now() });
            if (quickAddCache.size > QUICK_ADD_CACHE_LIMIT) {
                quickAddCache.delete(quickAddCache.keys().next().value);
            }

            return response.data.data;
        })
        .finally(() => pendingQuickAddRequests.delete(slug));

    pendingQuickAddRequests.set(slug, request);
    return request;
};

const openModal = async (prod) => {
    const requestId = ++activeQuickAddRequest;
    quickAddProduct.value = null;
    quickAddPreview.value = prod;
    quickAddError.value = false;
    quickAddSelections.value = {};
    quickAddMatrix.value = {};
    quantity.value = 1;

    quickAddModalInstance.show();

    try {
        const productData = await getQuickAddData(prod.slug);
        if (requestId !== activeQuickAddRequest) return;

        if (productData) {
            quickAddProduct.value = {
                ...productData,
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
        if (requestId !== activeQuickAddRequest) return;
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
            sessionId = createCartSessionId();
            if (sessionId) setSafeStorage('cart_session_id', sessionId);
        }
        
        const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (sessionId) headers['X-Cart-Session-Id'] = sessionId;

        const payload = { product_variant_id: selectedVar.id, quantity: quantity.value };
        const res = await axios.post(`${API_BASE_URL}/client/cart`, payload, { headers });

        if (res.data.session_id) {
            setSafeStorage('cart_session_id', res.data.session_id);
        }

        // Lấy số lượng giỏ hàng ngay từ kết quả của POST API nếu có
        let cartCount = 1;
        if (res.data.summary && typeof res.data.summary.total_items !== 'undefined') {
             cartCount = res.data.summary.total_items;
        } else if (typeof res.data.cart_count !== 'undefined') {
             cartCount = res.data.cart_count;
        } else {
            // Không chặn try-catch nếu GET lỗi. Lỗi GET chỉ là lỗi phụ.
            cartCount = await new Promise((resolve) => {
                 axios.get(`${API_BASE_URL}/client/cart`, { headers })
                 .then(cartRes => resolve(cartRes.data?.summary?.total_items ?? 0))
                 .catch(() => resolve(1)); // Giả định có 1 sản phẩm nếu không thể lấy từ server
            });
        }
        
        window.dispatchEvent(new CustomEvent('update-cart-count', {
            detail: { cart_count: cartCount }  
        }));
        
        pendingSuccessToast = true;
        quickAddModalInstance.hide();
    } catch (error) {
        const msg = error.response?.data?.message || 'Không thể thêm vào giỏ hàng!';
        soraAlert.fire({icon: 'error', title: 'Lỗi', text: msg});
    } finally {
        isAdding.value = false;
    }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Oswald:wght@400;500;600;700&display=swap');



.font-serif { font-family: 'Josefin Sans', sans-serif !important; }
.font-oswald { font-family: "Oswald", sans-serif !important; }
.bg-sora-primary { background-color: #9f273b !important; }
.text-sora-primary { color: #9f273b !important; }
.text-gold { color: #e7ce7d !important; }
.tracking-wide { letter-spacing: 0.1em; }
.tracking-widest { letter-spacing: 2px; }
.transition-all { transition: all 0.3s ease; }

.quick-add-skeleton-section {
  min-height: 72px;
}

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
