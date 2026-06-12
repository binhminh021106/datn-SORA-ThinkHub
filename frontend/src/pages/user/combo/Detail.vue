<template>
  <div class="combo-detail-page pb-5">
    
    <div v-if="isLoading" class="container pt-4 pb-5 fade-in">
      <SoraProductDetailSkeleton />
      <div class="mt-5 pt-4">
        <SoraProductGridSkeleton :count="4" min="220px" />
      </div>
    </div>

    <div v-else-if="!combo" class="vh-100 d-flex flex-column justify-content-center align-items-center text-center fade-in">
        <i class="bi bi-box2-heart fs-1 d-block mb-3 text-gold opacity-50"></i>
        <h5 class="font-serif text-muted mb-4">Gói ưu đãi này không tồn tại hoặc đã khép lại.</h5>
        <router-link :to="{ name: 'client-combos' }" class="btn luxury-btn-outline font-oswald px-4 py-2 tracking-widest text-uppercase">Quay lại Bộ sưu tập</router-link>
    </div>

    <div v-else class="fade-in">
      <div class="combo-breadcrumb-shell pt-4 pb-2">
        <div class="container">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0 font-oswald text-uppercase tracking-wide small" style="font-size: 0.75rem;">
              <li class="breadcrumb-item"><router-link to="/" class="text-muted text-decoration-none hover-primary">Trang chủ</router-link></li>
              <li class="breadcrumb-item"><router-link :to="{ name: 'client-combos' }" class="text-muted text-decoration-none hover-primary">Bộ sưu tập</router-link></li>
              <li class="breadcrumb-item active fw-bold text-sora-primary" aria-current="page">{{ combo.name }}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div class="container pt-4">
        <div class="row g-0 g-lg-5 mb-5 pb-5 combo-detail-hero-row">
          
          <div class="col-lg-6 mb-4 mb-lg-0">
            <div class="sticky-top" style="top: 100px; z-index: 1;">
              <div class="luxury-image-wrapper position-relative overflow-hidden cursor-zoom-in" style="aspect-ratio: 1 / 1;" @click="viewFullImage(getImage(combo.thumbnail_image))">
                <div class="image-display-surface"></div>
                <div class="position-absolute top-0 start-0 z-index-2 mt-4 ms-4">
                  <div class="luxury-badge luxury-badge-discount font-oswald tracking-widest px-3 py-2 text-uppercase shadow-sm">
                    Giảm {{ combo.discount_type === 'percentage' ? combo.discount_value + '%' : formatCurrency(combo.discount_value) }}
                  </div>
                </div>

                <div v-if="timerInfo.isEnded" class="ended-overlay d-flex align-items-center justify-content-center flex-column text-center p-4">
                    <h3 class="text-white font-oswald tracking-widest m-0 text-uppercase" style="letter-spacing: 4px;">{{ timerInfo.title }}</h3>
                    <div class="mt-3 bg-white" style="width: 40px; height: 1px;"></div>
                </div>

                <img :src="getImage(combo.thumbnail_image)" class="combo-hero-image img-zoom-hover position-absolute top-0 start-0 w-100 h-100" :class="{'opacity-75 grayscale': timerInfo.isEnded}" @error="handleImageError">
                
                <div class="image-zoom-hint position-absolute bottom-0 end-0 m-4 z-index-2 small fw-light fst-italic px-3 py-2 rounded-pill shadow-sm">
                  <i class="bi bi-arrows-fullscreen me-1"></i> Nhấp để xem chi tiết
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="combo-detail-copy ps-lg-4 pt-2">
              <div class="luxury-meta-line d-flex align-items-center gap-3 mb-3 text-uppercase font-oswald tracking-widest small">
                <span class="luxury-meta fw-medium"><i class="bi bi-stars me-1"></i> Bộ Sưu Tập {{ combo.items.length }} Món</span>
                <span v-if="combo.theme" class="theme-pill">{{ combo.theme }}</span>
              </div>
              
              <h1 class="combo-detail-title display-4 fw-bold mb-4 font-serif">{{ combo.name }}</h1>
              <p class="combo-detail-desc fs-6 mb-5 lh-lg fw-light">{{ combo.description }}</p>

              <div class="luxury-timer-section mb-5" v-if="timerInfo.type !== 'forever'">
                  <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div class="d-flex align-items-center gap-2">
                      <div class="pulsing-dot" :class="timerInfo.type === 'active' ? 'bg-sora-red' : 'bg-warning'" v-if="!timerInfo.isEnded"></div>
                      <span class="timer-label font-oswald tracking-wide text-uppercase small fw-medium">
                        {{ timerInfo.title }}
                      </span>
                    </div>
                    
                    <div v-if="!timerInfo.isEnded" class="timer-countdown d-flex gap-2 font-oswald">
                        <span><strong>{{ timerInfo.d }}</strong><small>Ngày</small></span>
                        <span><strong>{{ timerInfo.h }}</strong><small>Giờ</small></span>
                        <span><strong>{{ timerInfo.m }}</strong><small>Phút</small></span>
                        <span><strong>{{ timerInfo.s }}</strong><small>Giây</small></span>
                    </div>
                  </div>
              </div>

              <div class="combo-items-editorial mb-5">
                <h5 class="section-heading fw-bold mb-4 font-serif fs-4 d-flex align-items-center">
                  <i class="bi bi-gem text-gold me-2"></i> Định Hình Phong Cách
                </h5>
                
                <div class="editorial-item mb-4" v-for="(item, index) in combo.items" :key="item.id">
                  <div class="card luxury-product-card overflow-hidden">
                    <div class="d-flex flex-column">
                      
                      <div class="editorial-image-cell position-relative w-100">
                         <div class="position-absolute top-0 start-0 m-3 z-index-2">
                             <span class="item-index-badge font-oswald px-3 py-1 shadow-sm">Món {{ index + 1 }}</span>
                         </div>
                         <div class="editorial-image-frame position-relative w-100 cursor-zoom-in" style="height: 320px;" @click="viewFullImage(getDisplayImage(item))">
                            <img :src="getDisplayImage(item)" class="w-100 h-100 object-fit-cover transition-all img-zoom-hover" @error="handleImageError">
                         </div>
                      </div>

                      <div class="p-4 d-flex flex-column bg-white">
                         <div class="d-flex justify-content-between align-items-start mb-3 gap-2 flex-wrap flex-xl-nowrap">
                             <div>
                                <small class="item-category text-uppercase font-oswald tracking-widest fw-bold">{{ item.product?.category?.name || 'Trang Sức Cao Cấp' }}</small>
                                <h5 class="item-title fw-bold font-serif mt-1 mb-0 fs-5 lh-base">{{ item.product?.name }}</h5>
                             </div>
                             <div class="text-xl-end">
                                <template v-if="!item.product_variant_id">
                                    <div v-if="getSelectedVariant(item.id)" class="text-sora-primary fw-bold font-oswald fs-5">{{ formatCurrency(getSelectedVariant(item.id).price) }}</div>
                                    <div v-else class="text-muted fw-bold font-oswald fs-6">Từ {{ formatCurrency(item.product?.base_price) }}</div>
                                </template>
                                <template v-else>
                                    <div class="text-sora-primary fw-bold font-oswald fs-5">{{ formatCurrency(item.variant?.price) }}</div>
                                </template>
                             </div>
                         </div>

                         <div class="flex-grow-1 border-top border-light-subtle pt-3 mt-1">
                             <div v-if="item.product_variant_id" class="fixed-config-box p-3 small">
                                 <p class="text-muted font-oswald tracking-wide text-uppercase mb-2" style="font-size: 0.75rem;"><i class="bi bi-pin-angle-fill text-sora-primary me-1"></i>Phiên bản cấu hình sẵn</p>
                                 <div class="d-flex flex-wrap gap-2">
                                    <span v-if="item.variant?.formatted_attributes" class="fw-bold text-dark">
                                      {{ Object.values(item.variant.formatted_attributes).join(' - ') }}
                                    </span>
                                    <span v-else class="fw-bold text-dark">{{ item.variant?.sku }}</span>
                                 </div>
                             </div>

                             <div v-else>
                                 <div v-if="itemMatrices[item.id]" class="row g-3">
                                     <div v-for="(values, attrName) in itemMatrices[item.id]" :key="attrName" class="col-sm-6 col-md-12 col-xl-6">
                                        <p class="text-dark font-oswald tracking-wide text-uppercase mb-2" style="font-size: 0.8rem;">
                                          {{ attrName }}: <span class="fw-bold text-sora-primary ms-1">{{ userSelections[item.id][attrName] || 'Chưa chọn' }}</span>
                                        </p>
                                        <div class="d-flex flex-wrap gap-2">
                                            <label v-for="val in values" :key="val" 
                                                   class="attr-chip m-0 transition-all"
                                                   :class="{
                                                     'selected': userSelections[item.id][attrName] === val, 
                                                     'error': validationErrors[item.id],
                                                     'disabled': !isOptionAvailable(item, attrName, val)
                                                   }"
                                                   :title="!isOptionAvailable(item, attrName, val) ? 'Tạm hết hàng' : ''"
                                                   @click.prevent="isOptionAvailable(item, attrName, val) ? toggleSelection(item.id, attrName, val) : null">
                                              <input type="radio" class="d-none" :name="`attr_${item.id}_${attrName}`" :checked="userSelections[item.id][attrName] === val" :disabled="!isOptionAvailable(item, attrName, val)">
                                              <div class="chip-inner px-3 py-1 d-flex flex-column align-items-center justify-content-center text-center shadow-sm" style="min-width: 45px;">
                                                <span class="fw-bold font-oswald tracking-wide" style="font-size: 0.85rem;">{{ val }}</span>
                                              </div>
                                            </label>
                                        </div>
                                     </div>
                                 </div>

                                 <div class="text-danger small mt-3 fst-italic p-2 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded" v-if="validationErrors[item.id]">
                                   <i class="bi bi-exclamation-triangle-fill me-1"></i> Vui lòng hoàn tất tùy chọn thiết kế cho món này.
                                 </div>
                             </div>
                         </div>

                         <div class="d-flex align-items-center gap-2 mt-4 pt-3 border-top border-light-subtle">
                             <span class="text-muted small text-uppercase font-oswald tracking-widest">Số lượng áp dụng:</span>
                             <span class="quantity-badge font-oswald px-3 py-1 fs-6 shadow-sm">x{{ item.quantity }}</span>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div class="luxury-price-summary mb-5 p-4">
                <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-light-subtle">
                  <span class="text-muted font-oswald text-uppercase tracking-wide">Giá Trị Gốc</span>
                  <span class="text-muted text-decoration-line-through fs-5 font-oswald">{{ formatCurrency(originalTotal) }}</span>
                </div>
                <div class="text-end">
                  <span class="font-oswald text-warning tracking-widest text-uppercase small fw-bold" >
                    Tiết Kiệm Lên Đến <span class="text-danger" style="font-size:1.5rem;">{{ savingsPercentage }}%</span>
                  </span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <span class="fw-bold text-dark font-oswald text-uppercase tracking-wide fs-5">Mức Giá Ưu Đãi</span>
                  <span class="fw-bold text-sora-primary display-5 ">{{ formatCurrency(finalPrice) }}</span>
                </div>
            </div>

            <div v-if="!canBuyCombo" class="combo-unavailable text-center py-4">
              <span class="font-oswald tracking-widest text-uppercase text-muted fs-5">
                <template v-if="timerInfo.type === 'upcoming'">Gói ưu đãi chưa mở bán</template>
                <template v-else-if="timerInfo.type === 'soldout'">Đã bán hết số lượng</template>
                <template v-else>Gói ưu đãi đã khép lại</template>
              </span>
            </div>
            
            <div v-else class="row g-3">
              <div class="col-sm-6">
                <button class="btn luxury-btn-outline w-100 py-3 font-oswald tracking-widest text-uppercase" @click="addToCart">
                  <span v-if="isAddingToCart" class="spinner-border spinner-border-sm me-2"></span>
                  Thêm Vào Giỏ
                </button>
              </div>
              <div class="col-sm-6">
                <button class="btn luxury-btn-solid w-100 py-3 font-oswald tracking-widest text-uppercase" @click="buyNow">
                  Sở Hữu Ngay
                </button>
              </div>
            </div>

            <div class="shop-feature-row d-flex justify-content-between mt-5 pt-4">
              <div v-for="(feat, index) in shopFeatures" :key="index" class="feature-pill text-center">
                <i :class="['bi', feat.icon, 'fs-4 text-dark mb-1 d-block']"></i>
                <span class="font-oswald text-uppercase" style="font-size: 0.65rem; letter-spacing: 1px;" v-html="feat.text"></span>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      <div class="related-products-section py-5" v-if="relatedProducts.length > 0">
        <div class="container">
          <div class="text-center mb-5">
            <h3 class="font-serif fw-bold text-dark display-6 mb-3">Có Thể Bạn Sẽ Thích</h3>
            <div class="divider-gold mx-auto"></div>
          </div>

          <div class="position-relative">
            <swiper
              :modules="swiperModules"
              :slides-per-view="1"
              :space-between="20"
              :navigation="{ nextEl: '.related-next', prevEl: '.related-prev' }"
              :breakpoints="{
                '576': { slidesPerView: 2 },
                '768': { slidesPerView: 3 },
                '992': { slidesPerView: 4 }
              }"
              class="related-swiper py-2"
            >
              <swiper-slide v-for="product in relatedProducts" :key="product.id" class="h-auto pb-4">
                <ProductCard
                  :product="product"
                  :is-in-wishlist="isInWishlist(product.id)"
                  :is-in-compare="isInCompare(product.id)"
                  :show-wishlist="true"
                  :show-compare="true"
                  :show-add-to-cart="true"
                  :hover-add-to-cart="true"
                  @toggle-wishlist="toggleWishlist"
                  @toggle-compare="handleToggleCompare"
                  @add-to-cart="openQuickAdd"
                />
              </swiper-slide>
            </swiper>

            <button class="related-prev position-absolute top-50 start-0 translate-middle-y z-index-2 border border-light-subtle rounded-circle bg-white shadow-sm d-none d-md-flex align-items-center justify-content-center text-dark hover-primary transition-all" style="width: 40px; height: 40px; margin-left: -10px;">
              <i class="bi bi-chevron-left"></i>
            </button>
            <button class="related-next position-absolute top-50 end-0 translate-middle-y z-index-2 border border-light-subtle rounded-circle bg-white shadow-sm d-none d-md-flex align-items-center justify-content-center text-dark hover-primary transition-all" style="width: 40px; height: 40px; margin-right: -10px;">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <CompareModal 
        ref="compareModalRef" 
        shop-slug="sora" 
        @update-list="compareList = $event" 
      />

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
                   <label v-for="val in values" :key="val" 
                          class="attr-chip m-0 transition-all" 
                          :class="{
                            'selected': String(quickAddSelections[attrName]) === String(val),
                            'disabled': !isQuickAddOptionAvailable(attrName, val)
                          }"
                          :title="!isQuickAddOptionAvailable(attrName, val) ? 'Tạm hết hàng' : ''"
                          @click.prevent="isQuickAddOptionAvailable(attrName, val) ? toggleQuickAddSelection(attrName, val) : null">
                     <input type="radio" class="d-none" :checked="String(quickAddSelections[attrName]) === String(val)" :disabled="!isQuickAddOptionAvailable(attrName, val)">
                     <div class="chip-inner px-3 py-2 d-flex flex-column align-items-center justify-content-center text-center shadow-sm">
                       <span class="fw-bold font-oswald tracking-wide small">{{ val }}</span>
                     </div>
                   </label>
                 </div>
              </div>
              
              <div class="text-danger small fst-italic mt-2 fw-bold bg-danger bg-opacity-10 p-2 rounded" v-if="quickAddError">
                 <i class="bi bi-exclamation-triangle-fill me-1"></i> Vui lòng chọn đầy đủ phân loại.
              </div>

              <button @click="confirmQuickAdd" class="btn luxury-btn-solid w-100 py-3 mt-4 font-oswald tracking-widest text-uppercase fw-bold shadow-sm fs-6">
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import clientApiClient from '@/utils/clientApiClient';
import Toast from '@/utils/toastConfig';
import soraAlert from '@/utils/soraAlertConfig';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ProductCard from '@/components/ui/ProductCard.vue';
import CompareModal from '@/components/ui/CompareModal.vue';
import { usePublicRefreshListener } from '@/composables/usePublicRefreshListener.js';
import SoraProductDetailSkeleton from '@/components/ui/SoraProductDetailSkeleton.vue';
import SoraProductGridSkeleton from '@/components/ui/SoraProductGridSkeleton.vue';
import { getStorageUrl } from '@/utils/env';

