<template>
  <div class="shop-page min-vh-100 bg-white">
    
    <div class="container-fluid px-4 py-3 border-bottom sora-border-light bg-light">
      <div class="d-flex align-items-center text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.15em;">
        <router-link to="/" class="text-muted text-decoration-none hover-text-primary transition-colors">Trang chủ</router-link>
        <span class="mx-2 text-muted">/</span>
        <span class="fw-medium text-dark">Cửa hàng trang sức</span>
      </div>
    </div>

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

    <div class="container-fluid px-4 py-4 mt-2 mx-auto" style="max-width: 1440px;">
      <div class="row">
        
        <div class="col-lg-2 col-md-3 d-none d-md-block sidebar-filter pe-4 border-end sora-border-light pt-2">
          
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
                <i v-if="selectedColors.includes(color)" class="bi bi-check position-absolute fw-bold" :class="isLightColor(color) ? 'text-dark' : 'text-white'" style="top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.3rem;"></i>
              </div>
            </div>
          </div>

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
              />
            </template>
          </div>

          <div v-if="allProducts.length === 0 && !isLoadingProducts" class="text-center py-5 my-5 bg-light sora-border-light border fade-in" style="border-radius: 12px;">
            <i class="bi bi-gem fs-1 mb-3" style="color: #e7ce7d;"></i>
            <p class="text-dark playfair-font fs-4 mb-2">Không tìm thấy kiệt tác nào</p>
            <p class="text-muted mb-4 fw-light">Vui lòng thử thay đổi bộ lọc hoặc tìm kiếm khác.</p>
            <button @click="resetFilters" class="btn text-uppercase ls-widest px-5 py-3 transition-colors sora-btn-primary" style="font-size: 0.8rem; border-radius: 8px;">Xóa Bộ Lọc</button>
          </div>

          <div v-if="pagination.last_page > 1" class="d-flex justify-content-center align-items-center mt-5 pt-5 border-top sora-border-light fade-in">
            <nav aria-label="Page navigation">
              <ul class="pagination sora-custom-pagination gap-2 mb-0">
                <li class="page-item" :class="{ 'disabled': isFirstPage }">
                  <button class="page-link shadow-sm" @click="changePage(Number(pagination.current_page) - 1)" :disabled="isFirstPage">
                    <i class="bi bi-chevron-left"></i>
                  </button>
                </li>
                
                <li class="page-item" v-for="(page, index) in visiblePages" :key="index" :class="{ 'active': page !== '...' && Number(page) === Number(pagination.current_page), 'disabled': page === '...' }">
                  <span v-if="page === '...'" class="page-link border-0 text-muted bg-transparent px-2">...</span>
                  <button v-else class="page-link shadow-sm font-serif fw-bold" @click="changePage(page)">{{ page }}</button>
                </li>

                <li class="page-item" :class="{ 'disabled': isLastPage }">
                  <button class="page-link shadow-sm" @click="changePage(Number(pagination.current_page) + 1)" :disabled="isLastPage">
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

        </div>
      </div>
    </div>

    <CompareModal 
      ref="compareModalRef" 
      :shop-slug="shopSlug" 
      @update-list="compareList = $event" 
    />

  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import apiClient from '@/utils/apiClient';

import ProductCard from '@/components/ui/ProductCard.vue';
import CompareModal from '@/components/ui/CompareModal.vue'; 
import { usePublicRefreshListener } from '@/composables/usePublicRefreshListener.js';

const route = useRoute();
const router = useRouter();
const shopSlug = ref(route.params.shop_slug || 'aurora-jewelry');
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/api\/?$/, '');

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
const wishlistIds = ref([]);
const compareModalRef = ref(null);
const compareList = ref([]);

const isFirstPage = computed(() => Number(pagination.value.current_page) === 1);
const isLastPage = computed(() => Number(pagination.value.current_page) === Number(pagination.value.last_page));

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

const getImageUrl = (path) => {
  if (!path) return '/Sora-placeholder.png';
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  let cleanPath = path.startsWith('/') ? path.substring(1) : path;
  if (cleanPath.startsWith('storage/')) return `${API_BASE_URL}/${cleanPath}`;
  return `${API_BASE_URL}/storage/${cleanPath}`;
};

const handleImageError = (e) => { e.target.src = '/Sora-placeholder.png'; };

