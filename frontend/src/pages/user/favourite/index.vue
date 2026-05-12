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
        <h4 class="text-danger-custom mb-3">Bạn chưa đăng nhập!</h4>
        <p class="text-secondary mb-4">Vui lòng đăng nhập để xem tủ đồ cá nhân và thêm các sản phẩm yêu thích.</p>
        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <router-link to="/shop/sora" class="btn btn-outline-secondary px-5 py-2 text-uppercase tracking-wide" style="font-size: 0.9rem;">Về Cửa Hàng</router-link>
          <router-link to="/login" class="btn btn-main px-5 py-2 text-uppercase tracking-wide" style="font-size: 0.9rem;">Đăng nhập ngay</router-link>
        </div>
      </div>

      <!-- PHẦN 1: DANH SÁCH SẢN PHẨM YÊU THÍCH -->
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
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h4 class="h4 font-serif text-dark mb-3">Danh sách yêu thích trống</h4>
          <p class="text-secondary fw-light mb-4">Hãy thả tim các sản phẩm bên dưới để thêm vào bộ sưu tập của bạn.</p>
          <router-link to="/shop" class="btn btn-main px-5 py-2 text-uppercase tracking-wide d-inline-flex align-items-center" style="font-size: 0.9rem;">
            <i class="bi bi-shop me-2"></i> Khám Phá Cửa Hàng
          </router-link>
        </div>

        <!-- Lưới sản phẩm -->
        <div v-else class="row g-4">
          <div v-for="item in favorites" :key="'fav-'+item.id" class="col-6 col-md-4 col-lg-3">
            <div class="card h-100 border-0 rounded-0 shadow-sm product-card position-relative bg-white" v-if="item.product">
              
              <button @click="toggleFavorite(item.product.id)" class="btn-toggle-fav position-absolute top-0 end-0 m-2 z-2 bg-white border-0 shadow-sm rounded-circle d-flex align-items-center justify-content-center" title="Bỏ yêu thích" :disabled="isToggling === item.product.id">
                <span v-if="isToggling === item.product.id" class="spinner-border spinner-border-sm text-danger-custom" role="status"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="text-danger-custom" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>

              <router-link :to="`/shop/sora/product/${item.product.slug}`" class="img-zoom-wrapper position-relative bg-light d-block text-decoration-none">
                <img :src="getImageUrl(item.product.thumbnail_image)" :alt="item.product.name" class="w-100 h-100 object-fit-cover" style="aspect-ratio: 1/1;" />
              </router-link>

              <div class="card-body text-center d-flex flex-column p-3">
                <router-link :to="`/shop/sora/product/${item.product.slug}`" class="text-decoration-none product-title-link">
                  <h5 class="product-title font-serif text-dark mb-2 text-truncate" :title="item.product.name">{{ item.product.name }}</h5>
                </router-link>
                <p class="text-main fw-medium mb-3 mt-auto">
                  <span v-if="item.product.promotional_price && item.product.promotional_price > 0">{{ formatPrice(item.product.promotional_price) }}</span>
                  <span v-else>{{ formatPrice(item.product.base_price) }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PHẦN 2: DANH SÁCH KHÁM PHÁ (TEST DATA) -->
      <div class="pt-4 border-top">
        <div class="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h3 class="font-serif text-dark mb-1">Gợi Ý Khám Phá</h3>
            <p class="text-secondary fw-light mb-0">Các sản phẩm thực tế từ Database để bạn test thả tim.</p>
          </div>
          <router-link to="/shop" class="text-decoration-none text-main fw-medium font-serif hover-underline d-none d-md-block">
            Xem tất cả sản phẩm <i class="bi bi-arrow-right ms-1"></i>
          </router-link>
        </div>

        <div class="row g-4">
          <div v-for="product in allProducts" :key="'prod-'+product.id" class="col-6 col-md-4 col-lg-3">
            <div class="card h-100 border-0 rounded-0 shadow-sm product-card position-relative bg-white">
              
              <button @click="toggleFavorite(product.id)" class="btn-toggle-fav position-absolute top-0 end-0 m-2 z-2 bg-white border-0 shadow-sm rounded-circle d-flex align-items-center justify-content-center" :title="checkIsFavourited(product.id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'" :disabled="isToggling === product.id">
                
                <span v-if="isToggling === product.id" class="spinner-border spinner-border-sm text-danger-custom" role="status"></span>
                
                <svg v-else-if="checkIsFavourited(product.id)" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="text-danger-custom" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>

                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" class="text-muted hover-danger" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              <router-link :to="`/shop/sora/product/${product.slug}`" class="img-zoom-wrapper position-relative bg-light d-block text-decoration-none">
                <img :src="getImageUrl(product.thumbnail_image)" :alt="product.name" class="w-100 h-100 object-fit-cover" style="aspect-ratio: 1/1;" />
              </router-link>

              <div class="card-body text-center d-flex flex-column p-3">
                <router-link :to="`/shop/sora/product/${product.slug}`" class="text-decoration-none product-title-link">
                  <h5 class="product-title font-serif text-dark mb-2 text-truncate" :title="product.name">{{ product.name }}</h5>
                </router-link>
                <p class="text-main fw-medium mb-0 mt-auto">
                   <span v-if="product.promotional_price && product.promotional_price > 0">{{ formatPrice(product.promotional_price) }}</span>
                   <span v-else>{{ formatPrice(product.base_price) }}</span>
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- UI THÔNG BÁO (TOAST NOTIFICATION) GÓC DƯỚI BÊN PHẢI -->
    <transition name="toast-slide">
      <div v-if="toast" class="custom-toast position-fixed bottom-0 end-0 m-4 p-3 shadow-lg d-flex align-items-center bg-white border-start border-4" 
           :class="toast.type === 'added' ? 'border-success' : 'border-danger'" 
           style="z-index: 9999; min-width: 320px; border-radius: 6px;">
        
        <!-- Icon dựa trên trạng thái (Thêm / Xóa) -->
        <div class="me-3 d-flex align-items-center justify-content-center">
          <svg v-if="toast.type === 'added'" xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#198754" viewBox="0 0 24 24">
             <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="#dc3545" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <div class="flex-grow-1">
          <h6 class="mb-1 font-serif fw-bold" :class="toast.type === 'added' ? 'text-success' : 'text-danger'">
            {{ toast.type === 'added' ? 'Thành Công!' : 'Đã Gỡ Bỏ!' }}
          </h6>
          <p class="mb-0 text-secondary small fw-light">{{ toast.message }}</p>
        </div>
        
        <button type="button" class="btn-close ms-2" @click="toast = null" style="font-size: 0.8rem;"></button>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// State dữ liệu
const favorites = ref([]);
const allProducts = ref([]);
const isLoading = ref(true);
const isToggling = ref(null);
const isLoggedIn = ref(false);

// State quản lý Toast Thông Báo
const toast = ref(null);

const showToast = (message, actionType) => {
  toast.value = { message: message, type: actionType };
  setTimeout(() => { toast.value = null; }, 3000);
};

const favApiUrl = `${API_URL}/client/favourites`; 
const shopApiUrl = `${API_URL}/shop/sora/products`;

const getToken = () => {
  const commonKeys = ['access_token', 'token', 'auth_token', 'userToken', 'user_token'];
  for (const k of commonKeys) {
    const val = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (val && val.length > 15) return val; 
  }
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      if (parsed && typeof parsed === 'object') {
        if (parsed.access_token) return parsed.access_token;
        if (parsed.token) return parsed.token;
        if (parsed.user && parsed.user.token) return parsed.user.token;
      }
    } catch(e) {}
  }
  return '';
};

