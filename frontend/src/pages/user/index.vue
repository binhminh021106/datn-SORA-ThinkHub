<template>
  <div class="storefront-wrapper font-luxury bg-white">
    <div >
      <section class="hero-carousel position-relative">
        <div id="homeBannerCarousel" class="carousel slide carousel-fade" data-bs-ride="carousel">
          <div class="carousel-inner">
            <div v-for="(banner, index) in data.banners" :key="banner.id" class="carousel-item" :class="{ active: index === 0 }">
              <img :src="getImageUrl(banner.image_desktop)" class="d-block w-100 hero-img object-fit-cover" alt="Banner" @error="handleImageError">
              <div class="carousel-overlay"></div>
              <div class="carousel-caption d-none d-md-flex flex-column justify-content-center h-100 text-center px-5">
                <h6 class="text-gold tracking-widest text-uppercase mb-3">SORA Exclusive</h6>
                <h2 class="display-3 font-serif fw-bold text-white mb-4 shadow-text lh-sm">{{ banner.title || 'VẺ ĐẸP VĨNH CỬU' }}</h2>
                <div class="mt-2">
                  <a :href="banner.target_url || '#'" class="btn btn-outline-light px-5 py-3 text-uppercase tracking-widest fw-bold rounded-0 mx-2 hover-gold-btn">
                    Khám Phá Cửa Hàng
                  </a>
                </div>
              </div>
            </div>
            <div v-if="data.banners.length === 0" class="carousel-item active bg-dark d-flex align-items-center justify-content-center" style="height: 80vh;">
              <h2 class="text-gold font-serif tracking-widest display-4">SORA JEWELRY</h2>
            </div>
          </div>
          <button class="carousel-control-prev w-auto px-4" type="button" data-bs-target="#homeBannerCarousel" data-bs-slide="prev">
            <i class="bi bi-chevron-left fs-1 text-white opacity-75 hover-opacity-100 transition-all"></i>
          </button>
          <button class="carousel-control-next w-auto px-4" type="button" data-bs-target="#homeBannerCarousel" data-bs-slide="next">
            <i class="bi bi-chevron-right fs-1 text-white opacity-75 hover-opacity-100 transition-all"></i>
          </button>
        </div>
      </section>

      <section class="coupons-section py-5" style="background-color: #f9f9f9;" v-if="data.coupons.length > 0">
        <div class="container py-4">
          <div class="text-center mb-5">
            <h3 class="font-serif fw-bold text-dark mb-2">Đặc Quyền Mua Sắm</h3>
            <div class="divider-gold mx-auto"></div>
          </div>
          <div class="coupon-scroll-container d-flex gap-4 pb-3">
            <div v-for="coupon in data.coupons" :key="coupon.id" class="coupon-card flex-shrink-0 position-relative bg-white border border-secondary border-opacity-25 rounded-0 shadow-sm">
              <div class="row g-0 h-100">
                <div class="col-4 bg-primary-luxury text-gold d-flex flex-column justify-content-center align-items-center p-3 border-end-dashed">
                  <span class="fw-bold display-6 font-serif">{{ coupon.discount_type === 'percent' ? coupon.discount_value : formatShortCurrency(coupon.discount_value) }}</span>
                  <span class="small">{{ coupon.discount_type === 'percent' ? '%' : 'VNĐ' }}</span>
                </div>
                <div class="col-8 p-4 d-flex flex-column justify-content-between">
                  <div>
                    <h6 class="fw-bold text-primary-luxury mb-1 tracking-widest text-uppercase">{{ coupon.code }}</h6>
                    <small class="text-muted fst-italic">Đơn tối thiểu: {{ formatCurrency(coupon.min_order_value) }}</small>
                  </div>
                  <button @click="saveCoupon(coupon.code)" class="btn btn-sm btn-outline-primary-luxury mt-3 rounded-0 fw-bold tracking-widest text-uppercase">
                    Lưu Mã Nhận Ưu Đãi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="categories-section py-5 bg-white">
        <div class="container py-4 text-center">
          <h6 class="text-primary-luxury tracking-widest text-uppercase fw-bold mb-2">Lựa Chọn Di Sản</h6>
          <h3 class="font-serif fw-bold text-dark mb-5 display-6">Danh Mục Trang Sức</h3>
          
          <div class="row g-4 justify-content-center">
            <div v-for="cat in data.categories" :key="cat.id" class="col-6 col-md-4 col-lg-2">
              <router-link :to="`/category/${cat.id}`" class="text-decoration-none group d-block">
                <div class="ratio ratio-1x1 overflow-hidden mx-auto mb-3 border border-1 border-secondary border-opacity-10 p-1">
                  <img :src="getImageUrl(cat.image)" class="object-fit-cover transition-transform duration-500 group-hover-scale filter-brightness" alt="Category" @error="handleImageError">
                </div>
                <h6 class="text-dark font-serif fw-bold group-hover-text-primary transition-colors fs-5">{{ cat.name }}</h6>
                <div class="divider-gold mx-auto mt-2 scale-0 group-hover-scale-100 transition-transform"></div>
              </router-link>
            </div>
          </div>
        </div>
      </section>

      <section class="brand-story-section py-5" style="background-color: #fcfaf8;">
        <div class="container py-5">
          <div class="row align-items-center g-5">
            <div class="col-lg-6">
              <div class="position-relative p-3">
                <div class="border border-gold position-absolute w-100 h-100 top-0 start-0 translate-middle-x ms-4 mt-4 z-index-1"></div>
                <img src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=800&auto=format&fit=crop" class="w-100 position-relative z-index-2 shadow-sm" alt="Craftsmanship" loading="lazy">
              </div>
            </div>
            <div class="col-lg-6 ps-lg-5">
              <h6 class="text-gold tracking-widest text-uppercase fw-bold mb-2">Nghệ Thuật Chế Tác</h6>
              <h2 class="font-serif fw-bold text-primary-luxury display-5 mb-4">Tinh Hoa Hội Tụ<br>Trong Từng Giọt Vàng</h2>
              <p class="text-dark fw-light mb-4 lh-lg" style="font-size: 1.1rem;">
                Tại SORA, mỗi món trang sức không chỉ là vật trang điểm, mà là một tác phẩm nghệ thuật mang đậm dấu ấn cá nhân. Bằng đôi bàn tay tài hoa của những nghệ nhân kim hoàn hàng đầu, chúng tôi biến những viên đá thô ráp thành biểu tượng của sự sang trọng, quyền quý và trường tồn cùng thời gian.
              </p>
              <router-link to="/about" class="btn btn-outline-primary-luxury px-4 py-3 text-uppercase tracking-widest fw-bold rounded-0 border-2">
                Khám Phá Câu Chuyện
              </router-link>
            </div>
          </div>
        </div>
      </section>

      <section class="products-section py-5 my-3 container bg-white">
        <div class="d-flex justify-content-between align-items-end mb-5 pb-3 border-bottom border-secondary border-opacity-10">
          <div>
            <h6 class="text-primary-luxury tracking-widest text-uppercase fw-bold mb-2">Xu Hướng</h6>
            <h3 class="font-serif fw-bold text-dark mb-0 display-6">Tuyệt Tác Mới Nhất</h3>
          </div>
          <router-link to="/shop" class="btn btn-outline-primary-luxury rounded-0 px-4 py-2 text-uppercase tracking-widest text-sm fw-bold">
            Xem Bộ Sưu Tập
          </router-link>
        </div>

        <div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
          <div class="col" v-for="product in data.products" :key="product.id">
            <div class="luxury-related-card product-card bg-white d-flex flex-column group position-relative overflow-hidden border border-light-subtle h-100 cursor-pointer" @click="goToProductDetail(product.slug)">
              
              <div class="position-relative bg-light text-center border-bottom border-light-subtle sora-img-container" :class="{'has-hover-image': hasHoverImage(product)}">
                
                <button @click.stop="toggleWishlist(product)" class="wishlist-btn position-absolute top-0 end-0 m-3 z-index-2 border-0 bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center" style="width: 38px; height: 38px; z-index: 10;">
                  <i :class="isInWishlist(product.id) ? 'bi bi-suit-heart-fill text-danger' : 'bi bi-suit-heart text-muted hover-text-accent'" class="fs-5 transition-colors" style="margin-top: 2px;"></i>
                </button>

                <div class="position-absolute top-0 start-0 m-3 d-flex flex-column gap-2 z-index-2 pointer-events-none text-start">
                  <span v-if="product.is_new" class="badge bg-white text-dark border border-light-subtle shadow-sm font-oswald tracking-widest px-2 py-1 rounded-0" style="font-size: 0.65rem;">MỚI</span>
                  <span v-if="product.promotional_price" class="badge text-white shadow-sm font-oswald tracking-widest px-2 py-1 rounded-0" style="background-color: var(--color-accent); font-size: 0.65rem;">SALE</span>
                </div>
                
                <div class="ratio ratio-1x1 w-100">
                  <img :src="getImageUrl(product.thumbnail_image)" 
                       :alt="product.name" 
                       class="sora-main-img object-fit-cover w-100 h-100 transition-transform duration-700 group-hover-scale bg-white" 
                       style="object-position: center;" 
                       @error="handleImageError">
                  <img v-if="hasHoverImage(product)"
                       :src="getImageUrl(product.hover_image)" 
                       :alt="product.name + ' hover'" 
                       class="sora-hover-img position-absolute top-0 start-0 w-100 h-100 object-fit-cover transition-transform duration-700 group-hover-scale" 
                       style="object-position: center;">
                </div>
                <div class="theme-bar position-absolute bottom-0 start-0 z-index-2"></div>
              </div>
              
              <div class="position-relative flex-grow-1 bg-white d-flex flex-column">
                <div class="p-4 text-center d-flex flex-column flex-grow-1" style="padding-bottom: 64px !important;">
                  <h6 class="text-dark font-oswald text-uppercase tracking-widest fw-bold mb-2 text-truncate-2 fs-5 lh-base">{{ product.name }}</h6>
                  <p class="font-serif fst-italic text-muted fs-6 mb-3">{{ product.category?.name || 'Trang sức SORA' }}</p>
                  
                  <div class="mt-auto">
                    <div class="d-flex align-items-center justify-content-center gap-3">
                      <p v-if="product.promotional_price" class="text-muted text-decoration-line-through mb-0 fw-light font-serif" style="font-size: 0.95rem;">
                        {{ formatCurrency(product.base_price) }}
                      </p>
                      <span class="text-primary-luxury fw-bold font-serif fs-5">{{ formatCurrency(product.promotional_price || product.base_price) }}</span>
                    </div>
                  </div>
                </div>

                <div class="related-btn-add">
                  <button class="btn luxury-btn-solid w-100 rounded-0 py-3 font-oswald tracking-widest text-uppercase fw-bold shadow-none fs-6" 
                          @click.stop="goToProductDetail(product.slug)">
                    <i class="bi bi-eye me-2"></i> Xem chi tiết
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section class="combo-section py-5 overflow-hidden" style="background-color: #fbf9f6;" v-if="data.combos && data.combos.length > 0">
        <div class="container text-center mb-4">
          <h6 class="text-primary-luxury tracking-widest text-uppercase fw-bold mb-2">Đồng Điệu</h6>
          <h3 class="font-serif fw-bold text-dark display-6 mb-3">Bộ Sưu Tập Giới Hạn</h3>
          <div class="divider-gold mx-auto"></div>
        </div>

        <div class="container-fluid px-0 pb-2 position-relative">
          <swiper
            :key="data.combos.length"
            :modules="swiperModules"
            :grabCursor="true"
            :centeredSlides="true"
            slidesPerView="auto"
            :breakpoints="{
              '320': { spaceBetween: -30 },
              '768': { spaceBetween: -80 },
              '1024': { spaceBetween: -120 }
            }"
            :loop="false"
            :speed="800"
            :autoplay="{ delay: 5000, disableOnInteraction: false }"
            @swiper="onComboSwiperInit"
            @slideChange="onComboSlideChange"
            class="combo-swiper-luxury"
          >
            <swiper-slide v-for="combo in data.combos" :key="combo.id" class="combo-slide-luxury">
              
              <div class="luxury-horizontal-card bg-white d-flex flex-column flex-md-row align-items-center p-4 p-lg-5 mx-auto">
                
                <div class="combo-img-wrapper position-relative flex-shrink-0 mb-4 mb-md-0 mx-auto" style="width: 100%; max-width: 320px;">
                  <div class="position-absolute bg-secondary bg-opacity-10 d-none d-md-block" style="top: 25px; bottom: -25px; left: -25px; right: 25px; z-index: 0;"></div>
                  
                  <router-link :to="'/combos/' + combo.slug" class="d-block position-relative z-index-1 shadow-sm bg-white" style="aspect-ratio: 1/1; padding: 12px;">
                    <img :src="getImageUrl(combo.thumbnail_image || combo.image)" class="w-100 h-100 object-fit-cover" alt="Combo SORA" @error="handleImageError">
                  </router-link>
                </div>

                <div class="combo-content-container flex-grow-1 ps-md-5 ms-md-3 text-start text-center text-md-start">
                  <span class="text-gold tracking-widest text-uppercase mb-2 fw-bold font-oswald d-block" style="font-size: 0.75rem;">Sora Collection</span>
                  
                  <router-link :to="'/combos/' + combo.slug" class="text-decoration-none">
                    <h3 class="font-serif fw-bold text-dark mb-3 hover-text-primary transition-colors fs-2">{{ combo.name }}</h3>
                  </router-link>
                  
                  <div class="divider-gold mb-3 mx-auto mx-md-0" style="width: 40px; height: 2px;"></div>
                  
                  <p class="text-muted fw-light mb-4 text-truncate-3" style="font-size: 1rem; line-height: 1.7;">
                    {{ combo.description || 'Sự kết hợp hoàn mỹ giữa nghệ thuật chế tác kim hoàn đỉnh cao và vẻ đẹp vượt thời gian.' }}
                  </p>

                  <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-3 mb-4">
                    <span class="text-primary-luxury fw-bold fs-3 font-serif">{{ formatCurrency(combo.promotional_price || combo.price) }}</span>
                    <span v-if="combo.base_price || combo.old_price" class="text-muted text-decoration-line-through small fw-light font-serif">{{ formatCurrency(combo.base_price || combo.old_price) }}</span>
                  </div>
                  
                  <router-link :to="'/combos/' + combo.slug" class="btn btn-outline-primary-luxury rounded-0 py-3 px-5 text-uppercase tracking-widest fw-bold font-oswald shadow-none" style="font-size: 0.85rem;">
                    Khám Phá Ngay
                  </router-link>
                </div>
              </div>

            </swiper-slide>
          </swiper>

          <div class="d-flex justify-content-center align-items-center gap-3 mt-2 pb-2">
            <button @click="prevCombo" :disabled="isComboBeginning" class="btn bg-white rounded-circle shadow-sm border border-light-subtle d-flex justify-content-center align-items-center custom-nav-btn" style="width: 48px; height: 48px;">
              <i class="bi bi-chevron-left fs-5"></i>
            </button>
            <button @click="nextCombo" :disabled="isComboEnd" class="btn bg-white rounded-circle shadow-sm border border-light-subtle d-flex justify-content-center align-items-center custom-nav-btn" style="width: 48px; height: 48px;">
              <i class="bi bi-chevron-right fs-5"></i>
            </button>
          </div>
        </div>
      </section>

      <section class="gallery-section py-5 mt-3 mb-4">
        <div class="container text-center mb-5">
          <h6 class="text-primary-luxury tracking-widest text-uppercase fw-bold mb-2">Khoảnh khắc SORA</h6>
          <h2 class="font-serif fw-bold text-dark display-5 mb-3">Chân Dung SORA</h2>
          <p class="text-muted fw-light mx-auto" style="max-width: 600px; font-size: 1rem; line-height: 1.6;">
            Khoảnh khắc rạng ngời của những vị khách quý. SORA tự hào là mảnh ghép hoàn hảo tôn vinh vẻ đẹp độc bản của bạn.
          </p>
        </div>

        <div class="container-fluid px-0 overflow-hidden">
          <div class="sora-marquee-wrapper">
            <div class="sora-marquee-track">
              <div class="sora-marquee-group">
                <div v-for="(img, index) in displayGalleries" :key="'g1-' + index" class="gallery-slide-item">
                  <div class="gallery-img-wrapper position-relative group cursor-pointer bg-light">
                     <img :src="img.image_path ? getImageUrl(img.image_path) : img" class="w-100 object-fit-cover" alt="Sora Customer" @error="handleImageError">
                     <div class="gallery-overlay position-absolute inset-0 d-flex justify-content-center align-items-center opacity-0 transition-all duration-500 z-index-2">
                        <i class="bi bi-instagram text-white fs-1"></i>
                     </div>
                  </div>
                </div>
              </div>
              <div class="sora-marquee-group">
                <div v-for="(img, index) in displayGalleries" :key="'g2-' + index" class="gallery-slide-item">
                  <div class="gallery-img-wrapper position-relative group cursor-pointer bg-light">
                     <img :src="img.image_path ? getImageUrl(img.image_path) : img" class="w-100 object-fit-cover" alt="Sora Customer" @error="handleImageError">
                     <div class="gallery-overlay position-absolute inset-0 d-flex justify-content-center align-items-center opacity-0 transition-all duration-500 z-index-2">
                        <i class="bi bi-instagram text-white fs-1"></i>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="blog-section py-5" style="background-color: #f9f9f9;">
        <div class="container py-4">
          <div class="text-center mb-5">
            <h6 class="text-primary-luxury tracking-widest text-uppercase fw-bold mb-2">Cẩm Nang</h6>
            <h3 class="font-serif fw-bold text-dark mb-3 display-6">Kiến Thức Trang Sức</h3>
            <div class="divider-gold mx-auto"></div>
          </div>
          
          <div class="row g-4" v-if="data.news && data.news.length > 0">
            <div class="col-md-4" v-for="article in data.news.slice(0, 3)" :key="article.id">
              <div class="blog-card group cursor-pointer bg-white p-3 shadow-sm border border-light h-100 d-flex flex-column" @click="router.push(`/tin-tuc/${article.slug}`)">
                <div class="ratio ratio-4x3 overflow-hidden mb-3">
                  <img :src="getImageUrl(article.image_url)" loading="lazy" class="object-fit-cover transition-transform duration-700 group-hover-scale" :alt="article.title" @error="handleImageError">
                </div>
                <small class="text-gold tracking-widest text-uppercase fw-bold" style="font-style: italic;">{{ article.category || 'Mới Nhất' }}</small>
                <h4 class="font-serif fw-bold text-primary-luxury mt-2 group-hover-text-accent transition-colors" style="line-height: 1.4;">
                  {{ article.title }}
                </h4>
                <p class="text-dark fw-light mt-2 mb-0 text-truncate-3" style="font-size: 0.9rem;">
                  {{ article.excerpt || (article.content ? article.content.replace(/(<([^>]+)>)/gi, "").substring(0, 100) + '...' : 'Khám phá những bí quyết độc quyền từ chuyên gia kim hoàn SORA...') }}
                </p>
              </div>
            </div>
          </div>

          <div v-else class="text-center text-muted fst-italic">
            Chưa có bài viết nào được xuất bản.
          </div>
        </div>
      </section>

      <section class="membership-banner py-5 position-relative" style="background-color: var(--color-primary);">
        <div class="container position-relative z-index-2 py-5 text-center">
          <i class="bi bi-gem text-gold display-4 mb-3"></i>
          <h2 class="font-serif fw-bold text-gold display-5 mb-4">SORA Privilege Club</h2>
          <p class="lead fw-light text-white opacity-100 max-w-600 mx-auto mb-5">Đăng ký thành viên để tận hưởng đặc quyền chăm sóc trang sức trọn đời và chiết khấu VIP dành riêng cho bạn.</p>
          
          <div class="row justify-content-center g-4 mb-5">
            <div class="col-md-3" v-for="tier in data.tiers" :key="tier.id">
              <div class="p-4 border border-gold rounded-0 bg-dark h-100 shadow-lg transition-transform hover-translate-up" style="background-color: #111 !important;">
                <h5 class="text-gold font-serif fw-bold display-6 mb-3">{{ tier.name }}</h5>
                <div class="divider-gold mx-auto mb-3" style="width: 30px; height: 1px;"></div>
                <ul class="list-unstyled text-center small mb-0 text-white opacity-100 lh-lg">
                  <li>Chiết khấu đặc quyền {{ tier.discount_percent }}%</li>
                  <li>{{ tier.yearly_service_quota }} lần Spa miễn phí/năm</li>
                  <li>Ưu tiên nhận BST mới</li>
                </ul>
              </div>
            </div>
          </div>
          <router-link to="/register" class="btn btn-gold btn-lg px-5 py-3 text-uppercase tracking-widest fw-bold rounded-0 shadow-lg">
            Tạo Tài Khoản Ngay
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const swiperModules = [Pagination, Navigation, Autoplay];
const isLoading = ref(true);
const router = useRouter();

