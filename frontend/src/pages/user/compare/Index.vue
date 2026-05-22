<template>
  <div class="compare-page-wrapper">
    <div class="container">
      <div class="breadcrumb mb-4">
        <span @click="router.push('/')">Trang chủ</span> <span class="separator">/</span>
        <span @click="router.push(`/shop/${shopSlug}`)">Sản phẩm</span> <span class="separator">/</span>
        <span class="current">So sánh sản phẩm</span>
      </div>

      <!-- HEADER MỚI: QUAY LẠI VÀ CHỈ BÁO SP GỐC -->
      <div class="compare-header mb-4 pb-3 border-bottom">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div class="header-left">
            <h1 class="page-title mb-2">So sánh sản phẩm</h1>
            <!-- Hiển thị tên sản phẩm gốc -->
            <p v-if="baseProductName" class="text-muted mb-0" style="font-size: 15px;">
              Bạn đang so sánh với sản phẩm: <strong style="color: rgb(159,39,59);">{{ baseProductName }}</strong>
            </p>
          </div>
          
          <div class="header-right">
            <!-- Nút Quay lại sản phẩm -->
            <button class="btn-outline" @click="goBackToBaseProduct">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2" style="vertical-align: middle; margin-top: -2px;">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Quay lại sản phẩm
            </button>

            <label class="diff-toggle ms-md-3">
              <input type="checkbox" v-model="showDiffOnly">
              <span>Chỉ hiển thị điểm khác biệt</span>
            </label>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu so sánh...</p>
      </div>

      <div v-else-if="products.length === 0" class="empty-state">
        <p>Chưa có sản phẩm nào để so sánh.</p>
        <button class="btn-primary-outline" @click="router.push(`/shop/${shopSlug}`)">Tiếp tục mua sắm</button>
      </div>

      <div v-else class="table-responsive">
        <table class="compare-table hover-column-table">
          <!-- HÀNG 1: THÔNG TIN CƠ BẢN VÀ ACTION -->
          <thead>
            <tr>
              <th class="criteria-col empty-th"></th>
              <th v-for="(product, index) in products" :key="product.id" class="product-col" :class="{'best-choice': isBestPrice(product.promotional_price || product.base_price)}">
                <div class="product-card-top">
                  <button class="btn-remove" @click="removeProduct(product.id)" title="Xóa khỏi so sánh">✕</button>
                  <img :src="product.thumbnail_image || 'https://via.placeholder.com/150'" :alt="product.name" class="p-img">
                  <h3 class="p-name" @click="goToDetail(product.slug)" :title="product.name">{{ product.name }}</h3>
                  
                  <!-- Tag Sản phẩm gốc được gán tự động vào cột đầu tiên (hoặc trùng với spGoc id) -->
                  <div v-if="product.id == spGoc || (index === 0 && !spGoc && products.length > 1)" class="base-product-badge">
                    Sản phẩm gốc
                  </div>

                  <button class="btn-buy mt-3" @click="goToDetail(product.slug)">XEM CHI TIẾT</button>
                </div>
              </th>
              <!-- Ô thêm sản phẩm (ĐÃ SỬA @CLICK ĐỂ MỞ POPUP) -->
              <th v-if="products.length < 4" class="add-more-col">
                <div class="add-more-box" @click="openComparePopup">
                  <div class="plus-icon">+</div>
                  <p>Thêm sản phẩm</p>
                </div>
              </th>
            </tr>
          </thead>

          <!-- BODY: CÁC TIÊU CHÍ SO SÁNH (Hover cột hoạt động ở đây) -->
          <tbody>
            
            <!-- 1. MỨC GIÁ VÀ CHÊNH LỆCH -->
            <tr v-show="!showDiffOnly || hasDifference('price')">
              <td class="criteria-name">Mức giá</td>
              <td v-for="(product, index) in products" :key="'price-'+product.id" class="val-cell" :class="{'highlight-diff': showDiffOnly && hasDifference('price')}">
                <div class="price-wrap" :class="{'text-success fw-bold': isBestPrice(product.promotional_price || product.base_price)}">
                  {{ formatMoney(product.promotional_price || product.base_price) }}
                </div>
                
                <!-- Text giải thích chênh lệch giá (So với sản phẩm cột 1) -->
                <div v-if="index > 0" class="diff-text mt-1" :class="getPriceDiffColor(product, products[0])">
                  <span v-if="getPriceDiff(product, products[0])">
                    {{ getPriceDiff(product, products[0]) }}
                  </span>
                  <span v-else class="text-muted fst-italic">Bằng giá</span>
                </div>
              </td>
              <td v-if="products.length < 4"></td>
            </tr>

            <!-- 2. TÌNH TRẠNG TỒN KHO -->
            <tr v-show="!showDiffOnly || hasDifference('stock_quantity')">
              <td class="criteria-name">Tồn kho</td>
              <td v-for="(product, index) in products" :key="'stock-'+product.id" class="val-cell" :class="{'highlight-diff': showDiffOnly && hasDifference('stock_quantity')}">
                <div :class="product.stock_quantity > 0 ? 'text-dark' : 'text-danger'">
                  {{ product.stock_quantity > 0 ? `Còn hàng (${product.stock_quantity})` : 'Hết hàng' }}
                </div>
                
                <!-- Text chênh lệch số lượng -->
                <div v-if="index > 0" class="diff-text text-muted mt-1 fst-italic">
                  {{ getStockDiff(product, products[0]) }}
                </div>
              </td>
              <td v-if="products.length < 4"></td>
            </tr>

            <!-- 3. THƯƠNG HIỆU -->
            <tr v-show="!showDiffOnly || hasDifference('brand_name')">
              <td class="criteria-name">Thương hiệu</td>
              <td v-for="product in products" :key="'brand-'+product.id" class="val-cell" :class="{'highlight-diff': showDiffOnly && hasDifference('brand_name')}">
                {{ product.brand_name || 'Không có' }}
              </td>
              <td v-if="products.length < 4"></td>
            </tr>

            <!-- 4. DANH MỤC -->
            <tr v-show="!showDiffOnly || hasDifference('category_name')">
              <td class="criteria-name">Danh mục</td>
              <td v-for="product in products" :key="'cat-'+product.id" class="val-cell" :class="{'highlight-diff': showDiffOnly && hasDifference('category_name')}">
                {{ product.category_name || 'Không có' }}
              </td>
              <td v-if="products.length < 4"></td>
            </tr>

            <!-- 5. CÁC THÔNG SỐ KỸ THUẬT -->
            <tr v-for="specKey in allSpecificationKeys" :key="specKey" v-show="!showDiffOnly || hasSpecDifference(specKey)">
              <td class="criteria-name text-capitalize">{{ specKey }}</td>
              <td v-for="(product, index) in products" :key="specKey+'-'+product.id" class="val-cell" :class="{'highlight-diff': showDiffOnly && hasSpecDifference(specKey)}">
                
                <div class="fw-medium">{{ getSpecValue(product, specKey) }}</div>
                
                <div v-if="index > 0" class="diff-text attr-diff mt-1">
                  {{ getSpecDiffText(product, products[0], specKey) }}
                </div>

              </td>
              <td v-if="products.length < 4"></td>
            </tr>

            <!-- 6. MÔ TẢ NGẮN -->
            <tr v-show="!showDiffOnly || hasDifference('description')">
              <td class="criteria-name">Mô tả</td>
              <td v-for="product in products" :key="'desc-'+product.id" class="desc-cell val-cell" :class="{'highlight-diff': showDiffOnly && hasDifference('description')}">
                <div v-html="truncateHtml(product.description, 100)"></div>
              </td>
              <td v-if="products.length < 4"></td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>

    <!-- BỔ SUNG: POPUP GỢI Ý CHỌN THÊM SẢN PHẨM SO SÁNH -->
    <transition name="fade">
      <div v-if="showComparePopup" class="compare-modal-overlay" @click.self="closeComparePopup">
        <div class="compare-modal">
          
          <div class="compare-modal-header">
            <h3>Chọn sản phẩm để so sánh ({{ products.length }}/4)</h3>
            <div class="header-search-wrap">
              <input 
                type="text" 
                v-model="searchQuery" 
                @input="handleSearchInput" 
                placeholder="Tìm tên sản phẩm..." 
                class="modal-search-input"
              >
              <button class="close-btn" @click="closeComparePopup">✕</button>
            </div>
          </div>

          <!-- TABS: Gợi ý & Yêu thích -->
          <div class="compare-modal-tabs">
            <button :class="{'active': comparePopupTab === 'suggestions'}" @click="comparePopupTab = 'suggestions'">
              Gợi ý thêm
            </button>
            <button :class="{'active': comparePopupTab === 'favourites'}" @click="fetchFavouritesForCompare">
              Sản phẩm đã yêu thích
            </button>
          </div>

          <div class="compare-modal-body">
            
            <!-- TAB 1: GỢI Ý -->
            <div v-if="comparePopupTab === 'suggestions'">
              <p class="compare-modal-subtitle">Các sản phẩm mới nhất cùng danh mục:</p>
              
              <div v-if="isLoadingCompareSuggestions" class="rec-loading">
                <div class="spinner small-spinner"></div>
              </div>

              <div v-else-if="filteredSuggestions.length === 0" class="empty-msg">
                <p>Không tìm thấy sản phẩm nào khớp với tìm kiếm của bạn.</p>
              </div>

              <div v-else class="compare-suggestions-grid">
                <div v-for="item in filteredSuggestions" :key="item.id" class="suggestion-card">
                  <img :src="getImageUrl(item.thumbnail_image)" :alt="item.name" class="suggestion-img">
                  <div class="suggestion-info">
                    <h4 class="suggestion-name" :title="item.name">{{ item.name }}</h4>
                    <p class="suggestion-price">{{ formatMoney(item.promotional_price || item.base_price) }}</p>
                  </div>
                  <button 
                    class="btn-add-suggestion"
                    :class="{ 'is-added': isInCompare(item.id) }"
                    @click="toggleCompare(item)"
                  >
                    {{ isInCompare(item.id) ? 'Đã thêm ✓' : '+ So sánh' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- TAB 2: YÊU THÍCH -->
            <div v-if="comparePopupTab === 'favourites'">
              <p class="compare-modal-subtitle">Chọn từ danh sách yêu thích của bạn:</p>
              
              <div v-if="!isLoggedIn" class="not-logged-in-msg">
                <p>Vui lòng đăng nhập để xem danh sách yêu thích.</p>
              </div>
              <div v-else-if="isLoadingFavourites" class="rec-loading">
                <div class="spinner small-spinner"></div>
              </div>
              <div v-else-if="filteredFavourites.length === 0" class="empty-msg">
                <p v-if="searchQuery">Không có sản phẩm yêu thích nào khớp với "{{ searchQuery }}".</p>
                <p v-else>Bạn chưa có sản phẩm yêu thích nào.</p>
              </div>
              <div v-else class="compare-suggestions-grid">
                <div v-for="item in filteredFavourites" :key="item.id" class="suggestion-card">
                  <img :src="getImageUrl(item.thumbnail_image)" :alt="item.name" class="suggestion-img">
                  <div class="suggestion-info">
                    <h4 class="suggestion-name" :title="item.name">{{ item.name }}</h4>
                    <p class="suggestion-price">{{ formatMoney(item.promotional_price || item.base_price) }}</p>
                  </div>
                  <button 
                    class="btn-add-suggestion"
                    :class="{ 'is-added': isInCompare(item.id) }"
                    @click="toggleCompare(item)"
                  >
                    {{ isInCompare(item.id) ? 'Đã thêm ✓' : '+ So sánh' }}
                  </button>
                </div>
              </div>
            </div>

          </div>
          <div class="compare-modal-footer">
            <button class="btn-primary" @click="closeComparePopup">
              Hoàn tất
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';
import Toast from '@/utils/toastConfig';

const route = useRoute();
const router = useRouter();
const shopSlug = route.params.shop_slug || 'aurora';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const products = ref([]);
const isLoading = ref(true);
const showDiffOnly = ref(false);

// ==========================================
// THÊM: STATE CHO POPUP SO SÁNH
// ==========================================
const showComparePopup = ref(false);
const compareSuggestions = ref([]);
const isLoadingCompareSuggestions = ref(false);
const comparePopupTab = ref('suggestions');
const favouriteProducts = ref([]);
const isLoadingFavourites = ref(false);
const isLoggedIn = computed(() => !!localStorage.getItem('auth_token'));
const searchQuery = ref('');
let searchTimeout = null;

// Thay vì dùng ref, dùng computed để theo dõi query param theo thời gian thực an toàn hơn
const spGoc = computed(() => route.query.spGoc || null);

// Computed lấy tên sản phẩm gốc đang được so sánh
const baseProductName = computed(() => {
  if (!spGoc.value || products.value.length === 0) return null;
  const baseProd = products.value.find(p => p.id == spGoc.value);
  return baseProd ? baseProd.name : null;
});

// Hàm quay lại: Trả về chi tiết spGoc hoặc danh sách chung
const goBackToBaseProduct = () => {
  if (spGoc.value) {
      const baseProd = products.value.find(p => p.id == spGoc.value);
      if (baseProd && baseProd.slug) {
          const detailUrl = `/shop/${shopSlug}/product/${baseProd.slug}`;
          router.push(detailUrl).catch((err) => {
              window.location.href = detailUrl;
          });
          return;
      }
  }
  const shopUrl = `/shop/${shopSlug}`;
  router.push(shopUrl).catch(() => {
      window.location.href = shopUrl;
  });
};

const loadCompareData = async (isBackgroundRefresh = false) => {
  try {
    const stored = localStorage.getItem(`compare_list_${shopSlug}`);
    if (!stored) {
      if(!isBackgroundRefresh) isLoading.value = false;
      return;
    }

    const compareList = JSON.parse(stored);
    const ids = compareList.map(p => p.id);

    if (ids.length === 0) {
      products.value = [];
      if(!isBackgroundRefresh) isLoading.value = false;
      return;
    }

    if(!isBackgroundRefresh) isLoading.value = true;

    const response = await axios.post(`${API_BASE_URL}/shop/${shopSlug}/compare`, {
      product_ids: ids
    });

    if (response.data.success) {
      let fetchedProducts = response.data.data;
      
      // Sắp xếp đưa Sản phẩm gốc (spGoc) lên đầu tiên (vị trí index 0)
      if (spGoc.value) {
          fetchedProducts.sort((a, b) => {
              if (a.id == spGoc.value) return -1;
              if (b.id == spGoc.value) return 1;
              return 0;
          });
      }
      
      products.value = fetchedProducts;
    }

  } catch (error) {
    console.error("Lỗi khi tải dữ liệu so sánh", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadCompareData();
});

// ==========================================
// LOGIC: POPUP CHỌN SẢN PHẨM SO SÁNH
// ==========================================
const getImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/150?text=No+Image';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${API_BASE_URL}/storage/${path}`;
};

const openComparePopup = async () => {
  showComparePopup.value = true;
  comparePopupTab.value = 'suggestions';
  searchQuery.value = '';

  if (compareSuggestions.value.length === 0) {
    await fetchCompareSuggestions();
  }
};

const closeComparePopup = () => {
  showComparePopup.value = false;
};

// Computed Lọc tìm kiếm
const filteredSuggestions = computed(() => {
  if (!searchQuery.value) return compareSuggestions.value;
  const lowerQ = searchQuery.value.toLowerCase();
  return compareSuggestions.value.filter(p => p.name.toLowerCase().includes(lowerQ));
});

const filteredFavourites = computed(() => {
  if (!searchQuery.value) return favouriteProducts.value;
  const lowerQ = searchQuery.value.toLowerCase();
  return favouriteProducts.value.filter(p => p.name.toLowerCase().includes(lowerQ));
});

// API Gọi danh sách gợi ý
const fetchCompareSuggestions = async (query = '') => {
  isLoadingCompareSuggestions.value = true;
  try {
    let url = new URL(`${API_BASE_URL}/shop/${shopSlug}/products`);
    url.searchParams.append('per_page', query ? '20' : '10');
    url.searchParams.append('sort', 'new'); 
    
    // Gửi tham số keyword cho backend
    if (query) {
      url.searchParams.append('keyword', query);
    }

    const response = await fetch(url.toString());
    const result = await response.json();
    
    if (result.success && result.data?.data) {
      compareSuggestions.value = result.data.data;
    }
  } catch (error) {
    console.error("Lỗi tải sản phẩm gợi ý:", error);
  } finally {
    isLoadingCompareSuggestions.value = false;
  }
};

const handleSearchInput = () => {
  if (comparePopupTab.value === 'suggestions') {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      fetchCompareSuggestions(searchQuery.value);
    }, 500);
  }
};

