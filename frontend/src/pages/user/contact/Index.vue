<template>
  <div class="contact-page font-sans bg-light-custom pb-5">
    
    <!-- Tiêu đề chính (Hero Section) -->
    <section class="sora-banner position-relative d-flex align-items-center justify-content-center overflow-hidden">
      <div class="banner-ambient"></div>
      <div class="banner-glow banner-glow-left"></div>
      <div class="banner-glow banner-glow-right"></div>
      <div class="banner-monogram font-serif">SORA BOUTIQUE</div>
      <div class="banner-line-art banner-line-art-left"></div>
      <div class="banner-line-art banner-line-art-right"></div>

      <div class="position-relative z-index-2 text-center px-3 banner-content">
        <p class="text-champagne font-oswald tracking-widest mb-3 text-uppercase small">
          <i class="bi bi-stars me-2"></i>Dịch Vụ Khách Hàng
        </p>
        <h1 class="display-3 fw-bold font-serif mb-3 text-white text-uppercase">Kết Nối Cùng SORA</h1>
        <p class="banner-subtitle fw-light fs-5 mb-0 font-serif text-white">
          Sẵn sàng lắng nghe và kiến tạo khoảnh khắc dành riêng cho bạn.
        </p>
      </div>
    </section>

    <!-- Nội dung chính -->
    <section class="py-5" style="margin-top: -3rem; position: relative; z-index: 2;">
      <div class="container bg-white shadow-sm p-4 p-md-5">
        
        <!-- Đoạn mô tả ngắn -->
        <div class="text-center max-w-2xl mb-5 mx-auto">
          <h2 class="h3 font-serif text-main mb-3">Trải Nghiệm Chăm Sóc Độc Bản</h2>
          <p class="text-secondary fw-light" style="line-height: 1.8;">
            Mỗi yêu cầu, mỗi câu chuyện của bạn đều là mảnh ghép quan trọng giúp SORA vươn tới sự hoàn mỹ. Đừng ngần ngại chia sẻ, đội ngũ chuyên viên của chúng tôi luôn ở đây, sẵn sàng lắng nghe và kiến tạo nên những khoảnh khắc trang sức dành riêng cho bạn.
          </p>
        </div>

        <div class="row g-5 mt-2">
          
          <!-- Thông tin liên hệ -->
          <div class="col-lg-5 order-2 order-lg-1 pe-lg-5">
            <div class="contact-info-wrapper h-100 bg-light p-4 p-md-5 border-start border-accent border-4 d-flex flex-column">
              <h3 class="h4 font-serif text-dark mb-4">Thông Tin Liên Hệ</h3>
              
              <ul class="list-unstyled mb-5 text-secondary fw-light">
                <li class="d-flex align-items-start mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" class="text-main me-3 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <div>
                    <strong class="d-block text-dark fw-medium mb-1">SORA Flagship Store</strong>
                    Khu đô thị cao cấp, Quận 1, TP. Hồ Chí Minh
                  </div>
                </li>
                <li class="d-flex align-items-start mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" class="text-main me-3 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <div>
                    <strong class="d-block text-dark fw-medium mb-1">Hotline CSKH (24/7)</strong>
                    <a href="tel:0901234567" class="text-secondary text-decoration-none custom-link">090 123 4567</a>
                  </div>
                </li>
                <li class="d-flex align-items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" class="text-main me-3 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div>
                    <strong class="d-block text-dark fw-medium mb-1">Giờ mở cửa</strong>
                    09:00 - 21:00 (Từ Thứ 2 đến Chủ Nhật)
                  </div>
                </li>
              </ul>
              
              <!-- Nút Liên Hệ Trực Tiếp Cố Định Ở Khối Trái -->
              <!-- <div class="mt-2 mb-4 pt-4 border-top border-accent">
                <h4 class="h6 font-serif text-dark mb-3 fw-bold">Trợ Giúp Tức Thời</h4>
                <p class="text-secondary small fw-light mb-3">Kết nối trực tiếp với chuyên viên SORA để nhận tư vấn ngay lập tức.</p>
                <div class="d-flex gap-2">
                  <a href="https://zalo.me/0901234567" target="_blank" class="btn btn-zalo flex-grow-1 text-uppercase fw-medium rounded-0 py-2 d-flex justify-content-center align-items-center">
                    <strong class="me-2" style="font-size: 1.1rem;">Zalo</strong> Chat
                  </a>
                  <a href="https://m.me/sorajewelry" target="_blank" class="btn btn-messenger flex-grow-1 text-uppercase fw-medium rounded-0 py-2 d-flex justify-content-center align-items-center">
                    <i class="fa-brands fa-facebook-messenger me-2 fs-5"></i> Msg
                  </a>
                </div>
              </div> -->

              <!-- Đoạn cam kết -->
              <div class="p-3 bg-white border border-light text-center mt-auto">
                <p class="mb-0 text-main font-serif fst-italic text-sm">
                  "Mọi yêu cầu qua Form hệ thống sẽ được Chuyên viên SORA phản hồi tận tâm muộn nhất trong vòng 2 giờ làm việc."
                </p>
              </div>
            </div>
          </div>

          <!-- Form liên hệ (Gọi API lưu Database) -->
          <div class="col-lg-7 order-1 order-lg-2">
            <div class="px-md-4 py-3">
              <h3 class="h4 font-serif text-main mb-4">Gửi Lời Nhắn Cho Hệ Thống</h3>
              <form @submit.prevent="submitContactForm">
                <div class="row g-4">
                  <div class="col-md-6">
                    <div class="form-floating custom-floating">
                      <input type="text" class="form-control custom-input" id="fullname" v-model="form.fullname" placeholder="Họ và tên" required>
                      <label for="fullname" class="text-muted fw-light">Danh xưng / Họ và tên *</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating custom-floating">
                      <input type="tel" class="form-control custom-input" id="phone" v-model="form.phone" placeholder="Số điện thoại" required>
                      <label for="phone" class="text-muted fw-light">Số điện thoại liên hệ *</label>
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="form-floating custom-floating">
                      <input type="email" class="form-control custom-input" id="email" v-model="form.email" placeholder="name@example.com" required>
                      <label for="email" class="text-muted fw-light">Địa chỉ Email *</label>
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="form-floating custom-floating">
                      <textarea class="form-control custom-input" id="message" v-model="form.message" placeholder="Nội dung tin nhắn" style="height: 120px" required></textarea>
                      <label for="message" class="text-muted fw-light">Mong muốn hoặc thắc mắc của bạn...</label>
                    </div>
                  </div>
                  <div class="col-12 mt-5 text-end">
                    <!-- Nút Gửi kèm trạng thái Loading -->
                    <button type="submit" class="editorial-btn text-uppercase px-5 py-3 w-100 w-md-auto d-flex align-items-center justify-content-center ms-auto" style="letter-spacing: 0.1em;" :disabled="isSubmitting">
                      <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                      Gửi Lời Nhắn
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Câu kết (Slogan) -->
    <section class="py-5 text-center">
      <div class="container py-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="text-accent mb-3 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        <p class="h5 font-serif text-main fst-italic mb-2">SORA – Nơi khí chất độc bản được tôn vinh.</p>
        <p class="text-muted fw-light small">Hãy để chúng tôi đồng hành cùng phong cách vượt thời gian của bạn.</p>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { createSoraAlert } from '@/utils/soraAlertConfig';