const comboSwiperRef = ref(null);
const isComboBeginning = ref(true);
const isComboEnd = ref(false);

const onComboSwiperInit = (swiper) => {
  comboSwiperRef.value = swiper;
  isComboBeginning.value = swiper.isBeginning;
  isComboEnd.value = swiper.isEnd;
};

const onComboSlideChange = (swiper) => {
  isComboBeginning.value = swiper.isBeginning;
  isComboEnd.value = swiper.isEnd;
};

const nextCombo = () => {
  if (comboSwiperRef.value) comboSwiperRef.value.slideNext();
};

const prevCombo = () => {
  if (comboSwiperRef.value) comboSwiperRef.value.slidePrev();
};

const wishlistIds = ref([]);

const data = reactive({
  banners: [],
  coupons: [],
  categories: [],
  products: [],
  combos: [],
  tiers: [],
  galleries: [],
  news: [] 
});

const dummyGalleries = [
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1543269664-56d93c1b41a6?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=600'
];

const displayGalleries = computed(() => {
  let baseArray = (data.galleries && data.galleries.length > 0) ? data.galleries : dummyGalleries;
  let arr = [...baseArray];
  while (arr.length < 10) {
    arr = [...arr, ...baseArray];
  }
  return arr;
});

const API_BASE = import.meta.env.VITE_API_BASE_URL; 

