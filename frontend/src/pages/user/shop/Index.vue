<template>
  <div class="shop-page min-vh-100 bg-white">
    
    <!-- HEADER BREADCRUMB -->
    <div class="container-fluid px-4 py-3 border-bottom sora-border-light bg-light">
      <div class="d-flex align-items-center text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.15em;">
        <router-link to="/" class="text-muted text-decoration-none hover-text-primary transition-colors">Trang chủ</router-link>
        <span class="mx-2 text-muted">/</span>
        <span class="fw-medium text-dark">Cửa hàng trang sức</span>
      </div>
    </div>

    <!-- LỰA CHỌN LÝ TƯỞNG (DANH MỤC) -->
    <section class="ideal-choices-section py-2 border-bottom sora-border-light" style="background-color: rgb(159,39,59);">
      <div class="container-fluid px-3 py-1 py-md-2">
        <div class="d-flex flex-column align-items-center text-center mb-2">
          <h2 class="text-white fw-bold mb-1 font-serif" style="font-size: clamp(1.4rem, 2.5vw, 1.8rem); letter-spacing: 0.02em;">Lựa chọn lý tưởng</h2>
          <div class="d-flex align-items-center justify-content-center mb-3">
            <svg width="120" height="15" viewBox="0 0 150 20" xmlns="http://www.w3.org/2000/svg" style="opacity: 0.8;">
              <path d="M10 10h40m50 0h40M65 10c0-3 4-5 10-5s10 2 10 5-4 5-10 5-10-2-10-5z" stroke="white" stroke-width="1.5" fill="none"/>
            </svg>
          </div>
        </div>

        <!-- SKELETON: CATEGORY -->
        <div v-if="isLoadingCategories" class="row justify-content-center row-cols-2 row-cols-sm-3 row-cols-md-5 g-2 g-md-3 mb-3 pb-2 mx-auto fade-in" style="max-width: 900px;">
          <div class="col" v-for="i in 5" :key="'cat-skel-'+i">
            <div class="d-flex flex-column align-items-center">
              <div class="skeleton-box rounded-circle shimmer mb-2" style="width: 85px; height: 85px; background-color: rgba(255,255,255,0.2);"></div>
              <div class="skeleton-box skeleton-text shimmer w-75" style="height: 14px; background-color: rgba(255,255,255,0.2);"></div>
            </div>
          </div>
        </div>

        <div v-else class="row justify-content-center row-cols-2 row-cols-sm-3 row-cols-md-5 g-2 g-md-3 mb-3 pb-2 mx-auto fade-in" style="max-width: 900px;">
          <div class="col" v-for="cat in categories.slice(0, 5)" :key="cat.id">
            <div class="category-circle-item text-center cursor-pointer group d-flex flex-column align-items-center" @click="filterByCategory(cat.slug)">
              <div class="circle-img-wrapper rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center mb-2 transition-transform duration-400 group-hover-scale" style="width: 85px; height: 85px; padding: 2px;">
                <img :src="getImageUrl(cat.thumbnail)" loading="lazy" :alt="cat.name" @error="handleImageError" class="w-100 h-100 object-fit-contain rounded-circle transition-transform duration-500 group-hover-scale-img">
              </div>
              <h3 class="text-white fw-medium mb-0 tracking-wider text-truncate w-100 pb-1" style="font-size: 0.85rem;">
                <span class="category-name position-relative">{{ cat.name }}</span>
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MAIN CONTENT: BỘ LỌC VÀ LƯỚI SẢN PHẨM -->
    <div class="container-fluid px-4 py-4 mt-2 mx-auto" style="max-width: 1440px;">
      <div class="row">
        
        <!-- SIDEBAR BỘ LỌC (LEFT) -->
        <div class="col-lg-2 col-md-3 d-none d-md-block sidebar-filter pe-4 border-end sora-border-light pt-2">
          
          <!-- BỘ LỌC DANH MỤC -->
          <div class="filter-widget mb-5">
            <h5 class="filter-title playfair-font mb-4 fs-5 fw-normal text-dark border-bottom pb-3">Danh mục</h5>
            <ul class="list-unstyled mb-0 filter-list">
              <li v-for="cat in categories" :key="cat.id" class="mb-3">
                <div class="custom-checkbox d-flex align-items-center cursor-pointer" @click="filterByCategory(cat.slug)">
                  <div class="checkmark transition-all duration-300 shadow-sm" :class="{'checked': filters.categories === cat.slug}"></div>
                  <span class="label-text ms-3 transition-colors" :class="filters.categories === cat.slug ? 'text-dark fw-bold' : 'text-muted'">{{ cat.name }}</span>
                </div>
              </li>
            </ul>
          </div>

          <!-- BỘ LỌC MÀU SẮC (Trích xuất từ Biến thể) -->
          <div v-if="colorOptions.length > 0" class="filter-widget mb-5">
            <h5 class="filter-title playfair-font mb-4 fs-5 fw-normal text-dark border-bottom pb-3">Màu sắc</h5>
            <div class="d-flex flex-wrap gap-2">
              <div 
                v-for="(color, index) in colorOptions" :key="index"
                class="color-filter-circle cursor-pointer position-relative shadow-sm border"
                :class="{'selected': selectedColors.includes(color)}"
                :style="{ backgroundColor: getColorCode(color) }"
                @click="toggleColor(color)"
                :title="color"
              >
                <!-- Đổi màu dấu tick dựa trên độ sáng của nền để dễ nhìn -->
                <i v-if="selectedColors.includes(color)" class="bi bi-check position-absolute fw-bold" :class="isLightColor(color) ? 'text-dark' : 'text-white'" style="top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.3rem;"></i>
              </div>
            </div>
          </div>

          <!-- BỘ LỌC THUỘC TÍNH ĐỘNG KHÁC (Size, Chất liệu, ...) -->
          <div v-if="isLoadingAttributes" class="filter-widget mb-5 fade-in">
            <div v-for="i in 2" :key="'attr-skel-'+i" class="mb-5">
              <div class="skeleton-box skeleton-text shimmer mb-4 w-75" style="height: 24px;"></div>
              <ul class="list-unstyled mb-0 filter-list">
                <li v-for="j in 3" :key="'li-'+j" class="mb-3">
                  <div class="d-flex align-items-center">
                    <div class="skeleton-box rounded-circle shimmer me-3" style="width: 18px; height: 18px;"></div>
                    <div class="skeleton-box skeleton-text shimmer w-50"></div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <template v-else>
            <div class="filter-widget mb-5" v-for="attr in dynamicAttributes" :key="attr.id">
              <template v-if="!isColorAttribute(attr.name)">
                <h5 class="filter-title playfair-font mb-4 fs-5 fw-normal text-dark border-bottom pb-3">{{ attr.name }}</h5>
                <ul class="list-unstyled mb-0 filter-list d-flex flex-wrap gap-2">
                  <li v-for="val in attr.values" :key="val.id" class="mb-2 w-100">
                    <div class="custom-checkbox d-flex align-items-center cursor-pointer" @click="toggleAttribute(val.value)">
                      <div class="checkmark transition-all duration-300 shadow-sm" :class="{'checked': selectedAttributes.includes(val.value)}"></div>
                      <span class="label-text ms-3 transition-colors" :class="selectedAttributes.includes(val.value) ? 'text-dark fw-bold' : 'text-muted'">{{ val.value }}</span>
                    </div>
                  </li>
                </ul>
              </template>
            </div>
          </template>

        </div>

        <!-- MAIN PRODUCT GRID (RIGHT) -->
        <div class="col-lg-10 col-md-9 ps-lg-5">
          
          <div class="shop-top-bar d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom sora-border-light">
            <div class="result-count text-muted mb-3 mb-md-0" style="font-size: 1.2rem;">
              <span v-if="!isLoadingProducts">Hiển thị 1–{{ allProducts.length }} của {{ pagination.total }} kết quả</span>
              <span v-else>
                 <div class="skeleton-box skeleton-text shimmer" style="width: 200px; height: 18px;"></div>
              </span>
            </div>
            
            <div class="d-flex align-items-center gap-4">
              <div class="sort-dropdown d-flex align-items-center gap-2">
                <span class="text-dark fw-medium" style="font-size: 1.25rem;">Sắp xếp:</span>                
                <select v-model="filters.sort" @change="applyFilters" class="form-select border-0 shadow-none cursor-pointer text-muted px-1" style="width: auto; background-color: transparent; font-size: 0.95rem;">
                  <option value="recommended">Mặc định</option>
                  <option value="new">Mới nhất</option>
                  <option value="price_asc">Giá: Thấp đến Cao</option>
                  <option value="price_desc">Giá: Cao đến Thấp</option>
                </select>
              </div>
            </div>
          </div>

          <!-- LƯỚI SẢN PHẨM SKELETON -->
          <div v-if="isLoadingProducts" class="product-grid fade-in">
             <div v-for="i in 8" :key="'prod-skel-'+i" class="sora-luxury-card skeleton-card">
                <div class="sora-card-image skeleton-box shimmer" style="aspect-ratio: 1/1;"></div>
                <div class="sora-card-info bg-white d-flex flex-column justify-content-center align-items-center">
                    <div class="skeleton-box skeleton-title shimmer mb-3" style="width: 80%; height: 20px;"></div>
                    <div class="skeleton-box skeleton-text shimmer mb-3" style="width: 50%; height: 12px;"></div>
                    <div class="skeleton-box skeleton-text shimmer mt-auto" style="width: 60%; height: 18px;"></div>
                </div>
             </div>
          </div>

          <!-- LƯỚI SẢN PHẨM THẬT SỬ DỤNG COMPONENT PRODUCTCARD ĐÃ NÂNG CẤP -->
          <div v-else class="product-grid fade-in">
            <template v-for="product in allProducts" :key="product.id">
              <ProductCard
                :product="product"
                :is-in-wishlist="isInWishlist(product.id)"
                :is-in-compare="isInCompare(product.id)"
                :show-wishlist="true"
                :show-compare="true"
                :show-add-to-cart="true"
                @toggle-wishlist="toggleWishlist"
                @toggle-compare="handleToggleCompare"
                @add-to-cart="openQuickAdd"
              />
            </template>
          </div>

          <!-- Empty State -->
          <div v-if="allProducts.length === 0 && !isLoadingProducts" class="text-center py-5 my-5 bg-light sora-border-light border fade-in" style="border-radius: 12px;">
            <i class="bi bi-gem fs-1 mb-3" style="color: #e7ce7d;"></i>
            <p class="text-dark playfair-font fs-4 mb-2">Không tìm thấy kiệt tác nào</p>
            <p class="text-muted mb-4 fw-light">Vui lòng thử thay đổi bộ lọc hoặc tìm kiếm khác.</p>
            <button @click="resetFilters" class="btn text-uppercase ls-widest px-5 py-3 transition-colors sora-btn-primary" style="font-size: 0.8rem; border-radius: 8px;">Xóa Bộ Lọc</button>
          </div>

          <!-- PHÂN TRANG -->
          <div v-if="pagination.last_page > 1" class="d-flex justify-content-center align-items-center mt-5 pt-5 border-top sora-border-light fade-in">
            <nav aria-label="Page navigation">
              <ul class="pagination sora-custom-pagination gap-2 mb-0">
                <li class="page-item" :class="{ 'disabled': Number(pagination.current_page) === 1 }">
                  <button class="page-link shadow-sm" @click="changePage(Number(pagination.current_page) - 1)" :disabled="Number(pagination.current_page) === 1">
                    <i class="bi bi-chevron-left"></i>
                  </button>
                </li>
                
                <li class="page-item" v-for="(page, index) in visiblePages" :key="index" :class="{ 'active': page !== '...' && Number(page) === Number(pagination.current_page), 'disabled': page === '...' }">
                  <span v-if="page === '...'" class="page-link border-0 text-muted bg-transparent px-2">...</span>
                  <button v-else class="page-link shadow-sm font-serif fw-bold" @click="changePage(page)">{{ page }}</button>
                </li>

                <li class="page-item" :class="{ 'disabled': Number(pagination.current_page) === Number(pagination.last_page) }">
                  <button class="page-link shadow-sm" @click="changePage(Number(pagination.current_page) + 1)" :disabled="Number(pagination.current_page) === Number(pagination.last_page)">
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

        </div>
      </div>
    </div>

    <!-- TÍCH HỢP COMPONENT COMPARE MODAL -->
    <CompareModal 
      ref="compareModalRef" 
      :shop-slug="shopSlug" 
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
import { ref, shallowRef, onMounted, reactive, computed, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';

import ProductCard from '@/components/ui/ProductCard.vue';
import CompareModal from '@/components/ui/CompareModal.vue'; 

const route = useRoute();
const router = useRouter();
const shopSlug = ref(route.params.shop_slug || 'aurora-jewelry');

// ĐÃ SỬA: Đảm bảo không có dư thừa `/api` trong base URL
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/api\/?$/, '');

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

