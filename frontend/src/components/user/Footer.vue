<template>
  <footer class="site-footer bg-primary-custom">
    
    <div class="pre-footer py-4" style="background-color: var(--secondary);">
      <div class="container">
        <div class="row g-4 text-center">
          <div class="col-6 col-md-3">
            <div class="trust-item">
              <i class="bi bi-truck fs-2 mb-2 d-block text-primary-custom"></i>
              <h6 class="fw-bold font-oswald text-uppercase mb-1 text-primary-custom tracking-wide">Giao hàng miễn phí</h6>
              <p class="text-primary-custom opacity-75 small mb-0">Cho đơn hàng từ 1.000.000đ</p>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="trust-item">
              <i class="bi bi-shield-check fs-2 mb-2 d-block text-primary-custom"></i>
              <h6 class="fw-bold font-oswald text-uppercase mb-1 text-primary-custom tracking-wide">Bảo hành trọn đời</h6>
              <p class="text-primary-custom opacity-75 small mb-0">Làm sáng & đánh bóng miễn phí</p>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="trust-item">
              <i class="bi bi-arrow-repeat fs-2 mb-2 d-block text-primary-custom"></i>
              <h6 class="fw-bold font-oswald text-uppercase mb-1 text-primary-custom tracking-wide">Đổi trả dễ dàng</h6>
              <p class="text-primary-custom opacity-75 small mb-0">Trong vòng 7 ngày đầu tiên</p>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="trust-item">
              <i class="bi bi-headset fs-2 mb-2 d-block text-primary-custom"></i>
              <h6 class="fw-bold font-oswald text-uppercase mb-1 text-primary-custom tracking-wide">Hỗ trợ 24/7</h6>
              <p class="text-primary-custom opacity-75 small mb-0">Hotline: 1234.567.8910</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="main-footer py-5 border-bottom border-light border-opacity-10">
      <div class="container py-3">
        <div class="row g-5">
          
          <div class="col-lg-3 col-md-6 text-center text-md-start">
            <a href="#" @click.prevent="safeNavigate('home')" class="d-inline-block mb-4">
              <img src="../../assets/images/logo1.png" alt="SORA Logo" class="footer-logo filter-white" @error="handleLogoError">
            </a>
            <p class="text-light opacity-75 small mb-4 pe-md-3" style="line-height: 1.8;">
              SORA mang đến những thiết kế trang sức tinh tế, tôn vinh vẻ đẹp đích thực và phong cách cá nhân của bạn. Mỗi chế tác là một tác phẩm nghệ thuật.
            </p>
            <div class="social-links d-flex gap-3 justify-content-center justify-content-md-start">
              <a href="#" class="social-btn"><i class="bi bi-facebook"></i></a>
              <a href="#" class="social-btn"><i class="bi bi-instagram"></i></a>
              <a href="#" class="social-btn"><i class="bi bi-twitter-x"></i></a>
              <a href="#" class="social-btn"><i class="bi bi-youtube"></i></a>
            </div>
          </div>

          <div class="col-lg-3 col-md-6">
            <h5 class="footer-title font-oswald text-uppercase mb-4 text-white">Liên Kết Nhanh</h5>
            <ul class="footer-links list-unstyled m-0 p-0">
              <li><a href="#" @click.prevent="safeNavigate('home')">Trang Chủ</a></li>
              <li><a href="#" @click.prevent="safeNavigate('Shop')">Sản Phẩm Mới</a></li>
              <li><a href="#" @click.prevent="safeNavigate('collections')">Bộ Sưu Tập SORA</a></li>
              <li><a href="#" @click.prevent="safeNavigate('about')">Về Chúng Tôi</a></li>
              <li><a href="#" @click.prevent="safeNavigate('blog')">Tin Tức & Khuyến Mãi</a></li>
            </ul>
          </div>

          <div class="col-lg-3 col-md-6">
            <h5 class="footer-title font-oswald text-uppercase mb-4 text-white">Hỗ Trợ Khách Hàng</h5>
            <ul class="footer-links list-unstyled m-0 p-0">
              <li><a href="#" @click.prevent="safeNavigate('contact')">Trung Tâm Trợ Giúp</a></li>
              <li><a href="#" @click.prevent="safeNavigate('policy', { hash: '#faq' })">Câu Hỏi Thường Gặp</a></li>
              <li><a href="#" @click.prevent="safeNavigate('policy', { hash: '#return-policy' })">Chính Sách Đổi Trả</a></li>
              <li><a href="#" @click.prevent="safeNavigate('policy', { hash: '#privacy-policy' })">Chính Sách Bảo Mật</a></li>
              <li><a href="#" @click.prevent="safeNavigate('profile')">Tra Cứu Đơn Hàng</a></li>
            </ul>
          </div>

          <div class="col-lg-3 col-md-6">
            <h5 class="footer-title font-oswald text-uppercase mb-4 text-white">Nhận Bản Tin SORA</h5>
            <p class="text-light opacity-75 small mb-4">Đăng ký để nhận thông tin về bộ sưu tập mới và các ưu đãi độc quyền.</p>
            
            <form @submit.prevent="subscribeNewsletter" class="newsletter-form position-relative mb-4">
              <input type="email" class="form-control luxury-input pe-5 text-white" 
                     placeholder="Nhập email của bạn..." 
                     v-model="email" required>
              <button type="submit" class="btn border-0 position-absolute end-0 top-50 translate-middle-y text-secondary-custom" 
                      style="padding: 5px 10px;" :disabled="isSubscribing">
                <i v-if="isSubscribing" class="spinner-border spinner-border-sm"></i>
                <i v-else class="bi bi-arrow-right fs-5"></i>
              </button>
            </form>
            
            <div class="contact-info mt-4">
              <p class="text-white small mb-2 fw-medium"><i class="bi bi-geo-alt text-secondary-custom me-2 fs-6"></i> 123 Đường Ngọc Hồi, Hà Nội</p>
              <p class="text-white small mb-0 fw-medium"><i class="bi bi-envelope text-secondary-custom me-2 fs-6"></i> SORA@GMAIL.COM</p>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div class="bottom-footer py-4">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p class="small text-light opacity-75 mb-0 font-oswald tracking-wide" style="font-size: 0.85rem;">
              &copy; {{ new Date().getFullYear() }} <strong class="text-white">SORA JEWELRY</strong>. ALL RIGHTS RESERVED.
            </p>
          </div>
          <div class="col-md-6 text-center text-md-end">
            <div class="payment-methods d-flex justify-content-center justify-content-md-end gap-3 text-light opacity-75">
              <i class="bi bi-credit-card-fill fs-4 hover-secondary" title="Visa/Mastercard"></i>
              <i class="bi bi-wallet-fill fs-4 hover-secondary" title="Ví Điện Tử"></i>
              <i class="bi bi-bank fs-4 hover-secondary" title="Chuyển khoản"></i>
              <i class="bi bi-cash-stack fs-4 hover-secondary" title="COD"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  </footer>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const router = useRouter();
