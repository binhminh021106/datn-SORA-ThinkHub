<template>
  <div class="sora-home font-luxury">
    <SoraHomeIntroLoader :show="showHomeLogoLoader" />

    <div class="home-page-content" :class="{ 'home-page-content-loading': showHomeLogoLoader }">
      <SoraHomeSkeleton v-if="showHomeSkeleton" />

      <template v-else-if="!showHomeLogoLoader">
        <section class="home-hero">

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

      <section class="home-stats-band position-relative overflow-hidden">
        <div class="banner-ambient"></div>
        <div class="banner-glow banner-glow-left"></div>
        <div class="banner-glow banner-glow-right"></div>
        <div class="banner-monogram font-serif">SORA</div>
        <div class="banner-line-art banner-line-art-left d-none d-md-block"></div>
        <div class="banner-line-art banner-line-art-right d-none d-md-block"></div>

        <div class="stat-container position-relative z-index-2">
          <div class="stat-item" v-for="item in homeStats" :key="item.value">
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </section>

      <section class="editorial-section story-section">
        <div class="container">
          <div class="story-grid">
            <div class="story-image" v-if="storyImage">
              <img :src="getImageUrl(storyImage)" alt="SORA story" @error="handleImageError">
              <div class="story-thumb" v-if="storyAccentImage">
                <img :src="getImageUrl(storyAccentImage)" alt="SORA accent" @error="handleImageError">
              </div>
            </div>
            <div class="story-copy">
              <span class="section-kicker">Di sản SORA</span>
              <h2 class="font-serif">Thanh lịch trong từng dấu ấn.</h2>
              <p>SORA gửi gắm vẻ đẹp tinh tế vào từng thiết kế, để mỗi món trang sức trở thành kỷ vật đồng hành cùng
                phong cách và những khoảnh khắc đáng nhớ.</p>
              <router-link :to="{ name: 'about' }" class="editorial-btn text-decoration-none">Câu chuyện thương
                hiệu</router-link>
            </div>
            <div class="story-watermark font-serif">SORA</div>
          </div>
        </div>
      </section>

      <!-- TOP SELLING SECTION -->
      <section class="editorial-section top-selling-editorial" style="background-color: #fdfaf7; padding-top: 5rem; padding-bottom: 5rem;" v-if="topSellingProducts.length > 0">
        <div class="container products-container">
          <div class="section-heading text-center mb-5" style="max-width: 1000px;">
            <span class="section-kicker text-sora-primary fw-bold" style="font-size: 0.9rem; letter-spacing: 3px;"><i class="bi bi-fire me-1"></i> Bestsellers</span>
            <h2 class="font-serif text-md-nowrap">Kiệt tác được khao khát nhất</h2>
          </div>

          <div class="editorial-products-grid">
            <ProductCard v-for="product in topSellingProducts" :key="'ts-' + product.id" :product="product"
              :is-in-wishlist="isInWishlist(product.id)" :show-wishlist="true" :show-add-to-cart="true"
              :show-compare="true" :hover-add-to-cart="true" shop-slug="sora" />
          </div>

          <div class="text-center mt-5 pt-3">
            <router-link :to="{ name: 'shop', query: { sort: 'best_selling' } }" class="editorial-btn text-decoration-none">Khám phá toàn bộ Bestsellers</router-link>
          </div>
        </div>
      </section>

      <!-- COMBO CAROUSEL SECTION -->
      <section class="editorial-section combos-editorial" v-if="data.combos && data.combos.length > 0">
        <div class="container-fluid px-0 combos-container">
          <div class="section-heading text-center mb-5">
            <span class="section-kicker text-gold">Ưu Đãi Đặc Quyền</span>
            <h2 class="font-serif text-md-nowrap">Bộ sưu tập hoàn hảo</h2>
          </div>

          <ComboCarousel :combos="data.combos" />
        </div>
      </section>


      <section class="editorial-section products-editorial" v-if="featuredProducts.length > 0">
        <div class="container products-container">
          <div class="section-heading text-center mb-5">
            <span class="section-kicker">Bộ Sưu Tập Mới</span>
            <h2 class="font-serif">Đón chào những thiết kế mới nhất từ SORA</h2>
          </div>

          <div class="editorial-products-grid">
            <ProductCard v-for="product in featuredProducts" :key="product.id" :product="product"
              :is-in-wishlist="isInWishlist(product.id)" :show-wishlist="true" :show-add-to-cart="true"
              :show-compare="true" :hover-add-to-cart="true" shop-slug="sora" />
          </div>

          <div class="text-center mt-5 pt-2">
            <router-link :to="{ name: 'shop' }" class="editorial-btn text-decoration-none">Khám phá tất cả tác
              phẩm</router-link>
          </div>
        </div>
      </section>


      <section class="editorial-section craft-section">
        <div class="craft-watermark font-serif d-none d-lg-block">SORA</div>

        <div class="container">
          <div class="craft-rows-wrapper">
            <!-- HÀNG 1: Text trái - Ảnh phải -->
            <div class="craft-row-top">
              <div class="craft-copy">
                <span class="section-kicker">Nghệ thuật chế tác</span>
                <h2 class="font-serif">Tinh xảo từ chất liệu đến đường nét.</h2>
                <div class="craft-line" v-for="(item, index) in craftItems" :key="`craft-${index}`">
                  <i class="bi bi-diamond-fill craft-line-icon" aria-hidden="true"></i>
                  <div class="craft-line-content">
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.text }}</p>
                  </div>
                </div>
              </div>
              <div class="craft-image" v-if="craftImage">
                <img :src="getImageUrl(craftImage)" alt="SORA craftsmanship" @error="handleImageError">
              </div>
            </div>

            <!-- HÀNG 2: Ảnh trái - Card phải -->
            <div class="craft-row-bottom">
              <div class="craft-image-low" v-if="craftAccentImage">
                <img :src="getImageUrl(craftAccentImage)" alt="SORA jewelry care" @error="handleImageError">
              </div>
              <div class="craft-card">
                <i class="bi bi-quote craft-quote-icon" aria-hidden="true"></i>
                <h3 class="font-serif">Vẻ đẹp được nâng niu mỗi ngày.</h3>
                <p>Từ lựa chọn chất liệu đến hoàn thiện chi tiết, SORA hướng đến sự chỉn chu, sang trọng và bền lâu
                  trong
                  từng trải nghiệm.</p>
                <router-link :to="{ name: 'services' }" class="editorial-btn text-decoration-none">Dịch vụ của chúng
                  tôi</router-link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="dark-expertise-section position-relative overflow-hidden">
        <div class="banner-ambient"></div>
        <div class="banner-glow banner-glow-left"></div>
        <div class="banner-glow banner-glow-right"></div>
        <div class="banner-monogram font-serif">ĐẶC QUYỀN</div>
        <div class="banner-line-art banner-line-art-left d-none d-md-block"></div>
        <div class="banner-line-art banner-line-art-right d-none d-md-block"></div>

        <div class="container position-relative z-index-2">
          <div class="section-heading text-center text-white">
            <span class="section-kicker text-gold">Đặc Quyền SORA</span>
            <h2 class="font-serif">Sự chăm sóc tận tâm cho mọi nhu cầu</h2>
          </div>
          <div class="expertise-grid">
            <div class="expertise-card" v-for="service in serviceCards" :key="service.title">
              <i :class="service.icon"></i>
              <h3>{{ service.title }}</h3>
              <p>{{ service.text }}</p>
            </div>
          </div>
          <div class="text-center mt-5 pt-3">
            <router-link :to="{ name: 'services' }"
              class="editorial-btn text-decoration-none">Khám phá tất cả dịch
              vụ</router-link>
          </div>
        </div>
      </section>

      <section class="editorial-section gallery-editorial" v-if="galleryDisplayImages.length > 0">
        <div class="container narrow-container">
          <div class="section-heading text-center">
            <span class="section-kicker">Khoảnh Khắc Khách Hàng</span>
            <h2 class="font-serif">Lý do khách hàng luôn tin chọn SORA</h2>
          </div>

          <div class="testimonial-grid">
            <div class="testimonial-tile" v-for="(img, index) in galleryDisplayImages" :key="'gallery-' + index">
              <img v-if="index % 2 === 0" :src="getImageUrl(img)" alt="SORA customer" @error="handleImageError">
              <div v-else class="testimonial-copy d-flex flex-column justify-content-center">
                <span class="testimonial-watermark font-serif">Sora</span>
                <div class="testimonial-brand">
                  <img src="@/assets/images/icon-logo.png" alt="SORA">
                  <span>SORA</span>
                </div>
                <div class="stars">★★★★★</div>
                <h3>{{ testimonialTitles[index % testimonialTitles.length] }}</h3>
                <p>Trải nghiệm SORA được chăm chút từ thiết kế, chất liệu đến dịch vụ hậu mãi.</p>
                <div class="testimonial-divider"></div>
                <div class="testimonial-badges">
                  <span v-for="(badge, index) in testimonialBadges" :key="`badge-${index}`">
                    {{ badge }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="editorial-section news-editorial" v-if="data.news && data.news.length > 0">
        <div class="container news-container">
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

      </template>

    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, onUnmounted, ref, computed, watch } from 'vue';
