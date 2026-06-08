<template>
  <div class="sora-home font-luxury">
    <Transition name="home-logo-loader">
      <div v-if="showHomeLogoLoader"
        class="home-logo-loader vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
        <div class="logo-pulse-wrapper mb-4">
          <img src="@/assets/images/icon-logo.png" alt="SORA Logo" class="logo-pulse-img">
        </div>
      </div>
    </Transition>

    <div class="home-page-content" :class="{ 'home-page-content-loading': showHomeLogoLoader }">
      <section class="home-hero">
        <div v-if="showHeroSkeleton" class="hero-loading-layer d-flex align-items-center justify-content-center">
          <div class="hero-loading-content text-center position-relative z-index-2">
            <div class="hero-loading-brand font-serif fw-bold mb-3">SORA</div>
            <div class="hero-loading-line mx-auto mb-3"></div>
            <p class="font-oswald tracking-widest text-uppercase mb-0">Đang chuẩn bị không gian mua sắm</p>
          </div>
        </div>

        <div v-if="heroBanners.length > 0" id="homeEditorialCarousel"
          class="home-hero-media carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="6000"
          data-bs-touch="true">
          <div class="carousel-inner h-100">
            <div v-for="(banner, index) in heroBanners" :key="banner.id || index" class="carousel-item h-100"
              :class="{ active: index === 0 }">
              <picture>
                <source v-if="banner.image_mobile" media="(max-width: 767px)"
                  :srcset="getImageUrl(banner.image_mobile)">
                <img :src="getImageUrl(banner.image_desktop || banner.image_mobile)" :alt="banner.title || 'SORA hero'"
                  :class="{ 'hero-img-visible': index !== 0 || isHeroImageReady }" decoding="async"
                  :loading="index === 0 ? 'eager' : 'lazy'" :fetchpriority="index === 0 ? 'high' : 'auto'"
                  @load="markHeroImageReady(index)" @error="handleHeroImageError($event, index)">
              </picture>

              <div class="home-hero-shade"></div>
              <div
                class="w-100 h-100 position-absolute top-0 start-0 d-flex flex-column align-items-center justify-content-center z-index-2">
                <div class="home-hero-copy text-center">
                  <span class="section-kicker text-gold">Trang Sức Cao Cấp SORA</span>
                  <h1 class="font-serif" v-html="formatBannerTitle(banner.title)"></h1>
                  <p>Những thiết kế trang sức tinh tế, tôn vinh vẻ đẹp riêng trong mọi khoảnh khắc.</p>
                  <a v-if="banner.target_url" :href="banner.target_url" class="editorial-btn text-decoration-none">Khám
                    phá ngay</a>
                  <router-link v-else :to="{ name: 'shop' }" class="editorial-btn text-decoration-none">Khám phá bộ sưu
                    tập</router-link>
                </div>
              </div>
            </div>
          </div>
          <button v-if="heroBanners.length > 1" class="carousel-control-prev home-hero-control" type="button"
            data-bs-target="#homeEditorialCarousel" data-bs-slide="prev">
            <i class="bi bi-chevron-left"></i>
          </button>
          <button v-if="heroBanners.length > 1" class="carousel-control-next home-hero-control" type="button"
            data-bs-target="#homeEditorialCarousel" data-bs-slide="next">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
        <div class="home-hero-media" v-else-if="heroImage">
          <img :src="getImageUrl(heroImage)" alt="SORA hero" :class="{ 'hero-img-visible': isHeroImageReady }"
            decoding="async" loading="eager" fetchpriority="high" @load="markHeroImageReady(0)"
            @error="handleHeroImageError($event, 0)">
          <div class="home-hero-shade"></div>
          <div
            class="w-100 h-100 position-absolute top-0 start-0 d-flex flex-column align-items-center justify-content-center z-index-2">
            <div class="home-hero-copy text-center">
              <span class="section-kicker text-gold">Trang Sức Cao Cấp SORA</span>
              <h1 class="font-serif">Tỏa Sáng Cùng<br>Vẻ Đẹp Đích Thực</h1>
              <p>Những thiết kế trang sức tinh tế, tôn vinh vẻ đẹp riêng trong mọi khoảnh khắc.</p>
              <router-link :to="{ name: 'shop' }" class="editorial-btn text-decoration-none">Khám phá bộ sưu
                tập</router-link>
            </div>
          </div>
        </div>
        <div v-else class="home-hero-empty w-100 h-100 d-flex align-items-center justify-content-center">
          <span class="font-serif">SORA</span>
        </div>

        <div class="hero-side-card hero-card-left d-none d-lg-block" v-if="secondaryImages[0]">
          <img :src="getImageUrl(secondaryImages[0])" alt="SORA detail" @error="handleImageError">
          <span>Chi tiết mang dấu ấn</span>
        </div>
        <div class="hero-side-card hero-card-right d-none d-lg-block" v-if="secondaryImages[1]">
          <img :src="getImageUrl(secondaryImages[1])" alt="SORA edit" @error="handleImageError">
          <span>Tuyển tập tinh hoa</span>
        </div>
      </section>

      <section class="home-stats-band">
        <div class="stat-item" v-for="item in homeStats" :key="item.value">
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </div>
      </section>

      <section class="editorial-section story-section">
        <div class="container">
          <div class="story-grid">
            <div class="story-image" v-if="storyImage">
              <img :src="getImageUrl(storyImage)" alt="SORA story" @error="handleImageError">
            </div>
            <div class="story-copy">
              <span class="section-kicker">Di sản SORA</span>
              <h2 class="font-serif">Nơi nghệ thuật hội tụ cùng sự thanh lịch.</h2>
              <p>SORA tạo nên những món trang sức có khả năng đồng hành cùng kỷ niệm, phong cách và dấu ấn cá nhân của
                mỗi khách hàng.</p>
              <router-link :to="{ name: 'about' }" class="editorial-btn text-decoration-none">Câu chuyện thương
                hiệu</router-link>
              <div class="story-thumb" v-if="storyAccentImage">
                <img :src="getImageUrl(storyAccentImage)" alt="SORA accent" @error="handleImageError">
              </div>
            </div>
            <div class="story-watermark font-serif">SORA</div>
          </div>
        </div>
      </section>

      <section class="editorial-section products-editorial" v-if="featuredProducts.length > 0">
        <div class="container products-container">
          <div class="section-heading text-center">
            <span class="section-kicker">Tác Phẩm Nổi Bật</span>
            <h2 class="font-serif">Tuyệt tác vượt thời gian cho mọi khoảnh khắc</h2>
          </div>

          <div class="editorial-products-grid">
            <ProductCard v-for="product in featuredProducts" :key="product.id" :product="product"
              :is-in-wishlist="isInWishlist(product.id)" :show-wishlist="true" :show-add-to-cart="true"
              :show-compare="true" :hover-add-to-cart="true" shop-slug="sora" @toggle-wishlist="toggleWishlist" />
          </div>

          <div class="text-center mt-5 pt-2">
            <router-link :to="{ name: 'shop' }" class="editorial-btn text-decoration-none">Khám phá tất cả tác
              phẩm</router-link>
          </div>
        </div>
      </section>

      <section class="editorial-section craft-section">
        <div class="container">
          <div class="craft-grid">
            <div class="craft-copy">
              <span class="section-kicker">Nghệ thuật chế tác</span>
              <h2 class="font-serif">Kiến tạo vẻ đẹp, chất lượng và niềm tin tuyệt đối.</h2>
              <div class="craft-line" v-for="item in craftItems" :key="item.title">
                <h3>{{ item.title }}</h3>
                <p>{{ item.text }}</p>
              </div>
            </div>
            <div class="craft-image" v-if="craftImage">
              <img :src="getImageUrl(craftImage)" alt="SORA craftsmanship" @error="handleImageError">
            </div>
            <div class="craft-image craft-image-low" v-if="craftAccentImage">
              <img :src="getImageUrl(craftAccentImage)" alt="SORA jewelry care" @error="handleImageError">
            </div>
            <div class="craft-card">
              <h3 class="font-serif">Thiết kế thanh lịch, chế tác tận tâm.</h3>
              <p>Mỗi sản phẩm được lựa chọn và trình bày với tinh thần tối giản, sang trọng và bền vững.</p>
              <router-link :to="{ name: 'services' }" class="editorial-btn text-decoration-none">Dịch vụ của chúng
                tôi</router-link>
            </div>
          </div>
        </div>
      </section>

      <section class="dark-expertise-section">
        <div class="container">
          <div class="section-heading text-center text-white">
            <span class="section-kicker text-gold">Dịch vụ Đặc Quyền SORA</span>
            <h2 class="font-serif">Sự chăm sóc tận tâm và chuyên môn cho mọi nhu cầu</h2>
          </div>
          <div class="expertise-grid">
            <div class="expertise-card" v-for="service in serviceCards" :key="service.title">
              <i :class="service.icon"></i>
              <h3>{{ service.title }}</h3>
              <p>{{ service.text }}</p>
            </div>
          </div>
          <div class="text-center mt-4 pt-3">
            <router-link :to="{ name: 'services' }"
              class="text-gold font-oswald text-uppercase text-decoration-none hover-shine-text">Khám phá tất cả dịch
              vụ</router-link>
          </div>
        </div>
      </section>

      <section class="editorial-section gallery-editorial" v-if="galleryDisplayImages.length > 0">
        <div class="container narrow-container">
          <div class="section-heading text-center">
            <span class="section-kicker">Khoảnh Khắc Khách Hàng</span>
            <h2 class="font-serif">Khám phá lý do khách hàng luôn tin chọn SORA.</h2>
          </div>

          <div class="testimonial-grid">
            <div class="testimonial-tile" v-for="(img, index) in galleryDisplayImages" :key="'gallery-' + index">
              <img v-if="index % 2 === 0" :src="getImageUrl(img)" alt="SORA customer" @error="handleImageError">
              <div v-else class="testimonial-copy d-flex flex-column justify-content-center">
                <div class="stars">★★★★★</div>
                <h3>{{ testimonialTitles[index % testimonialTitles.length] }}</h3>
                <p>Trải nghiệm SORA được chăm chút từ thiết kế, chất liệu đến dịch vụ hậu mãi.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="editorial-section news-editorial" v-if="data.news && data.news.length > 0">
        <div class="container">
          <div class="news-heading">
            <div>
              <span class="section-kicker">Tạp Chí SORA</span>
              <h2 class="font-serif">Kiến thức & Cảm hứng trang sức</h2>
            </div>
            <router-link :to="{ name: 'news' }" class="editorial-btn text-decoration-none">Xem tạp chí</router-link>
          </div>

          <div class="news-grid">
            <NewsPostCard v-for="article in data.news.slice(0, 3)" :key="article.id" :post="article" />
          </div>
        </div>
      </section>

      <section class="bottom-cta" v-if="bottomCtaImage">
        <img :src="getImageUrl(bottomCtaImage)" alt="SORA radiance" @error="handleImageError">
        <div class="bottom-cta-overlay"></div>
        <div class="bottom-cta-copy">
          <span class="section-kicker text-gold">Tuyển chọn từ SORA</span>
          <h2 class="font-serif">Vẻ Đẹp Rạng Ngời<br>Đích Thực</h2>
          <p>Chọn món trang sức dành riêng cho phong cách của bạn.</p>
          <router-link :to="{ name: 'shop' }" class="editorial-btn text-decoration-none">Mua sắm ngay</router-link>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref, computed, watch } from 'vue';