const email = ref('');
const isSubscribing = ref(false);

const safeNavigate = (routeName, options = {}) => {
    if (router.hasRoute(routeName)) {
        router.push({ name: routeName, ...options });
        if (!options.hash) {
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        }
    } else {
        Swal.fire({ 
            toast: true, 
            position: 'bottom-end', 
            icon: 'info', 
            title: 'Tính năng đang được phát triển!', 
            showConfirmButton: false, 
            timer: 2000 
        });
    }
};

const handleLogoError = (e) => {
    e.target.outerHTML = '<h2 class="font-oswald fw-bold text-white m-0 tracking-wide">S O R A</h2>';
};

const subscribeNewsletter = () => {
    if (!email.value) return;
    
    isSubscribing.value = true;
    
    setTimeout(() => {
        isSubscribing.value = false;
        Swal.fire({
            icon: 'success',
            title: 'Đăng ký thành công!',
            text: 'Cảm ơn bạn đã quan tâm. Thông tin ưu đãi sẽ được gửi đến email của bạn.',
            confirmButtonColor: '#9f273b'
        });
        email.value = '';
    }, 1000);
};
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
.text-secondary-custom { color: #e7ce7d !important; }
.bg-primary-custom { background-color: #ffffff !important; }

.font-oswald { font-family: 'Oswald', sans-serif !important; }
.tracking-wide { letter-spacing: 1px; }

.site-footer {
  font-family: 'Arial', sans-serif;
  background-color: #9f273b;
}

.trust-item {
  transition: transform 0.3s ease;
}
.trust-item:hover {
  transform: translateY(-5px);
}

.main-footer {
  background-color: #9f273b;
}

.footer-logo {
  height: 70px; 
  width: auto;
  object-fit: contain;
}

.filter-white {
  filter: brightness(0) invert(1);
}

.social-links .social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff;
  transition: all 0.3s ease;
  background: transparent;
}
.social-links .social-btn:hover {
  background-color: #e7ce7d;
  border-color: #e7ce7d;
  color: #9f273b;
  transform: translateY(-3px);
}

.footer-title {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.footer-links li {
  margin-bottom: 12px;
}
.footer-links a {
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  display: inline-block;
  position: relative;
}
.footer-links a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 1px;
  bottom: -2px;
  left: 0;
  background-color: #e7ce7d;
  transition: width 0.3s ease;
}
.footer-links a:hover {
  color: #e7ce7d; 
}
.footer-links a:hover::after {
  width: 100%;
}

.luxury-input {
  border: none;
  border-bottom: 1px solid rgba(255,255,255,0.3);
  border-radius: 0;
  background: transparent;
  padding-left: 0;
  padding-right: 40px;
  font-size: 0.95rem;
  color: #fff;
  box-shadow: none !important;
  transition: border-color 0.3s ease;
}
.luxury-input::placeholder {
  color: rgba(255,255,255,0.5);
}
.luxury-input:focus {
  border-bottom-color: #e7ce7d;
}

.bottom-footer {
  background-color: #801f2f;
}
.payment-methods i {
  transition: 0.3s;
}
.hover-secondary:hover {
  color: #e7ce7d !important;
}
</style>