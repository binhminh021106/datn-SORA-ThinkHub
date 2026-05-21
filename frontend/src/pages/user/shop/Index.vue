<template>
  <div class="shop-page min-vh-100 bg-white">
    
    <!-- HEADER BREADCRUMB -->
    <div class="container-fluid px-4 py-3 border-bottom sora-border-light bg-light">
      <div class="d-flex align-items-center text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.15em;">
        <a href=""> <span class="text-muted cursor-pointer hover-text-primary transition-colors">Trang chủ</span> </a>
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

        <div v-if="isLoadingCategories" class="d-flex justify-content-center py-4">
          <div class="spinner-border text-white" style="width: 2rem; height: 2rem; border-width: 0.1em;" role="status"></div>
        </div>

        <div v-else class="row justify-content-center row-cols-2 row-cols-sm-3 row-cols-md-5 g-2 g-md-3 mb-3 pb-2 mx-auto" style="max-width: 900px;">
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
        <div class="col-lg-2 col-md-3 d-none d-md-block sidebar-filter pe-4 pt-2">
          
          <div class="filter-header mb-4 border-bottom pb-3">
             <h5 class="text-uppercase fw-bold mb-0 d-flex align-items-center" style="color: #9f273b; font-size: 1.1rem; letter-spacing: 0.5px;">
               <i class="bi bi-funnel-fill me-2 fs-5"></i> Bộ Lọc
             </h5>
          </div>

          <!-- BỘ LỌC DANH MỤC -->
          <div class="filter-widget mb-4 border-bottom pb-3">
            <div class="d-flex justify-content-between align-items-center cursor-pointer" :class="{'mb-3': filterCollapses.categories !== false}" @click="toggleCollapse('categories')">
              <h6 class="text-uppercase fw-bold mb-0 text-dark" style="font-size: 0.85rem; letter-spacing: 0.5px;">DANH MỤC</h6>
              <i class="bi text-muted" :class="filterCollapses.categories !== false ? 'bi-chevron-up' : 'bi-chevron-down'" style="font-size: 0.8rem;"></i>
            </div>
            
            <ul v-if="filterCollapses.categories !== false" class="list-unstyled mb-0 filter-list-text d-flex flex-column gap-2 mt-3">
              <li>
                <div class="d-flex align-items-center cursor-pointer category-item" @click="filterByCategory('')" :class="{'active': filters.categories === ''}">
                  <span class="dot me-2"></span>
                  <span class="label-text transition-colors">Tất cả</span>
                </div>
              </li>
              <li v-for="cat in categories" :key="cat.id">
                <div class="d-flex align-items-center cursor-pointer category-item" @click="filterByCategory(cat.slug)" :class="{'active': filters.categories === cat.slug}">
                  <span class="dot me-2"></span>
                  <span class="label-text transition-colors">{{ cat.name }}</span>
                </div>
              </li>
            </ul>
          </div>

          <!-- BỘ LỌC MÀU SẮC (Trích xuất từ Biến thể) -->
          <div v-if="colorOptions.length > 0" class="filter-widget mb-4 border-bottom pb-3">
            <div class="d-flex justify-content-between align-items-center cursor-pointer" :class="{'mb-3': filterCollapses.colors !== false}" @click="toggleCollapse('colors')">
              <h6 class="text-uppercase fw-bold mb-0 text-dark" style="font-size: 0.85rem; letter-spacing: 0.5px;">MÀU SẮC</h6>
              <i class="bi text-muted" :class="filterCollapses.colors !== false ? 'bi-chevron-up' : 'bi-chevron-down'" style="font-size: 0.8rem;"></i>
            </div>
            
            <div v-if="filterCollapses.colors !== false" class="d-flex flex-wrap gap-2 mt-3">
              <div 
                v-for="(color, index) in colorOptions" :key="index"
                class="color-filter-circle cursor-pointer position-relative shadow-sm"
                :class="{'selected': selectedColors.includes(color)}"
                :style="{ backgroundColor: getColorCode(color) }"
                @click="toggleColor(color)"
                :title="color"
              >
                <i v-if="selectedColors.includes(color)" class="bi bi-check position-absolute text-white" style="top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.2rem; text-shadow: 0px 0px 2px rgba(0,0,0,0.5);"></i>
              </div>
            </div>
          </div>

          <!-- BỘ LỌC THUỘC TÍNH ĐỘNG KHÁC (Chỉ lấy Chất liệu) -->
          <div v-if="isLoadingAttributes" class="d-flex justify-content-center mb-5">
             <div class="spinner-grow spinner-grow-sm text-secondary" role="status"></div>
          </div>
          <template v-else>
            <div class="filter-widget mb-4 border-bottom pb-3" v-for="attr in dynamicAttributes" :key="attr.id">
              <template v-if="!isColorAttribute(attr.name)">
                <div class="d-flex justify-content-between align-items-center cursor-pointer" :class="{'mb-3': filterCollapses[attr.name] !== false}" @click="toggleCollapse(attr.name)">
                  <h6 class="text-uppercase fw-bold mb-0 text-dark" style="font-size: 0.85rem; letter-spacing: 0.5px;">{{ attr.name }}</h6>
                  <i class="bi text-muted" :class="filterCollapses[attr.name] !== false ? 'bi-chevron-up' : 'bi-chevron-down'" style="font-size: 0.8rem;"></i>
                </div>
                
                <ul v-if="filterCollapses[attr.name] !== false" class="list-unstyled mb-0 filter-list-text d-flex flex-column gap-2 mt-3">
                  <li v-for="val in attr.values" :key="val.id" class="w-100">
                    <div class="d-flex align-items-center cursor-pointer category-item" @click="toggleAttribute(val.value)" :class="{'active': selectedAttributes.includes(val.value)}">
                      <span class="dot me-2"></span>
                      <span class="label-text transition-colors">{{ val.value }}</span>
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
              <span v-else>Đang tải dữ liệu...</span>
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

          <!-- LƯỚI SẢN PHẨM -->
          <div v-if="isLoadingProducts" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
            <div class="spinner-border" style="color: var(--sora-primary); width: 2.5rem; height: 2.5rem; border-width: 0.1em;" role="status"></div>
          </div>

          <div v-else class="product-grid">
            <template v-for="product in allProducts" :key="product.id">
              <div class="sora-luxury-card" @click="goToProductDetail(product.slug)">
                  <div class="sora-card-image sora-img-container" :class="{'has-hover-image': hasHoverImage(product)}">
                      <div class="sora-card-badges">
                          <span v-if="product.is_new" class="sora-badge">MỚI</span>
                          <span v-if="product.promotional_price" class="sora-badge sale-badge">SALE</span>
                      </div>
                      <img :src="getImageUrl(product.thumbnail_image)" loading="lazy" :alt="product.name" class="sora-main-img" @error="handleImageError">
                      <img v-if="hasHoverImage(product)" :src="getImageUrl(product.hover_image)" loading="lazy" :alt="product.name + ' hover'" class="sora-hover-img" @error="handleImageError">
                  </div>

                  <div class="sora-card-info">
                      <h3 class="sora-card-title" :title="product.name">{{ product.name }}</h3>
                      <p class="sora-card-category">{{ product.category?.name || 'Trang sức SORA' }}</p>
                      
                      <div class="sora-card-price d-flex align-items-center justify-content-center flex-wrap gap-1">
                          <span v-if="product.promotional_price" class="sora-card-price-old">
                            {{ formatPrice(product.base_price) }}
                          </span>
                          <span>{{ formatPrice(product.promotional_price || product.base_price) }}</span>
                      </div>
                  </div>

                  <div class="sora-card-action">
                      <button class="sora-action-btn" @click.stop="openQuickAdd(product)">
                          <i class="bi bi-eye"></i> THÊM VÀO GIỎ
                      </button>
                  </div>
              </div>
            </template>
          </div>

          <!-- Empty State -->
          <div v-if="allProducts.length === 0 && !isLoadingProducts" class="text-center py-5 my-5 bg-light sora-border-light border" style="border-radius: 12px;">
            <i class="bi bi-gem fs-1 mb-3" style="color: var(--sora-secondary);"></i>
            <p class="text-dark playfair-font fs-4 mb-2">Không tìm thấy kiệt tác nào</p>
            <p class="text-muted mb-4 fw-light">Vui lòng thử thay đổi bộ lọc hoặc tìm kiếm khác.</p>
            <button @click="resetFilters" class="btn text-uppercase ls-widest px-5 py-3 transition-colors sora-btn-primary" style="font-size: 0.8rem; border-radius: 8px;">Xóa Bộ Lọc</button>
          </div>

          <!-- PHÂN TRANG -->
          <div v-if="pagination.last_page > 1" class="d-flex justify-content-center align-items-center mt-5 pt-5 border-top sora-border-light">
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

    <!-- MODAL QUICK ADD -->
    <div v-if="quickAddModal.isOpen" class="modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" @click.self="closeQuickAdd" style="z-index: 9999 !important; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(2px);">
      <div class="bg-white rounded shadow-lg d-flex flex-column position-relative" style="width: 90%; max-width: 480px; max-height: 90vh; overflow: hidden; animation: slideUp 0.3s ease-out; border-radius: 12px !important;">
        <div class="d-flex justify-content-between align-items-center px-4 py-3" style="background-color: #9f273b;">
          <h5 class="mb-0 text-white fw-bold font-serif fs-5" style="letter-spacing: 0.5px;">Tùy chọn Sản phẩm</h5>
          <button @click="closeQuickAdd" class="btn text-white p-0 m-0 border-0" style="opacity: 0.8;">
            <i class="bi bi-x-lg fs-4"></i>
          </button>
        </div>
        <div class="p-4 overflow-y-auto" style="flex-grow: 1;">
          <div class="d-flex gap-3 mb-4 pb-4 border-bottom">
            <div class="flex-shrink-0 border rounded" style="width: 90px; height: 90px; overflow: hidden; border-color: #eaeaea;">
               <img :src="getImageUrl(currentVariant?.image_url || quickAddModal.product.thumbnail_image)" class="w-100 h-100 object-fit-cover bg-light" @error="handleImageError">
            </div>
            <div class="d-flex flex-column justify-content-center">
              <span class="text-uppercase fw-bold mb-1" style="font-size: 0.7rem; color: #e7ce7d; letter-spacing: 2px;">{{ quickAddModal.product.category?.name || 'SẢN PHẨM' }}</span>
              <h6 class="fs-5 mb-2 fw-bold text-dark font-serif">{{ quickAddModal.product.name }}</h6>
              <div class="d-flex align-items-center flex-wrap gap-2">
                <span class="fw-bold fs-5" style="color: #9f273b; font-family: 'Playfair Display', serif;">{{ displayPriceFormatted }}</span>
                <span v-if="modalOldPrice" class="text-muted text-decoration-line-through" style="font-size: 0.95rem;">
                  {{ formatPrice(modalOldPrice) }}
                </span>
                <span v-if="modalDiscount > 0" class="sora-discount-tag" style="padding: 2px 6px; font-size: 0.75rem;">
                  -{{ modalDiscount }}%
                </span>
              </div>
            </div>
          </div>
          <div v-for="(options, attrName) in quickAddModal.attributes" :key="attrName" class="mb-4">
            <label class="d-block text-uppercase fw-bold mb-2 text-dark font-oswald" style="font-size: 0.85rem; letter-spacing: 1px;">
              {{ attrName }}:
            </label>
            <div class="d-flex flex-wrap gap-2">
              <button 
                v-for="opt in options" :key="opt"
                @click="quickAddModal.selectedOptions[attrName] = opt"
                class="btn variant-select-btn px-4 py-2 fw-medium border"
                :class="{'selected': quickAddModal.selectedOptions[attrName] === opt}"
              >
                {{ opt }}
              </button>
            </div>
          </div>
          <div class="mb-4">
            <label class="d-block text-uppercase fw-bold mb-2 text-dark font-oswald" style="font-size: 0.85rem; letter-spacing: 1px;">SỐ LƯỢNG:</label>
            <div class="d-flex align-items-center gap-3">
               <div class="input-group" style="width: 140px;">
                 <button @click="updateQuickAddQty(-1)" class="btn btn-outline-secondary" type="button"><i class="bi bi-dash"></i></button>
                 <input type="number" v-model.number="quickAddModal.quantity" @change="validateQuickAddQty" class="form-control text-center fw-bold text-dark" style="-moz-appearance: textfield;">
                 <button @click="updateQuickAddQty(1)" class="btn btn-outline-secondary" type="button"><i class="bi bi-plus"></i></button>
               </div>
               <span v-if="isAllAttributesSelected && currentVariant" class="text-muted small fw-medium">
                 {{ currentVariant.stock_quantity > 0 ? `Còn ${currentVariant.stock_quantity} sản phẩm` : 'Hết hàng' }}
               </span>
               <span v-else class="text-muted small fw-medium fst-italic">Vui lòng chọn phân loại</span>
            </div>
          </div>
          <div v-if="!isAllAttributesSelected && Object.keys(quickAddModal.attributes).length > 0" class="alert alert-info py-2 small mb-0"><i class="bi bi-info-circle me-1"></i> Vui lòng chọn đầy đủ phân loại sản phẩm.</div>
          <div v-else-if="!currentVariant && Object.keys(quickAddModal.attributes).length > 0" class="alert alert-warning py-2 small mb-0"><i class="bi bi-exclamation-triangle me-1"></i> Phân loại này tạm thời không khả dụng.</div>
          <div v-else-if="currentVariant && currentVariant.stock_quantity <= 0" class="alert alert-danger py-2 small mb-0"><i class="bi bi-slash-circle me-1"></i> Sản phẩm này đã hết hàng trong kho.</div>
        </div>
        <div class="p-3 bg-light border-top">
          <button 
            @click="confirmAddToCart" 
            :disabled="quickAddModal.isAdding || !isAllAttributesSelected || !currentVariant || currentVariant.stock_quantity <= 0"
            class="btn w-100 py-3 text-uppercase fw-bold text-white d-flex justify-content-center align-items-center gap-2"
            style="background-color: #9f273b; border-radius: 8px; font-family: 'Oswald', sans-serif; letter-spacing: 1px; border: none; font-size: 0.95rem;"
          >
            <span v-if="quickAddModal.isAdding" class="spinner-border spinner-border-sm" role="status"></span>
            <template v-else><i class="bi bi-cart-plus me-1"></i> XÁC NHẬN THÊM</template>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();