const swiperModules = [Navigation];
const route = useRoute();
const router = useRouter();

const combo = ref(null);
const isLoading = ref(true);
const itemMatrices = ref({}); 
const userSelections = ref({}); 
const validationErrors = ref({}); 
const isAddingToCart = ref(false);
const relatedProducts = ref([]); 

const quickAddProduct = ref(null);
const quickAddMatrix = ref({});
const quickAddSelections = ref({});
const quickAddError = ref(false);
let quickAddModalInstance = null;

const currentTime = ref(new Date().getTime());
let timerInterval = null;

const shopFeatures = [
  { icon: 'bi-truck', text: 'Giao Hàng<br>Miễn Phí' },
  { icon: 'bi-arrow-repeat', text: 'Đổi Trả<br>Dễ Dàng' },
  { icon: 'bi-shield-check', text: 'Bảo Hành<br>Trọn Đời' },
  { icon: 'bi-gem', text: 'Chất Lượng<br>Đỉnh Cao' }
];

const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val || 0);

const getSafeStorage = (key) => {
    try { return localStorage.getItem(key); } catch(e) { return null; }
};

const setSafeStorage = (key, val) => {
    try { localStorage.setItem(key, val); } catch(e) { console.warn('LocalStorage bị chặn.'); }
};

const getImage = (path) => {
    return getStorageUrl(path);
};

