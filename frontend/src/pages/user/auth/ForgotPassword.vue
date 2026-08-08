<template>
  <div class="auth-wrapper">
    <div class="auth-container">
      <!-- Cột trái: Hình ảnh Branding giống Login -->
      <div class="auth-banner">
        <div class="banner-overlay"></div>
        <router-link to="/" class="auth-home-link">
          <i class="bi bi-house-door" aria-hidden="true"></i>
          <span>Trang chủ</span>
        </router-link>
        <div class="banner-content">
          <img src="../../../assets/images/logo2.png" alt="SORA Jewelry Logo" class="brand-logo-img" />
          <p class="brand-slogan">Tôn Vinh Vẻ Đẹp Độc Bản</p>
        </div>
      </div>

      <!-- Cột phải: Form Quên mật khẩu -->
      <div class="auth-box">
        <router-link to="/login" class="auth-back-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Về Đăng nhập
        </router-link>

        <div class="auth-header">
          <h2 class="auth-title font-serif tracking-widest">QUÊN MẬT KHẨU</h2>
          
          <p class="subtitle" v-if="step === 1">Đừng lo lắng, chúng tôi sẽ giúp bạn lấy lại tài khoản</p>
          <p class="subtitle" v-if="step === 2">Vui lòng kiểm tra email <strong>{{ form.email }}</strong></p>
          <p class="subtitle" v-if="step === 3">Tạo mật khẩu mới cho tài khoản của bạn.</p>
        </div>

        <!-- BƯỚC 1: NHẬP EMAIL -->
        <form @submit.prevent="handleSendOtp" v-if="step === 1" class="auth-form animation-fade-in">
          <div class="form-group">
            <label>Email đăng ký <span style="color: #cc1e2e">*</span></label>
            <input type="email" v-model="form.email" placeholder="Nhập email của bạn" required />
          </div>

          <!-- CAPTCHA -->
          <div class="form-group">
            <div id="otp-recaptcha" v-show="!recaptchaError"></div>
            <div v-if="recaptchaError" class="recaptcha-error">
               <p style="color: #cc1e2e; font-size: 14px; margin-bottom: 8px;">{{ recaptchaErrorMessage }}</p>
               <button type="button" @click="retryRecaptcha" class="btn-resend" style="width: auto; padding: 5px 15px; font-size: 13px;">Thử lại</button>
            </div>
          </div>

          <button type="submit" class="btn-primary" :disabled="isLoading || !recaptchaToken">
            {{ isLoading ? 'ĐANG XỬ LÝ...' : 'NHẬN MÃ OTP' }}
          </button>
        </form>

        <!-- BƯỚC 2: NHẬP OTP -->
        <form @submit.prevent="handleVerifyOtp" v-if="step === 2" class="auth-form animation-fade-in">
          <div class="otp-container">
            <input
              v-for="(digit, index) in otpArray"
              :key="index"
              type="text"
              class="otp-box-input"
              maxlength="1"
              v-model="otpArray[index]"
              @input="handleOtpInput(index, $event)"
              @keydown="handleOtpKeydown(index, $event)"
              @paste="handleOtpPaste"
              :ref="el => { if (el) otpInputs[index] = el }"
              autocomplete="one-time-code"
              inputmode="numeric"
            />
          </div>

          <div class="otp-actions">
             <span class="change-email" @click="goBackToStep1">Đổi email khác</span>
             <span class="timer">Gửi lại sau: <strong>{{ countdown }}s</strong></span>
          </div>

          <button type="submit" class="btn-primary" :disabled="isLoading || form.otp.length < 6">
            {{ isLoading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN OTP' }}
          </button>
          
          <div class="resend-container">
             <div class="form-group mb-2">
               <div id="otp-recaptcha-resend" v-show="!recaptchaError"></div>
               <div v-if="recaptchaError" class="recaptcha-error">
                 <p style="color: #cc1e2e; font-size: 14px; margin-bottom: 8px;">{{ recaptchaErrorMessage }}</p>
                 <button type="button" @click="retryRecaptcha" class="btn-resend" style="width: auto; padding: 5px 15px; font-size: 13px;">Thu lai</button>
               </div>
             </div>
             <button type="button" class="btn-resend" :disabled="countdown > 0 || isResending || !recaptchaToken" @click="handleSendOtp">
               {{ isResending ? 'ĐANG GỬI...' : 'GỬI LẠI MÃ ' + (countdown > 0 ? `(${countdown}s)` : '') }}
             </button>
          </div>
        </form>

        <!-- BƯỚC 3: ĐẶT LẠI MẬT KHẨU -->
        <form @submit.prevent="handleResetPassword" v-if="step === 3" class="auth-form animation-fade-in">
          <div class="form-group password-group">
            <label>Mật khẩu mới <span style="color: #cc1e2e">*</span></label>
            <div class="input-wrapper">
              <input :type="showPass1 ? 'text' : 'password'" v-model="form.password" placeholder="Nhập mật khẩu mới" required minlength="8" />
              <button type="button" class="toggle-password" @click="showPass1 = !showPass1">
                <svg v-if="showPass1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
            </div>
          </div>

          <div class="form-group password-group">
            <label>Xác nhận mật khẩu <span style="color: #cc1e2e">*</span></label>
            <div class="input-wrapper">
              <input :type="showPass2 ? 'text' : 'password'" v-model="form.password_confirmation" placeholder="Xác nhận mật khẩu mới" required minlength="8" />
              <button type="button" class="toggle-password" @click="showPass2 = !showPass2">
                <svg v-if="showPass2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
            </div>
          </div>

          <button type="submit" class="btn-primary" :disabled="isLoading">
            {{ isLoading ? 'ĐANG XỬ LÝ...' : 'ĐỔI MẬT KHẨU' }}
          </button>
        </form>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import clientApiClient from '@/utils/clientApiClient';
import Toast from '@/utils/toastConfig';

const router = useRouter();
const step = ref(1); 
const isLoading = ref(false);
const isResending = ref(false);

const showPass1 = ref(false);
const showPass2 = ref(false);

const recaptchaToken = ref('');
const recaptchaError = ref(false);
const recaptchaErrorMessage = ref('Không thể tải mã bảo vệ CAPTCHA. Vui lòng thử lại.');
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const setRecaptchaError = (message) => {
  recaptchaToken.value = '';
  recaptchaErrorMessage.value = message;
  recaptchaError.value = true;
};

const retryRecaptcha = () => {
  recaptchaError.value = false;
  recaptchaErrorMessage.value = 'Không thể tải mã bảo vệ CAPTCHA. Vui lòng thử lại.';
  const el = document.getElementById(recaptchaElementId());
  if (el) el.innerHTML = '';
  recaptchaToken.value = '';
  
  const oldScript = document.getElementById('grecaptcha-script');
  if (oldScript) oldScript.remove();
  
  maxRetries = 50;
  initRecaptchaScript();
};

const renderRecaptcha = () => {
  if (!recaptchaSiteKey) {
    setRecaptchaError('CAPTCHA chưa được cấu hình. Vui lòng liên hệ quản trị viên.');
    return;
  }

  if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
    const el = document.getElementById(recaptchaElementId());
    if (el) {
      try {
      el.innerHTML = '';
      recaptchaWidgetId = window.grecaptcha.render(el, {
        sitekey: recaptchaSiteKey,
        callback: (token) => { recaptchaToken.value = token; },
        'expired-callback': () => { recaptchaToken.value = ''; }
      });
      } catch (error) {
        console.error('Failed to render reCAPTCHA', error);
        setRecaptchaError('Không thể hiển thị CAPTCHA. Vui lòng thử lại.');
      }
    }
  }
};

const recaptchaElementId = () => step.value === 2 ? 'otp-recaptcha-resend' : 'otp-recaptcha';

let recaptchaInitTimeout = null;
let maxRetries = 50;
let recaptchaWidgetId = null;

const initRecaptchaScript = () => {
  if (!recaptchaSiteKey) {
    setRecaptchaError('CAPTCHA chưa được cấu hình. Vui lòng liên hệ quản trị viên.');
    return;
  }

  const init = () => {
    if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
      renderRecaptcha();
    } else if (maxRetries > 0) {
      maxRetries--;
      recaptchaInitTimeout = setTimeout(init, 200);
    } else {
      setRecaptchaError('Không thể tải CAPTCHA do lỗi mạng. Vui lòng thử lại.');
    }
  };

  const existingScript = document.getElementById('grecaptcha-script');
  if (existingScript) {
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

onUnmounted(() => {
  if (recaptchaInitTimeout) {
    clearTimeout(recaptchaInitTimeout);
  }
  if (timer) {
    clearInterval(timer);
  }
});

const form = ref({
  email: '',
  otp: '',
  reset_token: '',
  password: '',
  password_confirmation: ''
});

const otpArray = ref(['', '', '', '', '', '']);
const otpInputs = ref([]); 

watch(otpArray, (newVal) => {
  form.value.otp = newVal.join('');
}, { deep: true });

const handleOtpInput = (index, event) => {
  let val = event.target.value;
  if (val && !/^\d+$/.test(val)) {
     otpArray.value[index] = '';
     return;
  }
  if (val && index < 5) {
    if (otpInputs.value[index + 1]) otpInputs.value[index + 1].focus();
  }
};

const handleOtpKeydown = (index, event) => {
  if (event.key === 'Backspace' && !otpArray.value[index] && index > 0) {
    if (otpInputs.value[index - 1]) otpInputs.value[index - 1].focus();
  }
};

const handleOtpPaste = (event) => {
  event.preventDefault();
  const pasteData = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
  if (pasteData) {
    for (let i = 0; i < pasteData.length; i++) {
        otpArray.value[i] = pasteData[i];
    }
    const nextIndex = Math.min(pasteData.length, 5);
    if (otpInputs.value[nextIndex]) otpInputs.value[nextIndex].focus();
  }
};

const goBackToStep1 = () => {
  step.value = 1;
  otpArray.value = ['', '', '', '', '', ''];
  form.value.otp = '';
  form.value.reset_token = '';
  form.value.password = '';
  form.value.password_confirmation = '';
  recaptchaToken.value = '';
  if (timer) clearInterval(timer);
  nextTick(() => { renderRecaptcha(); });
};

const countdown = ref(0);
let timer = null;

const startCountdown = () => {
  countdown.value = 120;
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (countdown.value > 0) countdown.value--;
    else clearInterval(timer);
  }, 1000);
};