import Toast from '@/utils/toastConfig';
import soraAlert from '@/utils/soraAlertConfig';
import ProductCard from '@/components/ui/ProductCard.vue';
import NewsPostCard from '@/components/ui/NewsPostCard.vue';
import ComboCarousel from '@/components/ui/ComboCarousel.vue';
import SoraHomeIntroLoader from '@/components/ui/SoraHomeIntroLoader.vue';
import SoraHomeSkeleton from '@/components/ui/SoraHomeSkeleton.vue';
import { getStorageUrl } from '@/utils/env';
import clientApiClient from '@/utils/clientApiClient';
import { getUserToken } from '@/composables/useUtilities';
import { useQuery } from '@tanstack/vue-query';

const { data: homeQueryData, isPending: isQueryLoading, isError: isQueryError } = useQuery({
  queryKey: ['homeData'],
  queryFn: async () => {
    const res = await clientApiClient.get('/client/home-data', { ignoreAuthRedirect: true });
    return res.data?.data || res.data || {};
  },
  staleTime: 5 * 60 * 1000,
});

const isLoading = computed(() => isQueryLoading.value && !data.banners.length);
const shouldShowHomeIntro = ref(!window.__sora_intro_shown);
const isLogoLoaderMinTimeDone = ref(!shouldShowHomeIntro.value);
const isHeroImageReady = ref(false);
const windowWidth = ref(window.innerWidth);
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
  { title: 'Đường nét tinh xảo', text: 'Từng chi tiết được hoàn thiện cẩn trọng để giữ trọn vẻ mềm mại và cân đối.' },
  { title: 'Chất liệu chọn lọc', text: 'SORA ưu tiên chất liệu bền đẹp, phù hợp với nhu cầu sử dụng lâu dài.' },
  { title: 'Phong cách bền lâu', text: 'Thiết kế thanh lịch, dễ kết hợp và đủ trang nhã cho nhiều khoảnh khắc.' }
];