const getImageUrl = getImage;

const handleImageError = (e) => {
  e.target.src = '/Sora-placeholder.png';
};

const isValidImage = (url) => {
    return url && typeof url === 'string' && url.trim() !== '';
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

const getCartHeaders = () => {
    const token = getToken(); 
    let sessionId = getSafeStorage('cart_session_id'); 
    if (!sessionId && !token) { 
        sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        setSafeStorage('cart_session_id', sessionId);
    }
    const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (sessionId) headers['X-Cart-Session-Id'] = sessionId;
    return headers;
};

const buildVariantMatrix = (variants) => {
    const matrix = {};
    if (!variants) return matrix;
    
    variants.forEach(variant => {
        let attrs = {};
        let attrVals = variant.attributeValues || variant.attribute_values;
        
        if (attrVals) { 
            attrVals.forEach(av => { if (av.attribute) attrs[av.attribute.name] = av.value; });
        } else if (variant.attributes) {
            attrs = typeof variant.attributes === 'string' ? JSON.parse(variant.attributes) : variant.attributes;
        } else if (variant.formatted_attributes) {
            attrs = variant.formatted_attributes;
        }
        
        variant.formatted_attributes = attrs;
        
        Object.entries(attrs).forEach(([attrName, attrValue]) => {
            if (!matrix[attrName]) matrix[attrName] = new Set();
            matrix[attrName].add(attrValue);
        });
    });
    
    const finalMatrix = {};
    Object.keys(matrix).forEach(key => { finalMatrix[key] = Array.from(matrix[key]); });
    return finalMatrix;
};

const isOptionAvailable = (item, attrName, val) => {
    if (!item.product?.variants) return false;
    const otherSelections = { ...userSelections.value[item.id] };
    delete otherSelections[attrName];

    return item.product.variants.some(v => {
        if (!v.formatted_attributes || String(v.formatted_attributes[attrName]) !== String(val)) return false;
        return Object.entries(otherSelections).every(([k, vVal]) => {
            if (!vVal) return true;
            return String(v.formatted_attributes[k]) === String(vVal);
        });
    });
};

const isQuickAddOptionAvailable = (attrName, val) => {
    if (!quickAddProduct.value?.variants) return false;
    const otherSelections = { ...quickAddSelections.value };
    delete otherSelections[attrName];

    return quickAddProduct.value.variants.some(v => {
        if (!v.formatted_attributes || String(v.formatted_attributes[attrName]) !== String(val)) return false;
        return Object.entries(otherSelections).every(([k, vVal]) => {
            if (!vVal) return true;
            return String(v.formatted_attributes[k]) === String(vVal);
        });
    });
};

const toggleSelection = (itemId, attrName, val) => {
    if (userSelections.value[itemId][attrName] === val) {
        userSelections.value[itemId][attrName] = null;
    } else {
        userSelections.value[itemId][attrName] = val;
        validationErrors.value[itemId] = false;
    }
};

const toggleQuickAddSelection = (attrName, val) => {
    if (String(quickAddSelections.value[attrName]) === String(val)) {
        quickAddSelections.value[attrName] = null;
    } else {
        quickAddSelections.value[attrName] = val;
        quickAddError.value = false;
    }
};

const favourites = ref([]);
const isTogglingFav = ref(null);

const fetchFavorites = async () => {
  const token = getToken();
  if (!token) return;
  try {
    const res = await clientApiClient.get('/client/favourites', { ignoreAuthRedirect: true });
    const data = res.data;
    if (data.status) favourites.value = data.data.map(fav => fav.product_id);
  } catch (e) {}
};

const isInWishlist = (productId) => favourites.value.includes(productId);

const toggleWishlist = async (prod) => {
  if (!prod || !prod.id) return;
  const token = getToken();
  
  if (!token) {
    soraAlert.fire({
      icon: 'warning', title: 'Bạn chưa đăng nhập!', text: 'Vui lòng đăng nhập để lưu trữ bộ sưu tập yêu thích của mình.',
      confirmButtonText: 'Đăng Nhập Ngay', showCancelButton: true, cancelButtonText: 'Đóng'
    }).then((result) => {
      if (result.isConfirmed) router.push('/login');
    });
    return;
  }

  isTogglingFav.value = prod.id; 
  try {
    const res = await clientApiClient.post('/client/favourites/toggle', { product_id: prod.id });
    const data = res.data;
    if (data.status) {
      if (data.action === 'added') {
        favourites.value.push(prod.id);
        Toast.fire({ icon: 'success', title: 'Đã thêm vào yêu thích' });
      } else if (data.action === 'removed') {
        favourites.value = favourites.value.filter(id => id !== prod.id);
        Toast.fire({ icon: 'info', title: 'Đã bỏ yêu thích' });
      }
    }
  } catch (error) {
  } finally {
    isTogglingFav.value = null; 
  }
};

const compareModalRef = ref(null);
const compareList = ref([]); 

const isInCompare = (id) => compareList.value.some(item => item.id === id);

const handleToggleCompare = (prod) => {
  if (compareModalRef.value) compareModalRef.value.toggleCompare(prod);
};

const getSelectedVariant = (itemId) => {
    const item = combo.value.items.find(i => i.id === itemId);
    if (!item || item.product_variant_id) return item?.variant;
    
    const selections = userSelections.value[itemId];
    if (!selections) return null;
    
    const requiredAttrs = Object.keys(itemMatrices.value[itemId] || {});
    if (requiredAttrs.length === 0) return null;

    const hasAllAttrs = requiredAttrs.every(attr => selections[attr]);
    if (!hasAllAttrs) return null;
    
    return item.product.variants.find(v => {
        return requiredAttrs.every(attr => v.formatted_attributes && String(v.formatted_attributes[attr]) === String(selections[attr]));
    });
};

const getDisplayImage = (item) => {
    if (item.product_variant_id && item.variant && isValidImage(item.variant.image_url)) {
        return getImage(item.variant.image_url);
    }
    if (!item.product_variant_id) {
        const selectedVar = getSelectedVariant(item.id);
        if (selectedVar && isValidImage(selectedVar.image_url)) return getImage(selectedVar.image_url);
    }
    return getImage(item.product?.thumbnail_image);
};

const viewFullImage = (url) => {
  soraAlert.fire({
    imageUrl: url, imageAlt: 'Product Image', width: 600, imageHeight: 600, padding: 0, 
    background: 'transparent', backdrop: 'rgba(0,0,0,0.85)', showConfirmButton: false, showCloseButton: true,
    customClass: { image: 'rounded-3 shadow-lg object-fit-contain bg-white', popup: 'p-0 bg-transparent' }
  });
};

const isAllAttributesSelected = (itemId) => {
    const selections = userSelections.value[itemId];
    if (!selections) return false;
    const requiredAttrs = Object.keys(itemMatrices.value[itemId] || {});
    return requiredAttrs.every(attr => selections[attr]);
};

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
    if (selectedVar && isValidImage(selectedVar.image_url)) return getImageUrl(selectedVar.image_url);
    if (isValidImage(quickAddProduct.value.thumbnail_image)) return getImageUrl(quickAddProduct.value.thumbnail_image);
    return getImageUrl(quickAddProduct.value.fallback_image);
});