const fetchFavouritesForCompare = async () => {
  comparePopupTab.value = 'favourites';
  
  if(!isLoggedIn.value || favouriteProducts.value.length > 0) return;

  isLoadingFavourites.value = true;
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/client/favourites`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const result = await response.json();
    if (result.status && result.data) {
      favouriteProducts.value = result.data.map(item => item.product).filter(p => p !== null);
    }
  } catch (error) {
    console.error("Lỗi lấy danh sách yêu thích:", error);
  } finally {
    isLoadingFavourites.value = false;
  }
};

// Kiểm tra xem sản phẩm đã có trong bảng so sánh chưa
const isInCompare = (id) => {
  return products.value.some(p => p.id === id);
};

// Nút Thêm/Xóa trong Popup
const toggleCompare = (item) => {
  const stored = JSON.parse(localStorage.getItem(`compare_list_${shopSlug}`) || '[]');
  
  if (isInCompare(item.id)) {
    // Đang có => Xóa
    removeProduct(item.id);
  } else {
    // Chưa có => Thêm
    if (stored.length >= 4) {
      Toast.fire({ icon: 'warning', title: 'Chỉ được so sánh tối đa 4 sản phẩm' });
      return;
    }
    stored.push({ id: item.id, name: item.name, image: item.thumbnail_image });
    localStorage.setItem(`compare_list_${shopSlug}`, JSON.stringify(stored));
    Toast.fire({ icon: 'success', title: 'Đã thêm vào danh sách so sánh' });
    
    // Refresh ngầm dữ liệu để update bảng mà không bị chớp màn hình loading
    loadCompareData(true);
  }
};

const removeProduct = (id) => {
  // Update UI Local trước cho nhanh
  products.value = products.value.filter(p => p.id !== id);
  
  // Update LocalStorage
  const stored = JSON.parse(localStorage.getItem(`compare_list_${shopSlug}`) || '[]');
  const updatedList = stored.filter(p => p.id !== id);
  localStorage.setItem(`compare_list_${shopSlug}`, JSON.stringify(updatedList));
};

// ==========================================
// LOGIC: TRÍCH XUẤT THÔNG SỐ (SPECIFICATIONS)
// ==========================================
const allSpecificationKeys = computed(() => {
  const keys = new Set();
  products.value.forEach(p => {
    if (p.specifications && typeof p.specifications === 'object') {
      Object.keys(p.specifications).forEach(k => keys.add(k));
    }
  });
  return Array.from(keys);
});

const getSpecValue = (product, key) => {
  if (!product.specifications || !product.specifications[key]) return '-';
  return product.specifications[key];
};

// ==========================================
// LOGIC: KIỂM TRA KHÁC BIỆT ĐỂ ẨN/HIỆN HÀNG
// ==========================================
const hasDifference = (key) => {
  if (products.value.length <= 1) return false;
  const firstVal = key === 'price' 
      ? (products.value[0].promotional_price || products.value[0].base_price) 
      : products.value[0][key];

  return products.value.some(p => {
    const val = key === 'price' ? (p.promotional_price || p.base_price) : p[key];
    return val !== firstVal;
  });
};

const hasSpecDifference = (specKey) => {
  if (products.value.length <= 1) return false;
  const firstVal = getSpecValue(products.value[0], specKey);
  return products.value.some(p => getSpecValue(p, specKey) !== firstVal);
};

// ==========================================
// LOGIC: TEXT GIẢI THÍCH CHI TIẾT CHÊNH LỆCH
// ==========================================
const getPriceDiff = (current, base) => {
  if (!base || current.id === base.id) return null;
  const pCurrent = parseFloat(current.promotional_price || current.base_price);
  const pBase = parseFloat(base.promotional_price || base.base_price);
  const diff = pCurrent - pBase;

  if (diff === 0) return null;
  
  const diffFormatted = new Intl.NumberFormat('vi-VN').format(Math.abs(diff)) + 'đ';
  
  if (diff > 2000000) return `Đắt hơn rất nhiều (+ ${diffFormatted})`;
  if (diff < -2000000) return `Rẻ hơn cực nhiều (- ${diffFormatted})`;
  
  return diff > 0 ? `Đắt hơn ${diffFormatted}` : `Rẻ hơn ${diffFormatted}`;
};

const getPriceDiffColor = (current, base) => {
  if (!base || current.id === base.id) return '';
  const pCurrent = parseFloat(current.promotional_price || current.base_price);
  const pBase = parseFloat(base.promotional_price || base.base_price);
  return pCurrent > pBase ? 'text-danger' : (pCurrent < pBase ? 'text-success' : '');
};

const getStockDiff = (current, base) => {
  if (!base || current.id === base.id) return null;
  const sCurrent = current.stock_quantity || 0;
  const sBase = base.stock_quantity || 0;
  const diff = sCurrent - sBase;

  if (diff === 0) return null;
  return diff > 0 ? `(Nhiều hơn ${diff} sản phẩm)` : `(Ít hơn ${Math.abs(diff)} sản phẩm)`;
};

const getSpecDiffText = (current, base, specKey) => {
  if (!base || current.id === base.id) return null;
  const vCurrent = getSpecValue(current, specKey);
  const vBase = getSpecValue(base, specKey);

  if (vCurrent !== vBase && vCurrent !== '-' && vBase !== '-') {
    return `Khác: ${vCurrent} vs ${vBase}`;
  }
  return null;
};

// ==========================================
// UTILITIES CƠ BẢN
// ==========================================
const isBestPrice = (price) => {
  if (products.value.length <= 1 || !price) return false;
  const prices = products.value.map(p => parseFloat(p.promotional_price || p.base_price)).filter(p => !isNaN(p));
  const minPrice = Math.min(...prices);
  return parseFloat(price) === minPrice;
};

const goToDetail = (slug) => router.push(`/shop/${shopSlug}/product/${slug}`);
const formatMoney = (amount) => amount ? new Intl.NumberFormat('vi-VN').format(amount) + ' ₫' : '0 ₫';
const truncateHtml = (html, length) => {
  if (!html) return '';
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  const text = tmp.textContent || tmp.innerText || "";
  return text.length > length ? text.substring(0, length) + "..." : text;
};
</script>

<style scoped>
.compare-page-wrapper {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 40px 0;
}

.container {
  max-width: 1300px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.breadcrumb { font-size: 14px; color: #888; cursor: pointer; }
.breadcrumb .separator { margin: 0 10px; }
.breadcrumb .current { color: #333; pointer-events: none;}

.compare-header {
  border-bottom: 1px solid #eee;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.page-title { font-size: 24px; font-weight: 600; color: #333; }

.diff-toggle {
  display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; color: #555;
}

.table-responsive { overflow-x: auto; padding-bottom: 20px; }

/* Nút quay lại */
.btn-outline {
  background: transparent;
  border: 1px solid #ccc;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  color: #555;
  font-weight: 600;
  transition: background 0.2s, border-color 0.2s;
  display: flex;
  align-items: center;
}
.btn-outline:hover {
  background: #f9f9f9;
  border-color: #999;
}
.me-2 { margin-right: 8px; }

/* ==========================================
   CSS TRICK: HIỆU ỨNG HOVER CẢ CỘT
========================================== */
.hover-column-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  min-width: 900px;
  overflow: hidden; 
}

.hover-column-table td, .hover-column-table th {
  position: relative; 
  z-index: 1;
  padding: 20px 15px;
  border-bottom: 1px solid #eee;
}

.hover-column-table .product-col:hover::after,
.hover-column-table .val-cell:hover::after {
  content: "";
  position: absolute;
  background-color: rgba(159, 39, 59, 0.04);
  left: 0;
  top: -5000px;
  height: 10000px; 
  width: 100%;
  z-index: -1;
  pointer-events: none;
}

/* Cột Layout */
.criteria-col { width: 15%; background: #fdfdfd; border-right: 1px solid #eee; }
.product-col { width: 21.25%; border-right: 1px solid #eee; vertical-align: top;}
.add-more-col { width: 21.25%; vertical-align: top; padding: 20px;}

/* Header Sản Phẩm */
.product-card-top {
  position: relative;
  text-align: center;
}

.btn-remove {
  position: absolute; top: -10px; right: 0; background: #eee; border: none; width: 26px; height: 26px; border-radius: 50%; cursor: pointer; color: #555; display: flex; align-items: center; justify-content: center; z-index: 10;
}
.btn-remove:hover { background: #E74C3C; color: white; }

.p-img { width: 140px; height: 140px; object-fit: cover; margin-bottom: 15px; border-radius: 8px; background: #fafafa;}
.p-name { font-size: 15px; font-weight: 500; color: #333; cursor: pointer; margin-bottom: 10px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 42px;}
.p-name:hover { color: rgb(159,39,59); }

.base-product-badge {
  display: inline-block; padding: 3px 8px; background: #f1f1f1; border-radius: 4px; font-size: 11px; color: #555; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
}

.btn-buy {
  width: 100%; padding: 10px; background: transparent; color: rgb(159,39,59); border: 1px solid rgb(159,39,59); border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.3s;
}
.btn-buy:hover { background: rgb(159,39,59); color: #fff;}

.add-more-box {
  height: 100%; min-height: 250px; border: 2px dashed #ddd; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; color: #888; transition: all 0.3s;
}
.add-more-box:hover { border-color: rgb(159,39,59); color: rgb(159,39,59); background: #fffcfc;}
.plus-icon { font-size: 40px; margin-bottom: 10px; }

/* Table Body Text */
.criteria-name {
  font-weight: 600; color: #555; background: #fafafa; font-size: 14px;
}
.val-cell { text-align: center; vertical-align: middle;}
.price-wrap { font-size: 16px; font-weight: 600; color: #333; }
.desc-cell { font-size: 13px; color: #666; line-height: 1.6; text-align: left;}

/* Difference Text & Highlights */
.diff-text { font-size: 12px; font-weight: 600; }
.attr-diff { color: rgb(159,39,59); font-style: italic;}
.highlight-diff { background-color: #fdfaf5; transition: background 0.3s; }

/* Utilities */
.text-success { color: #28a745 !important; }
.text-danger { color: #dc3545 !important; }
.text-muted { color: #888 !important;}
.fw-bold { font-weight: 700 !important; }
.fw-medium { font-weight: 500 !important; }
.fst-italic { font-style: italic !important; }
.mt-1 { margin-top: 0.25rem; }
.mt-3 { margin-top: 1rem; }

/* Loading state */
.loading-state, .empty-state { text-align: center; padding: 50px 0; color: #666;}
.spinner { width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid rgb(159,39,59); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.small-spinner { width: 30px; height: 30px; border-width: 2px; }
.btn-primary-outline { background: transparent; border: 1px solid rgb(159,39,59); color: rgb(159,39,59); padding: 10px 24px; border-radius: 6px; cursor: pointer; margin-top: 15px;}

@media (min-width: 768px) {
  .ms-md-3 { margin-left: 1rem; }
}

/* ==========================================
   CSS POPUP CHỌN SẢN PHẨM SO SÁNH
========================================== */
.compare-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); }
.compare-modal { background: #fff; border-radius: 12px; width: 90%; max-width: 800px; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }

.compare-modal-header { padding: 20px 25px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; gap: 15px; flex-wrap: wrap; }
.compare-modal-header h3 { font-size: 18px; margin: 0; color: #222; font-weight: 600; white-space: nowrap;}
.header-search-wrap { display: flex; align-items: center; gap: 15px; flex: 1; justify-content: flex-end; }
.modal-search-input { padding: 8px 16px; border: 1px solid #ddd; border-radius: 20px; outline: none; font-size: 13px; width: 100%; max-width: 250px; transition: border-color 0.3s, box-shadow 0.3s; }
.modal-search-input:focus { border-color: rgb(159,39,59); box-shadow: 0 0 5px rgba(159,39,59,0.2); }

.close-btn { background: transparent; border: none; font-size: 20px; cursor: pointer; color: #888; transition: color 0.2s;}
.close-btn:hover { color: rgb(159,39,59); }
.compare-modal-body { padding: 20px 25px; overflow-y: auto; flex: 1; }
.compare-modal-subtitle { font-size: 14px; color: #666; margin-bottom: 20px; }

.compare-suggestions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; }
.suggestion-card { border: 1px solid #eee; border-radius: 8px; padding: 10px; text-align: center; display: flex; flex-direction: column; transition: transform 0.2s, border-color 0.2s; }
.suggestion-card:hover { border-color: rgb(159,39,59); transform: translateY(-3px); }
.suggestion-img { width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 6px; margin-bottom: 10px; background: #f9f9f9;}
.suggestion-info { flex: 1; display: flex; flex-direction: column; justify-content: flex-start; }
.suggestion-name { font-size: 13px; font-weight: 500; margin-bottom: 5px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: #333; line-height: 1.4;}
.suggestion-price { font-size: 14px; font-weight: 600; color: rgb(159,39,59); margin-bottom: 10px; }
.btn-add-suggestion { background: transparent; border: 1px solid rgb(159,39,59); color: rgb(159,39,59); padding: 6px; border-radius: 4px; font-size: 12px; cursor: pointer; font-weight: 600; transition: all 0.2s; width: 100%; }
.btn-add-suggestion:hover { background: rgb(159,39,59); color: #fff; }
.btn-add-suggestion.is-added { background: rgb(159,39,59); color: #fff; }

.compare-modal-footer { padding: 15px 25px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 15px; background: #fdfdfd; border-radius: 0 0 12px 12px; }
.btn-primary { background: rgb(159,39,59); border: none; padding: 10px 24px; border-radius: 6px; cursor: pointer; color: #fff; font-weight: 600; transition: opacity 0.2s; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.compare-modal-tabs {
    display: flex;
    border-bottom: 1px solid #eee;
    background: #fafafa;
}
.compare-modal-tabs button {
    flex: 1;
    padding: 12px 15px;
    background: transparent;
    border: none;
    font-size: 14px;
    font-weight: 600;
    color: #666;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.3s;
}
.compare-modal-tabs button.active {
    color: rgb(159,39,59);
    border-bottom-color: rgb(159,39,59);
    background: #fff;
}
.compare-modal-tabs button:hover:not(.active) {
    background: #f0f0f0;
}
.not-logged-in-msg, .empty-msg {
    text-align: center;
    padding: 40px 20px;
    color: #888;
    font-style: italic;
}
.rec-loading { min-height: 200px; display: flex; align-items: center; justify-content: center; }

@media (max-width: 600px) {
  .compare-modal-header { flex-direction: column; align-items: flex-start; }
  .header-search-wrap { width: 100%; justify-content: space-between; }
  .modal-search-input { max-width: none; flex: 1; margin-right: 15px;}
}
</style>