const serviceCards = [
  { icon: 'bi bi-gem', title: 'Chăm sóc trang sức trọn đời', text: 'Hỗ trợ chăm sóc và làm mới trang sức SORA.' },
  { icon: 'bi bi-stars', title: 'Tư vấn định hình phong cách', text: 'Tư vấn lựa chọn thiết kế phù hợp với phong cách.' },
  { icon: 'bi bi-shield-check', title: 'Bảo đảm độ tin cậy', text: 'Cam kết thông tin rõ ràng và dịch vụ hậu mãi.' }
];

const testimonialTitles = ['Trải nghiệm tuyệt vời', 'Hoàn hảo cho mỗi ngày', 'Dịch vụ chu đáo'];
const testimonialBadges = ['Tư vấn tận tâm', 'Chất liệu chọn lọc', 'Bảo hành rõ ràng'];

const soraPlaceholder = '/Sora-placeholder.png';

const getImageUrl = (path) => {
  return getStorageUrl(path, soraPlaceholder);
};

const formatPrice = (value) => {
  if (!value) return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace('₫', 'đ');
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

const featuredProducts = computed(() => data.products.slice(0, 8));

const topSellingProducts = computed(() => {
  if (!data.products) return [];
  return [...data.products]
    .sort((a, b) => (Number(b.sold_count) || 0) - (Number(a.sold_count) || 0))
    .slice(0, 4);
});

const galleryDisplayImages = computed(() => {
  const galleryImages = data.galleries.map((item) => item.image_path || item.image).filter(Boolean);
  if (galleryImages.length > 0) return galleryImages.slice(0, 4);
  return data.products.map((product) => product.thumbnail_image).filter(Boolean).slice(0, 4);
});

const isHomeReady = computed(() => !isLoading.value && (!heroImage.value || isHeroImageReady.value));
const showHomeLogoLoader = computed(() => shouldShowHomeIntro.value && (!isHomeReady.value || !isLogoLoaderMinTimeDone.value));
const showHomeSkeleton = computed(() =>
  isLoading.value && (!shouldShowHomeIntro.value || isLogoLoaderMinTimeDone.value)
);

const comboCurrentIndex = ref(0);
let comboAutoplayTimer = null;
let comboIntervalTimer = null;
const timeLeft = reactive({ days: 0, hours: 0, minutes: 0, seconds: 0 });
const parseDBDate = (dateStr) => {
  if (!dateStr) return null;
  const cleanStr = dateStr.replace(' ', 'T').substring(0, 19);
  return new Date(cleanStr).getTime();
};

const getItemPrice = (item) => {
  if (item.product_variant_id && item.variant) return parseFloat(item.variant.price);
  return item.product ? parseFloat(item.product.base_price) : 0;
};

const formattedCombos = computed(() => {
  if (!data.combos || !Array.isArray(data.combos)) return [];

  const now = new Date().getTime();

  const validCombos = data.combos.filter(c => {
    const endDate = parseDBDate(c.end_date);
    return !endDate || endDate > now;
  });

  return validCombos.map(combo => {
    const rawItems = combo.items || combo.products || [];
    let originalTotal = 0;

    const products = rawItems.map(item => {
      if (item.product || item.variant) {
        const product = item.product || {};
        const variant = item.variant || {};
        const price = getItemPrice(item);
        originalTotal += price * (item.quantity || 1);

        return {
          name: product.name || 'Tác phẩm SORA',
          code: variant.sku || 'Tùy chọn phân loại',
          price: formatPrice(price),
          quantity: item.quantity || 1,
          image: getImageUrl(variant.image_url || product.thumbnail_image)
        };
      }

      const promo = parseFloat(item.promotional_price);
      const base = parseFloat(item.price || item.base_price);
      const price = promo > 0 ? promo : (base > 0 ? base : 0);
      originalTotal += price * (item.quantity || 1);

      return {
        name: item.name || 'Tác phẩm SORA',
        code: item.code || item.sku || 'Tùy chọn phân loại',
        price: formatPrice(price),
        quantity: item.quantity || 1,
        image: getImageUrl(item.thumbnail_image || item.image)
      };
    });

    const basePrice = Number(combo.base_price || originalTotal || 0);
    const promoPrice = Number(combo.promotional_price != null ? combo.promotional_price : basePrice);
    const discountPercent = basePrice > promoPrice ? Math.round(((basePrice - promoPrice) / basePrice) * 100) : 0;
    const discountAmount = discountPercent > 0 ? `${discountPercent}%` : formatPrice(Math.max(0, basePrice - promoPrice));

    return {
      ...combo,
      badge: combo.theme || combo.target_gender || 'Ưu Đãi Đặc Quyền',
      title: combo.name,
      slug: combo.slug,
      originalPrice: formatPrice(basePrice),
      discountPrice: formatPrice(promoPrice),
      discountAmount: discountPercent > 0 ? `${discountPercent}%` : discountAmount,
      products: products,
      endDate: parseDBDate(combo.end_date),
      comboImage: getImageUrl(combo.thumbnail_image || combo.image)
    };
  });
});

const updateCountdown = () => {
  if (formattedCombos.value.length === 0) return;
  const currentCombo = formattedCombos.value[comboCurrentIndex.value];
  if (!currentCombo || !currentCombo.endDate) {
    timeLeft.days = timeLeft.hours = timeLeft.minutes = timeLeft.seconds = 0;
    return;
  }
  const now = new Date().getTime();
  const distance = currentCombo.endDate - now;

  if (distance < 0) {
    timeLeft.days = timeLeft.hours = timeLeft.minutes = timeLeft.seconds = 0;
    return;
  }

  timeLeft.days = Math.floor(distance / (1000 * 60 * 60 * 24));
  timeLeft.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  timeLeft.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  timeLeft.seconds = Math.floor((distance % (1000 * 60)) / 1000);
};

const comboNext = () => {
  if (formattedCombos.value.length === 0) return;
  comboCurrentIndex.value = (comboCurrentIndex.value + 1) % formattedCombos.value.length;
  comboResetAutoplay();
  updateCountdown();
};

const comboPrev = () => {
  if (formattedCombos.value.length === 0) return;
  comboCurrentIndex.value = (comboCurrentIndex.value - 1 + formattedCombos.value.length) % formattedCombos.value.length;
  comboResetAutoplay();
  updateCountdown();
};

const comboGoToSlide = (index) => {
  comboCurrentIndex.value = index;
  comboResetAutoplay();
  updateCountdown();
};

const comboStartAutoplay = () => {
  comboAutoplayTimer = setInterval(comboNext, 6000);
};
const comboResetAutoplay = () => {
  clearInterval(comboAutoplayTimer);
  comboStartAutoplay();
};

const getComboCardStyle = (index) => {
  const total = formattedCombos.value.length;
  if (total === 0) return {};
  const diff = (index - comboCurrentIndex.value + total) % total;
  const isMobile = windowWidth.value < 768;
  const shiftPercent = isMobile ? '12%' : '45%';

  if (diff === 0) {
    return { left: '50%', top: '50%', transform: 'translate(-50%, -50%) scale(1)', zIndex: 30, opacity: 1, boxShadow: '0 25px 50px -12px rgba(var(--sora-primary-rgb), 0.2)' };
  } else if (diff === 1 || (total === 2 && diff === 1)) {
    return { left: '50%', top: '50%', transform: `translate(calc(-50% + ${shiftPercent}), -50%) scale(0.88)`, zIndex: 20, opacity: 0.6, boxShadow: 'none' };
  } else if (diff === total - 1) {
    return { left: '50%', top: '50%', transform: `translate(calc(-50% - ${shiftPercent}), -50%) scale(0.88)`, zIndex: 20, opacity: 0.6, boxShadow: 'none' };
  } else {
    return { left: '50%', top: '50%', transform: 'translate(-50%, -50%) scale(0.75)', zIndex: 10, opacity: 0, pointerEvents: 'none' };
  }
};

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};


