<template>
  <header class="site-header bg-white sticky-top" :class="[isScrolled ? 'header-scrolled' : '', isHidden ? 'header-hidden' : '']">
    <div class="container position-relative">

      <div class="header-tier-top d-flex justify-content-between align-items-center pt-3 pb-2 transition-all">

        <div class="top-links-wrapper d-flex align-items-center" style="flex: 1;">
          <button class="btn border-0 d-lg-none fs-3 text-dark p-0 me-3" @click="toggleMobileMenu">
            <i class="bi bi-list"></i>
          </button>
          <div class="top-links d-none d-lg-flex gap-4">
            <router-link :to="{ name: 'about' }" class="top-link">VỀ SORA</router-link>
            <router-link :to="{ name: 'contact' }" class="top-link">LIÊN HỆ</router-link>
            <router-link :to="{ name: 'services' }" class="top-link">DỊCH VỤ</router-link>
            <router-link :to="{ name: 'gold-price' }" class="top-link">BẢNG GIÁ VÀNG</router-link>
          </div>
        </div>

        <div href="/" class="logo-wrapper d-flex justify-content-center" style="flex: 1;">
          <router-link :to="{ name: 'home' }">
            <img src="../../assets/images/logo1.png" alt="SORA Logo" class="logo-img" @error="handleLogoError">
          </router-link>
        </div>

        <div class="header-icons d-flex justify-content-end align-items-center gap-4" style="flex: 1;">
          <a href="#" @click.prevent="safeNavigate('favourite')" class="icon-link hover-primary transition-color">
            <i class="bi bi-heart"></i>
          </a>

          <div class="user-menu-wrapper position-relative" ref="userMenuContainer">
            <!-- User Menu khi đăng nhập phải đổi màu và đổi biểu tượng biểu thị là đã dăng nhập -->
            <button @click="toggleUserMenu"
              class="btn border-0 p-0 bg-transparent icon-link hover-primary transition-color d-flex align-items-center justify-content-center">
              <i v-if="user" class="bi bi-person-circle text-primary-custom"></i>
              <i v-else class="bi bi-person-circle"></i>
            </button>

            <transition name="fade">
              <div v-if="isUserMenuOpen"
                class="user-dropdown shadow-lg rounded-4 border bg-white position-absolute end-0 mt-3 py-2"
                style="width: 220px; z-index: 1050;">

                <template v-if="user">
                  <div class="px-4 py-2 border-bottom mb-2 bg-light">
                    <div class="fw-bold text-truncate">{{ user.fullName || 'Thành viên' }}</div>
                    <div class="small text-muted font-monospace text-truncate">{{ user.email }}</div>
                  </div>
                  <a href="#" @click.prevent="safeNavigate('profile')"
                    class="dropdown-item py-2 px-4 fw-medium text-decoration-none"><i
                      class="bi bi-person-circle me-2 text-muted"></i>Tài khoản của tôi
                  </a>
                  <a href="#" @click.prevent="safeNavigate('order')"
                    class="dropdown-item py-2 px-4 fw-medium text-decoration-none"><i
                      class="bi bi-box-seam me-2 text-muted"></i>Đơn mua
                  </a>
                  <a href="#" @click.prevent="safeNavigate('favourite')"
                    class="dropdown-item py-2 px-4 fw-medium text-decoration-none"><i
                      class="bi bi-heart text-danger me-2"></i>Yêu thích
                  </a>
                  <div class="dropdown-divider my-2"></div>
                  <a href="#" @click.prevent="handleLogout" class="dropdown-item py-2 px-4 fw-bold text-danger"><i
                      class="bi bi-box-arrow-right me-2"></i>Đăng xuất
                  </a>
                </template>
                <template v-else>
                  <div class="p-3 text-center">
                    <p class="small text-muted mb-3">Đăng nhập để theo dõi đơn hàng và ưu đãi</p>
                    <a href="#" @click.prevent="safeNavigate('login')"
                      class="btn btn-brand w-100 fw-bold rounded-pill text-white mb-2 text-decoration-none">Đăng Nhập</a>
                    <div class="small">Chưa có tài khoản? <a href="#" @click.prevent="safeNavigate('register')"
                        class="text-primary-custom fw-bold text-decoration-none">Đăng ký</a></div>
                  </div>
                </template>
              </div>
            </transition>
          </div>

          <router-link :to="{ name: 'cart' }" class="icon-link position-relative hover-primary transition-color d-flex align-items-center">
            <i class="bi bi-bag"></i>
            <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount > 99 ? '99+' : cartItemCount }}</span>
          </router-link>
        </div>
      </div>

      <div class="header-tier-bottom transition-all d-none d-lg-flex justify-content-center align-items-center pb-2 mt-2 position-static">

        <nav class="main-nav position-static">
          <ul class="d-flex align-items-center m-0 p-0 list-unstyled gap-5 position-static">
            <li><router-link :to="{ name: 'home' }" class="nav-item-link">XU HƯỚNG</router-link></li>

            <!-- MEGA MENU SẢN PHẨM: ĐÃ ÁP DỤNG HÀM BẢO VỆ MOUSE LEAVE (DELAY 200MS) -->
            <li class="position-static py-2" @mouseenter="openMegaMenu" @mouseleave="closeMegaMenu">
              <a href="#" @click.prevent="safeNavigate('shop')" class="nav-item-link d-flex align-items-center">
                SẢN PHẨM
              </a>

              <transition name="mega-fade">
                <MegaMenu
                  :show="isMegaMenuOpen"
                  :categories="categories"
                  :hoveredCategory="hoveredCategory"
                  :getImage="getImage"
                  :handleImageError="handleImageError"
                  :formatCurrency="formatCurrency"
                  :safeNavigate="safeNavigate"
                  :goToProduct="goToProduct"
                  :onHoverCategory="(cat) => (hoveredCategory = cat)"
                  :onClose="() => (isMegaMenuOpen = false)"
                />
              </transition>
            </li>

            <router-link :to="{ name: 'client-combos' }" class="nav-item-link">BỘ SƯU TẬP</router-link>
            <!-- <li><a href="#" class="nav-item-link">QUÀ TẶNG</a></li> -->
            <li><router-link :to="{ name: 'news'}" class="nav-item-link">TIN TỨC</router-link></li>
          </ul>
        </nav>

        <div class="search-trigger-wrapper position-absolute end-0 d-flex align-items-center">
          <span class="text-muted fw-light opacity-50 me-3" style="font-size: 1.2rem;">|</span>

          <div class="search-box-luxury position-relative" ref="searchContainer">
            <form @submit.prevent="handleSearch" class="position-relative d-flex align-items-center">
              <input type="text" class="form-control bg-transparent border-0 shadow-none pe-4 font-oswald tracking-wide"
                placeholder="Tìm kiếm..." v-model="searchQuery" @input="onSearchInput"
                @focus="showSearchResults = true">
              <button type="submit" class="btn border-0 p-0 position-absolute end-0 text-dark hover-primary">
                <i v-if="isFetchingSearch" class="spinner-border spinner-border-sm text-muted"></i>
                <i v-else class="bi bi-search fs-6"></i>
              </button>
              <div class="search-underline"></div>
            </form>

            <transition name="fade">
              <div v-if="showSearchResults && searchQuery.length > 0"
                class="search-results-dropdown shadow-lg rounded-4 overflow-hidden border mt-2 bg-white position-absolute end-0"
                style="width: 320px; z-index: 1050;">

                <div v-if="categoryResults.length > 0" class="p-2 bg-light border-bottom text-start">
                  <div class="small fw-bold text-muted text-uppercase px-2 mb-1" style="font-size: 0.7rem;">Danh mục</div>
                  <ul class="list-unstyled m-0">
                    <li v-for="cat in categoryResults" :key="cat.id">
                      <a href="#" @click.prevent="goToCategory(cat.slug)"
                        class="d-block px-3 py-2 text-dark text-decoration-none hover-bg-light rounded fw-semibold">
                        <i class="bi bi-folder2-open me-2 text-primary-custom"></i> {{ cat.name }}
                      </a>
                    </li>
                  </ul>
                </div>

                <div v-if="searchResults.length > 0" class="p-2 text-start">
                  <div class="small fw-bold text-muted text-uppercase px-2 mb-1 mt-1" style="font-size: 0.7rem;">
                    {{ isCategoryFallback ? 'Gợi ý từ danh mục' : 'Sản phẩm' }}
                  </div>
                  <ul class="list-unstyled m-0">
                    <li v-for="prod in searchResults" :key="prod.id">
                      <a href="#" @click.prevent="goToProduct(prod.slug)"
                        class="d-flex align-items-center px-2 py-2 text-dark text-decoration-none hover-bg-light rounded gap-3">
                        <img :src="getImage(prod.thumbnail_image)" @error="handleImageError" class="rounded border object-fit-cover bg-white"
                          style="width: 40px; height: 40px;">
                        <div class="overflow-hidden">
                          <div class="small fw-bold text-truncate" v-html="highlightText(prod.name)"></div>
                          <div class="small fw-bold text-danger">{{ formatCurrency(prod.promotional_price || prod.base_price) }}</div>
                        </div>
                      </a>
                    </li>
                  </ul>
                </div>

                <div v-if="!isFetchingSearch && categoryResults.length === 0 && searchResults.length === 0"
                  class="p-4 text-center text-muted">
                  <i class="bi bi-emoji-frown fs-3 d-block mb-2"></i>
                  <span class="small">Không tìm thấy kết quả cho "{{ searchQuery }}"</span>
                </div>

                <div v-if="searchResults.length > 0" class="p-2 border-top bg-light text-center">
                  <a href="#" @click.prevent="handleSearch"
                    class="small fw-bold text-primary-custom text-decoration-none">
                    Xem tất cả <i class="bi bi-arrow-right"></i>
                  </a>
                </div>
              </div>
            </transition>
          </div>
        </div>

      </div>
    </div>

    <!-- Nền mờ khi Header trượt lên -->
    <div class="border-bottom opacity-50"></div>

    <!-- MOBILE OFFCANVAS MENU -->
    <transition name="slide-left">
      <div v-if="isMobileMenuOpen" class="mobile-menu-overlay">
        <div class="mobile-backdrop" @click="toggleMobileMenu"></div>
        <div class="mobile-sidebar bg-white d-flex flex-column">
          <div class="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
            <h4 class="font-oswald fw-bold text-dark m-0 tracking-wide text-sora-primary">S O R A</h4>
            <button class="btn border-0 text-dark fs-4 p-0 shadow-none hover-primary transition-color" @click="toggleMobileMenu">
                <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="flex-grow-1 overflow-auto p-3">
            <ul class="list-unstyled m-0 d-flex flex-column gap-2 font-oswald tracking-wide text-uppercase">
              <li><a href="#" @click.prevent="toggleMobileMenu(); safeNavigate('home')" class="mobile-nav-link fw-bold"><i class="bi bi-house me-3 fs-5 text-muted"></i> Trang chủ</a></li>
              <li><a href="#" @click.prevent="toggleMobileMenu(); safeNavigate('shop')" class="mobile-nav-link fw-bold"><i class="bi bi-gem me-3 fs-5 text-muted"></i> Cửa hàng Trang sức</a></li>
              <li><a href="#" @click.prevent="toggleMobileMenu(); safeNavigate('client-combos')" class="mobile-nav-link fw-bold"><i class="bi bi-stars me-3 fs-5 text-muted"></i> Bộ Sưu Tập</a></li>
              <li><hr class="border-light-subtle my-2"></li>
              <li><a href="#" @click.prevent="toggleMobileMenu(); safeNavigate('about')" class="mobile-nav-link fw-bold"><i class="bi bi-info-circle me-3 fs-5 text-muted"></i> Về SORA</a></li>
              <li><a href="#" @click.prevent="toggleMobileMenu(); safeNavigate('gold-price')" class="mobile-nav-link fw-bold"><i class="bi bi-graph-up-arrow me-3 fs-5 text-muted"></i> Bảng giá vàng</a></li>
              <li><a href="#" @click.prevent="toggleMobileMenu(); safeNavigate('services')" class="mobile-nav-link fw-bold"><i class="bi bi-tools me-3 fs-5 text-muted"></i> Dịch vụ</a></li>
              <li><a href="#" @click.prevent="toggleMobileMenu(); safeNavigate('contact')" class="mobile-nav-link fw-bold"><i class="bi bi-telephone me-3 fs-5 text-muted"></i> Liên hệ</a></li>
            </ul>
          </div>
          <div class="p-4 bg-light border-top">
             <div v-if="!user">
                <button @click="toggleMobileMenu(); safeNavigate('login')" class="btn btn-brand w-100 fw-bold rounded-pill text-white mb-3 font-oswald tracking-wide shadow-sm py-2">ĐĂNG NHẬP</button>
                <button @click="toggleMobileMenu(); safeNavigate('register')" class="btn btn-outline-brand w-100 fw-bold rounded-pill font-oswald tracking-wide py-2">ĐĂNG KÝ</button>
             </div>
             <div v-else>
                <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-light-subtle">
                   <div class="bg-primary-custom text-white rounded-circle d-flex align-items-center justify-content-center fw-bold border shadow-sm" style="width: 45px; height: 45px;">
                      {{ user.fullName?.charAt(0).toUpperCase() || 'U' }}
                   </div>
                   <div class="overflow-hidden">
                      <div class="fw-bold text-dark text-truncate">{{ user.fullName }}</div>
                      <div class="text-muted small text-truncate">{{ user.email }}</div>
                   </div>
                </div>
                <button @click="toggleMobileMenu(); safeNavigate('profile')" class="btn btn-light w-100 mb-2 border text-start fw-medium py-2"><i class="bi bi-person-circle me-2 text-primary-custom"></i>Tài khoản của tôi</button>
                <button @click="toggleMobileMenu(); safeNavigate('order')" class="btn btn-light w-100 mb-3 border text-start fw-medium py-2"><i class="bi bi-box-seam me-2 text-primary-custom"></i>Đơn hàng đã mua</button>
                <button @click="toggleMobileMenu(); handleLogout()" class="btn btn-light w-100 border text-center text-danger fw-bold py-2"><i class="bi bi-box-arrow-right me-2"></i>Đăng xuất</button>
             </div>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';
