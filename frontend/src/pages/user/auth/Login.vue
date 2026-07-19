<template>
  <div class="auth-wrapper">
    <div class="auth-container">
      <!-- Cột trái: Hình ảnh Branding -->
      <div class="auth-banner">
        <div class="banner-overlay"></div>
        <div class="banner-content">
          <img src="../../../assets/images/logo2.png" alt="SORA Jewelry Logo" class="brand-logo-img" />
          <p class="brand-slogan">Tôn Vinh Vẻ Đẹp Độc Bản</p>
        </div>
      </div>

      <!-- Cột phải: Form Đăng nhập -->
      <div class="auth-box">
        <div class="auth-header">
          <h2 class="auth-title font-serif tracking-widest">ĐĂNG NHẬP</h2>
          <p class="subtitle">Đăng nhập để tiếp tục hành trình mua sắm đẳng cấp cùng SORA.</p>
        </div>

        <div v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" placeholder="Nhập email của bạn" required />
          </div>
          <div class="form-group">
            <div class="label-row">
              <label>Mật khẩu</label>
              <router-link to="/forgot-password" class="forgot-password">Quên mật khẩu?</router-link>
            </div>
            <div class="password-input-wrapper">
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="Nhập mật khẩu"
                required autocomplete="new-password" readonly onfocus="this.removeAttribute('readonly');" />
              <button type="button" class="password-toggle" @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'" :aria-pressed="showPassword">
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>
          <div class="form-group remember-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.remember" />
              <span> Nhớ mật khẩu</span>
            </label>
          </div>
          <button type="submit" class="editorial-btn w-100 py-3 fs-6" :disabled="isLoading">
            {{ isLoading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP' }}
          </button>
        </form>

        <!-- Divider -->
        <div class="divider">
          <span>Hoặc tiếp tục với</span>
        </div>

        <!-- Social Logins -->
        <div class="social-login">
          <button @click="LoginWithGoogle" class="btn-social" type="button">
            <svg class="social-icon" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4" />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853" />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05" />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335" />
            </svg>
            Google
          </button>

          <!-- <button @click="handleSocialLogin('Facebook')" class="btn-social" type="button">
            <svg class="social-icon" viewBox="0 0 24 24">
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                fill="#1877F2" />
            </svg>
            Facebook
          </button> -->
        </div>

        <div class="auth-switch">
          <p>
            Chưa có tài khoản?
            <router-link to="/register" class="switch-link">Đăng ký ngay</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';
import Toast from '@/utils/toastConfig';
import { API_BASE_URL } from '@/utils/env';
import clientApiClient from '@/utils/clientApiClient';

const router = useRouter();
const route = useRoute();
const queryClient = useQueryClient();

const LoginWithGoogle = () => {
  if (route.query.redirect) {
    localStorage.setItem('redirect_after_login', route.query.redirect);
  }
  window.location.href = `${API_BASE_URL}/auth/google/redirect`;
}

const isLoading = ref(false);
const errorMessage = ref('');
const showPassword = ref(false);

const form = reactive({
  email: '',
  password: '',
  remember: false
});

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await clientApiClient.post('/login', form, { skipCartSession: true });

    Toast.fire({ icon: 'success', title: 'Đăng nhập thành công!' });

    // Lưu Token
    localStorage.setItem('auth_token', response.data.access_token);

    // CẬP NHẬT MỚI: Lưu thông tin User vào localStorage để Header nhận diện
    localStorage.setItem('userData', JSON.stringify(response.data.user));

    // Đồng bộ giỏ hàng Guest vào tài khoản
    const sessionId = localStorage.getItem('cart_session_id');

    if (form.remember) {
      localStorage.setItem('user_remember_email', form.email);
    } else {
      localStorage.removeItem('user_remember_email');
    }

    if (sessionId) {
      try {
        await clientApiClient.post('/client/cart/merge', {}, {
          ensureCartSession: true,
          ignoreAuthRedirect: true
        });
        localStorage.removeItem('cart_session_id');
        window.dispatchEvent(new CustomEvent('update-cart-count'));
      } catch (e) {
        console.error('Merge cart error:', e);
      }
    }

      setTimeout(() => {
        // Smart Redirect Logic
        let redirectPath = route.query.redirect || localStorage.getItem('redirect_after_login') || '/';
        
        // Prevent loop redirect to admin routes if user is not admin
        if (redirectPath.startsWith('/admin')) {
          redirectPath = '/';
        }
        
        localStorage.removeItem('redirect_after_login');

        // Khôi phục bộ đệm của user
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        queryClient.invalidateQueries({ queryKey: ['user_profile'] });
        
        // Phát sự kiện để Header tự cập nhật
        window.dispatchEvent(new CustomEvent('auth-status-changed'));

        router.push(redirectPath);
      }, 1000);
  } catch (error) {
    if (error.response && error.response.data.errors) {
      errorMessage.value = Object.values(error.response.data.errors).flat().join('\n');
    } else {
      errorMessage.value = 'Email hoặc mật khẩu không chính xác.';
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const rememberedEmail = localStorage.getItem('user_remember_email');
  if (rememberedEmail) {
    form.email = rememberedEmail;
    form.remember = true;
  }
});

const handleSocialLogin = (platform) => {
  Toast.fire({ icon: 'info', title: `Tính năng đăng nhập bằng ${platform} đang được phát triển!` });
};
</script>

<style scoped>
/* Reset & Base */
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fcf9f5;
  padding: 20px 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.auth-container {
  display: flex;
  background: white;
  width: 100%;
  max-width: 950px;
  min-height: 600px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(159, 39, 59, 0.15);
}

.auth-banner {
  flex: 1;
  position: relative;
  background: url('https://images.unsplash.com/photo-1617117832890-a5f11e037000?q=80&w=1000&auto=format&fit=crop') center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(159, 39, 59, 0.9) 0%, rgba(20, 5, 10, 0.8) 100%);
}