const isColorAttribute = (attrName) => {
  if (!attrName) return false;
  const name = String(attrName).toLowerCase();
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

const isInWishlist = (productId) => wishlistIds.value.includes(productId);

const showWishlistNotification = (isAdded) => {
  Toast.fire({
    icon: isAdded ? 'success' : 'info',
    title: isAdded ? 'Đã thêm vào danh sách yêu thích!' : 'Đã bỏ khỏi danh sách yêu thích'
  });
  localStorage.setItem('sora_wishlist', JSON.stringify(wishlistIds.value));
};

const loadWishlist = async () => {
  const token = getToken();
  if (!token) {
    const stored = localStorage.getItem('sora_wishlist');
    if (stored) wishlistIds.value = JSON.parse(stored);
    return;
  }
  try {
    const result = await apiClient.get('/client/favourites');
    if (result.data?.status && Array.isArray(result.data.data)) {
      wishlistIds.value = result.data.data.map((item) => item.product?.id).filter(Boolean);
      localStorage.setItem('sora_wishlist', JSON.stringify(wishlistIds.value));
    } else {
      const stored = localStorage.getItem('sora_wishlist');
      if (stored) wishlistIds.value = JSON.parse(stored);
    }
  } catch (error) {
    const stored = localStorage.getItem('sora_wishlist');
    if (stored) wishlistIds.value = JSON.parse(stored);
  }
};

const toggleWishlist = async (product) => {
  if (!product || !product.id) return;
  const token = getToken();
  
  if (!token) {
    const index = wishlistIds.value.indexOf(product.id);
    const isAdding = index === -1;
    if (isAdding) wishlistIds.value.push(product.id);
    else wishlistIds.value.splice(index, 1);
    showWishlistNotification(isAdding);
    return;
  }

  try {
    const data = await apiClient.post('/client/favourites/toggle', { product_id: product.id });

    if (!data.data?.status) throw new Error();

    const isAdded = data.data?.action === 'added';
    if (isAdded && !wishlistIds.value.includes(product.id)) wishlistIds.value.push(product.id);
    else if (!isAdded) wishlistIds.value = wishlistIds.value.filter(id => id !== product.id);
    
    showWishlistNotification(isAdded);
  } catch (error) {
    if (error?.response?.status === 401) {
      Swal.fire({
        icon: 'warning',
        title: 'Bạn chưa đăng nhập!',
        text: 'Vui lòng đăng nhập để lưu trữ bộ sưu tập yêu thích của mình.',
        confirmButtonText: 'Đăng Nhập Ngay',
        showCancelButton: true,
        cancelButtonText: 'Đóng',
        confirmButtonColor: '#9f273b'
      }).then((result) => {
        if (result.isConfirmed) router.push('/login');
      });
    } else {
      Toast.fire({ icon: 'error', title: 'Có lỗi xảy ra, thử lại sau' });
    }
  }
};

const isInCompare = (id) => compareList.value.some(item => item.id === id);
const handleToggleCompare = (prod) => { if (compareModalRef.value) compareModalRef.value.toggleCompare(prod); };

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

const toggleFilterArray = (arrayRef, value) => {
  const index = arrayRef.value.indexOf(value);
  if (index > -1) arrayRef.value.splice(index, 1);
  else arrayRef.value.push(value);
  applyFilters();
};

const toggleColor = (color) => toggleFilterArray(selectedColors, color);
const toggleAttribute = (val) => toggleFilterArray(selectedAttributes, val);

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
    if (selectedColors.value.length > 0) queryPayload.color = selectedColors.value.join(',');
    if (selectedAttributes.value.length > 0) queryPayload.attribute_values = selectedAttributes.value.join(',');

    const data = await apiClient.get(`/shop/${shopSlug.value}/products`, { params: queryPayload });
    
    if(data?.data?.success) {
      allProducts.value = data.data.data.data; 
      pagination.value = { current_page: data.data.data.current_page, last_page: data.data.data.last_page, total: data.data.data.total };
      extractFiltersFromVariants(allProducts.value);
    }
  } catch (e) {
  } finally { 
    isLoadingProducts.value = false; 
  }
};

usePublicRefreshListener({
  products: () => fetchProducts(Number(pagination.value.current_page) || 1),
});

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
  // Đọc query parameter category từ URL
  const categoryFromQuery = route.query.category;
  if (categoryFromQuery) {
    filters.categories = categoryFromQuery;
  }

  loadWishlist();
  Promise.all([fetchCategories(), fetchProducts(1)]).then(() => isPageLoading.value = false);
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