watch(showHomeLogoLoader, (isShown) => {
  if (!isShown && shouldShowHomeIntro.value && isHomeReady.value && isLogoLoaderMinTimeDone.value) {
    window.__sora_intro_shown = true;
    shouldShowHomeIntro.value = false;
  }
});

const loadWishlist = async () => {
  const token = getUserToken();
  if (!token) {
    wishlistIds.value = [];
    return;
  }
  try {
    const { data: result } = await clientApiClient.get('/client/favourites', { ignoreAuthRedirect: true });
    if (result.status && Array.isArray(result.data)) {
      wishlistIds.value = result.data.map((item) => item.product?.id).filter(Boolean);
    } else if (result.require_login) {
      import('@/composables/useUtilities').then(({ clearUserAuthStorage }) => {
        clearUserAuthStorage();
        wishlistIds.value = [];
      });
    }
  } catch (error) {
    wishlistIds.value = [];
  }
};

const toggleWishlist = async (product) => {
  try {
    const { data: result } = await clientApiClient.post('/client/favourites/toggle', { product_id: product.id });
    if (!result.status) throw new Error(result.message || 'Không thể cập nhật danh sách yêu thích.');

    const isAdded = result.action === 'added';
    if (isAdded && !wishlistIds.value.includes(product.id)) {
      wishlistIds.value.push(product.id);
    } else if (!isAdded) {
      wishlistIds.value = wishlistIds.value.filter((id) => id !== product.id);
    }
    showWishlistNotification(isAdded);
  } catch (error) {
    soraAlert.fire({ icon: 'error', title: 'Không thể cập nhật danh sách yêu thích', text: error.message || 'Xin vui lòng thử lại sau.' });
  }
};

const handleImageError = (event) => {
  event.target.onerror = null;
  event.target.src = soraPlaceholder;
};

const markHeroImageReady = (index = 0) => {
  if (index === 0) {
    isHeroImageReady.value = true;
  }
};

watch(heroImage, (newVal) => {
  if (newVal && !isHeroImageReady.value) {
    const img = new Image();
    img.onload = () => markHeroImageReady(0);
    img.onerror = () => markHeroImageReady(0);
    img.src = getImageUrl(newVal);
  } else if (!newVal && !isHeroImageReady.value) {
    markHeroImageReady(0);
  }
}, { immediate: true });

const handleHeroImageError = (event, index = 0) => {
  handleImageError(event);
  markHeroImageReady(index);
};

const isInWishlist = (productId) => wishlistIds.value.includes(productId);