import MegaMenu from '@/components/user/MegaMenu.vue';

const route = useRoute();
const router = useRouter();
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || BACKEND_URL.replace(/\/api\/?$/, '');

const sysConfig = ref({ phone: '12345678910', email: 'SORA@GMAIL.COM', facebook: '#', instagram: '#', twitter: '#' });
const user = ref(null);
const isUserMenuOpen = ref(false);
const userMenuContainer = ref(null);

const categories = ref([]);
const hoveredCategory = ref(null);

const searchQuery = ref('');
const searchResults = ref([]);
const categoryResults = ref([]);
const showSearchResults = ref(false);
const searchContainer = ref(null);
const isCategoryFallback = ref(false);
let searchDebounce = null;
const isFetchingSearch = ref(false);

const cartItemCount = ref(0);

// ==========================================
// TÍCH HỢP BẢO VỆ CHUỘT CHO MEGA MENU (200MS)
// ==========================================
const isMegaMenuOpen = ref(false);
let megaMenuTimer = null;

const openMegaMenu = () => {
    if (megaMenuTimer) clearTimeout(megaMenuTimer);
    isMegaMenuOpen.value = true;
};

const closeMegaMenu = () => {
    megaMenuTimer = setTimeout(() => {
        isMegaMenuOpen.value = false;
    }, 200); 
};