const handleFormErrors = (error, defaultMsg) => {
    if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0][0]; 
        Toast.fire({ icon: 'error', title: firstError });
    } else if (error.response?.status === 429) {
        Toast.fire({ icon: 'warning', title: error.response?.data?.message || 'Thao tác quá nhanh, vui lòng chờ.' });
    } else if (error.response) {
        let errorMsg = error.response?.data?.message || defaultMsg;
        Toast.fire({ icon: 'error', title: errorMsg });
    } else {
        console.error('Lỗi Javascript hoặc Network:', error);
        Toast.fire({ icon: 'error', title: defaultMsg });
    }
};

const handleSendOtp = async () => {
  if (!form.value.email) {
    Toast.fire({ icon: 'warning', title: 'Vui lòng nhập email!' });
    return;
  }
  
  if (!recaptchaToken.value) {
    Toast.fire({ icon: 'warning', title: 'Vui lòng xác minh bạn không phải là robot.' });
    return;
  }
  
  if (step.value === 1) isLoading.value = true;
  else isResending.value = true;

  try {
    const payload = { email: form.value.email.trim() };
    payload['g-recaptcha-response'] = recaptchaToken.value;
    
    await clientApiClient.post('/client/forgot-password/send-otp', payload);
    Toast.fire({ icon: 'success', title: 'Nếu email hợp lệ, mã OTP sẽ được gửi đến bạn.' });
    step.value = 2;
    recaptchaToken.value = '';
    nextTick(() => {
      renderRecaptcha();
      if (otpInputs.value[0]) otpInputs.value[0].focus();
    });
    startCountdown();
  } catch (error) {
    handleFormErrors(error, 'Lỗi gửi OTP.');
    // Reset recaptcha if failed so they can try again
    if (window.grecaptcha) {
        window.grecaptcha.reset(recaptchaWidgetId);
        recaptchaToken.value = '';
    }
  } finally {
    isLoading.value = false;
    isResending.value = false;
  }
};

