<template>
  <div>

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
        <SoraProductGridSkeleton v-if="isLoading" :count="6" grid-class="row g-4" col-class="col-6 col-md-4" />

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
          <div v-for="item in favorites" :key="'fav-'+item.id" class="col-6 col-md-4">
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


    <!-- MODALS (outside layout) -->
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
                  <span class="text-sora-primary fw-bold font-oswald fs-5">{{ formatCurrency(quickAddSelectedPrice) }}</span>
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
          <div v-else class="p-4">
             <SoraListSkeleton :rows="3" image-size="80px" />
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import clientApiClient from '@/utils/clientApiClient';
import { getUserToken } from '@/composables/useUtilities';
import Toast from '@/utils/toastConfig';
import { createSoraAlert } from '@/utils/soraAlertConfig';
import ProductCard from '@/components/ui/ProductCard.vue';
import CompareModal from '@/components/ui/CompareModal.vue';
import SoraProductGridSkeleton from '@/components/ui/SoraProductGridSkeleton.vue';
import SoraListSkeleton from '@/components/ui/SoraListSkeleton.vue';
import { getStorageUrl } from '@/utils/env';

const router = useRouter();

const favorites = ref([]);
const isLoading = ref(true);
const isToggling = ref(null);
const isLoggedIn = ref(false);

const soraAlert = createSoraAlert({
  customClass: { confirmButton: 'px-4 py-2 mx-2 rounded shadow-sm fw-bold font-oswald tracking-widest text-uppercase' },
  didOpen: (modal) => { if (modal.parentElement) modal.parentElement.style.zIndex = '10000005'; }
});

// auth helper: use getUserToken() from composables

const getImageUrl = (path) => {
  return getStorageUrl(path);
};

const handleImageError = (e) => { e.target.src = '/Sora-placeholder.png'; };
const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

const fetchFavorites = async () => {
  if (!isLoggedIn.value) {
    isLoading.value = false;
    return;
  }
  try {
    const { data } = await clientApiClient.get('/client/favourites', { ignoreAuthRedirect: true });
    if (data && data.status) {
      favorites.value = data.data;
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
  const token = getUserToken();
  if (!token) {
    soraAlert.fire({ icon: 'warning', title: 'Phiên đăng nhập hết hạn!', text: 'Vui lòng đăng nhập lại.' });
    isLoggedIn.value = false;
    router.push('/login');
    return;
  }

  isToggling.value = product.id;
  try {
    const { data } = await clientApiClient.post('/client/favourites/toggle', { product_id: product.id });
    if (data && data.status) {
      favorites.value = favorites.value.filter(item => item.product_id !== product.id);
      Toast.fire({ icon: 'info', title: 'Đã gỡ khỏi danh sách yêu thích' });
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
      const { data: resData } = await clientApiClient.get(`/shop/all/products/${prod.slug}`, { ignoreAuthRedirect: true });
      if (resData && resData.data) {
        quickAddProduct.value = {
          ...resData.data,
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
      const payload = { product_variant_id: selectedVar.id, quantity: 1 };
      const { data } = await clientApiClient.post('/client/cart', payload, { ensureCartSession: true, ignoreAuthRedirect: true });

      if (data && data.session_id) {
        localStorage.setItem('cart_session_id', data.session_id);
      }

      quickAddModalInstance.hide();
      Toast.fire({ icon: 'success', title: 'Đã thêm sản phẩm vào giỏ' });
    } catch (error) {
        const msg = error.response?.data?.message || 'Không thể thêm vào giỏ hàng!';
        soraAlert.fire({icon: 'error', title: 'Lỗi', text: msg});
    }
};

onMounted(() => {
  const token = getUserToken();
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
@import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Oswald:wght@400;500;600;700&display=swap');


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
.font-serif { font-family: 'Josefin Sans', sans-serif; }
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