import clientApiClient from '@/utils/clientApiClient';

// 1. Quản lý trạng thái form
const form = ref({
  fullname: '',
  phone: '',
  email: '',
  message: ''
});
const isSubmitting = ref(false);

// 3. Cấu hình SweetAlert2 đồng bộ với toàn hệ thống
const soraAlert = createSoraAlert({
  customClass: {
    confirmButton: 'px-4 py-2 mx-2 rounded-0 shadow-sm fw-bold font-oswald tracking-widest text-uppercase'
  }
});

// 4. Hàm Gửi Form Lưu Database
const submitContactForm = async () => {
  isSubmitting.value = true;
  
  try {
    const response = await clientApiClient.post('/client/contact', form.value, {
      ignoreAuthRedirect: true,
      skipCartSession: true
    });

    if (response.data.status) {
      soraAlert.fire({
        icon: 'success',
        title: 'Đã Gửi Thành Công!',
        text: response.data.message
      });
      // Reset form cho sạch
      form.value = { fullname: '', phone: '', email: '', message: '' };
    }
  } catch (error) {
    if (error.response && error.response.status === 422) {
      // Lỗi do nhập thiếu dữ liệu
      const errors = error.response.data.errors;
      const firstErrorMsg = Object.values(errors)[0][0]; 
      soraAlert.fire({ icon: 'error', title: 'Kiểm tra lại dữ liệu', text: firstErrorMsg });
    } else {
      // Lỗi do server sập hoặc chưa chạy php artisan serve
      soraAlert.fire({ icon: 'error', title: 'Lỗi Kết Nối', text: 'Có lỗi máy chủ xảy ra. Vui lòng thử lại sau!' });
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Màu sắc thương hiệu SORA */
.bg-light-custom { background-color: #faf9f8 !important; }
.bg-main { background-color: #9f273b !important; }
.text-main { color: #9f273b !important; }
.bg-accent { background-color: #e7ce7d !important; }
.text-accent { color: #e7ce7d !important; }
.text-danger-custom { color: #cc1e2e !important; }
.border-accent { border-color: #e7ce7d !important; }

/* Nút Zalo & Messenger tĩnh (Trong trang) */
.btn-zalo {
  background-color: #0068FF;
  color: white;
  border: 1px solid #0068FF;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
}
.btn-zalo:hover {
  background-color: #0054cc;
  border-color: #0054cc;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 104, 255, 0.2);
}

.btn-messenger {
  background-color: #000000;
  color: white;
  border: 1px solid #000000;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
}
.btn-messenger:hover {
  background-color: #333333;
  border-color: #333333;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Font Serif cho tiêu đề */
.font-serif {
  font-family: "Playfair Display", "Merriweather", serif;
}
.max-w-2xl { max-width: 42rem; }

/* Custom Link Hover */
.custom-link {
  transition: color 0.3s ease;
}
.custom-link:hover {
  color: #9f273b !important;
}

/* Custom Input Style (Luxury Minimal) */
.custom-input {
  border: none;
  border-bottom: 1px solid #dee2e6;
  border-radius: 0;
  padding-left: 0;
  padding-right: 0;
  background-color: transparent;
  box-shadow: none !important;
  font-weight: 300;
  transition: border-color 0.3s ease;
}
.custom-input:focus {
  border-bottom: 2px solid #9f273b;
  background-color: transparent;
}

/* Floating Label Tweaks for Border Bottom Input */
.custom-floating > label {
  padding-left: 0;
}
.custom-floating > .form-control:focus ~ label,
.custom-floating > .form-control:not(:placeholder-shown) ~ label {
  color: #9f273b;
  transform: scale(0.85) translateY(-0.75rem) translateX(0);
}

/* Custom Floating Label Tweaks */
@media (min-width: 768px) {
  .w-md-auto { width: auto !important; }
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