const handleVerifyOtp = async () => {
  isLoading.value = true;
  try {
    const res = await clientApiClient.post('/client/forgot-password/verify-otp', {
      email: form.value.email.trim(),
      otp: form.value.otp
    });
    
    const payload = res.data || res;
    const token = payload.reset_token || payload.data?.reset_token;

    if (!token) {
        Toast.fire({ icon: 'error', title: 'Lỗi Client: Không lấy được Token bảo mật từ Server!' });
        return; 
    }
    
    form.value.reset_token = token;
    step.value = 3;
    Toast.fire({ icon: 'success', title: 'Xác thực thành công. Vui lòng tạo mật khẩu mới.' });
    if (timer) clearInterval(timer);
  } catch (error) {
    handleFormErrors(error, 'Mã OTP không hợp lệ.');
    
    otpArray.value = ['', '', '', '', '', ''];
    form.value.otp = '';
    nextTick(() => { if(otpInputs.value[0]) otpInputs.value[0].focus(); });

    if (error.response?.status === 403 && error.response?.data?.message?.includes('hủy')) {
        setTimeout(() => { goBackToStep1(); }, 2000);
    }
  } finally {
    isLoading.value = false;
  }
};

const handleResetPassword = async () => {
  if (!form.value.reset_token) {
      Toast.fire({ icon: 'error', title: 'Mã Token bảo mật bị rỗng! Vui lòng làm lại từ đầu.' });
      goBackToStep1();
      return;
  }

  if (form.value.password !== form.value.password_confirmation) {
      Toast.fire({ icon: 'error', title: 'Mật khẩu xác nhận không khớp.' });
      return;
  }
  
  isLoading.value = true;
  try {
    const res = await clientApiClient.post('/client/forgot-password/reset', {
      email: form.value.email.trim(),
      reset_token: form.value.reset_token,
      password: form.value.password,
      password_confirmation: form.value.password_confirmation
    });
    
    Toast.fire({ icon: 'success', title: res.data?.message || 'Đổi mật khẩu thành công!' });
    router.push('/login');
  } catch (error) {
    handleFormErrors(error, 'Lỗi đặt lại mật khẩu.');

    if (error.response?.status === 403) {
        setTimeout(() => { goBackToStep1(); }, 2000);
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => { window.scrollTo(0, 0); });
onUnmounted(() => { if (timer) clearInterval(timer); });
</script>

<style scoped>
/* Reset & Base - Dựa trên Login.vue của SORA */
.auth-wrapper {
  min-height: 100vh;
  min-height: 100dvh;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fcf9f5;
  padding: 40px 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.auth-container {
  display: flex;
  background: white;
  width: 100%;
  max-width: 1120px;
  min-height: 650px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(159, 39, 59, 0.15);
}

/* Banner trái */
.auth-banner {
  flex: 0 0 52%;
  position: relative;
  background: #1a060d;
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

.brand-logo-img {
  max-width: 180px;
  height: auto;
  margin-bottom: 25px;
  filter: drop-shadow(0 0 1.5px #e7ce7d) 
          drop-shadow(0 0 1.5px rgba(231, 206, 125, 0.01)) 
          drop-shadow(0 4px 6px rgba(0, 0, 0, 0.01));
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

.auth-banner {
  overflow: hidden;
  isolation: isolate;
  background: linear-gradient(145deg, #7f2037 0%, #4a1426 48%, #171113 100%);
}

.auth-banner::before {
  content: '';
  position: absolute;
  inset: 24px;
  z-index: 0;
  border: 1px solid rgba(231, 206, 125, 0.34);
  border-radius: 18px;
  box-shadow: inset 0 0 0 10px rgba(255, 255, 255, 0.018);
}

.banner-overlay {
  z-index: 1;
  background:
    radial-gradient(circle at 50% 42%, rgba(231, 206, 125, 0.2), transparent 31%),
    linear-gradient(145deg, rgba(87, 18, 38, 0.78), rgba(20, 14, 16, 0.92));
}

.banner-overlay::before,
.banner-overlay::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%) rotate(45deg);
}

.banner-overlay::before {
  width: min(58vw, 330px);
  aspect-ratio: 1;
  border: 1px solid rgba(231, 206, 125, 0.34);
  box-shadow: 0 0 0 24px rgba(231, 206, 125, 0.035);
}

.banner-overlay::after {
  width: min(42vw, 240px);
  aspect-ratio: 1;
  border: 1px solid rgba(231, 206, 125, 0.2);
}

.banner-content {
  z-index: 2;
  padding: 48px;
}

.brand-logo-img {
  max-width: 205px;
  margin-bottom: 30px;
  filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.38)) drop-shadow(0 0 8px rgba(231, 206, 125, 0.2));
}

.brand-slogan {
  color: #f0d97f;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.42);
}

.auth-home-link {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid rgba(231, 206, 125, 0.44);
  border-radius: 8px;
  background: rgba(24, 12, 16, 0.24);
  color: rgba(255, 249, 236, 0.92);
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.25s ease, color 0.25s ease, transform 0.25s ease;
}

.auth-home-link:hover {
  background: rgba(231, 206, 125, 0.16);
  color: #f0d97f;
  transform: translateX(-2px);
}

.auth-back-link {
  display: inline-flex;
  color: #7e675f;
  text-decoration: none;
  font-weight: 600;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  transition: color 0.25s ease, transform 0.25s ease;
}

.auth-back-link:hover {
  color: #9f273b;
  transform: translateX(-2px);
}

/* Box form phải */
.auth-box {
  flex: 1;
  padding: 0 40px 10px 40px;
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

.subtitle strong {
  color: #333;
}

.form-group {
  margin-bottom: 22px;
}

.form-group label {
  color: #444;
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 8px;
  display: inline-block;
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

.input-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0;
  display: flex;
  transition: color 0.3s;
}

.toggle-password:hover {
  color: #9f273b;
}

/* OTP UI */
.otp-container {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 25px;
}

.otp-box-input {
  width: 100%;
  aspect-ratio: 1;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fafafa;
  color: #444;
  transition: all 0.3s;
}

.otp-box-input:focus {
  outline: none;
  border-color: #e7ce7d;
  background-color: #fff;
  box-shadow: 0 4px 15px rgba(231, 206, 125, 0.15);
  transform: translateY(-2px);
}

.alert {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.otp-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  font-size: 13px;
}

.change-email {
  color: #666;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s;
}

.change-email:hover {
  color: #9f273b;
}

.timer {
  color: #666;
}

.timer strong {
  color: #cc1e2e;
}

.resend-container {
  text-align: center;
  margin-top: 20px;
}

.btn-resend {
  background: none;
  border: none;
  color: #666;
  font-weight: bold;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.3s;
  padding: 5px 10px;
}

.btn-resend:not(:disabled):hover {
  color: #9f273b;
}

.btn-resend:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Button */
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

/* Utils */
.animation-fade-in {
  animation: fadeIn 0.4s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

@media (min-width: 769px) and (max-width: 991.98px) {
  .auth-banner { flex-basis: 48%; }
  .banner-overlay::before { width: 240px; }
  .banner-overlay::after { width: 175px; }
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
  
  .auth-back-link {
    display: flex;
  }
  
  .otp-box-input {
    font-size: 20px;
  }
}
</style>