import Toast from '@/utils/toastConfig';
import soraAlert from '@/utils/soraAlertConfig';
import ProductCard from '@/components/ui/ProductCard.vue';
import NewsPostCard from '@/components/ui/NewsPostCard.vue';

const HOME_INTRO_SESSION_KEY = 'sora_home_intro_seen';
const navigationEntry = performance.getEntriesByType('navigation')[0];
const isHardReload = navigationEntry?.type === 'reload';
const isLoading = ref(true);
const shouldShowHomeIntro = ref(isHardReload || sessionStorage.getItem(HOME_INTRO_SESSION_KEY) !== '1');
const isLogoLoaderMinTimeDone = ref(!shouldShowHomeIntro.value);
const isHeroImageReady = ref(false);
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

const homeStats = [
  { value: '90%', label: 'Khách hàng hài lòng' },
  { value: '15+', label: 'Bộ sưu tập nổi bật' },
  { value: '3K+', label: 'Khoảnh khắc SORA' }
];

const craftItems = [
  { title: 'Chế tác thủ công tinh xảo', text: 'Thiết kế được chăm chút trong từng đường nét và tỷ lệ.' },
  { title: 'Chất liệu thượng hạng', text: 'Lựa chọn chất liệu phù hợp với vẻ đẹp bền vững.' },
  { title: 'Thiết kế vượt thời gian', text: 'Phong cách thanh lịch, dễ đồng hành trong nhiều dịp.' }
];