const shopSlug = ref(route.params.shop_slug || 'aurora-jewelry');
const API_BASE_URL = 'http://127.0.0.1:8000';

const soraAlert = Swal.mixin({
  buttonsStyling: true,
  confirmButtonColor: '#9f273b',
  customClass: { confirmButton: 'px-4 py-2 mx-2 rounded shadow-sm fw-bold font-oswald tracking-widest text-uppercase' },
  didOpen: (modal) => { if (modal.parentElement) modal.parentElement.style.zIndex = '10005'; }
});

const Toast = Swal.mixin({
  toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true,
  didOpen: (toast) => { if (toast.parentElement) toast.parentElement.style.zIndex = '10005'; }
});

const isLoadingCategories = ref(true);
const isLoadingProducts = ref(true);
const isLoadingAttributes = ref(true);
const isPageLoading = ref(true);

const categories = shallowRef([]);
const dynamicAttributes = ref([]); // Đổi thành ref để cập nhật trực tiếp từ biến thể
const allProducts = shallowRef([]);
const pagination = ref({ current_page: 1, last_page: 1, total: 0 });

const selectedAttributes = ref([]); 
const colorOptions = ref([]); // State lưu các màu hiện có lấy từ biến thể
const selectedColors = ref([]); // State lưu các màu đang chọn
const filters = reactive({ sort: 'recommended', categories: '' });

