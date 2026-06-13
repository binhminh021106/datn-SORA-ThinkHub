<template>
  <div class="about-page font-sans">

    <!-- 1. Tiêu đề chính (Hero Section) -->
    <section class="sora-banner position-relative d-flex align-items-center justify-content-center overflow-hidden">
      <div class="banner-ambient"></div>
      <div class="banner-glow banner-glow-left"></div>
      <div class="banner-glow banner-glow-right"></div>
      <div class="banner-monogram font-serif">SORA BOUTIQUE</div>
      <div class="banner-line-art banner-line-art-left"></div>
      <div class="banner-line-art banner-line-art-right"></div>

      <div class="position-relative z-index-2 text-center px-3 banner-content">
        <p class="text-champagne font-oswald tracking-widest mb-3 text-uppercase small">
          <i class="bi bi-stars me-2"></i>Câu chuyện thương hiệu
        </p>
        <h1 class="display-3 fw-bold font-serif mb-3 text-white text-uppercase">VỀ SORA</h1>
        <p class="banner-subtitle fw-light fs-5 mb-0 font-serif text-white">
          "Tuyệt tác trang sức – Nơi khí chất độc bản được tôn vinh."
        </p>
      </div>
    </section>

    <!-- 2. Đoạn giới thiệu ngắn & 3. Câu chuyện thương hiệu -->
    <section class="py-5 mt-4">
      <div class="container">
        <div class="row align-items-center gx-5">
          <div class="col-md-6 order-2 order-md-1 mt-4 mt-md-0">
            <div class="position-relative overflow-hidden img-wrapper rounded-4">
              <img :src="smartImage" alt="SORA Boutique Story" @error="handleImageError"
                class="img-fluid w-100 object-fit-cover shadow-sm transition-transform custom-img-portrait rounded-4" />
              <div class="img-border position-absolute rounded-4"></div>
            </div>
          </div>
          <div class="col-md-6 order-1 order-md-2">
            <div class="mb-5">
              <h2 class="display-6 font-serif text-main mb-3">Khởi Nguồn Khí Chất</h2>
              <div class="divider bg-accent mb-4"></div>
              <p class="lead fw-light text-secondary" style="line-height: 1.8;">
                SORA không chỉ là trang sức, SORA là tuyên ngôn của sự tinh tế. Ra đời với mong muốn mang đến những món
                phụ kiện vượt qua giá trị vật chất thông thường, chúng tôi chế tác nên những mảnh ghép phản chiếu tâm
                hồn và cá tính riêng biệt của thế hệ trẻ hiện đại.
              </p>
            </div>
            <div>
              <h3 class="h4 font-serif text-dark mb-3">Câu Chuyện Của SORA</h3>
              <p class="fw-light text-secondary" style="line-height: 1.8;">
                Lấy cảm hứng từ từ "Sora" (Bầu trời) trong tiếng Nhật – biểu tượng của sự tự do, vô hạn và thuần khiết.
                Mỗi thiết kế của SORA bắt đầu từ những nét phác thảo đầy đam mê, đi qua đôi bàn tay tài hoa của các nghệ
                nhân kim hoàn, để trở thành một tác phẩm nghệ thuật thu nhỏ. Chúng tôi tin rằng, trang sức cao cấp không
                cần phải quá phô trương, sự sang trọng thực sự nằm ở sự tối giản, tỉ mỉ và một câu chuyện có chiều sâu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Sứ mệnh & 5. Tầm nhìn -->
    <section class="py-5 bg-white">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-6">
            <div class="card h-100 border-light shadow-sm card-hover p-4 p-md-5 position-relative overflow-hidden">
              <div class="card-indicator bg-main position-absolute top-0 start-0 h-100"></div>
              <div class="card-body">
                <h3 class="text-main text-uppercase fw-bold mb-3" style="font-size: 0.85rem; letter-spacing: 0.15em;">Sứ
                  mệnh</h3>
                <h4 class="h2 font-serif text-dark mb-4">Đánh thức vẻ đẹp tiềm ẩn</h4>
                <p class="fw-light text-secondary mb-0" style="line-height: 1.8;">
                  Trao quyền cho người trẻ tự tin thể hiện bản ngã qua từng món trang sức chế tác tinh xảo. SORA đồng
                  hành cùng bạn trong mọi khoảnh khắc, biến những điều bình dị trở nên phi thường.
                </p>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="card h-100 border-light shadow-sm card-hover p-4 p-md-5 position-relative overflow-hidden">
              <div class="card-indicator bg-accent position-absolute top-0 start-0 h-100"></div>
              <div class="card-body">
                <h3 class="text-accent text-uppercase fw-bold mb-3" style="font-size: 0.85rem; letter-spacing: 0.15em;">
                  Tầm nhìn</h3>
                <h4 class="h2 font-serif text-dark mb-4">Biểu tượng đương đại</h4>
                <p class="fw-light text-secondary mb-0" style="line-height: 1.8;">
                  Trở thành thương hiệu trang sức cao cấp hàng đầu dành cho thế hệ Millennials và Gen Z tại Việt Nam.
                  Định hình lại khái niệm "Luxury" – Hiện đại, Bền vững và Cầm nắm được cảm xúc.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. Giá trị cốt lõi -->
    <section class="py-5 bg-main text-white mt-5">
      <div class="container py-4">
        <div class="text-center mb-5">
          <h2 class="display-5 font-serif text-accent mb-3">Giá Trị Cốt Lõi</h2>
          <div class="divider bg-accent mx-auto"></div>
        </div>

        <div class="row g-5 text-center">
          <div class="col-md-4">
            <div
              class="icon-circle border-accent text-accent mx-auto mb-4 d-flex align-items-center justify-content-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h4 class="h3 font-serif mb-3">Chế Tác Thủ Công</h4>
            <p class="fw-light text-white-50 px-3">Mỗi sản phẩm là kết tinh từ hàng chục giờ lao động miệt mài của các
              nghệ nhân giàu kinh nghiệm.</p>
          </div>
          <div class="col-md-4">
            <div
              class="icon-circle border-accent text-accent mx-auto mb-4 d-flex align-items-center justify-content-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h4 class="h3 font-serif mb-3">Thiết Kế Độc Bản</h4>
            <p class="fw-light text-white-50 px-3">Hướng tới phong cách Minimal tinh tế, không hòa lẫn. Tôn vinh vẻ đẹp
              cá nhân của người sở hữu.</p>
          </div>
          <div class="col-md-4">
            <div
              class="icon-circle border-accent text-accent mx-auto mb-4 d-flex align-items-center justify-content-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h4 class="h3 font-serif mb-3">Chất Liệu Bền Vững</h4>
            <p class="fw-light text-white-50 px-3">Tuyển chọn khắt khe từ Vàng, Bạc cao cấp đến Đá quý thiên nhiên, cam
              kết nguồn gốc minh bạch.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 7. Giới thiệu sản phẩm (Combo Carousel) -->
    <section class="py-5 my-5 combos-editorial" v-if="combos.length > 0">
      <div class="container-fluid px-0 combos-container">
        <div class="section-heading text-center mb-2 mt-5">
          <span class="section-kicker text-gold">Tuyệt Tác Từ Vật Liệu Cao Cấp</span>
          <h2 class="font-serif">Bộ sưu tập quà tặng hoàn hảo</h2>
        </div>
        <ComboCarousel :combos="combos" />
      </div>
    </section>

    <!-- 8. Cam kết với khách hàng -->
    <section class="py-5" style="background-color: #f4f1ee;">
      <div class="container py-4 text-center">
        <h2 class="h2 font-serif text-main mb-5">Lời Cam Kết Của Chúng Tôi</h2>
        <div class="row g-4 text-dark">
          <div class="col-6 col-md-3 d-flex flex-column align-items-center">
            <span class="text-danger-custom mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
            <span class="fw-medium text-uppercase small" style="letter-spacing: 0.1em;">Bảo hành trọn đời</span>
          </div>
          <div class="col-6 col-md-3 d-flex flex-column align-items-center">
            <span class="text-danger-custom mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </span>
            <span class="fw-medium text-uppercase small" style="letter-spacing: 0.1em;">Bao bì sang trọng</span>
          </div>
          <div class="col-6 col-md-3 d-flex flex-column align-items-center">
            <span class="text-danger-custom mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </span>
            <span class="fw-medium text-uppercase small" style="letter-spacing: 0.1em;">Làm sạch miễn phí</span>
          </div>
          <div class="col-6 col-md-3 d-flex flex-column align-items-center">
            <span class="text-danger-custom mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </span>
            <span class="fw-medium text-uppercase small" style="letter-spacing: 0.1em;">Thanh toán an toàn</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 9. Đoạn kết + Lời kêu gọi hành động (CTA) -->
    <section class="py-5 my-5 text-center">
      <div class="container d-flex flex-column align-items-center py-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" class="text-accent mb-4" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        <h2 class="display-5 font-serif text-main mb-4">Sẵn Sàng Tỏa Sáng Cùng SORA?</h2>
        <p class="lead fw-light text-secondary mb-5" style="max-width: 600px;">
          Hãy để chúng tôi giúp bạn tìm thấy món trang sức thuộc về riêng bạn. Một dấu ấn thời gian, một mảnh ghép hoàn
          hảo cho phong cách thường nhật.
        </p>
        <router-link to="/products" class="editorial-btn text-decoration-none px-5 py-3">
          Khám Phá SORA
        </router-link>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import ComboCarousel from '@/components/ui/ComboCarousel.vue';