const quickAddSelectedPrice = computed(() => {
    if (!quickAddProduct.value) return 0;
    const selectedVar = quickAddSelectedVariant.value;
    if (selectedVar) return selectedVar.promotional_price || selectedVar.price;
    return quickAddProduct.value.promotional_price || quickAddProduct.value.base_price || quickAddProduct.value.fallback_price || 0;
});

const openQuickAdd = async (product) => {
    quickAddProduct.value = null;
    quickAddError.value = false;
    quickAddSelections.value = {};
    quickAddMatrix.value = {};
    
    if (!quickAddModalInstance) {
        quickAddModalInstance = new window.bootstrap.Modal(document.getElementById('quickAddModal'));
    }
    quickAddModalInstance.show();

    try {
        const res = await clientApiClient.get(`/shop/all/products/${product.slug}`, { ignoreAuthRedirect: true });
        if (res.data && res.data.data) {
            quickAddProduct.value = {
                ...res.data.data,
                fallback_image: product.thumbnail_image,
                fallback_price: product.base_price 
            };
            
            quickAddMatrix.value = buildVariantMatrix(quickAddProduct.value.variants);
            
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
         Toast.fire({ icon: 'error', title: 'Phiên bản đã hết hàng!' });
         return;
    }

    try {
        const headers = getCartHeaders();
        const res = await clientApiClient.post('/client/cart', {
            product_variant_id: selectedVar.id,
            quantity: 1
        }, { ensureCartSession: true, ignoreAuthRedirect: true });

        if (res.data.session_id) {
            setSafeStorage('cart_session_id', res.data.session_id);
        }
        
        window.dispatchEvent(new CustomEvent('update-cart-count'));
        quickAddModalInstance.hide();
        Toast.fire({ icon: 'success', title: 'Đã thêm sản phẩm vào giỏ' });
    } catch (error) {
        const msg = error.response?.data?.message || 'Không thể thêm vào giỏ hàng!';
        soraAlert.fire({ icon: 'error', title: 'Lỗi', text: msg });
    }
};

const originalTotal = computed(() => {
  if (!combo.value) return 0;
  return combo.value.items.reduce((total, item) => {
    let price = 0;
    if (item.product_variant_id && item.variant) {
      price = item.variant.price; 
    } else {
      const selectedVar = getSelectedVariant(item.id);
      price = selectedVar ? selectedVar.price : (item.product ? item.product.base_price : 0);
    }
    return total + (parseFloat(price) * item.quantity);
  }, 0);
});

const finalPrice = computed(() => {
  if (!combo.value) return 0;
  let total = originalTotal.value;
  let discount = parseFloat(combo.value.discount_value);
  if (combo.value.discount_type === 'percentage') return total - (total * (Math.min(discount, 100) / 100));
  return Math.max(0, total - discount);
});

const savingsPercentage = computed(() => {
  if (originalTotal.value === 0) return 0;
  const savings = originalTotal.value - finalPrice.value;
  return Math.round((savings / originalTotal.value) * 100);
});

const parseDBDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr.replace(' ', 'T').substring(0, 19)).getTime();
};