const filterCollapses = ref({
  categories: true,
  colors: true
});

const toggleCollapse = (key) => {
  // Thay thế object mới để kích hoạt reactivity của Vue
  const newCollapses = { ...filterCollapses.value };
  if (newCollapses[key] === undefined) {
    newCollapses[key] = false;
  } else {
    newCollapses[key] = !newCollapses[key];
  }
  filterCollapses.value = newCollapses;
};

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

const formatPrice = (price) => {
  if (!price || isNaN(price)) return 'Liên Hệ';
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};
const getImageUrl = (path) => path ? (path.startsWith('http') ? path : `${API_BASE_URL}/storage/${path}`) : 'https://placehold.co/500x500/f5f5f5/cccccc?text=No+Image';
const handleImageError = (e) => { e.target.src = 'https://placehold.co/500x500/f5f5f5/cccccc?text=No+Image'; };
const hasHoverImage = (product) => product.hover_image && product.hover_image !== product.thumbnail_image;

const isColorAttribute = (attrName) => {
  const name = attrName.toLowerCase();
  return name.includes('màu') || name.includes('color');
};

const isMaterialAttribute = (attrName) => {
  const name = attrName.toLowerCase();
  return name.includes('chất liệu') || name.includes('material');
};

const getColorCode = (colorName) => {
  const map = {
    'đỏ': '#cc1e2e', 'red': '#cc1e2e',
    'xanh': '#2e5b9f', 'blue': '#2e5b9f', 'xanh dương': '#2e5b9f',
    'vàng': '#e7ce7d', 'gold': '#e7ce7d', 'vàng 18k': '#d4af37',
    'trắng': '#fcfcfc', 'white': '#fcfcfc', 'vàng trắng': '#f4f4f4',
    'đen': '#2c2c2c', 'black': '#2c2c2c',
    'hồng': '#f4a4b4', 'pink': '#f4a4b4', 'vàng hồng': '#b76e79',
    'bạc': '#c0c0c0', 'silver': '#c0c0c0'
  };
  return map[colorName.toLowerCase().trim()] || '#e0e0e0'; 
};