const soraPlaceholder = '/Sora-placeholder.png';

// ĐÃ SỬA: Hàm getImageUrl dùng Regex cạo sạch url rác
const getImageUrl = (path) => {
  if (!path) return soraPlaceholder;
  if (path.startsWith('http')) return path;

  // 1. Dọn dẹp URL Backend (Cắt bỏ /api)
  const baseUrl = API_BASE.replace(/\/api\/?$/, '');

  // 2. Cạo sạch các phần thừa ở đầu chuỗi (Dấu /, chữ public, chữ storage)
  let cleanPath = path;
  cleanPath = cleanPath.replace(/^\/+/, '');         // Xóa mọi dấu / ở đầu
  cleanPath = cleanPath.replace(/^public\//, '');    // Xóa chữ public/ nếu có
  cleanPath = cleanPath.replace(/^storage\//, '');   // Xóa chữ storage/ nếu có
  cleanPath = cleanPath.replace(/^\/+/, '');         // Xóa dấu / một lần nữa cho chắc ăn

  // 3. Nối lại thành 1 đường link hoàn hảo duy nhất
  return `${baseUrl}/storage/${cleanPath}`;
};

const handleImageError = (e) => { 
  e.target.onerror = null; 
  e.target.src = soraPlaceholder; 
};

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
const formatShortCurrency = (value) => {
  if (value >= 1000000) return (value / 1000000) + 'Tr';
  if (value >= 1000) return (value / 1000) + 'K';
  return value;
};
const hasHoverImage = (product) => product.hover_image && product.hover_image !== product.thumbnail_image;

const goToProductDetail = (slug) => {
  if (slug) router.push(`/shop/sora/product/${slug}`);
};

const loadWishlist = () => {
  const stored = localStorage.getItem('sora_wishlist');
  if (stored) wishlistIds.value = JSON.parse(stored);
};

const isInWishlist = (productId) => wishlistIds.value.includes(productId);

const toggleWishlist = (product) => {
  const index = wishlistIds.value.indexOf(product.id);
  if (index === -1) {
    wishlistIds.value.push(product.id);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã thêm vào danh sách yêu thích!', showConfirmButton: false, timer: 2000 });
  } else {
    wishlistIds.value.splice(index, 1);
    Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Đã bỏ khỏi danh sách yêu thích', showConfirmButton: false, timer: 2000 });
  }
  localStorage.setItem('sora_wishlist', JSON.stringify(wishlistIds.value));
};

const fetchHomepageData = async () => {
  try {
    const response = await fetch(`${API_BASE}/client/home-data`, {
      headers: { 'Accept': 'application/json' }
    });
    
    const result = await response.json();

    if (result.success) {
      data.banners = result.data.banners || [];
      data.coupons = result.data.coupons || [];
      data.categories = result.data.categories || [];
      data.products = result.data.products || [];
      data.combos = result.data.combos || [];
      data.tiers = result.data.tiers || [];
      if(result.data.galleries) data.galleries = result.data.galleries;

      data.news = result.data.news || [];
    }
  } catch (error) {
    console.error("Lỗi tải trang chủ:", error);
  } finally {
    isLoading.value = false;
  }
};

const saveCoupon = (code) => {
  Swal.fire({
    icon: 'success',
    title: 'Lưu mã thành công!',
    text: `Mã ${code} đã được thêm vào ví voucher của bạn.`,
    confirmButtonColor: '#9f273b'
  });
};

onMounted(() => {
  fetchHomepageData();
  loadWishlist(); 
});
</script>

<style>
:root {
  --color-primary: #9f273b; 
  --color-gold: #e7ce7d;    
  --color-accent: #cc1e2e;  
  --sora-primary: #9f273b;
  --sora-secondary: #e7ce7d;
  --sora-accent: #cc1e2e;
}
</style>
<style scoped>


@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&family=Oswald:wght@400;500;600;700&display=swap');

.font-luxury { font-family: 'Montserrat', sans-serif; }
.font-serif { font-family: 'Playfair Display', serif; }
.font-oswald { font-family: 'Oswald', sans-serif; }

.tracking-widest { letter-spacing: 0.15em; }
.text-truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.text-truncate-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.z-index-1 { z-index: 1; }
.z-index-2 { z-index: 2; }
.z-index-max { z-index: 9999; }
.inset-0 { inset: 0; }
.cursor-pointer { cursor: pointer; }

.text-gold { color: #e7ce7d !important; }
.text-primary-luxury { color: #9f273b !important; }
.text-sora-primary { color: #9f273b !important; }
.bg-primary-luxury { background-color: #9f273b !important; }
.bg-accent-red { background-color: #cc1e2e !important; color: white; }
.border-gold { border-color: #e7ce7d !important; }
.divider-gold { width: 40px; height: 2px; background-color: #e7ce7d; }

/* Buttons General */
.btn-primary-luxury { background-color: #9f273b; color: #fff; border: 1px solid #9f273b; transition: all 0.3s; }
.btn-primary-luxury:hover { background-color: #111; border-color: #111; color: #fff; }
.btn-outline-primary-luxury { background-color: transparent; color: #9f273b; border: 1px solid #9f273b; transition: all 0.3s; }
.btn-outline-primary-luxury:hover { background-color: #9f273b; color: #fff; }
.btn-outline-gold { background-color: transparent; color: #e7ce7d; border: 1px solid #e7ce7d; transition: all 0.3s; }
.btn-outline-gold:hover { background-color: #e7ce7d; color: #111; border-color: #e7ce7d; }
.btn-gold { background-color: #e7ce7d; color: #111; border: 1px solid #e7ce7d; transition: all 0.3s; }
.btn-gold:hover { background-color: #d1b764; border-color: #d1b764; color: #000; transform: translateY(-2px); }
.hover-gold-btn:hover { background-color: #e7ce7d !important; border-color: #e7ce7d !important; color: #111 !important; }

/* Hero Section */
.hero-carousel { height: 85vh; min-height: 600px; background: #111; }
.hero-img { height: 85vh; min-height: 600px; opacity: 0.6; }
.carousel-overlay { position: absolute; inset: 0; background: radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%); }
.shadow-text { text-shadow: 2px 2px 8px rgba(0,0,0,0.7); }

/* Coupons */
.coupon-scroll-container { overflow-x: auto; scrollbar-width: none; }
.coupon-scroll-container::-webkit-scrollbar { display: none; }
.coupon-card { width: 320px; }
.border-end-dashed { border-right: 1px dashed rgba(255,255,255,0.3); }

/* Global Utilities */
.group:hover .group-hover-scale { transform: scale(1.05); }
.group:hover .group-hover-text-primary { color: #9f273b !important; }
.group:hover .group-hover-text-accent { color: #cc1e2e !important; }
.scale-0 { transform: scaleX(0); }
.group:hover .group-hover-scale-100 { transform: scaleX(1); }
.transition-colors { transition: background-color 0.5s ease, color 0.5s ease; }
.transition-transform { transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1); }
.hover-translate-up:hover { transform: translateY(-10px); }
.filter-brightness { filter: brightness(0.95); transition: filter 0.5s; }
.group:hover .filter-brightness { filter: brightness(1); }
.opacity-0 { opacity: 0; }
.group:hover .group-hover-opacity-100 { opacity: 1 !important; }
.transition-all { transition: all 0.4s ease; }
.hover-text-primary:hover { color: #9f273b !important; }

/* ========================================== */
/* PRODUCT CARD                               */
/* ========================================== */
.luxury-related-card { transition: all 0.4s ease; border-color: #eaeaea !important; }
.luxury-related-card:hover { box-shadow: 0 15px 35px rgba(0,0,0,0.06); border-color: #d1d5db !important; }

.sora-main-img, .sora-hover-img { transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1), opacity 0.6s ease; }
.sora-main-img { z-index: 1; }
.sora-hover-img { z-index: 2; opacity: 0; }
.group:hover .sora-img-container.has-hover-image .sora-main-img { opacity: 0; }
.group:hover .sora-img-container.has-hover-image .sora-hover-img { opacity: 1; }
.group:hover .sora-main-img, .group:hover .sora-hover-img { transform: scale(1.08); }

.theme-bar { width: 30%; height: 3px; background-color: var(--sora-primary); opacity: 0; transition: opacity 0.3s ease; left: 0; }
.luxury-related-card:hover .theme-bar { opacity: 1; }

.related-btn-add {
  position: absolute; bottom: 0; left: 0; width: 100%;
  transform: translateY(101%); transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  z-index: 10; background: rgb(112, 21, 21);
}
.group:hover .related-btn-add, .luxury-related-card:hover .related-btn-add { transform: translateY(0); }

.luxury-btn-solid { background-color: var(--sora-primary); color: white; border: 1px solid var(--sora-primary); transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); }
.luxury-btn-solid:hover:not(:disabled) { background-color: #7a1c2d; border-color: #7a1c2d; color: white; box-shadow: 0 8px 20px rgba(159,39,59,0.3); transform: translateY(-2px); }

.wishlist-btn { transition: all 0.3s ease; }
.wishlist-btn:hover { transform: scale(1.1); }
.text-danger { color: var(--color-accent) !important; }

/* ========================================== */
/* BỘ SƯU TẬP GIỚI HẠN                        */
/* ========================================== */
.combo-section { background-color: #fbf9f6; }
.combo-swiper-luxury { padding: 40px 0 60px 0; overflow: hidden; } 
.combo-slide-luxury { 
  width: 90%; 
  max-width: 850px; 
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1); 
  opacity: 0.4; 
  transform: scale(0.85); 
  z-index: 1;
  position: relative;
}
.combo-slide-luxury.swiper-slide-active { 
  opacity: 1; 
  transform: scale(1); 
  z-index: 10;
}
.combo-slide-luxury.swiper-slide-prev,
.combo-slide-luxury.swiper-slide-next {
  z-index: 5;
}

.luxury-horizontal-card { 
  border-radius: 6px; 
  border: 1px solid rgba(0,0,0,0.03); 
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
}
.combo-slide-luxury.swiper-slide-active .luxury-horizontal-card { 
  box-shadow: 0 25px 50px rgba(0,0,0,0.1) !important; 
}

.combo-img-wrapper { z-index: 2; }
.combo-content-container { z-index: 3; position: relative; }

.custom-nav-btn {
  color: #333;
  transition: all 0.3s ease;
}
.custom-nav-btn:hover:not(:disabled) {
  background-color: var(--color-primary) !important;
  color: white !important;
  border-color: var(--color-primary) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(159, 39, 59, 0.2) !important;
}
.custom-nav-btn:disabled {
  opacity: 0.35 !important;
  cursor: not-allowed;
  background-color: #f8f9fa !important;
  border-color: #dee2e6 !important;
  color: #adb5bd !important;
  box-shadow: none !important;
}

/* ========================================== */
/* CHÂN DUNG SORA                             */
/* ========================================== */
.sora-marquee-wrapper {
  display: flex;
  overflow: hidden;
  width: 100%;
}

.sora-marquee-track {
  display: flex;
  width: max-content;
  animation: soraMarquee 30s linear infinite;
}

.sora-marquee-track:hover {
  animation-play-state: paused; 
}

.sora-marquee-group {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.gallery-slide-item {
  width: 50vw; 
  flex-shrink: 0;
  padding: 0;
}

@media (min-width: 576px) { .gallery-slide-item { width: 33.333vw; } }
@media (min-width: 768px) { .gallery-slide-item { width: 25vw; } }
@media (min-width: 1024px) { .gallery-slide-item { width: 20vw; } }
@media (min-width: 1400px) { .gallery-slide-item { width: 16.666vw; } }

@keyframes soraMarquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); } 
}

.gallery-img-wrapper { width: 100%; overflow: hidden; }
.gallery-slide-item:nth-child(odd) .gallery-img-wrapper { height: 320px; }
.gallery-slide-item:nth-child(even) .gallery-img-wrapper { height: 450px; }
.gallery-img-wrapper img { height: 100%; transition: transform 0.8s ease; }
.gallery-img-wrapper:hover img { transform: scale(1.08); }
.gallery-overlay { background: rgba(159, 39, 59, 0.6); }
.gallery-img-wrapper:hover .gallery-overlay { opacity: 1 !important; }

@media (max-width: 768px) {
  .gallery-slide-item:nth-child(odd) .gallery-img-wrapper { height: 220px; }
  .gallery-slide-item:nth-child(even) .gallery-img-wrapper { height: 300px; }
}
</style>