const serviceCards = [
  { icon: 'bi bi-gem', title: 'Chăm sóc trang sức trọn đời', text: 'Hỗ trợ chăm sóc và làm mới trang sức SORA.' },
  { icon: 'bi bi-stars', title: 'Tư vấn định hình phong cách', text: 'Tư vấn lựa chọn thiết kế phù hợp với phong cách.' },
  { icon: 'bi bi-shield-check', title: 'Bảo đảm độ tin cậy', text: 'Cam kết thông tin rõ ràng và dịch vụ hậu mãi.' }
];

const testimonialTitles = ['Trải nghiệm tuyệt vời', 'Hoàn hảo cho mỗi ngày', 'Dịch vụ chu đáo'];

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/api\/?$/, '');
const soraPlaceholder = '/Sora-placeholder.png';

const getImageUrl = (path) => {
  if (!path) return soraPlaceholder;
  if (typeof path !== 'string') return soraPlaceholder;
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  let cleanPath = path.replace(/^\/+/, '').replace(/^public\//, '').replace(/^storage\//, '').replace(/^\/+/, '');
  return `${API_BASE}/storage/${cleanPath}`;
};

const formatBannerTitle = (title) => {
  if (!title) return 'Tỏa Sáng Cùng<br>Vẻ Đẹp Đích Thực';
  return title.replace(/\n/g, '<br>');
};

const imagePool = computed(() => {
  const bannerImages = data.banners.flatMap((banner) => [banner.image_desktop, banner.image_mobile]);
  const productImages = data.products.map((product) => product.thumbnail_image);
  const galleryImages = data.galleries.map((item) => item.image_path || item.image);
  const newsImages = data.news.map((article) => article.image_url || article.image);
  const comboImages = data.combos.map((combo) => combo.thumbnail_image || combo.image);
  return [...bannerImages, ...galleryImages, ...productImages, ...comboImages, ...newsImages].filter(Boolean);
});

const heroBanners = computed(() => data.banners.filter((banner) => banner?.image_desktop || banner?.image_mobile));
const heroImage = computed(() => {
  const firstBanner = heroBanners.value[0];
  return firstBanner?.image_desktop || firstBanner?.image_mobile || imagePool.value[0] || null;
});
const secondaryImages = computed(() => imagePool.value.filter((img) => img && img !== heroImage.value).slice(0, 6));
const storyImage = computed(() => secondaryImages.value[0] || heroImage.value);
const storyAccentImage = computed(() => secondaryImages.value[1] || null);
const craftImage = computed(() => secondaryImages.value[2] || storyImage.value);
const craftAccentImage = computed(() => secondaryImages.value[3] || storyAccentImage.value);
const bottomCtaImage = computed(() => data.banners[1]?.image_desktop || data.banners[1]?.image_mobile || secondaryImages.value[4] || heroImage.value);

// Sửa giới hạn 6 thành 8 sản phẩm
const featuredProducts = computed(() => data.products.slice(0, 8));

const galleryDisplayImages = computed(() => {
  const galleryImages = data.galleries.map((item) => item.image_path || item.image).filter(Boolean);
  if (galleryImages.length > 0) return galleryImages.slice(0, 6);
  return data.products.map((product) => product.thumbnail_image).filter(Boolean).slice(0, 6);
});

const showHeroSkeleton = computed(() => isLoading.value || (heroImage.value && !isHeroImageReady.value));
const isHomeReady = computed(() => !isLoading.value && (!heroImage.value || isHeroImageReady.value));
const showHomeLogoLoader = computed(() => shouldShowHomeIntro.value && (!isHomeReady.value || !isLogoLoaderMinTimeDone.value));

watch(showHomeLogoLoader, (isShown) => {
  if (!isShown && shouldShowHomeIntro.value && isHomeReady.value && isLogoLoaderMinTimeDone.value) {
    sessionStorage.setItem(HOME_INTRO_SESSION_KEY, '1');
    shouldShowHomeIntro.value = false;
  }
});

const handleImageError = (event) => {
  event.target.onerror = null;
  event.target.src = soraPlaceholder;
};

const markHeroImageReady = (index = 0) => {
  if (index === 0) {
    isHeroImageReady.value = true;
  }
};

const handleHeroImageError = (event, index = 0) => {
  handleImageError(event);
  markHeroImageReady(index);
};

const getToken = () => {
  return localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('userToken') || localStorage.getItem('user_token') || null;
};

const isInWishlist = (productId) => wishlistIds.value.includes(productId);

const showWishlistNotification = (isAdded) => {
  Toast.fire({
    icon: isAdded ? 'success' : 'info',
    title: isAdded ? 'Đã thêm vào danh sách yêu thích!' : 'Đã xóa khỏi danh sách yêu thích!'
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
    const response = await fetch(`${API_BASE}/api/client/favourites`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
    const result = await response.json();
    if (response.ok && result.status && Array.isArray(result.data)) {
      wishlistIds.value = result.data.map((item) => item.product?.id).filter(Boolean);
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
    const response = await fetch(`${API_BASE}/api/client/favourites/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ product_id: product.id })
    });
    const result = await response.json();
    if (!response.ok || !result.status) throw new Error(result.message || 'Không thể cập nhật danh sách yêu thích.');

    const isAdded = result.action === 'added';
    if (isAdded && !wishlistIds.value.includes(product.id)) {
      wishlistIds.value.push(product.id);
    } else if (!isAdded) {
      wishlistIds.value = wishlistIds.value.filter((id) => id !== product.id);
    }
    showWishlistNotification(isAdded);
  } catch (error) {
    if (error?.response?.status === 401) {
      soraAlert.fire({ icon: 'warning', title: 'Vui lòng đăng nhập để sử dụng chức năng yêu thích.' });
      return;
    }
    soraAlert.fire({ icon: 'error', title: 'Không thể cập nhật danh sách yêu thích', text: error.message || 'Xin vui lòng thử lại sau.' });
  }
};

const fetchHomepageData = async () => {
  isLoading.value = true;
  isHeroImageReady.value = false;

  try {
    const response = await fetch(`${API_BASE}/api/client/home-data`, { headers: { Accept: 'application/json' } });
    const result = await response.json();
    if (result.success) {
      data.banners = result.data.banners || [];
      data.coupons = result.data.coupons || [];
      data.categories = result.data.categories || [];
      data.products = result.data.products || [];
      data.combos = result.data.combos || [];
      data.tiers = result.data.tiers || [];
      data.galleries = result.data.galleries || [];
      data.news = result.data.news || [];
    }
  } catch (error) {
    soraAlert.fire({ icon: 'error', title: 'Không thể tải dữ liệu trang chủ' });
  } finally {
    isLoading.value = false;
  }
};

const saveCoupon = (code) => {
  Toast.fire({
    icon: 'success',
    title: 'Lưu mã thành công!',
    text: `Mã ${code} đã được thêm vào ví voucher của bạn.`
  });
};

onMounted(() => {
  if (shouldShowHomeIntro.value) {
    window.setTimeout(() => {
      isLogoLoaderMinTimeDone.value = true;
    }, 1000);
  }
  fetchHomepageData();
  loadWishlist();
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&family=Oswald:wght@400;500;600;700&display=swap');

:root {
  --sora-primary: #9f273b;
  --sora-secondary: #e7ce7d;
  --sora-accent: #cc1e2e;
  --sora-primary-rgb: 159, 39, 59;
  --sora-secondary-rgb: 231, 206, 125;
  --sora-accent-rgb: 204, 30, 46;
}
</style>

<style scoped>
.font-luxury {
  font-family: 'Montserrat', sans-serif;
}

.font-serif {
  font-family: 'Playfair Display', serif;
}

.font-oswald {
  font-family: 'Oswald', sans-serif;
}

.tracking-widest {
  letter-spacing: 0.15em;
}

.text-gold {
  color: var(--sora-secondary) !important;
}

.z-index-2 {
  z-index: 2;
}

.sora-home {
  background: #fffafa;
  color: #3f2026;
  overflow: hidden;
}

.home-logo-loader {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background:
    radial-gradient(circle at 50% 50%, rgba(var(--sora-secondary-rgb), 0.12), transparent 26%),
    #f8f9fa !important;
}

.home-page-content {
  opacity: 1;
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.home-page-content-loading {
  opacity: 0.96;
  transform: scale(0.996);
}

.logo-pulse-wrapper {
  display: inline-block;
}

.logo-pulse-img {
  width: 140px;
  height: auto;
  object-fit: contain;
  animation: luxury-pulse 1.8s infinite alternate ease-in-out;
}

.home-logo-loader-enter-active,
.home-logo-loader-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease, filter 0.5s ease;
}

.home-logo-loader-enter-from,
.home-logo-loader-leave-to {
  opacity: 0;
  transform: scale(1.035);
  filter: blur(8px);
}

@keyframes luxury-pulse {
  0% {
    transform: scale(0.95);
    filter: drop-shadow(0 0 5px rgba(var(--sora-primary-rgb), 0.2)) brightness(1);
  }

  100% {
    transform: scale(1.05);
    filter: drop-shadow(0 0 25px rgba(var(--sora-primary-rgb), 0.8)) brightness(1.15);
  }
}

.home-hero {
  position: relative;
  min-height: 720px;
  background: var(--sora-primary);
  display: grid;
  place-items: center;
  overflow: hidden;
}

.home-hero-media,
.home-hero-empty,
.home-hero-media img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.home-hero-media .carousel-inner,
.home-hero-media .carousel-item,
.home-hero-media picture {
  width: 100%;
  height: 100%;
}

.home-hero-media picture {
  display: block;
}

/* === KEN BURNS ANIMATION LÀM MƯỢT SLIDER === */
.home-hero-media img {
  object-fit: cover;
  object-position: center;
  opacity: 0;
  transform: scale(1.06);
  transition: opacity 0.8s ease-in-out;
}

.home-hero-media .carousel-item.active img.hero-img-visible {
  opacity: 1;
  animation: kenBurnsZoom 6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes kenBurnsZoom {
  0% {
    transform: scale(1.06);
  }

  100% {
    transform: scale(1);
  }
}

.home-hero-control {
  z-index: 4;
  width: 48px;
  height: 48px;
  top: 50%;
  bottom: auto;
  opacity: 1;
  border: 1px solid rgba(var(--sora-secondary-rgb), 0.55);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
  transform: translateY(-50%);
  backdrop-filter: blur(4px);
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.home-hero-control:hover {
  background: var(--sora-primary);
  color: #fff;
  border-color: var(--sora-secondary);
  transform: translateY(-50%) scale(1.1);
  /* Subtle pop on hover */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.home-hero-control.carousel-control-prev {
  left: 2rem;
  right: auto;
}

.home-hero-control.carousel-control-next {
  right: 2rem;
}

.home-hero-empty {
  background:
    radial-gradient(circle at 50% 38%, rgba(var(--sora-secondary-rgb), 0.3), transparent 34%),
    linear-gradient(135deg, var(--sora-primary) 0%, var(--sora-primary) 62%, #12090c 100%);
}

.home-hero-empty span {
  color: rgba(255, 255, 255, 0.12);
  font-size: clamp(6rem, 22vw, 18rem);
}

.home-hero-shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(0, 0, 0, 0.52) 0%, rgba(0, 0, 0, 0.12) 45%, rgba(0, 0, 0, 0.28) 100%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.22));
}

.home-hero-copy {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #fff;
  max-width: 780px;
  padding: 2rem;
}

.section-kicker {
  display: block;
  font-family: 'Oswald', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--sora-primary);
  margin-bottom: 0.75rem;
}

.home-hero-copy h1 {
  font-size: clamp(3.4rem, 8vw, 7rem);
  line-height: 0.95;
  margin-bottom: 1.5rem;
}

.bottom-cta-copy h2 {
  font-size: clamp(2.6rem, 6vw, 4.8rem);
  line-height: 1;
  margin-bottom: 1.25rem;
}

.home-hero-copy p,
.bottom-cta-copy p {
  max-width: 520px;
  margin: 0 auto 2rem;
  color: rgba(255, 255, 255, 0.78);
}

/* === SHINE EFFECT CHO BUTTON === */
.editorial-btn {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0.75rem 1.25rem;
  background: var(--sora-primary);
  color: #fff;
  border: 1px solid rgba(var(--sora-secondary-rgb), 0.5);
  border-radius: 14px;
  font-family: 'Oswald', sans-serif;
  font-size: 0.76rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.editorial-btn::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(45deg) translateY(-100%);
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.editorial-btn:hover {
  background: var(--sora-accent);
  color: #fff;
  border-color: var(--sora-secondary);
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
}

.editorial-btn:hover::after {
  transform: rotate(45deg) translateY(100%);
}

.hero-side-card {
  position: absolute;
  z-index: 3;
  width: 170px;
  padding: 0.7rem;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
}

.hero-side-card img {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  display: block;
}

.hero-side-card span {
  display: block;
  margin-top: 0.55rem;
  font-family: 'Oswald', sans-serif;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--sora-primary);
}

.hero-card-left {
  left: 14vw;
  top: 14%;
}

.hero-card-right {
  right: 14vw;
  top: 34%;
}

.hero-loading-layer {
  position: absolute;
  inset: 0;
  z-index: 20;
  background: linear-gradient(135deg, #fffafa 0%, #fbf2ef 45%, #f8efe4 100%);
}

.hero-loading-layer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.7) 45%, transparent 70%);
  transform: translateX(-100%);
  animation: heroShimmer 1.6s ease-in-out infinite;
}

.hero-loading-brand {
  color: var(--sora-primary);
  font-size: clamp(3.2rem, 8vw, 6rem);
  letter-spacing: 0.18em;
}

.hero-loading-line {
  width: 90px;
  height: 2px;
  background: var(--sora-secondary);
}

.hero-loading-content p {
  color: #6c3b43;
  font-size: 0.85rem;
}

@keyframes heroShimmer {
  100% {
    transform: translateX(100%);
  }
}

.home-stats-band {
  background: linear-gradient(135deg, var(--sora-primary) 0%, var(--sora-primary) 62%, #12090c 100%);
  color: #fff;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  padding: 3rem 7vw;
}

.stat-item {
  text-align: center;
}

.stat-item strong {
  display: block;
  color: var(--sora-secondary);
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.3rem, 5vw, 4.5rem);
  line-height: 1;
}

.stat-item span {
  display: block;
  margin-top: 0.7rem;
  font-family: 'Oswald', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.66);
}

.editorial-section {
  padding: clamp(4rem, 9vw, 8rem) 0;
}

.narrow-container {
  max-width: 980px;
}

.products-container {
  max-width: 1280px;
}

.section-heading {
  max-width: 740px;
  margin: 0 auto 3rem;
}

.section-heading h2,
.story-copy h2,
.craft-copy h2,
.news-heading h2 {
  font-size: clamp(2.3rem, 5vw, 4.4rem);
  line-height: 1.02;
}

.story-grid {
  position: relative;
  min-height: 580px;
  display: grid;
  grid-template-columns: minmax(260px, 0.9fr) minmax(300px, 1fr);
  align-items: center;
  gap: 5vw;
}

.story-image img,
.story-thumb img,
.craft-image img,
.testimonial-tile img,
.bottom-cta img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* === LÀM MỀM BOX SHADOW VÀ HIỆU ỨNG HOVER === */
.story-image {
  height: 520px;
  overflow: hidden;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.08);
  /* Bóng đổ mềm mịn hơn */
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.5s ease;
}

.story-image:hover,
.craft-image:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.12);
}

.story-copy {
  position: relative;
  z-index: 2;
  max-width: 560px;
}

.story-copy p,
.craft-copy p,
.craft-card p {
  color: #6d625d;
  line-height: 1.8;
}

.story-thumb {
  width: 185px;
  height: 220px;
  margin-top: 2rem;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.story-watermark {
  position: absolute;
  left: 0;
  bottom: -5rem;
  color: rgba(var(--sora-primary-rgb), 0.13);
  font-size: clamp(7rem, 24vw, 20rem);
  line-height: 1;
  pointer-events: none;
}

.editorial-products-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.6rem;
}

.craft-section {
  background: rgba(var(--sora-secondary-rgb), 0.22);
}

.craft-grid {
  display: grid;
  grid-template-columns: 1fr 0.85fr;
  gap: 3rem 5vw;
  align-items: center;
}

.craft-copy {
  max-width: 520px;
}

.craft-line {
  border-top: 1px solid rgba(var(--sora-primary-rgb), 0.18);
  padding: 1.2rem 0;
}

.craft-line h3 {
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.82rem;
  margin-bottom: 0.35rem;
}

.craft-image {
  min-height: 390px;
  overflow: hidden;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.08);
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.5s ease;
}

.craft-image-low {
  align-self: start;
  min-height: 330px;
}

.craft-card {
  max-width: 420px;
}

.craft-card h3 {
  font-size: clamp(2rem, 4vw, 3.4rem);
  line-height: 1.05;
}

.dark-expertise-section {
  background: linear-gradient(135deg, var(--sora-primary) 0%, var(--sora-primary) 62%, #12090c 100%);
  color: #fff;
  padding: clamp(4.5rem, 8vw, 7rem) 0;
}

.expertise-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  max-width: 860px;
  margin: 0 auto;
}

/* === HOVER NỔI LÊN CHO THẺ EXPERTISE === */
.expertise-card {
  background: rgba(0, 0, 0, 0.16);
  border: 1px solid rgba(var(--sora-secondary-rgb), 0.38);
  padding: 2rem;
  min-height: 210px;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.expertise-card:hover {
  transform: translateY(-6px);
  background: rgba(0, 0, 0, 0.25);
  border-color: rgba(var(--sora-secondary-rgb), 0.65);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.expertise-card i {
  color: var(--sora-secondary);
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.expertise-card:hover i {
  transform: scale(1.1);
}

.expertise-card h3 {
  margin: 1.7rem 0 0.7rem;
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.86rem;
}

.expertise-card p {
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.9rem;
  line-height: 1.7;
}

/* Link shine effect in dark section */
.hover-shine-text {
  position: relative;
  display: inline-block;
  transition: color 0.3s ease;
}

.hover-shine-text::after {
  content: '';
  position: absolute;
  width: 100%;
  transform: scaleX(0);
  height: 1px;
  bottom: -2px;
  left: 0;
  background-color: var(--sora-secondary);
  transform-origin: bottom right;
  transition: transform 0.25s ease-out;
}

.hover-shine-text:hover::after {
  transform: scaleX(1);
  transform-origin: bottom left;
}

.testimonial-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

.testimonial-tile {
  min-height: 245px;
  background: linear-gradient(135deg, var(--sora-primary) 0%, var(--sora-primary) 62%, #12090c 100%);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.testimonial-tile:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.testimonial-copy {
  height: 100%;
  padding: 2rem;
  color: #fff;
}

.stars {
  color: var(--sora-secondary);
  letter-spacing: 0.15em;
  margin-bottom: 1rem;
}

.testimonial-copy h3 {
  font-family: 'Oswald', sans-serif;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.88rem;
}

.testimonial-copy p {
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.7;
  margin: 0;
}

.news-editorial {
  background: #f6f3ef;
}

.news-heading {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 2rem;
  margin-bottom: 3rem;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.bottom-cta {
  position: relative;
  min-height: 560px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: var(--sora-primary);
}

.bottom-cta img {
  position: absolute;
  inset: 0;
  transition: transform 6s ease-out;
  /* Subtle zoom hint */
}

.bottom-cta:hover img {
  transform: scale(1.03);
}

.bottom-cta-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg,
      rgba(0, 0, 0, 0.58) 0%,
      rgba(0, 0, 0, 0.34) 24%,
      rgba(0, 0, 0, 0.12) 48%,
      rgba(0, 0, 0, 0.02) 100%);
}

.bottom-cta-copy {
  position: relative;
  z-index: 2;
  color: #fff;
  max-width: 640px;
  margin-left: 10vw;
}

.bottom-cta-copy p {
  margin-left: 0;
}

@media (max-width: 992px) {
  .home-hero {
    min-height: 620px;
  }

  .story-grid,
  .craft-grid {
    grid-template-columns: 1fr;
  }

  .editorial-products-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .expertise-grid,
  .news-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .home-hero {
    min-height: 560px;
  }

  .home-hero-control {
    width: 40px;
    height: 40px;
  }

  .home-hero-control.carousel-control-prev {
    left: 1rem;
  }

  .home-hero-control.carousel-control-next {
    right: 1rem;
  }

  .home-hero-copy h1 {
    font-size: clamp(3rem, 16vw, 4.8rem);
  }

  .bottom-cta-copy h2 {
    font-size: clamp(2.4rem, 11vw, 3.8rem);
  }

  .home-stats-band {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .editorial-products-grid,
  .expertise-grid,
  .testimonial-grid,
  .news-grid {
    grid-template-columns: 1fr;
  }

  .story-image,
  .craft-image {
    min-height: auto;
    height: 360px;
  }

  .news-heading {
    align-items: start;
    flex-direction: column;
  }

  .bottom-cta-copy {
    margin: 0;
    padding: 2rem;
  }
}
</style>