// Cập nhật filterCollapses với các thuộc tính mới
const fetchColors = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shop/${shopSlug.value}/colors`);
    const data = await response.json();
    if(data?.success) {
      colorOptions.value = data.data;
    }
  } catch (e) {
    console.error('Lỗi khi tải màu sắc:', e);
  }
};

const fetchAttributes = async () => {
  isLoadingAttributes.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/api/shop/${shopSlug.value}/attributes`);
    const data = await response.json();
    if(data?.success) {
      // Chỉ lấy các thuộc tính không phải màu sắc (ví dụ: Chất liệu)
      dynamicAttributes.value = data.data.filter(attr => !isColorAttribute(attr.name)).map(attr => ({
        id: attr.id,
        name: attr.name,
        values: attr.values
      }));
      
      // Khởi tạo state cho các thuộc tính mới để reactivity hoạt động tốt
      const newCollapses = { ...filterCollapses.value };
      let hasChanges = false;
      dynamicAttributes.value.forEach(attr => {
        if (newCollapses[attr.name] === undefined) {
          newCollapses[attr.name] = true;
          hasChanges = true;
        }
      });
      if (hasChanges) {
        filterCollapses.value = newCollapses;
      }
    }
  } catch (e) {
    console.error('Lỗi khi tải thuộc tính:', e);
  } finally {
    isLoadingAttributes.value = false;
  }
};