const showWishlistNotification = (isAdded) => {
  Toast.fire({
    icon: isAdded ? 'success' : 'info',
    title: isAdded ? 'Đã thêm vào danh sách yêu thích!' : 'Đã xóa khỏi danh sách yêu thích!'
  });
};


watch(homeQueryData, (payload) => {
  if (payload) {
    data.banners = payload.banners || [];
    data.coupons = payload.coupons || [];
    data.categories = payload.categories || [];
    data.products = payload.products || [];
    data.combos = payload.combos || [];
    data.tiers = payload.tiers || [];
    data.galleries = payload.galleries || [];
    data.news = payload.news || [];
  }
}, { immediate: true });

watch(isQueryError, (hasError) => {
  if (hasError) {
    soraAlert.fire({ icon: 'error', title: 'Không thể tải dữ liệu trang chủ' });
  }
});

onMounted(() => {
  if (shouldShowHomeIntro.value) {
    window.setTimeout(() => {
      isLogoLoaderMinTimeDone.value = true;
    }, 1000);
  }

  window.addEventListener('resize', handleResize);
  loadWishlist();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Manrope:wght@300;400;500;600;700&family=Oswald:wght@400;500;600;700&display=swap');

:root {
  --sora-primary: #9f273b;
  --sora-secondary: #e7ce7d;
  --sora-accent: #cc1e2e;
  --sora-primary-rgb: 159, 39, 59;
  --sora-secondary-rgb: 231, 206, 125;
  --sora-accent-rgb: 204, 30, 46;
  --home-container-width: 1320px;
  --home-gutter: 0.75rem;
}
</style>

<style scoped>
.font-luxury {
  font-family: 'Manrope', sans-serif;
}

.font-serif {
  font-family: 'Playfair Display', serif;
  /* khoảng cách giữa các dòng */
}

.font-oswald {
  font-family: 'Oswald', sans-serif;
}

.font-sans {
  font-family: 'Manrope', sans-serif;
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

.sora-home .container {
  width: 100%;
  max-width: var(--home-container-width);
  padding-left: var(--home-gutter);
  padding-right: var(--home-gutter);
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
  transform: rotate(45deg) translateY(-200%);
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
  transform: rotate(45deg) translateY(200%);
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



.home-stats-band {
  background: #6a1622;
  position: relative;
  color: #fff;
  padding: 1.5rem max(var(--home-gutter), calc((100vw - var(--home-container-width)) / 2 + var(--home-gutter)));
  display: flex;
  justify-content: center;
  align-items: center;
}

.banner-ambient {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(231, 206, 125, 0.2), transparent 68%);
  filter: blur(3px);
  z-index: 0;
}

.banner-glow {
  position: absolute;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(200, 40, 60, 0.6), transparent 70%);
  filter: blur(40px);
  border-radius: 50%;
  z-index: 0;
}

.banner-glow-left {
  left: -80px;
  bottom: -80px;
}

.banner-glow-right {
  right: -80px;
  top: -80px;
}

.banner-monogram {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  text-align: center;
  color: rgba(255, 244, 218, 0.038);
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 700;
  letter-spacing: 0.1em;
  line-height: 1;
  white-space: nowrap;
  z-index: 0;
}

.banner-line-art {
  position: absolute;
  width: 70px;
  height: 70px;
  border: 1px solid rgba(231, 206, 125, 0.34);
  z-index: 1;
}

.banner-line-art::before,
.banner-line-art::after {
  content: "";
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(231, 206, 125, 0.2);
}

.banner-line-art-left {
  left: 8%;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.banner-line-art-right {
  right: 8%;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.stat-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  width: 100%;
}

.stat-item {
  text-align: center;
}

.stat-item strong {
  display: block;
  color: var(--sora-secondary);
  font-family: 'Oswald', sans-serif;
  font-weight: 500;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1;
}

.stat-item span {
  display: block;
  margin-top: 0.5rem;
  font-family: 'Oswald', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
}

.editorial-section {
  padding: clamp(3rem, 5vw, 5rem) 0;
}

.narrow-container {
  max-width: var(--home-container-width);
}

.products-container,
.news-container,
.combos-container {
  max-width: var(--home-container-width);
}

.section-heading {
  max-width: 740px;
  margin: 0 auto 3rem;
}

.section-heading h2,
.story-copy h2,
.news-heading h2 {
  font-size: clamp(2.3rem, 5vw, 4.4rem);
  line-height: 1.02;
}

.story-grid {
  position: relative;
  min-height: 580px;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(2rem, 5vw, 4.5rem);
}

.story-grid>*,
.craft-row-top>*,
.craft-row-bottom>*,
.testimonial-grid>*,
.news-grid>*,
.editorial-products-grid>*,
.expertise-grid>* {
  min-width: 0;
}

.story-image>img,
.story-thumb img,
.craft-image img,
.craft-image-low img,
.testimonial-tile img,
.bottom-cta img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.story-image {
  position: relative;
  z-index: 1;
  height: 520px;
  overflow: visible;
  border-radius: 8px;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.08);
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.5s ease;
}

.story-image::before {
  content: '';
  position: absolute;
  inset: -14px 14px 14px -14px;
  z-index: -1;
  border: 1px solid rgba(var(--sora-secondary-rgb), 0.86);
  border-radius: 10px;
  background: rgba(255, 250, 250, 0.35);
}

.story-image>img,
.craft-image img,
.craft-image-low img,
.story-thumb img,
.testimonial-tile {
  border-radius: 8px;
}

.story-image:hover,
.craft-image:hover,
.craft-image-low:hover {
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
  color: #5f4a4f;
  line-height: 1.8;
}

.story-thumb {
  position: absolute;
  right: clamp(0.75rem, 2vw, 1.5rem);
  bottom: -44px;
  z-index: 3;
  width: 215px;
  height: 245px;
  overflow: hidden;
  border-radius: 8px;
  border: 8px solid rgba(255, 255, 255, 0.96);
  background: #fffafa;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.16);
}

.story-watermark {
  position: absolute;
  left: 48%;
  bottom: -4.5rem;
  z-index: 0;
  color: rgba(var(--sora-primary-rgb), 0.09);
  font-size: clamp(6rem, 17vw, 15rem);
  line-height: 1;
  pointer-events: none;
}

.editorial-products-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.6rem;
}


/* ==========================================
   CSS CHO COMBO CAROUSEL (VISIBLE-EDGE)
   ========================================== */
.combos-editorial {
  background-color: #fffafa;
  overflow: hidden;
}

.sora-combo-carousel {
  position: relative;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.combo-track-new {
  position: relative;
  width: 100%;
  max-width: 1000px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1200px;
}

.combo-card-wrapper {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100%;
  height: 95%;
  transform: translate(-50%, -50%) scale(0.85);
  transition: transform 0.7s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.7s ease, box-shadow 0.7s ease, z-index 0s;
  cursor: pointer;
  border-radius: 24px;
}

.combo-card-inner {
  background-color: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(var(--sora-secondary-rgb), 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: row;
  height: 100%;
}

.combo-left-panel {
  width: 50%;
  padding: 0;
  position: relative;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
}

.combo-bg-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  z-index: 0;
  transition: transform 0.7s ease;
}

.combo-card-wrapper:hover .combo-bg-image {
  transform: scale(1.05);
}

.combo-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.7) 40%, rgba(255, 255, 255, 0.95) 60%, rgba(255, 255, 255, 1) 100%);
  z-index: 0;
}