.banner-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Ánh sáng dịu (spotlight) chiếu hắt từ sau logo để làm nổi bật logo tự nhiên */


.brand-logo-img {
  max-width: 180px;
  height: auto;
  margin-bottom: 25px;
  /* Viền stroke vàng cực mỏng, không bị "nhựa", cộng với bóng đổ tối để nổi bật */
  filter: drop-shadow(0 0 1.5px #e7ce7d) drop-shadow(0 0 1.5px rgba(231, 206, 125, 0.01)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.01));
}

.brand-slogan {
  font-size: 15px;
  letter-spacing: 3px;
  color: #e7ce7d;
  text-transform: uppercase;
  margin: 0;
  font-weight: 500;
  font-family: 'Oswald', sans-serif;
}

.auth-box {
  flex: 1;
  padding: 50px 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #ffffff;
}

.auth-header {
  margin-bottom: 35px;
}

.auth-title {
  color: #9f273b;
  font-size: 26px;
  margin: 0 0 8px;
  font-family: 'Playfair Display', 'Lora', serif;
  text-transform: uppercase;
}

.subtitle {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.form-group {
  margin-bottom: 22px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.form-group label {
  color: #444;
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 8px;
  display: inline-block;
}

.remember-group {
  margin-top: -10px;
  margin-bottom: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal !important;
  color: #666 !important;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #9f273b;
  margin: 0;
  cursor: pointer;
}

.forgot-password {
  font-size: 13px;
  color: #9f273b;
  text-decoration: none;
  transition: color 0.3s;
}

.forgot-password:hover {
  color: #cc1e2e;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
  background-color: #fafafa;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #e7ce7d;
  background-color: #fff;
  box-shadow: 0 0 0 4px rgba(231, 206, 125, 0.15);
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}

.password-toggle:hover {
  color: #9f273b;
}

.password-toggle:focus {
  outline: none;
}

.btn-primary {
  width: 100%;
  padding: 15px;
  background-color: #9f273b;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-family: 'Oswald', sans-serif;
  margin-top: 10px;
}

.btn-primary:hover:not(:disabled) {
  background-color: #cc1e2e;
  box-shadow: 0 6px 15px rgba(204, 30, 46, 0.2);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background-color: #d39aa2;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 30px 0;
  color: #999;
  font-size: 13px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #eee;
}

.divider span {
  padding: 0 15px;
}

.social-login {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.btn-social {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #444;
  cursor: pointer;
  transition: background 0.3s, border-color 0.3s;
}

.btn-social:hover {
  background: #fcf9f5;
  border-color: #e7ce7d;
}

.social-icon {
  width: 20px;
  height: 20px;
}

.auth-switch {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.switch-link {
  color: #9f273b;
  font-weight: bold;
  text-decoration: none;
  transition: color 0.3s;
  margin-left: 5px;
}

.switch-link:hover {
  color: #e7ce7d;
  text-decoration: underline;
}

.alert {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.alert-error {
  background-color: #fcf0f0;
  color: #cc1e2e;
  border-left: 4px solid #cc1e2e;
}

.alert-success {
  background-color: #f0fdf4;
  color: #166534;
  border-left: 4px solid #22c55e;
}

@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
    max-width: 400px;
  }

  .auth-banner {
    display: none;
  }

  .auth-box {
    padding: 40px 25px;
  }
}
</style>