// ==========================================
// THUẬT TOÁN SMART STICKY HEADER
// ==========================================
const isScrolled = ref(false);
const isHidden = ref(false);
let lastScrollY = 0;

const handleScroll = () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
        isScrolled.value = true;
    } else if (currentScrollY < 20) {
        isScrolled.value = false;
    }

    if (currentScrollY > 200) {
        if (currentScrollY > lastScrollY && !isHidden.value) {
            isHidden.value = true;
            isUserMenuOpen.value = false;
            showSearchResults.value = false;
            isMegaMenuOpen.value = false;
        } else if (currentScrollY < lastScrollY && isHidden.value) {
            isHidden.value = false;
        }
    } else {
        isHidden.value = false;
    }
    lastScrollY = currentScrollY;
};

// TRẠNG THÁI MOBILE MENU
const isMobileMenuOpen = ref(false);
const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
    if (isMobileMenuOpen.value) {
        document.body.style.overflow = 'hidden'; 
    } else {
        document.body.style.overflow = 'auto';
    }
};

const safeNavigate = (routeName, options = {}) => {
  if (router.hasRoute(routeName)) {
    router.push({ name: routeName, ...options });
  } else {
    Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Tính năng đang được phát triển!', showConfirmButton: false, timer: 2000 });
  }
};