import clientApiClient from '@/utils/clientApiClient';
import { getStorageUrl } from '@/utils/env';

const soraPlaceholder = '/Sora-placeholder.png';

const combos = ref([]);
const homeDataPayload = ref(null);

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_URL}/storage/${path}`;
};

const smartImage = computed(() => {
  const data = homeDataPayload.value;
  if (!data) return 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop';

  const banners = data.banners || [];

  // Ưu tiên lấy ảnh banner mobile theo yêu cầu
  const mobileBanners = banners.filter(b => b?.image_mobile);
  let selectedImage = null;

  if (mobileBanners.length > 0) {
    selectedImage = mobileBanners[0].image_mobile;
  } else if (banners.length > 0 && banners[0].image_desktop) {
    selectedImage = banners[0].image_desktop;
  }

  return selectedImage ? getImageUrl(selectedImage) : 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop';
});

const handleImageError = (event) => {
  event.target.onerror = null; // Prevent infinite loop
  event.target.src = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop';
};

const fetchCombos = async () => {
  try {
    const res = await clientApiClient.get('/client/home-data', { ignoreAuthRedirect: true });
    const payload = res.data?.data || res.data || {};
    homeDataPayload.value = payload;
    if (payload.combos) {
      combos.value = payload.combos.slice(0, 5);
    }
  } catch (e) {
    console.error("Failed to fetch combos", e);
  }
}

onMounted(() => {
  fetchCombos();
});
</script>

<style scoped>
.about-page {
  --sora-primary: #9f273b;
  --sora-secondary: #e7ce7d;
  --sora-accent: #cc1e2e;
  --sora-primary-rgb: 159, 39, 59;
  --sora-secondary-rgb: 231, 206, 125;
  --sora-accent-rgb: 204, 30, 46;
}

/* Màu sắc thương hiệu SORA */
.bg-main {
  background-color: #9f273b !important;
}

.text-main {
  color: #9f273b !important;
}

.bg-accent {
  background-color: #e7ce7d !important;
}

.text-accent {
  color: #e7ce7d !important;
}

.text-danger-custom {
  color: #cc1e2e !important;
}

.border-accent {
  border-color: #e7ce7d !important;
}

/* Font Serif cho tiêu đề */
.font-serif {
  font-family: "Playfair Display", "Merriweather", serif;
}

/* Các tiện ích tùy chỉnh */
.max-w-2xl {
  max-width: 42rem;
  margin-left: auto;
  margin-right: auto;
}

.max-w-xl {
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
}

.object-fit-cover {
  object-fit: cover !important;
}

/* Nút bấm (Button) */
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

/* Banner (Sora Banner Style) */
.text-champagne {
  color: #ead089 !important;
}

.z-index-2 {
  z-index: 2;
}

.sora-banner {
  min-height: 380px;
  background:
    linear-gradient(135deg, rgba(54, 6, 17, 0.98), rgba(114, 20, 38, 0.96) 48%, rgba(74, 9, 24, 0.98)),
    repeating-linear-gradient(120deg, rgba(255, 255, 255, 0.045) 0 1px, transparent 1px 14px);
  isolation: isolate;
}

.sora-banner::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(255, 236, 189, 0.2), transparent 42%),
    linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.08) 44%, transparent 64%);
  opacity: 0.9;
  z-index: 0;
}

.banner-ambient {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(0deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 84px 84px;
  mask-image: radial-gradient(circle at center, black 0%, transparent 68%);
  z-index: 0;
}

.banner-glow {
  position: absolute;
  width: 330px;
  height: 330px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(231, 206, 125, 0.2), transparent 68%);
  filter: blur(3px);
  z-index: 0;
}

.banner-glow-left {
  left: -120px;
  bottom: -150px;
}

.banner-glow-right {
  right: -100px;
  top: -120px;
}

.banner-monogram {
  position: absolute;
  text-align: center;
  color: rgba(255, 244, 218, 0.038);
  font-size: clamp(3.4rem, 9vw, 8.8rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1;
  white-space: nowrap;
  z-index: 0;
  left: 50%;
  transform: translateX(-50%);
  bottom: 52px;
}

.banner-content {
  max-width: 850px;
}

.banner-content h1 {
  letter-spacing: 0;
  line-height: 1.05;
  text-shadow: 0 10px 35px rgba(0, 0, 0, 0.32);
}

.banner-subtitle {
  color: rgba(255, 248, 231, 0.9);
  line-height: 1.75;
  text-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
}

.banner-line-art {
  position: absolute;
  width: 118px;
  height: 118px;
  border: 1px solid rgba(231, 206, 125, 0.34);
  transform: rotate(45deg);
  z-index: 1;
}

.banner-line-art::before,
.banner-line-art::after {
  content: "";
  position: absolute;
  inset: 18px;
  border: 1px solid rgba(231, 206, 125, 0.2);
}

.banner-line-art-left {
  left: 8%;
  top: 24%;
}

.banner-line-art-right {
  right: 8%;
  bottom: 22%;
}

@media (max-width: 992px) {
  .sora-banner {
    min-height: 340px;
  }

  .banner-line-art {
    opacity: 0.45;
  }
}

@media (max-width: 768px) {
  .sora-banner {
    min-height: 320px;
  }

  .banner-content h1 {
    font-size: 2.45rem;
  }

  .banner-subtitle {
    font-size: 1rem !important;
  }

  .banner-line-art {
    display: none;
  }

  .banner-monogram {
    bottom: 38px;
    font-size: 3.5rem;
  }
}

/* Image wrapper (Border xoắn) */
.img-wrapper {
  padding: 1rem;
}

.img-wrapper img {
  position: relative;
  z-index: 2;
}

.img-border {
  top: 0;
  left: 0;
  right: 2rem;
  bottom: 2rem;
  border: 1px solid #e7ce7d;
  z-index: 1;
}

.custom-img-portrait {
  aspect-ratio: 4/5;
}

/* Đường kẻ ngăn cách (Divider) */
.divider {
  width: 4rem;
  height: 2px;
}

/* Card Mission & Vision */
.card-hover {
  transition: box-shadow 0.3s ease;
}

.card-hover:hover {
  box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .15) !important;
}

.card-indicator {
  width: 4px;
  transition: width 0.3s ease, opacity 0.3s ease;
  opacity: 1;
}

.card-hover:hover .card-indicator {
  width: 100%;
  opacity: 0.05;
}

/* Icon vòng tròn */
.icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1px solid;
}

/* Khối sản phẩm (Fix ảnh vuông tuyệt đối) */
.square-ratio {
  width: 100%;
  padding-bottom: 100%;
  /* Tạo tỷ lệ vuông chuẩn 1:1 */
  display: block;
  overflow: hidden;
}

.img-zoom-wrapper img {
  transition: transform 0.7s ease;
}

.product-card:hover .img-zoom-wrapper img {
  transform: scale(1.1);
}

.product-overlay {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  z-index: 2;
}

/* Link khám phá */
.product-link:hover {
  color: #cc1e2e !important;
}

/* Combo Carousel Container Overrides */
.combos-editorial {
  background-color: #fffafa;
  overflow: hidden;
}

.combos-container {
  max-width: var(--home-container-width, 1400px);
}

.section-heading {
  max-width: 740px;
  margin: 0 auto 3rem;
}

.section-kicker {
  display: block;
  font-family: 'Oswald', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--sora-primary, #9f273b);
  margin-bottom: 0.75rem;
}

.section-heading h2 {
  font-size: clamp(2.3rem, 5vw, 4.4rem);
  line-height: 1.02;
}

.text-gold {
  color: #d4af37 !important;
}
</style>