const getImageUrl = (path) => {
  if (!path) return 'https://images.unsplash.com/photo-1599643478524-fb66f4568dbb?q=80&w=600&auto=format&fit=crop';
  if (path.startsWith('http')) return path;
  return `http://localhost:8000/storage/${path}`;
};

const fetchFavorites = async () => {
  if (!isLoggedIn.value) {
    isLoading.value = false;
    return;
  }
  try {
    const response = await axios.get(favApiUrl, {
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

const fetchAllProducts = async () => {
  try {
    const response = await axios.get(shopApiUrl, {
      headers: { Accept: 'application/json' }
    });
    if (response.data.success && response.data.data && response.data.data.data) {
        allProducts.value = response.data.data.data;
    } else if (response.data.data) {
        allProducts.value = response.data.data;
    }
  } catch (error) {}
};

const checkIsFavourited = (productId) => {
  return favorites.value.some(fav => fav.product_id === productId);
};

const toggleFavorite = async (productId) => {
  const currentToken = getToken();
  if (!currentToken) {
    alert("Hệ thống chưa tìm thấy Token đăng nhập! (Vui lòng đăng nhập lại)");
    isLoggedIn.value = false;
    return;
  }

  isToggling.value = productId;
  try {
    const response = await axios.post(`${favApiUrl}/toggle`, {
      product_id: productId
    }, {
      headers: { Authorization: `Bearer ${currentToken}`, Accept: 'application/json' }
    });

    if (response.data.status) {
      showToast(response.data.message, response.data.action);
      await fetchFavorites(); 
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
      isLoggedIn.value = false;
    } else {
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    }
  } finally {
    isToggling.value = null;
  }
};

const formatPrice = (price) => {
  if (!price) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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
  fetchAllProducts();
});
</script>

<style scoped>
/* Màu sắc thương hiệu SORA */
.bg-light-custom { background-color: #faf9f8 !important; }
.bg-main { background-color: #9f273b !important; }
.text-main { color: #9f273b !important; }
.bg-accent { background-color: #e7ce7d !important; }
.text-accent { color: #e7ce7d !important; }
.text-danger-custom { color: #cc1e2e !important; }

/* Font chữ */
.font-serif { font-family: "Playfair Display", "Merriweather", serif; }
.divider { width: 4rem; height: 2px; }
.object-fit-cover { object-fit: cover !important; }
.tracking-wide { letter-spacing: 0.1em; }

/* Nút Quay Lại */
.back-link { transition: all 0.3s ease; }
.back-link:hover { color: #9f273b !important; transform: translateX(-5px); }
.hover-underline:hover { text-decoration: underline !important; }

/* Product Card & Hover Effects */
.product-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-bottom: 2px solid transparent !important;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 .5rem 1.5rem rgba(0,0,0,.08)!important;
  border-bottom: 2px solid #e7ce7d !important;
}

/* Image Zoom */
.img-zoom-wrapper { overflow: hidden; display: block; }
.img-zoom-wrapper img { transition: transform 0.8s ease; }
.product-card:hover .img-zoom-wrapper img { transform: scale(1.08); }

/* Tiêu đề sản phẩm */
.product-title { font-size: 1.05rem; line-height: 1.4; height: 1.4rem; }
.product-title-link { transition: color 0.3s ease; }
.product-title-link:hover .product-title { color: #9f273b !important; }

/* Nút thả tim */
.btn-toggle-fav { width: 32px; height: 32px; opacity: 0.9; transition: all 0.2s ease; }
.btn-toggle-fav:hover { opacity: 1; background-color: #f8eaec !important; transform: scale(1.1); }
.hover-danger { transition: stroke 0.2s ease; }
.btn-toggle-fav:hover .hover-danger { stroke: #cc1e2e !important; }

/* Nút main */
.btn-main { background-color: #9f273b; color: white; border: 1px solid #9f273b; transition: all 0.3s ease; }
.btn-main:hover { background-color: #cc1e2e; color: white; }
.btn-outline-secondary:hover { background-color: #e9ecef; color: #2c2c2c; }

/* HIỆU ỨNG CHUYỂN ĐỘNG CHO TOAST */
.toast-slide-enter-active,
.toast-slide-leave-active { transition: all 0.4s ease; }
.toast-slide-enter-from,
.toast-slide-leave-to { opacity: 0; transform: translateX(100px); }
</style>