const isLoadingCategories = ref(true);
const isLoadingProducts = ref(true);
const isLoadingAttributes = ref(true);
const isPageLoading = ref(true);

const categories = shallowRef([]);
const dynamicAttributes = ref([]); 
const allProducts = shallowRef([]);
const pagination = ref({ current_page: 1, last_page: 1, total: 0 });

const selectedAttributes = ref([]); 
const colorOptions = ref([]); 
const selectedColors = ref([]); 
const filters = reactive({ sort: 'recommended', categories: '' });

const getToken = () => {
  const possibleKeys = ['access_token', 'token', 'auth_token', 'userToken', 'user_token', 'user'];
  for (const k of possibleKeys) {
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

// Utilities
const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

const getImageUrl = (path) => {
  if (!path) return '/Sora-placeholder.png';
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  let cleanPath = path.startsWith('/') ? path.substring(1) : path;
  if (cleanPath.startsWith('storage/')) return `${API_BASE_URL}/${cleanPath}`;
  return `${API_BASE_URL}/storage/${cleanPath}`;
};

const handleImageError = (e) => { e.target.src = '/Sora-placeholder.png'; };

const isColorAttribute = (attrName) => {
  const name = attrName.toLowerCase();
  return name.includes('màu') || name.includes('color');
};

const getColorCode = (colorName) => {
  if(!colorName) return '#e0e0e0';
  const map = {
    'đỏ': '#cc1e2e', 'red': '#cc1e2e', 'đỏ đô': '#8b0000', 'đỏ mận': '#800000', 'đỏ tươi': '#ff0000', 'ruby': '#e0115f',
    'xanh': '#2e5b9f', 'blue': '#2e5b9f', 'xanh dương': '#007bff', 'xanh biển': '#1e90ff', 'xanh ngọc': '#009981', 'xanh lá': '#28a745', 'green': '#28a745', 'xanh lục': '#228b22', 'emerald': '#50c878',
    'vàng': '#e7ce7d', 'gold': '#e7ce7d', 'vàng 18k': '#d4af37', 'vàng 24k': '#ffd700', 'vàng chanh': '#fada5e', 'vàng kem': '#fdfd96',
    'trắng': '#ffffff', 'white': '#ffffff', 'vàng trắng': '#f4f4f4', 'bạch kim': '#e5e4e2', 'bạc': '#c0c0c0', 'silver': '#c0c0c0', 'trong suốt': '#f0f8ff',
    'đen': '#2c2c2c', 'black': '#2c2c2c', 'xám': '#808080', 'gray': '#808080', 'ghi': '#808080',
    'hồng': '#f4a4b4', 'pink': '#f4a4b4', 'vàng hồng': '#b76e79', 'rose gold': '#b76e79', 'tím': '#800080', 'purple': '#800080', 'thạch anh tím': '#9966cc',
    'nâu': '#8b4513', 'brown': '#8b4513', 'cam': '#fd7e14', 'orange': '#fd7e14'
  };
  return map[colorName.toLowerCase().trim()] || '#e0e0e0'; 
};

const isLightColor = (colorName) => {
  const code = getColorCode(colorName);
  const lightCodes = ['#ffffff', '#fcfcfc', '#f4f4f4', '#e5e4e2', '#c0c0c0', '#e0e0e0', '#fada5e', '#fdfd96', '#f0f8ff', '#ffb6c1', '#f4a4b4'];
  return lightCodes.includes(code);
};

// ==============================================
// LOGIC YÊU THÍCH (WISHLIST)
// ==============================================
const favourites = ref([]);
const isTogglingFav = ref(null);

const fetchFavorites = async () => {
  const token = getToken();
  if (!token) return;
  try {
    const response = await fetch(`${API_BASE_URL}/api/client/favourites`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const data = await response.json();
    if (data.status) {
      favourites.value = data.data.map(fav => fav.product_id);
    }
  } catch (e) {
    console.error('Lỗi tải danh sách yêu thích', e);
  }
};

const isInWishlist = (productId) => {
  return favourites.value.includes(productId);
};

const toggleWishlist = async (prod) => {
  if (!prod || !prod.id) return;
  const token = getToken();
  
  if (!token) {
    soraAlert.fire({
      icon: 'warning',
      title: 'Bạn chưa đăng nhập!',
      text: 'Vui lòng đăng nhập để lưu trữ bộ sưu tập yêu thích của mình.',
      confirmButtonText: 'Đăng Nhập Ngay',
      showCancelButton: true,
      cancelButtonText: 'Đóng'
    }).then((result) => {
      if (result.isConfirmed) router.push('/login');
    });
    return;
  }

  isTogglingFav.value = prod.id; 

  try {
    const response = await fetch(`${API_BASE_URL}/api/client/favourites/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ product_id: prod.id })
    });
    
    const data = await response.json();

    if (data.status) {
      if (data.action === 'added') {
        favourites.value.push(prod.id);
        Toast.fire({ icon: 'success', title: 'Đã thêm vào yêu thích' });
      } else if (data.action === 'removed') {
        favourites.value = favourites.value.filter(id => id !== prod.id);
        Toast.fire({ icon: 'info', title: 'Đã bỏ yêu thích' });
      }
    } else {
      if (response.status === 401) {
          Toast.fire({ icon: 'error', title: 'Phiên đăng nhập hết hạn.' });
      }
    }
  } catch (error) {
    Toast.fire({ icon: 'error', title: 'Có lỗi xảy ra, thử lại sau' });
  } finally {
    isTogglingFav.value = null; 
  }
};

// ==============================================
// LOGIC COMPARE VỚI COMPONENT MỚI 
// ==============================================
const compareModalRef = ref(null);
const compareList = ref([]); 

const isInCompare = (id) => {
  return compareList.value.some(item => item.id === id);
};

const handleToggleCompare = (prod) => {
  if (compareModalRef.value) {
    compareModalRef.value.toggleCompare(prod);
  }
};

// ==============================================
// LOGIC QUICK ADD (ĐỒNG BỘ 100% TỪ HOME)
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

// ==============================================
// FILTERS VÀ SẢN PHẨM 
// ==============================================
const extractFiltersFromVariants = (products) => {
  const attrsMap = {};
  const colorsSet = new Set(colorOptions.value); 

  products.forEach(product => {
    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach(variant => {
        const attrVals = variant.attribute_values || variant.attributeValues || [];
        attrVals.forEach(av => {
          if (av.attribute && av.attribute.name) {
            const attrName = av.attribute.name;
            const attrValue = av.value;

            if (isColorAttribute(attrName)) {
              colorsSet.add(attrValue);
            } else { 
              if (!attrsMap[attrName]) {
                attrsMap[attrName] = { id: av.attribute.id, name: attrName, values: new Set() };
              }
              attrsMap[attrName].values.add(attrValue);
            }
          }
        });
      });
    }
  });

  colorOptions.value = Array.from(colorsSet);

  Object.values(attrsMap).forEach(attr => {
    const existingAttr = dynamicAttributes.value.find(a => a.name === attr.name);
    if (existingAttr) {
      attr.values.forEach(val => {
        if (!existingAttr.values.some(v => v.value === val)) {
          existingAttr.values.push({ id: Math.random().toString(), value: val });
        }
      });
    } else {
      dynamicAttributes.value.push({
        id: attr.id,
        name: attr.name,
        values: Array.from(attr.values).map(val => ({ id: Math.random().toString(), value: val }))
      });
    }
  });

  isLoadingAttributes.value = false;
};

const toggleColor = (color) => {
  const index = selectedColors.value.indexOf(color);
  if (index > -1) {
    selectedColors.value.splice(index, 1);
  } else {
    selectedColors.value.push(color);
  }
  applyFilters();
};

const toggleAttribute = (val) => {
  const index = selectedAttributes.value.indexOf(val);
  if (index > -1) {
    selectedAttributes.value.splice(index, 1); 
  } else {
    selectedAttributes.value.push(val); 
  }
  applyFilters();
};

const fetchCategories = async () => {
  isLoadingCategories.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/api/shop/${shopSlug.value}/categories`);
    const data = await response.json();
    if(data?.success) categories.value = data.data; 
  } catch (e) {} finally { isLoadingCategories.value = false; }
};

const fetchProducts = async (page = 1) => {
  isLoadingProducts.value = true;
  try {
    const queryPayload = { page, sort: filters.sort };
    if (filters.categories) queryPayload.categories = filters.categories;
    
    if (selectedColors.value.length > 0) {
      queryPayload.color = selectedColors.value.join(',');
    }

    if (selectedAttributes.value.length > 0) {
      queryPayload.attribute_values = selectedAttributes.value.join(',');
    }

    const params = new URLSearchParams(queryPayload);
    const response = await fetch(`${API_BASE_URL}/api/shop/${shopSlug.value}/products?${params.toString()}`);
    const data = await response.json();
    
    if(data?.success) {
      allProducts.value = data.data.data; 
      pagination.value = { current_page: data.data.current_page, last_page: data.data.last_page, total: data.data.total };
      
      extractFiltersFromVariants(allProducts.value);
    }
  } catch (e) {
    console.error(e);
  } finally { 
    isLoadingProducts.value = false; 
  }
};

const filterByCategory = (categorySlug) => {
  filters.categories = filters.categories === categorySlug ? '' : categorySlug; 
  applyFilters();
};

const applyFilters = () => fetchProducts(1);
const resetFilters = () => { 
  filters.categories = ''; 
  filters.sort = 'recommended';
  selectedAttributes.value = []; 
  selectedColors.value = []; 
  applyFilters(); 
};

const visiblePages = computed(() => {
  const current = Number(pagination.value.current_page) || 1;
  const last = Number(pagination.value.last_page) || 1;
  const delta = 1; 
  let pages = [];

  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= current - delta && i <= current + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }
  return pages;
});

const changePage = (page) => { 
  if(page >= 1 && page <= pagination.value.last_page) { 
    fetchProducts(page); 
    const shopTopBar = document.querySelector('.shop-top-bar');
    if (shopTopBar) {
      const y = shopTopBar.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' }); 
    }
  } 
};

onMounted(() => { 
  fetchFavorites();
  Promise.all([fetchCategories(), fetchProducts(1)]).then(() => isPageLoading.value = false); 
});

onUnmounted(() => {
  if (quickAddModalInstance) quickAddModalInstance.dispose();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Oswald:wght@400;500;600;700&display=swap');

.shop-page {
  --sora-primary: #9f273b;
  --sora-secondary: #e7ce7d;
  --sora-accent: #cc1e2e;
  --sora-text: #2c2c2c;
  --sora-border: #eaeaea;
  font-family: 'Inter', sans-serif; 
  color: var(--sora-text);
}

.playfair-font { font-family: 'Playfair Display', serif; }
.font-oswald { font-family: 'Oswald', sans-serif; }
.font-serif { font-family: 'Playfair Display', serif; }
.cursor-pointer { cursor: pointer; }
.transition-colors { transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease; }

.sora-border-light { border-color: var(--sora-border) !important; }
.sora-btn-primary { background-color: var(--sora-primary); color: #fff; border: 1px solid var(--sora-primary); }
.sora-btn-primary:hover { background-color: #831f30; border-color: #831f30; color: #fff; }

.custom-checkbox .checkmark {
  position: relative; width: 18px; height: 18px; background-color: #fff; border: 1px solid #999; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.custom-checkbox:hover .checkmark { border-color: #111; }
.custom-checkbox .checkmark.checked { background-color: #fff; border-color: #111; }
.custom-checkbox .checkmark::after { content: ""; position: absolute; display: none; width: 10px; height: 10px; background-color: #111; border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); }
.custom-checkbox .checkmark.checked::after { display: block; }

.color-filter-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.color-filter-circle:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
}
.color-filter-circle.selected {
  border: 2px solid #111;
  transform: scale(1.1);
}

.sora-custom-pagination .page-link {
  color: var(--sora-text);
  border-radius: 4px;
  margin: 0 2px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  background-color: #fff;
  transition: all 0.3s;
}
.sora-custom-pagination .page-link:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #ddd;
  color: var(--sora-primary);
}
.sora-custom-pagination .page-item.active .page-link {
  background-color: var(--sora-primary) !important;
  border-color: var(--sora-primary) !important;
  color: #fff !important;
}
.sora-custom-pagination .page-item.disabled .page-link {
  color: #ccc;
  background-color: transparent;
  box-shadow: none !important;
}

.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 2.5rem 1.5rem; }

/* CSS QUICK ADD MODAL CHIP */
.attr-chip { border-radius: 4px; overflow: hidden; min-width: 55px; }
.attr-chip .chip-inner { border: 1px solid #dee2e6; background-color: #fff; color: #555; border-radius: 4px; transition: all 0.3s ease-in-out; padding: 6px 12px; }
.attr-chip:hover .chip-inner { border-color: #e7ce7d; color: #9f273b; }
.attr-chip.selected .chip-inner { background-color: #9f273b; border-color: #9f273b; color: #fff !important; box-shadow: 0 4px 10px rgba(159, 39, 59, 0.25); }
.attr-chip.selected .chip-inner span { color: #fff !important; }

/* HIỆU ỨNG SKELETON */
.fade-in { animation: fadeIn 0.4s ease-in; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.shimmer {
    background: #f6f7f8;
    background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
    background-repeat: no-repeat;
    background-size: 800px 100%;
    animation: placeholderShimmer 1.5s linear infinite forwards;
}
@keyframes placeholderShimmer { 0% { background-position: -468px 0; } 100% { background-position: 468px 0; } }

.skeleton-box { background-color: #eee; border-radius: 4px; }
.skeleton-text { height: 14px; border-radius: 4px; }
.skeleton-title { height: 24px; border-radius: 4px; }
.skeleton-card { pointer-events: none; border-color: #eee !important; box-shadow: none !important; }

/* VÒNG TRÒN CATEGORY LỰA CHỌN LÝ TƯỞNG */
.category-circle-item {
  transition: transform 0.3s ease;
}
.circle-img-wrapper {
  overflow: hidden;
}
.group-hover-scale-img {
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.category-circle-item:hover .group-hover-scale-img {
  transform: scale(1.15);
}
.category-name::after {
  content: '';
  position: absolute;
  width: 0;
  height: 1px;
  bottom: -2px;
  left: 50%;
  background-color: #e7ce7d;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}
.category-circle-item:hover .category-name::after {
  width: 100%;
}
</style>