const calculateTimeParts = (diff) => {
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return {
    d: days.toString().padStart(2, '0'), h: hours.toString().padStart(2, '0'),
    m: minutes.toString().padStart(2, '0'), s: seconds.toString().padStart(2, '0')
  };
};

const getTimerData = (comboObj) => {
    if (!comboObj) return { type: 'forever', title: '', isEnded: false };
    const now = currentTime.value; 
    
    if (comboObj.usage_limit !== null && comboObj.usage_limit <= 0) return { type: 'soldout', title: 'ĐÃ BÁN HẾT SỐ LƯỢNG', isEnded: true };

    const startTime = comboObj.parsed_start_date;
    const endTime = comboObj.parsed_end_date;

    if (endTime && endTime < now) return { type: 'ended', title: 'ƯU ĐÃI ĐÃ KẾT THÚC', isEnded: true };
    if (startTime && startTime > now) return { type: 'upcoming', title: 'MỞ BÁN SAU', isEnded: false, ...calculateTimeParts(startTime - now) };
    if (endTime && endTime >= now) return { type: 'active', title: 'KẾT THÚC TRONG', isEnded: false, ...calculateTimeParts(endTime - now) };
    
    return { type: 'forever', title: '', isEnded: false };
};

const timerInfo = computed(() => getTimerData(combo.value));

