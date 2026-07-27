<template>
  <div class="contact-page font-sans bg-white pb-5">
    
    <!-- Tiêu đề chính (Hero Section) -->
    <section class="sora-banner position-relative d-flex align-items-center justify-content-center overflow-hidden">
      <div class="banner-ambient"></div>
      <div class="banner-glow banner-glow-left"></div>
      <div class="banner-glow banner-glow-right"></div>
      <div class="banner-monogram font-serif">SORA BOUTIQUE</div>
      <div class="banner-line-art banner-line-art-left"></div>
      <div class="banner-line-art banner-line-art-right"></div>

      <div class="position-relative z-index-2 text-center px-3 banner-content d-flex flex-column align-items-center">
        <p class="text-champagne font-oswald tracking-widest mb-2 text-uppercase small">
          <i class="bi bi-headset me-2"></i>DỊCH VỤ KHÁCH HÀNG
        </p>
        <h1 class="display-3 fw-bold font-serif mb-2 text-gold-gradient text-uppercase">KẾT NỐI CÙNG SORA</h1>
        <div class="d-flex align-items-center justify-content-center mb-3">
          <svg width="120" height="15" viewBox="0 0 150 20" xmlns="http://www.w3.org/2000/svg" style="opacity: 0.9;">
            <path d="M10 10h40m50 0h40M65 10c0-3 4-5 10-5s10 2 10 5-4 5-10 5-10-2-10-5z" stroke="#e7ce7d" stroke-width="1.5" fill="none" />
          </svg>
        </div>
        <p class="banner-subtitle fw-light fs-5 mb-0 font-serif text-white-50 d-none d-md-block" style="max-width: 800px; margin: 0 auto;">
          Sẵn sàng lắng nghe và kiến tạo khoảnh khắc dành riêng cho bạn.
        </p>
      </div>
    </section>

    <!-- Nội dung chính -->
    <section class="py-5" style="margin-top: -3rem; position: relative; z-index: 2;">
      <div class="container bg-white shadow-lg rounded-4 p-4 p-md-5 border border-light">
        
        <div class="row g-5">
          
          <!-- Thông tin liên hệ -->
          <div class="col-lg-5 order-2 order-lg-1 pe-lg-5">
            <div class="contact-info-wrapper h-100 p-4 p-md-5 rounded-4 d-flex flex-column text-white" style="background: linear-gradient(135deg, #3a0a18, #6d152a); box-shadow: 0 15px 35px rgba(0,0,0,0.15);">
              <h3 class="h4 font-serif text-gold-gradient mb-4">Thông Tin Liên Hệ</h3>
              
              <ul class="list-unstyled mb-5 text-white-50 fw-light">
                <li class="d-flex align-items-start mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" class="text-champagne me-3 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <div>
                    <strong class="d-block text-white fw-medium mb-1">SORA Flagship Store</strong>
                    Khu đô thị cao cấp, Quận 1, TP. Hồ Chí Minh
                  </div>
                </li>
                <li class="d-flex align-items-start mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" class="text-champagne me-3 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <div>
                    <strong class="d-block text-white fw-medium mb-1">Hotline CSKH (24/7)</strong>
                    <a href="tel:0901234567" class="text-champagne text-decoration-none custom-link">090 123 4567</a>
                  </div>
                </li>
                <li class="d-flex align-items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" class="text-champagne me-3 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div>
                    <strong class="d-block text-white fw-medium mb-1">Giờ mở cửa</strong>
                    09:00 - 21:00 (Từ Thứ 2 đến Chủ Nhật)
                  </div>
                </li>
              </ul>

              <!-- Đoạn cam kết -->
              <div class="p-3 rounded-3 mt-auto" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(231,206,125,0.2);">
                <p class="mb-0 text-champagne font-serif fst-italic text-sm">
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
                    <label class="premium-form-label">Danh xưng / Họ và tên *</label>
                    <input type="text" class="premium-form-control w-100" id="fullname" v-model="form.fullname" placeholder="Nhập họ và tên của bạn" required>
                  </div>
                  <div class="col-md-6">
                    <label class="premium-form-label">Số điện thoại liên hệ *</label>
                    <input type="tel" class="premium-form-control w-100" id="phone" v-model="form.phone" placeholder="Nhập số điện thoại" required>
                  </div>
                  <div class="col-12">
                    <label class="premium-form-label">Địa chỉ Email *</label>
                    <input type="email" class="premium-form-control w-100" id="email" v-model="form.email" placeholder="name@example.com" required>
                  </div>
                  <div class="col-12">
                    <label class="premium-form-label">Mong muốn hoặc thắc mắc của bạn *</label>
                    <textarea class="premium-form-control w-100" id="message" v-model="form.message" placeholder="Xin vui lòng mô tả chi tiết..." style="height: 140px; resize: none;" required></textarea>
                  </div>
                  <!-- CAPTCHA -->
                  <div class="col-12 mt-3">
                    <div id="contact-recaptcha" v-show="!recaptchaError"></div>
                    <div v-if="recaptchaError" class="recaptcha-error">
                       <p style="color: #cc1e2e; font-size: 14px; margin-bottom: 8px;">Không thể tải mã bảo vệ CAPTCHA do lỗi mạng.</p>
                       <button type="button" @click="retryRecaptcha" class="btn-resend" style="width: auto; padding: 5px 15px; font-size: 13px;">Thử lại</button>
                    </div>
                  </div>
                  <div class="col-12 mt-4 text-end">
                    <!-- Nút Gửi kèm trạng thái Loading -->
                    <button type="submit" class="editorial-btn text-uppercase px-5 py-3 w-100 w-md-auto d-flex align-items-center justify-content-center ms-auto" style="letter-spacing: 0.1em;" :disabled="isSubmitting || !recaptchaToken">
                      <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                      GỬI LỜI NHẮN
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
    <section class="text-center">
      <div class="container">
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
import { ref, onMounted } from 'vue';
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
const recaptchaToken = ref('');
const recaptchaError = ref(false);