const soraPlaceholder = '/Sora-placeholder.png';
const getImage = (path) => {
  if (!path) return soraPlaceholder;
  const cleaned = path.trim();
  if (cleaned.startsWith('http') || cleaned.startsWith('data:')) return cleaned;
  let normalized = cleaned.replace(/^\//, '');
  if (normalized.startsWith('storage/')) {
    normalized = normalized.replace(/^storage\//, '');
  }
  return `${STORAGE_URL}/${normalized}`;
};
const handleImageError = (e) => { e.target.src = soraPlaceholder; };
const handleLogoError = (e) => { e.target.outerHTML = '<h2 class="font-oswald fw-bold text-dark m-0 tracking-wide">S O R A</h2>'; };
const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
const highlightText = (text) => {
  if (!searchQuery.value) return text;
  return text.replace(new RegExp(`(${searchQuery.value})`, 'gi'), '<mark class="text-primary-custom bg-transparent p-0">$1</mark>');
};

const getHeaders = () => {
  const headers = { 'Accept': 'application/json' };
  const token = localStorage.getItem('auth_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const sid = localStorage.getItem('cart_session_id');
  if (sid) headers['X-Cart-Session-Id'] = sid;
  
  return headers;
};

const fetchHeaderData = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/client/header-data`, { headers: getHeaders() });
    if (res.data.success) {
      categories.value = res.data.data.categories;
      if (categories.value.length > 0) hoveredCategory.value = categories.value[0];
      if (res.data.data.config) sysConfig.value = { ...sysConfig.value, ...res.data.data.config };
      
      if (res.data.data.cart_count !== undefined) {
          cartItemCount.value = parseInt(res.data.data.cart_count) || 0;
      }
    }
  } catch (error) { console.error('Lỗi tải Menu:', error); }
};

const fetchUserProfile = async () => {
  const token = localStorage.getItem('auth_token');
  if (!token) return;

  try {
    const res = await axios.get(`${BACKEND_URL}/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    user.value = res.data;
    localStorage.setItem('userData', JSON.stringify(res.data));
  } catch (error) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userData');
    user.value = null;
  }
};