// Hàm bật/tắt bộ lọc màu sắc
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
    const data = await apiClient.get(`/shop/${shopSlug.value}/categories`);
    if(data?.data?.success) categories.value = data.data.data; 
  } catch (e) {} finally { isLoadingCategories.value = false; }
};

const fetchProducts = async (page = 1) => {
  isLoadingProducts.value = true;
  try {
    const queryPayload = { page, sort: filters.sort };
    if (filters.categories) queryPayload.categories = filters.categories;
    
    // Gửi tham số màu sắc
    if (selectedColors.value.length > 0) {
      queryPayload.color = selectedColors.value.join(',');
    }

    // Gửi tham số thuộc tính
    if (selectedAttributes.value.length > 0) {
      queryPayload.attribute_values = selectedAttributes.value.join(',');
    }

    const params = new URLSearchParams(queryPayload);
    const response = await fetch(`${API_BASE_URL}/api/shop/${shopSlug.value}/products?${params.toString()}`);
    const data = await response.json();
    
    if(data?.success) {
      allProducts.value = data.data.data; 
      pagination.value = { current_page: data.data.current_page, last_page: data.data.last_page, total: data.data.total };
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

const goToProductDetail = (slug) => { 
  if (slug) router.push({ name: 'productDetail', params: { shop_slug: shopSlug.value, slug: slug } }); 
};

const quickAddModal = reactive({
  isOpen: false, product: null, attributes: {}, selectedOptions: {}, quantity: 1, isAdding: false
});

const openQuickAdd = (productSummary) => {
  quickAddModal.product = productSummary;
  quickAddModal.selectedOptions = {}; 
  quickAddModal.quantity = 1;
  quickAddModal.isAdding = false;
  
  const attrs = {};
  productSummary.variants?.forEach(variant => {
    const attrVals = variant.attribute_values || variant.attributeValues || [];
    attrVals.forEach(av => {
      const attrName = av.attribute?.name;
      if (attrName) {
        if (!attrs[attrName]) attrs[attrName] = new Set();
        attrs[attrName].add(av.value);
      }
    });
  });
  
  quickAddModal.attributes = Object.fromEntries(
    Object.entries(attrs).map(([key, valueSet]) => [key, Array.from(valueSet)])
  );
  
  document.body.style.overflow = 'hidden';
  quickAddModal.isOpen = true;
};

const closeQuickAdd = () => {
  document.body.style.overflow = 'auto'; 
  quickAddModal.isOpen = false;
  quickAddModal.product = null;
};

const isAllAttributesSelected = computed(() => {
  const requiredAttrs = Object.keys(quickAddModal.attributes || {});
  if (requiredAttrs.length === 0) return true;
  return requiredAttrs.every(attr => quickAddModal.selectedOptions[attr] != null);
});

const currentVariant = computed(() => {
  const variants = quickAddModal.product?.variants;
  if (!variants?.length) return null;
  if (Object.keys(quickAddModal.attributes).length === 0) return variants[0];
  if (!isAllAttributesSelected.value) return null;

  return variants.find(v => {
    const attrVals = v.attribute_values || v.attributeValues || [];
    return Object.entries(quickAddModal.selectedOptions).every(([attrName, selectedVal]) => {
      return attrVals.some(av => 
        av.attribute?.name === attrName && String(av.value) === String(selectedVal)
      );
    });
  });
});

const displayPriceFormatted = computed(() => {
  if (currentVariant.value) {
    return formatPrice(currentVariant.value.promotional_price || currentVariant.value.price);
  }
  if (quickAddModal.product) {
    if (quickAddModal.product.variants?.length > 0) {
      const prices = quickAddModal.product.variants.map(v => parseFloat(v.promotional_price || v.price));
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      if (min !== max && !isNaN(min) && !isNaN(max)) return `${formatPrice(min)} - ${formatPrice(max)}`;
      return formatPrice(min);
    }
    return formatPrice(quickAddModal.product.promotional_price || quickAddModal.product.base_price);
  }
  return formatPrice(0);
});

const modalOldPrice = computed(() => {
  if (currentVariant.value && currentVariant.value.promotional_price && currentVariant.value.price > currentVariant.value.promotional_price) {
    return currentVariant.value.price;
  }
  if (!currentVariant.value && quickAddModal.product?.promotional_price && quickAddModal.product?.base_price > quickAddModal.product?.promotional_price) {
    return quickAddModal.product.base_price;
  }
  return null;
});

const modalDiscount = computed(() => {
  if (currentVariant.value && currentVariant.value.promotional_price && currentVariant.value.price > currentVariant.value.promotional_price) {
    return Math.round(((currentVariant.value.price - currentVariant.value.promotional_price) / currentVariant.value.price) * 100);
  }
  if (!currentVariant.value && quickAddModal.product?.promotional_price && quickAddModal.product?.base_price > quickAddModal.product?.promotional_price) {
    return Math.round(((quickAddModal.product.base_price - quickAddModal.product.promotional_price) / quickAddModal.product.base_price) * 100);
  }
  return 0;
});

const updateQuickAddQty = (delta) => {
  if (!isAllAttributesSelected.value) { return Toast.fire({ icon: 'info', title: 'Vui lòng chọn đầy đủ phân loại.' }); }
  const maxStock = currentVariant.value?.stock_quantity || 0;
  let newQty = quickAddModal.quantity + delta;
  
  if (newQty < 1) newQty = 1;
  if (newQty > maxStock) { 
    Toast.fire({ icon: 'warning', title: `Chỉ còn tối đa ${maxStock} sản phẩm` }); 
    newQty = maxStock; 
  }
  quickAddModal.quantity = newQty;
};

const validateQuickAddQty = () => {
  if (!isAllAttributesSelected.value) { 
    quickAddModal.quantity = 1; 
    return Toast.fire({ icon: 'info', title: 'Vui lòng chọn đầy đủ phân loại.' }); 
  }
  const maxStock = currentVariant.value?.stock_quantity || 0;
  let qty = parseInt(quickAddModal.quantity);
  
  if (isNaN(qty) || qty < 1) quickAddModal.quantity = 1;
  else if (qty > maxStock) { 
    Toast.fire({ icon: 'warning', title: `Chỉ còn tối đa ${maxStock} sản phẩm` }); 
    quickAddModal.quantity = maxStock; 
  }
};

const confirmAddToCart = async () => {
  if (!isAllAttributesSelected.value || !currentVariant.value) {
    return Toast.fire({ icon: 'warning', title: 'Vui lòng chọn đầy đủ phân loại.' });
  }
  const maxStock = currentVariant.value.stock_quantity || 0;
  if (quickAddModal.quantity > maxStock) {
    return soraAlert.fire({ icon: 'error', title: 'Vượt quá tồn kho', text: `Rất tiếc, cửa hàng chỉ còn ${maxStock} sản phẩm khả dụng.` });
  }
  
  quickAddModal.isAdding = true;
  try {
    const token = getToken();
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('cart_session_id', sessionId);
    }

    const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json', 'X-Cart-Session-Id': sessionId };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/api/client/cart`, {
      method: 'POST', headers,
      body: JSON.stringify({ product_variant_id: currentVariant.value.id, quantity: quickAddModal.quantity })
    });
    
    const data = await response.json();
    if (data.success) { closeQuickAdd(); router.push('/cart'); } 
    else { soraAlert.fire({ icon: 'error', title: 'Không thể thêm', text: data.message || "Đã có lỗi xảy ra." }); }
  } catch (error) { 
    soraAlert.fire({ icon: 'error', title: 'Lỗi', text: 'Lỗi kết nối tới máy chủ.' }); 
  } finally { 
    quickAddModal.isAdding = false; 
  }
};