const canBuyCombo = computed(() => {
    if (!combo.value) return false;
    const timer = getTimerData(combo.value);
    return timer.type === 'active' || timer.type === 'forever';
});

const fetchRelatedProducts = async () => {
    if (!combo.value || !combo.value.items) return;
    const categoryIds = [...new Set(combo.value.items.map(item => item.product?.category_id).filter(Boolean))];
    try {
    const params = { per_page: 7 };
    if (categoryIds.length > 0) params.category_id = categoryIds[0];
    const res = await clientApiClient.get('/shop/all/products', { params, ignoreAuthRedirect: true });
    if (res.data && res.data.success) {
      let items = res.data.data.data ? res.data.data.data : res.data.data;
      relatedProducts.value = items.slice(0, 7);
    }
    } catch (error) {}
};

const fetchDetail = async (slug) => {
  isLoading.value = true;
  combo.value = null; 
  try {
    const res = await clientApiClient.get(`/client/combos/${slug}`, { ignoreAuthRedirect: true });
    let fetchedCombo = res.data.data;
    
    fetchedCombo.parsed_start_date = parseDBDate(fetchedCombo.start_date);
    fetchedCombo.parsed_end_date = parseDBDate(fetchedCombo.end_date);
    
    combo.value = fetchedCombo;
    
    userSelections.value = {}; validationErrors.value = {}; itemMatrices.value = {};

    combo.value.items.forEach(item => {
      if (!item.product_variant_id) {
        userSelections.value[item.id] = {}; 
        
        itemMatrices.value[item.id] = buildVariantMatrix(item.product?.variants);

        if (item.product?.variants && item.product.variants.length === 1) {
            const singleVariant = item.product.variants[0];
            if (singleVariant.formatted_attributes) {
                Object.entries(singleVariant.formatted_attributes).forEach(([attrName, attrValue]) => {
                    userSelections.value[item.id][attrName] = attrValue;
                });
            }
        }
      }
    });
    
    fetchRelatedProducts();
    
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
};

usePublicRefreshListener({
  combos: () => {
    if (route.params.slug) {
      fetchDetail(route.params.slug);
    }
  }
});

const validateSelections = () => {
  let isValid = true;
  validationErrors.value = {};
  
  combo.value.items.forEach(item => {
    if (!item.product_variant_id) {
      const selectedVar = getSelectedVariant(item.id);
      if (!selectedVar) {
        validationErrors.value[item.id] = true;
        isValid = false;
      } else {
        validationErrors.value[item.id] = false;
      }
    }
  });
  return isValid;
};

const checkValidationAndWarn = () => {
  if (!validateSelections()) {
    soraAlert.fire({
      icon: 'warning', title: 'Thiếu tùy chọn!', text: 'Vui lòng định hình thiết kế cho tất cả các món trong bộ sưu tập.',
      confirmButtonText: 'Chọn ngay'
    });
    return false;
  }
  return true;
};

const preparePayload = () => {
  const customSelections = combo.value.items.filter(i => !i.product_variant_id).map(item => {
    const selectedVar = getSelectedVariant(item.id);
    return {
      combo_item_id: parseInt(item.id),
      selected_variant_id: selectedVar ? selectedVar.id : null 
    };
  });
  
  return { combo_id: combo.value.id, quantity: 1, combo_selections: customSelections };
};

const addToCart = async () => {
  if (!checkValidationAndWarn()) return;
  
  isAddingToCart.value = true;
  const payload = preparePayload();
  
  try {
      const headers = getCartHeaders();
      const res = await clientApiClient.post('/client/cart/add-combo', payload, { ensureCartSession: true });
      
      if (res.data.session_id) {
          setSafeStorage('cart_session_id', res.data.session_id);
      }

      window.dispatchEvent(new CustomEvent('update-cart-count'));
      Toast.fire({ icon: 'success', title: 'Đã thêm Combo vào Túi mua sắm' });
      
  } catch (error) {
      const msg = error.response?.data?.message || 'Không thể thêm vào giỏ hàng. Vui lòng thử lại!';
      soraAlert.fire({ icon: 'error', title: 'Lỗi giỏ hàng', text: msg });
  } finally {
      isAddingToCart.value = false;
  }
};

const buyNow = () => {
  if (!checkValidationAndWarn()) return;
  
  const payload = preparePayload();
  setSafeStorage('checkout_combo_direct', JSON.stringify(payload));
  
  Toast.fire({ icon: 'success', title: 'Chuyển hướng đến Thanh toán...', timer: 1000 }).then(() => {
     router.push('/checkout').catch(()=>{});
  });
};

watch(() => route.params.slug, (newSlug) => {
    if(newSlug && route.name === 'client-combo-detail') fetchDetail(newSlug);
});

onMounted(() => {
    fetchFavorites();
    fetchDetail(route.params.slug);
    timerInterval = setInterval(() => { currentTime.value = new Date().getTime(); }, 1000);
});

onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval);
    document.querySelectorAll('.swal2-container').forEach(el => el.remove());
    if (quickAddModalInstance) quickAddModalInstance.dispose();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