const performSearch = async (query) => {
  if (!query) {
    searchResults.value = []; categoryResults.value = []; isCategoryFallback.value = false;
    return;
  }
  isFetchingSearch.value = true;
  try {
    const res = await axios.get(`${BACKEND_URL}/client/search`, { params: { keyword: query } });
    if (res.data.success) {
      searchResults.value = res.data.data.products;
      categoryResults.value = res.data.data.categories;
      isCategoryFallback.value = res.data.data.is_category_fallback;
    }
  } catch (e) { console.error(e); } finally { isFetchingSearch.value = false; }
};

const onSearchInput = (e) => {
  const query = e.target.value.trim();
  if (!query) {
    showSearchResults.value = false; searchResults.value = []; categoryResults.value = [];
    return;
  }
  showSearchResults.value = true;
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => { performSearch(query); }, 300);
};

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    showSearchResults.value = false;
    safeNavigate('shop', { query: { q: searchQuery.value } });
  }
};

const goToProduct = (slug) => {
  showSearchResults.value = false; 
  isMegaMenuOpen.value = false;
  const shopSlugValue = route.params.shop_slug || 'aurora-jewelry';
  safeNavigate('productDetail', { params: { shop_slug: shopSlugValue, slug: slug } });
};

const goToCategory = (slug) => {
  showSearchResults.value = false; isMegaMenuOpen.value = false;
  safeNavigate('shop', { query: { category: slug } });
};

const toggleUserMenu = () => { isUserMenuOpen.value = !isUserMenuOpen.value; };

const handleClickOutside = (e) => {
  if (userMenuContainer.value && !userMenuContainer.value.contains(e.target)) isUserMenuOpen.value = false;
  if (searchContainer.value && !searchContainer.value.contains(e.target)) showSearchResults.value = false;
};