.combo-left-content {
  position: relative;
  z-index: 1;
  padding: 2.5rem 3.5rem;
  padding-top: 5rem;
}

.combo-right-panel {
  width: 50%;
  padding: 2.5rem 3.5rem;
  background-color: #faf8f5;
  border-left: 1px solid rgba(var(--sora-secondary-rgb), 0.2);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.combo-badges {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.badge-red {
  padding: 0.35rem 1rem;
  background-color: var(--sora-primary);
  color: #fff;
  border-radius: 50px;
  font-family: 'Manrope', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.badge-light {
  padding: 0.35rem 1rem;
  background-color: rgba(var(--sora-secondary-rgb), 0.2);
  color: #2a1810;
  border-radius: 50px;
  font-family: 'Manrope', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.combo-title {
  color: #2a1810;
  font-size: clamp(1.4rem, 2vw, 1.8rem);
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 1rem;
  text-transform: uppercase;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.combo-countdown {
  margin-bottom: 1rem;
}

.countdown-label {
  color: #8b7a6a;
  font-family: 'Manrope', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.countdown-boxes {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.time-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-value {
  width: 56px;
  height: 56px;
  background-color: #fff;
  border: 1px solid rgba(var(--sora-secondary-rgb), 0.6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sora-primary);
  font-size: 1.5rem;
  font-weight: 700;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.time-label {
  margin-top: 0.5rem;
  color: #8b7a6a;
  font-family: 'Manrope', sans-serif;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.time-separator {
  color: var(--sora-secondary);
  font-size: 1.5rem;
  margin-top: -1.25rem;
}

.combo-pricing {
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(var(--sora-secondary-rgb), 0.2);
}

.discount-text {
  color: #8b7a6a;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.discount-text span {
  color: var(--sora-primary);
  font-weight: 600;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.original-price {
  text-decoration: line-through;
  color: #8b7a6a;
  font-size: 1.125rem;
}

.discount-price {
  color: var(--sora-primary);
  font-size: 2rem;
}

.combo-btn {
  width: 100%;
  padding: 1rem;
  background-color: var(--sora-primary);
  color: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-family: 'Manrope', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(var(--sora-primary-rgb), 0.3);
  position: relative;
  z-index: 10;
}

.combo-btn:hover {
  background-color: #4a1227;
  color: #fff;
  transform: translateY(-2px);
}

.combo-btn .btn-icon {
  transition: transform 0.3s ease;
}

.combo-btn:hover .btn-icon {
  transform: scale(1.1);
}

.combo-products-title {
  color: #2a1810;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.combo-products-scroll {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 0.5rem;
  padding-right: 0.25rem;
  margin-right: -0.25rem;
}

.products-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0.25rem;
}

.combo-product-item {
  background-color: #fff;
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(var(--sora-secondary-rgb), 0.2);
  transition: border-color 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.combo-product-item:hover {
  border-color: rgba(var(--sora-secondary-rgb), 0.6);
}

.product-img-box {
  position: relative;
  width: 96px;
  height: 96px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #f9f9f9, #f1f1f1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.product-img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  mix-blend-mode: multiply;
}

.product-qty {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  background-color: var(--sora-primary);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  border: 1px solid #fff;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-info h4 {
  color: #2a1810;
  font-size: 1rem;
  font-weight: 600;
}

.combo-scroll-hint {
  margin-top: 0.5rem;
  text-align: center;
  color: #8b7a6a;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.combo-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(250, 248, 245, 0.1);
  z-index: 20;
  border-radius: 24px;
}

.combo-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px);
  color: #fff;
  border-radius: 50%;
  border: 1px solid rgba(var(--sora-secondary-rgb), 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 40;
  padding: 0;
}

.combo-nav-btn:hover {
  background: var(--sora-primary);
  color: #fff;
  border-color: var(--sora-secondary);
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.combo-nav-btn .group-hover {
  transition: transform 0.3s ease;
}

.combo-nav-btn.nav-prev:hover .group-hover {
  transform: translateX(-2px);
}

.combo-nav-btn.nav-next:hover .group-hover {
  transform: translateX(2px);
}

.nav-prev {
  left: 2rem;
}

.nav-next {
  right: 2rem;
}

.combo-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-top: 2rem;
}

.combo-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(var(--sora-secondary-rgb), 0.5);
  border: none;
  transition: all 0.3s ease;
  padding: 0;
}

.combo-dot:hover {
  background-color: var(--sora-secondary);
}

.combo-dot.active {
  width: 40px;
  border-radius: 10px;
  background-color: var(--sora-primary);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scroll-mask {
  mask-image: linear-gradient(to bottom, transparent, black 10px, black calc(100% - 10px), transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 10px, black calc(100% - 10px), transparent);
}

@media (max-width: 1199.98px) {
  .nav-prev {
    left: 1rem;
  }

  .nav-next {
    right: 1rem;
  }
}

@media (max-width: 991.98px) {
  .sora-combo-carousel {
    height: 700px;
  }

  .combo-card-wrapper {
    width: 95%;
  }

  .combo-left-panel,
  .combo-right-panel {
    padding: 1.5rem;
  }

  .combo-left-content {
    padding: 1.5rem;
    padding-top: 4rem;
  }

  .time-value {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }

  .nav-prev {
    left: 0.5rem;
  }

  .nav-next {
    right: 0.5rem;
  }

  .product-img-box {
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 767.98px) {
  .sora-combo-carousel {
    height: 850px;
  }

  .combo-card-wrapper {
    position: relative;
    left: auto;
    top: auto;
    width: 100%;
    height: 100%;
    transform: none !important;
  }

  .combo-card-inner {
    flex-direction: column;
  }

  .combo-left-panel,
  .combo-right-panel {
    width: 100%;
  }

  .combo-right-panel {
    border-left: none;
    border-top: 1px solid rgba(var(--sora-secondary-rgb), 0.2);
  }
}


/* ==========================================
   CÁC PHẦN CÒN LẠI CỦA TRANG CHỦ
   ========================================== */
.craft-section {
  background: rgba(var(--sora-secondary-rgb), 0.18);
  padding: clamp(3.75rem, 7vw, 6rem) 0;
  position: relative;
  overflow: hidden;
}

.craft-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: clamp(10rem, 28vw, 22rem);
  color: rgba(var(--sora-primary-rgb), 0.03);
  z-index: 0;
  pointer-events: none;
  line-height: 1;
  white-space: nowrap;
}

.craft-rows-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: clamp(2rem, 4vw, 3.5rem);
}

.craft-row-top,
.craft-row-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(1.5rem, 3vw, 3rem);
}

.craft-copy {
  flex: 1;
}

.craft-copy h2 {
  font-size: clamp(2.3rem, 5vw, 4.4rem);
  line-height: 1.02;
}

.craft-line {
  border-top: 1px solid rgba(var(--sora-primary-rgb), 0.18);
  padding: 1.25rem 0;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.craft-line:hover {
  transform: translateX(6px);
  border-color: rgba(var(--sora-primary-rgb), 0.4);
}

.craft-line-icon {
  color: var(--sora-secondary);
  font-size: 0.65rem;
  margin-top: 0.25rem;
}

.craft-line h3 {
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.86rem;
  color: #4b1f28;
  margin-bottom: 0.35rem;
}

.craft-line p {
  margin-bottom: 0;
  font-size: 0.95rem;
}

.craft-image {
  flex: 0 0 min(100%, 500px);
  position: relative;
  min-height: 320px;
  border-radius: 10px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.5s ease;
}

.craft-image::before {
  content: '';
  position: absolute;
  inset: 15px -15px -15px 15px;
  z-index: -1;
  border: 1px solid rgba(var(--sora-secondary-rgb), 0.5);
  background: repeating-linear-gradient(45deg,
      rgba(var(--sora-secondary-rgb), 0.08),
      rgba(var(--sora-secondary-rgb), 0.08) 2px,
      transparent 2px,
      transparent 10px);
  border-radius: 10px;
}

.craft-image-low {
  flex: 0 0 min(100%, 430px);
  position: relative;
  min-height: 280px;
  border-radius: 10px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.5s ease;
}

.craft-image-low::before {
  content: '';
  position: absolute;
  inset: 15px 15px -15px -15px;
  z-index: -1;
  border: 1px solid rgba(var(--sora-secondary-rgb), 0.5);
  background: repeating-linear-gradient(45deg,
      rgba(var(--sora-secondary-rgb), 0.08),
      rgba(var(--sora-secondary-rgb), 0.08) 2px,
      transparent 2px,
      transparent 10px);
  border-radius: 10px;
}

.craft-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.08);
  border-left: 4px solid var(--sora-secondary);
  backdrop-filter: blur(8px);
}

.craft-quote-icon {
  font-size: 2.5rem;
  color: rgba(var(--sora-secondary-rgb), 0.4);
  line-height: 1;
  margin-bottom: -1rem;
  display: block;
}

.craft-card h3 {
  color: #4b1f28;
  font-size: clamp(2rem, 3.4vw, 3rem);
  line-height: 1.05;
  margin-top: 1rem;
}

.dark-expertise-section {
  background: linear-gradient(135deg, var(--sora-primary) 0%, var(--sora-primary) 62%, #12090c 100%);
  color: #fff;
  padding: clamp(1rem, 2vw, 3rem) 0;
}

.expertise-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 1280px;
  margin: 0 auto;
}

.expertise-card {
  background: rgba(0, 0, 0, 0.16);
  border: 1px solid rgba(var(--sora-secondary-rgb), 0.38);
  padding: 2.5rem;
  min-height: 240px;
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
  font-size: 1.8rem;
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
  font-size: 0.95rem;
}

.expertise-card p {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.95rem;
  line-height: 1.7;
}

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
  grid-template-columns: 250px minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.testimonial-tile {
  background: linear-gradient(135deg, var(--sora-primary) 0%, var(--sora-primary) 62%, #12090c 100%);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 250px;
}

.testimonial-tile:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.testimonial-copy {
  position: relative;
  isolation: isolate;
  height: 100%;
  padding: 1.5rem;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background:
    radial-gradient(circle at 76% 18%, rgba(var(--sora-secondary-rgb), 0.18), transparent 28%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.05), transparent 42%);
}

.testimonial-watermark {
  position: absolute;
  z-index: -1;
  right: 1.1rem;
  top: 50%;
  transform: translateY(-50%) rotate(-8deg);
  color: rgba(30, 5, 10, 0.34);
  font-size: 5.4rem;
  font-style: italic;
  line-height: 1;
  pointer-events: none;
  user-select: none;
}

.testimonial-brand {
  position: absolute;
  top: 1.1rem;
  right: 1.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: rgba(255, 238, 196, 0.92);
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  letter-spacing: 0.05em;
}

.testimonial-brand img {
  width: 22px;
  height: 22px;
  object-fit: contain;
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.28));
}

.stars {
  color: var(--sora-secondary);
  letter-spacing: 0.15em;
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
}

.testimonial-copy h3 {
  font-family: 'Oswald', sans-serif;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.82rem;
}

.testimonial-copy p {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.84rem;
  line-height: 1.6;
  margin: 0;
}

.testimonial-divider {
  width: 72px;
  height: 1px;
  margin: 1rem 0 0.75rem;
  background: linear-gradient(90deg, rgba(var(--sora-secondary-rgb), 0.85), transparent);
}

.testimonial-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.testimonial-badges span {
  border: 1px solid rgba(var(--sora-secondary-rgb), 0.38);
  color: rgba(255, 241, 209, 0.88);
  background: rgba(0, 0, 0, 0.12);
  padding: 0.28rem 0.55rem;
  font-family: 'Oswald', sans-serif;
  font-size: 0.66rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1;
}

.news-editorial {
  background: #fffafa;
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
  gap: 1.8rem;
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
  margin-left: max(var(--home-gutter), calc((100vw - var(--home-container-width)) / 2 + var(--home-gutter)));
}

.bottom-cta-copy p {
  margin-left: 0;
}

@media (max-width: 992px) {
  .home-hero {
    min-height: 620px;
  }

  .story-grid {
    grid-template-columns: 1fr;
  }

  .craft-row-top,
  .craft-row-bottom {
    flex-direction: column;
    align-items: stretch;
    gap: 2rem;
  }

  .craft-image,
  .craft-image-low {
    width: 100%;
    max-width: 100%;
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
    padding-top: 1.25rem;
    padding-bottom: 1.25rem;
  }

  .stat-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .editorial-products-grid,
  .expertise-grid,
  .news-grid {
    grid-template-columns: 1fr;
  }

  .testimonial-grid {
    grid-template-columns: minmax(0, 250px);
    justify-content: center;
  }

  .testimonial-tile {
    height: 250px;
  }

  .testimonial-copy {
    padding: 1.35rem;
  }

  .testimonial-watermark {
    right: 0.7rem;
    font-size: 4.4rem;
  }

  .testimonial-brand {
    top: 0.9rem;
    right: 1rem;
    font-size: 0.9rem;
  }

  .story-image,
  .craft-image {
    min-height: auto;
    height: 330px;
  }

  .craft-image,
  .craft-image-low {
    width: 100%;
    justify-self: stretch;
  }

  .craft-image-low {
    height: 280px;
  }

  .story-thumb {
    right: 1rem;
    bottom: -2.25rem;
    width: 145px;
    height: 165px;
    border-width: 6px;
  }

  .story-watermark {
    display: none;
  }

  .news-heading {
    align-items: start;
    flex-direction: column;
  }

  .bottom-cta-copy {
    margin-left: 0;
    padding: 2rem;
  }

  .sora-combo-carousel {
    height: 850px;
    padding: 1rem 0;
  }

  .combo-card-wrapper {
    width: 95%;
    height: 95%;
  }

  .combo-card-inner {
    flex-direction: column;
  }

  .combo-left-panel,
  .combo-right-panel {
    width: 100%;
    padding: 1.5rem;
  }

  .time-value {
    width: 45px;
    height: 45px;
    font-size: 1.2rem;
  }

  .combo-nav-btn {
    width: 40px;
    height: 40px;
  }
}
</style>