.combo-detail-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 12%, rgba(231, 206, 125, 0.15), transparent 28%),
    linear-gradient(180deg, #fffaf1 0%, #fbf7ee 45%, #f7efe3 100%);
  color: #2d2020;
}

.bg-light-custom { background-color: #faf9f6; min-height: 100vh; }
.font-serif { font-family: 'Playfair Display', serif; }
.font-oswald { font-family: 'Oswald', sans-serif; }
.tracking-wide { letter-spacing: 1px; }
.tracking-widest { letter-spacing: 2px; }
.z-index-2 { z-index: 2; }
.transition-color { transition: color 0.3s ease; }
.transition-all { transition: all 0.3s ease; }
.cursor-pointer { cursor: pointer; }
.cursor-zoom-in { cursor: zoom-in; }

.text-sora-primary { color: #8f2034 !important; }
.text-sora-red { color: #a9283f !important; }
.text-gold { color: #c9a44e !important; }
.bg-sora-primary { background-color: #8f2034 !important; }
.border-gold-light { border-color: rgba(197, 158, 74, 0.42) !important; }
.divider-gold { width: 54px; height: 2px; background: linear-gradient(90deg, transparent, #c9a44e, transparent); }

.hover-primary:hover { color: #8f2034 !important; }

.combo-breadcrumb-shell {
  background: linear-gradient(180deg, rgba(255, 252, 246, 0.7), transparent);
}

.combo-detail-hero-row {
  border-bottom: 1px solid rgba(197, 158, 74, 0.32) !important;
}

.combo-detail-copy {
  color: #2f2020;
}

.luxury-meta {
  color: #c9a44e;
}

.theme-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 5px 12px;
  border-radius: 999px;
  color: #6b5451;
  border: 1px solid rgba(197, 158, 74, 0.42);
  background: rgba(255, 252, 246, 0.82);
}

.combo-detail-title {
  color: #2f2020;
  line-height: 1.08;
  letter-spacing: 0;
}

.combo-detail-desc {
  color: #776360;
  font-family: Arial, sans-serif;
}

.luxury-image-wrapper {
  border-radius: 24px;
  border: 1px solid rgba(197, 158, 74, 0.38);
  background:
    radial-gradient(circle at 50% 78%, rgba(130, 39, 53, 0.12), transparent 36%),
    linear-gradient(145deg, #fffaf1, #efe1cf);
  box-shadow: 0 28px 70px rgba(65, 35, 24, 0.13);
}

.luxury-image-wrapper::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 12%, rgba(255, 255, 255, 0.8), transparent 28%),
    linear-gradient(115deg, transparent 24%, rgba(255, 255, 255, 0.22) 46%, transparent 66%);
  pointer-events: none;
  z-index: 0;
}

.image-display-surface {
  position: absolute;
  left: 16%;
  right: 16%;
  bottom: 42px;
  height: 54px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(122, 87, 74, 0.25), rgba(122, 87, 74, 0));
  filter: blur(3px);
  z-index: 0;
}

.combo-hero-image {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-zoom-hover { transition: transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.luxury-image-wrapper:hover .img-zoom-hover { transform: scale(1.05); }
.grayscale { filter: grayscale(100%); }
.ended-overlay { position: absolute; inset: 0; background-color: rgba(45, 19, 24, 0.78); backdrop-filter: blur(4px); z-index: 10; }
.luxury-badge { letter-spacing: 2px; font-size: 0.8rem; border-radius: 999px; }
.luxury-badge-discount {
  color: #fff7df;
  background: linear-gradient(135deg, #761527, #a8273e);
  border: 1px solid rgba(231, 206, 125, 0.72);
}

.image-zoom-hint {
  color: #6b5451;
  background: rgba(255, 252, 246, 0.86);
  border: 1px solid rgba(197, 158, 74, 0.36);
  opacity: 0.92;
  font-size: 0.75rem;
}

.luxury-timer-section {
  padding: 16px;
  border: 1px solid rgba(197, 158, 74, 0.38);
  border-radius: 18px;
  background: rgba(255, 252, 246, 0.72);
  box-shadow: 0 14px 34px rgba(65, 35, 24, 0.07);
}

.timer-label {
  color: #6b5451;
}

.timer-countdown span {
  min-width: 58px;
  height: 58px;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  border: 1px solid rgba(197, 158, 74, 0.44);
  background: linear-gradient(180deg, #fffdf8, #f8eddd);
  box-shadow: 0 10px 24px rgba(72, 42, 28, 0.08);
}

.timer-countdown strong {
  color: #8f2034;
  font-size: 1.2rem;
  line-height: 1;
}

.timer-countdown small {
  margin-top: 4px;
  color: #8b7771;
  font-size: 0.64rem;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.section-heading {
  color: #2f2020;
}

.luxury-product-card {
  border: 1px solid rgba(197, 158, 74, 0.34);
  border-radius: 18px;
  background: linear-gradient(180deg, #fffdf8, #fbf3e8);
  box-shadow: 0 18px 42px rgba(65, 35, 24, 0.08);
  transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
}

.luxury-product-card:hover {
  transform: translateY(-3px);
  border-color: rgba(197, 158, 74, 0.62);
  box-shadow: 0 24px 50px rgba(65, 35, 24, 0.13);
}

.editorial-image-cell {
  border-bottom: 1px solid rgba(197, 158, 74, 0.28);
  background:
    radial-gradient(circle at 50% 78%, rgba(130, 39, 53, 0.1), transparent 36%),
    linear-gradient(145deg, #fffaf1, #efe1cf);
}

.editorial-image-frame img {
  position: relative;
  z-index: 1;
  padding: 0;
}

.editorial-image-frame::after {
  display: none;
}

.item-index-badge,
.quantity-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  color: #fff7df;
  background: #2d2020;
  border: 1px solid rgba(231, 206, 125, 0.78);
}

.item-category {
  color: #c9a44e;
  font-size: 0.7rem;
}

.item-title {
  color: #2f2020;
}

.fixed-config-box {
  border: 1px solid rgba(197, 158, 74, 0.32);
  border-radius: 14px;
  background: rgba(255, 252, 246, 0.72);
}

.pulsing-dot { width: 8px; height: 8px; border-radius: 50%; animation: pulse 1.5s infinite; }
@keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(204, 30, 46, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(204, 30, 46, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(204, 30, 46, 0); } }

.attr-chip { border-radius: 999px; overflow: hidden; min-width: 55px; }
.attr-chip:not(.disabled) { cursor: pointer; }
.attr-chip.disabled { opacity: 0.6; cursor: not-allowed; }
.attr-chip.disabled .chip-inner { background-color: #f8f9fa; border-color: #e9ecef; color: #adb5bd; box-shadow: none !important; }
.attr-chip.disabled:hover .chip-inner { border-color: #e9ecef; color: #adb5bd; }
.attr-chip .chip-inner {
  border: 1px solid rgba(197, 158, 74, 0.38);
  background: rgba(255, 252, 246, 0.88);
  color: #6b5451;
  border-radius: 999px;
  transition: all 0.3s ease-in-out;
  padding: 6px 12px;
}
.attr-chip:hover:not(.disabled) .chip-inner { border-color: #c9a44e; color: #8f2034; }
.attr-chip.selected:not(.disabled) .chip-inner { background-color: #8f2034; border-color: #c9a44e; color: #fff !important; box-shadow: 0 8px 18px rgba(159, 39, 59, 0.22); }
.attr-chip.selected:not(.disabled) .chip-inner span { color: #fff !important; }
.attr-chip.error .chip-inner { border-color: #dc3545; color: #dc3545; background-color: rgba(220, 53, 69, 0.05); animation: shake 0.4s; }

@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 50% { transform: translateX(4px); } 75% { transform: translateX(-4px); } }

.luxury-price-summary {
  border: 1px solid rgba(197, 158, 74, 0.42);
  border-radius: 20px;
  background: rgba(255, 252, 246, 0.88);
  box-shadow: 0 18px 44px rgba(65, 35, 24, 0.08);
}

.combo-unavailable {
  border: 1px solid rgba(197, 158, 74, 0.35);
  border-radius: 18px;
  background: rgba(255, 252, 246, 0.82);
}

.luxury-btn-solid,
.luxury-btn-outline {
  border-radius: 999px;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.luxury-btn-solid {
  background: linear-gradient(135deg, #761527, #9f273b);
  color: #fff5dc;
  border: 1px solid rgba(231, 206, 125, 0.72);
  box-shadow: 0 14px 26px rgba(126, 23, 43, 0.22);
}
.luxury-btn-solid:hover { color: #fffdf4; box-shadow: 0 18px 34px rgba(126,23,43,0.3); transform: translateY(-2px); }
.luxury-btn-outline { border: 1px solid rgba(197, 158, 74, 0.62); color: #7e172b; background: rgba(255, 252, 246, 0.9); }
.luxury-btn-outline:hover { background: #7e172b; color: #fff7df; border-color: rgba(231, 206, 125, 0.78); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(159,39,59,0.2); }

.shop-feature-row {
  gap: 10px;
  border-top-color: rgba(197, 158, 74, 0.28) !important;
}

.feature-pill {
  flex: 1;
  padding: 12px 8px;
  border-radius: 16px;
  border: 1px solid rgba(197, 158, 74, 0.24);
  background: rgba(255, 252, 246, 0.54);
}

.related-products-section {
  background:
    linear-gradient(180deg, rgba(255, 252, 246, 0.92), #fffaf1);
  border-top: 1px solid rgba(197, 158, 74, 0.28);
}

.related-prev:hover, .related-next:hover { background-color: #8f2034 !important; color: white !important; border-color: #8f2034 !important; }

.fade-in { animation: fadeIn 0.4s ease-in; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

@media (max-width: 991.98px) {
  .luxury-image-wrapper {
    min-height: auto;
  }

  .combo-hero-image {
    height: 520px;
  }

  .combo-detail-title {
    font-size: 2.6rem;
  }
}

@media (max-width: 767.98px) {
  .combo-detail-title {
    font-size: 2.2rem;
  }

  .combo-hero-image {
    height: 390px;
    padding: 24px;
  }

  .luxury-image-wrapper {
    border-radius: 20px;
  }

  .luxury-meta-line {
    align-items: flex-start !important;
    flex-direction: column;
    gap: 8px !important;
  }

  .theme-pill {
    border-left: 0 !important;
  }

  .timer-countdown {
    width: 100%;
    flex-wrap: wrap;
  }

  .timer-countdown span {
    flex: 1 1 calc(50% - 8px);
  }

  .editorial-image-cell {
    min-height: 220px;
    border-right: 0;
    border-bottom: 1px solid rgba(197, 158, 74, 0.28);
  }

  .shop-feature-row {
    flex-wrap: wrap;
  }

  .feature-pill {
    flex: 1 1 calc(50% - 10px);
  }
}

@media (max-width: 420px) {
  .combo-hero-image {
    height: 330px;
  }

  .feature-pill {
    flex-basis: 100%;
  }
}
</style>