onMounted(() => { 
  Promise.all([
    fetchCategories(), 
    fetchColors(),
    fetchAttributes(),
    fetchProducts(1)
  ]).then(() => isPageLoading.value = false); 
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

.category-item .dot {
  display: inline-block; width: 6px; height: 6px; border-radius: 50%; border: 1px solid #999; background-color: transparent; transition: all 0.3s ease;
}
.category-item:hover .dot { border-color: #111; }
.category-item.active .dot { background-color: #111; border-color: #111; }
.category-item .label-text { font-size: 0.9rem; color: #555; transition: all 0.3s ease; }
.category-item:hover .label-text { color: #111; }
.category-item.active .label-text { color: #111; font-weight: 600; }

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
.sora-luxury-card { background: #ffffff; border: 1px solid #f0f0f0; border-radius: 2px; position: relative; display: flex; flex-direction: column; overflow: hidden; transition: all 0.4s; cursor: pointer; height: 100%; }
.sora-luxury-card:hover { box-shadow: 0 15px 35px rgba(0,0,0,0.08); border-color: #e5e5e5; transform: translateY(-5px); }
.sora-card-image { position: relative; width: 100%; aspect-ratio: 1 / 1; overflow: hidden; background-color: #f9f9f9; }
.sora-card-image img { width: 100%; height: 100%; object-fit: cover; object-position: center; transition: opacity 0.6s ease; }
.sora-main-img { z-index: 1; }
.sora-hover-img { position: absolute; top:0; left:0; z-index: 2; opacity: 0; }
.sora-luxury-card:hover .sora-card-image.has-hover-image .sora-main-img { opacity: 0; }
.sora-luxury-card:hover .sora-card-image.has-hover-image .sora-hover-img { opacity: 1; }
.sora-card-badges { position: absolute; top: 15px; left: 15px; z-index: 10; display: flex; flex-direction: column; gap: 8px; }
.sora-badge { background: #ffffff; color: #222; font-family: 'Oswald', sans-serif; font-size: 0.65rem; font-weight: 700; letter-spacing: 2px; padding: 4px 10px; border-radius: 2px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.sale-badge { background-color: #9f273b !important; color: white !important; }
.sora-card-info { padding: 20px 15px 70px 15px; text-align: center; flex-grow: 1; display: flex; flex-direction: column; justify-content: center; }
.sora-card-title { font-family: 'Oswald', sans-serif; font-size: 1.1rem; font-weight: 600; color: #111; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.sora-card-category { font-family: 'Playfair Display', serif; font-style: italic; color: #666; font-size: 0.95rem; margin-bottom: 15px; }
.sora-card-price { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: #9f273b; margin-top: auto; }
.sora-card-price-old { font-size: 0.95rem; color: #999; text-decoration: line-through; margin-right: 10px; font-weight: 400; }
.sora-card-action { position: absolute; bottom: 0; left: 0; width: 100%; transform: translateY(100%); transition: transform 0.4s; z-index: 10; }
.sora-luxury-card:hover .sora-card-action { transform: translateY(0); }
.sora-action-btn { width: 100%; padding: 14px 0; background: #731621; color: #ffffff; border: none; font-family: 'Oswald', sans-serif; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: background 0.3s ease; }
.sora-action-btn:hover { background: #500f17; color: #fff;}

/* CSS QUICK ADD MODAL */
@keyframes slideUp { from { transform: translateY(30px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
.variant-select-btn:hover { border-color: #9f273b; color: #9f273b; }
.variant-select-btn.selected { border-color: #9f273b; color: #9f273b; font-weight: 700; background-color: #fdf5f6; box-shadow: inset 0 0 0 1px #9f273b; }
.sora-discount-tag { background-color: #cc1e2e; color: white; font-weight: bold; border-radius: 2px; }
</style>