const handleLogout = () => {
  Swal.fire({
    title: 'Đăng xuất?', text: 'Bạn có chắc muốn đăng xuất khỏi tài khoản?', icon: 'question',
    showCancelButton: true, confirmButtonColor: '#9f273b', cancelButtonColor: '#6c757d', confirmButtonText: 'Đăng xuất'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('userData');
      localStorage.removeItem('auth_token');
      user.value = null;
      isUserMenuOpen.value = false;
      safeNavigate('home');
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã đăng xuất', showConfirmButton: false, timer: 1500 });
    }
  });
};

// ==========================================
// XỬ LÝ SỰ KIỆN CẬP NHẬT GIỎ HÀNG THÔNG MINH
// ==========================================
const handleCartUpdateEvent = (e) => {
  // Nếu tín hiệu có gửi kèm con số chính xác -> Cập nhật luôn, khỏi gọi API đỡ lag
  if (e && e.detail && e.detail.cart_count !== undefined) {
    cartItemCount.value = parseInt(e.detail.cart_count) || 0;
  } else {
    // Nếu chỉ báo hiệu (không có số) -> Tải lại dữ liệu từ server
    fetchHeaderData();
  }
};

// Theo dõi chuyển hướng trang (SPA Router) - Tự động tải lại số lượng giỏ hàng khi người dùng chuyển qua lại các trang
watch(
  () => route.fullPath,
  () => {
    fetchHeaderData();
  }
);

onMounted(() => {
  fetchHeaderData();
  const userData = localStorage.getItem('userData');
  if (userData) {
    user.value = JSON.parse(userData);
  }
  fetchUserProfile();
  
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('update-cart-count', handleCartUpdateEvent);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('update-cart-count', handleCartUpdateEvent);
});
</script>
<style>
:root {
  --primary: #9f273b;
  --secondary: #e7ce7d;
  --accent: #cc1e2e;
}

</style>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap');