const retryRecaptcha = () => {
  recaptchaError.value = false;
  const el = document.getElementById('contact-recaptcha');
  if (el) el.innerHTML = '';
  recaptchaToken.value = '';
  
  const oldScript = document.getElementById('grecaptcha-script');
  if (oldScript) oldScript.remove();
  
  maxRetries = 50;
  initRecaptchaScript();
};

// Render CAPTCHA
const renderRecaptcha = () => {
  if (window.grecaptcha && window.grecaptcha.render) {
    const el = document.getElementById('contact-recaptcha');
    if (el) {
      el.innerHTML = '';
      window.grecaptcha.render(el, {
        sitekey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
        callback: (token) => { recaptchaToken.value = token; },
        'expired-callback': () => { recaptchaToken.value = ''; }
      });
    }
  }
};

let recaptchaInitTimeout = null;
let maxRetries = 50;

const initRecaptchaScript = () => {
  const init = () => {
    if (window.grecaptcha && window.grecaptcha.ready) {
      window.grecaptcha.ready(() => {
        renderRecaptcha();
      });
    } else if (maxRetries > 0) {
      maxRetries--;
      recaptchaInitTimeout = setTimeout(init, 200);
    } else {
      recaptchaError.value = true;
    }
  };

  if (window.grecaptcha) {
    init();
  } else {
    const script = document.createElement('script');
    script.id = 'grecaptcha-script';
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = init;
    script.onerror = () => { 
        console.error('Failed to load reCAPTCHA script'); 
        recaptchaError.value = true;
    };
    document.head.appendChild(script);
  }
};

onMounted(() => {
  initRecaptchaScript();
});

import { onUnmounted } from 'vue';

onUnmounted(() => {
  if (recaptchaInitTimeout) {
    clearTimeout(recaptchaInitTimeout);
  }
});

// 3. Cấu hình SweetAlert2 đồng bộ với toàn hệ thống
const soraAlert = createSoraAlert({
  customClass: {
    confirmButton: 'px-4 py-2 mx-2 rounded-0 shadow-sm fw-bold font-oswald tracking-widest text-uppercase'
  }
});

// 4. Hàm Gửi Form Lưu Database
const submitContactForm = async () => {
  if (!recaptchaToken.value) {
    soraAlert.fire({ icon: 'warning', title: 'Thiếu xác thực', text: 'Vui lòng xác nhận bạn không phải là robot.' });
    return;
  }
  isSubmitting.value = true;
  
  try {
    const payload = { ...form.value, 'g-recaptcha-response': recaptchaToken.value };
    const response = await clientApiClient.post('/client/contact', payload, {
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
      recaptchaToken.value = '';
      if (window.grecaptcha) window.grecaptcha.reset();
    }
  } catch (error) {
    if (error.response && error.response.status === 422) {
      // Lỗi do nhập thiếu dữ liệu
      const errors = error.response.data.errors;
      const firstErrorMsg = Object.values(errors)[0][0]; 
      soraAlert.fire({ icon: 'error', title: 'Kiểm tra lại dữ liệu', text: firstErrorMsg });
      if (window.grecaptcha) window.grecaptcha.reset();
      recaptchaToken.value = '';
    } else if (error.response && error.response.status === 429) {
      // Lỗi do gửi quá nhiều (Rate limit / Chống Spam)
      let msg = error.response.data.message || 'Bạn đã thao tác quá nhiều. Vui lòng thử lại sau!';
      if (msg === 'Too Many Attempts.') {
        msg = 'Bạn đã vượt quá số lần thử nghiệm (3 lần/giờ). Vui lòng quay lại sau!';
      }
      soraAlert.fire({ 
        icon: 'warning', 
        title: 'Thao tác quá nhanh', 
        text: msg
      });
    } else {
      // Lỗi do server sập hoặc lỗi kết nối
      soraAlert.fire({ icon: 'error', title: 'Lỗi Kết Nối', text: 'Có lỗi máy chủ xảy ra. Vui lòng thử lại sau!' });
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');


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
  font-family: 'Josefin Sans', sans-serif;
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
  border-radius: 10px;
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
  min-height: 340px;
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
    min-height: 160px;
  }

  .banner-content h1 {
    font-size: clamp(1.1rem, 4.5vw, 1.4rem) !important;
    white-space: nowrap;
    margin-bottom: 0 !important;
  }

  .banner-content p.text-champagne {
    margin-bottom: 0.25rem !important;
    font-size: 0.75rem;
  }

  .banner-subtitle {
    font-size: 0.9rem !important;
  }

  .banner-line-art {
    display: none;
  }

  .banner-monogram {
    bottom: 10px;
    font-size: 1.8rem;
    white-space: nowrap;
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

.premium-form-control {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.9rem 1.15rem;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  box-shadow: none;
}

.premium-form-control:focus {
  border-color: #d4af37;
  background-color: #ffffff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
}

.premium-form-control::placeholder {
  color: #94a3b8;
}

.premium-form-label {
  color: #334155;
  font-weight: 500;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  display: block;
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