.text-primary-custom { color: #9f273b !important; }
.bg-primary-custom { background-color: #9f273b !important; }
.border-primary-custom { border-color: #9f273b !important; }

.btn-brand { background-color: #9f273b; border: none; transition: 0.2s; color: white !important; }
.btn-brand:hover { background-color: #801f2f; color: white !important; }
.btn-outline-brand { border: 1.5px solid #9f273b; color: #9f273b; background: transparent; transition: 0.2s; }
.btn-outline-brand:hover { background-color: #9f273b; color: white !important; }

.hover-primary:hover { color: #9f273b !important; }
.transition-color { transition: color 0.2s ease; }
.hover-bg-light:hover { background-color: #f8f9fa; }
.font-oswald { font-family: 'Oswald', sans-serif !important; }
.tracking-wide { letter-spacing: 0.5px; }

/* ==========================================
   CSS SMART STICKY HEADER
========================================== */
.site-header { 
  z-index: 1040; 
  background-color: #fff; 
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease; 
}

/* Khi cuộn xuống thì ẩn đi */
.header-hidden {
  transform: translateY(-100%);
}

/* Khi cuộn trang (Shrink) -> Thu nhỏ Header lại */
.header-scrolled { 
  box-shadow: 0 4px 20px rgba(0,0,0,0.06); 
}
.header-scrolled .header-tier-top { 
  padding-top: 5px !important; 
  padding-bottom: 5px !important; 
}
.header-scrolled .header-tier-bottom {
  margin-top: 0 !important;
  padding-bottom: 5px !important;
}
.header-scrolled .logo-img { 
  height: 50px; 
}
.header-scrolled .nav-item-link {
  font-size: 0.9rem;
}

.logo-img { 
  height: 80px; 
  width: auto; 
  object-fit: contain; 
  display: block; 
  transition: height 0.4s ease; 
}
.transition-all { transition: all 0.4s ease; }

.top-link {
  font-family: 'Oswald', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: #333;
  text-decoration: none;
  letter-spacing: 1px;
  transition: color 0.2s ease;
}
.top-link:hover { color: #9f273b; }

.icon-link { color: #333; font-size: 1.3rem; text-decoration: none; }

.cart-badge {
  position: absolute;
  top: -6px;
  right: -10px;
  background-color: #9f273b;
  color: white;
  font-size: 0.65rem;
  font-weight: bold;
  height: 18px;
  min-width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50px;
  border: 2px solid #fff;
  line-height: 1;
}

.nav-item-link {
  color: #333;
  text-decoration: none;
  font-family: 'Oswald', sans-serif;
  font-weight: 500;
  font-size: 1rem;
  letter-spacing: 1.5px;
  padding: 5px 0;
  position: relative;
  transition: font-size 0.4s ease, color 0.2s ease;
}
.nav-item-link::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background-color: #9f273b;
  transition: width 0.3s ease;
}
.nav-item-link:hover { color: #9f273b; }
.nav-item-link:hover::after { width: 100%; }

.search-box-luxury { width: 220px; }
.search-box-luxury input { font-size: 0.85rem; color: #333; }
.search-box-luxury input:focus { outline: none; box-shadow: none; }
.search-underline { position: absolute; bottom: 0; left: 0; width: 100%; height: 1px; background-color: #ddd; transition: background-color 0.3s ease; }
.search-box-luxury input:focus~.search-underline { background-color: #9f273b; height: 2px; }

.mega-menu-wrapper {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin: 0 auto; 
  width: 980px; 
  max-width: 100%;
  background: #fff;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  cursor: default;
  z-index: 1050;
}

.mega-menu-wrapper::before {
  content: '';
  position: absolute;
  top: -30px; 
  left: 0;
  width: 100%;
  height: 30px;
  background: transparent;
}

.mega-cat-link {
  color: #333;
  padding: 4px 0;
  border-radius: 0;
  position: relative;
  display: inline-block;
  width: max-content; 
  transition: color 0.3s ease;
  background-color: transparent !important;
}

.mega-cat-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%; 
  height: 1.5px;
  background-color: #9f273b;
  transform: scaleX(0); 
  transform-origin: left;
  transition: transform 0.4s ease-in-out; 
}

.mega-cat-link:hover, .mega-cat-link.active-cat { color: #9f273b !important; }
.mega-cat-link:hover::after, .mega-cat-link.active-cat::after { transform: scaleX(1); }

.mega-product-card { position: relative; padding-bottom: 8px; cursor: pointer; }
.mega-product-card::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 1.5px; background-color: #9f273b; transform: scaleX(0); transform-origin: left; transition: transform 0.4s ease-in-out; }
.mega-product-card:hover::after { transform: scaleX(1); }
.mega-product-card:hover h6 { color: #9f273b; }

.mega-img-wrap { aspect-ratio: 1; overflow: hidden; }
.mega-img-wrap img { transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.mega-product-card:hover .mega-img-wrap img { transform: scale(1.08); }

.search-results-dropdown,
.user-dropdown { border-color: #eee !important; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08) !important; }

.dropdown-item { font-size: 0.9rem; transition: background 0.2s; color: #333; }
.dropdown-item:hover { background-color: #f8f9fa; color: #9f273b; }

.z-index-max { z-index: 9999; }

/* CSS OFFCANVAS MOBILE MENU */
.mobile-menu-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1060; display: flex; }
.mobile-backdrop { position: absolute; inset: 0; background-color: rgba(0, 0, 0, 0.6); backdrop-filter: blur(3px); cursor: pointer; }
.mobile-sidebar { position: relative; width: 85%; max-width: 320px; height: 100%; box-shadow: 2px 0 20px rgba(0,0,0,0.15); }
.mobile-nav-link { display: block; color: #333; text-decoration: none; padding: 14px 15px; border-radius: 8px; transition: all 0.2s ease; font-size: 0.95rem; }
.mobile-nav-link:hover, .mobile-nav-link:active { background-color: rgba(159, 39, 59, 0.08); color: #9f273b; }
.mobile-nav-link:hover i { color: #9f273b !important; }

.mega-fade-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.mega-fade-leave-active { transition: opacity 0.15s ease; }
.mega-fade-enter-from { opacity: 0; transform: translateY(15px); }
.mega-fade-leave-to { opacity: 0; }

.slide-left-enter-active, .slide-left-leave-active { transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); }
.slide-left-enter-from, .slide-left-leave-to { transform: translateX(-100%); }
.slide-left-enter-active .mobile-backdrop, .slide-left-leave-active .mobile-backdrop { transition: opacity 0.4s ease; }
.slide-left-enter-from .mobile-backdrop, .slide-left-leave-to .mobile-backdrop { opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>