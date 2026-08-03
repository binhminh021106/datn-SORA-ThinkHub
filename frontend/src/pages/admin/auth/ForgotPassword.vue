<template>
  <div class="auth-page d-flex justify-content-center align-items-center bg-light min-vh-100 py-5">
    <div class="auth-box shadow-lg rounded-4 overflow-hidden bg-white row g-0" style="max-width: 500px; width: 90%;">
      <div class="col-12 p-5 position-relative">
        
        <!-- Nút Quay lại (Chỉ hiện ở bước 2 hoặc 3) -->
        <button v-if="step > 1" @click="goBackToStep1" class="btn border-0 text-muted position-absolute top-0 start-0 m-3 hover-brand">
          <i class="bi bi-arrow-left"></i> Quay lại
        </button>

        <div class="text-center mb-4 mt-2">
          <i class="bi bi-shield-lock-fill text-brand" style="font-size: 3.5rem;"></i>
          <h3 class="fw-bold mt-2 text-dark">Khôi phục mật khẩu</h3>
          
          <p class="text-muted small mt-2" v-if="step === 1">Nhập địa chỉ email quản trị của bạn, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.</p>
          <p class="text-muted small mt-2" v-if="step === 2">Vui lòng kiểm tra hộp thư <strong>{{ form.email }}</strong> và nhập mã OTP gồm 6 chữ số.</p>
          <p class="text-muted small mt-2" v-if="step === 3">Tạo mật khẩu mới cho tài khoản quản trị của bạn.</p>
        </div>

        <!-- BƯỚC 1: NHẬP EMAIL -->
        <form @submit.prevent="handleSendOtp" v-if="step === 1" class="animation-fade-in">
          <div class="form-floating mb-4">
            <input type="email" class="form-control" id="email" v-model="form.email" placeholder="name@example.com" required>
            <label for="email">Địa chỉ Email</label>
          </div>

          <div class="mb-4 d-flex flex-column align-items-center">
            <div id="otp-recaptcha" v-show="!recaptchaError"></div>
            <div v-if="recaptchaError" class="text-danger small text-center">
               <p class="mb-2">{{ recaptchaErrorMessage }}</p>
               <button type="button" @click="retryRecaptcha" class="btn btn-sm btn-outline-danger">Thử lại</button>
            </div>
          </div>

          <button type="submit" class="btn btn-brand w-100 py-2 fw-bold text-white shadow-sm mb-3" :disabled="isLoading || !recaptchaToken">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            {{ isLoading ? 'ĐANG XỬ LÝ...' : 'NHẬN MÃ OTP' }}
          </button>

          <div class="text-center small">
            <router-link :to="{ name: 'admin-login' }" class="text-decoration-none fw-semibold text-muted hover-brand">
              <i class="bi bi-arrow-left me-1"></i> Quay lại đăng nhập
            </router-link>
          </div>
        </form>

        <!-- BƯỚC 2: NHẬP MÃ OTP -->
        <form @submit.prevent="handleVerifyOtp" v-if="step === 2" class="animation-fade-in">
          <div class="d-flex justify-content-between gap-2 mb-3">
            <input
              v-for="(digit, index) in otpArray"
              :key="index"
              type="text"
              class="form-control text-center otp-input fs-3 fw-bold"
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
          
          <div class="d-flex justify-content-between align-items-center mb-4 small text-muted">
             <span><a href="#" @click.prevent="goBackToStep1" class="text-brand text-decoration-none">Đổi email khác</a></span>
             <span>Gửi lại sau: <strong class="text-danger">{{ countdown }}s</strong></span>
          </div>

          <button type="submit" class="btn btn-brand w-100 py-2 fw-bold text-white shadow-sm mb-3" :disabled="isLoading || form.otp.length < 6">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            {{ isLoading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN OTP' }}
          </button>
          
          <div class="text-center mt-3">
             <div class="mb-3 d-flex flex-column align-items-center">
               <div id="otp-recaptcha-resend" v-show="!recaptchaError"></div>
               <div v-if="recaptchaError" class="text-danger small">
                 <p class="mb-2">{{ recaptchaErrorMessage }}</p>
                 <button type="button" @click="retryRecaptcha" class="btn btn-sm btn-outline-danger">Thử lại</button>
               </div>
             </div>

             <button type="button" class="btn btn-link text-muted text-decoration-none small fw-semibold p-0" :disabled="countdown > 0 || isResending || !recaptchaToken" @click="handleSendOtp">
               {{ isResending ? 'Đang gửi...' : 'Gửi lại mã ' + (countdown > 0 ? `(${countdown}s)` : '') }}
             </button>
          </div>
        </form>

        <!-- BƯỚC 3: ĐẶT LẠI MẬT KHẨU -->
        <form @submit.prevent="handleResetPassword" v-if="step === 3" class="animation-fade-in">
          <div class="form-floating mb-3 position-relative">
            <input :type="showPass1 ? 'text' : 'password'" class="form-control pe-5" id="new_password" v-model="form.password" placeholder="Mật khẩu mới" required minlength="8">
            <label for="new_password">Mật khẩu mới</label>
            <button type="button" class="btn border-0 position-absolute top-50 end-0 translate-middle-y text-muted me-1" @click="showPass1 = !showPass1">
              <i class="bi" :class="showPass1 ? 'bi-eye-slash' : 'bi-eye'"></i>
            </button>
          </div>

          <div class="form-floating mb-4 position-relative">
            <input :type="showPass2 ? 'text' : 'password'" class="form-control pe-5" id="confirm_password" v-model="form.password_confirmation" placeholder="Xác nhận mật khẩu" required minlength="8">
            <label for="confirm_password">Xác nhận mật khẩu mới</label>
            <button type="button" class="btn border-0 position-absolute top-50 end-0 translate-middle-y text-muted me-1" @click="showPass2 = !showPass2">
              <i class="bi" :class="showPass2 ? 'bi-eye-slash' : 'bi-eye'"></i>
            </button>
          </div>

          <button type="submit" class="btn btn-brand w-100 py-2 fw-bold text-white shadow-sm" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            {{ isLoading ? 'ĐANG XỬ LÝ...' : 'ĐỔI MẬT KHẨU' }}
          </button>
        </form>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const router = useRouter();

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
        setRecaptchaError('Không thể tải CAPTCHA do lỗi mạng. Vui lòng thử lại.');
    };
    document.head.appendChild(script);
  }
};

const step = ref(1);
const isLoading = ref(false);
const isResending = ref(false);

const showPass1 = ref(false);
const showPass2 = ref(false);

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
  if (timer) clearInterval(timer);
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

// Utils xử lý lỗi chung cho fetch API
const handleFetchErrors = async (response, defaultMsg) => {
  let errorMessage = defaultMsg;
  let status = response.status;
  try {
    const data = await response.json();
    if (status === 422 && data.errors) {
       errorMessage = Object.values(data.errors)[0][0];
    } else if (data.message) {
       errorMessage = data.message;
    }
  } catch (e) {
    // Cannot parse JSON
  }

  if (status === 429) {
     Swal.fire({ icon: 'warning', title: 'Cảnh báo', text: errorMessage || 'Thao tác quá nhanh.', confirmButtonColor: '#009981' });
  } else {
     Swal.fire({ icon: 'error', title: 'Lỗi', text: errorMessage, confirmButtonColor: '#009981' });
  }
  
  return { status, errorMessage };
};

const handleSendOtp = async () => {
  if (!form.value.email) {
    Swal.fire({ icon: 'warning', title: 'Thiếu thông tin', text: 'Vui lòng nhập email!', confirmButtonColor: '#009981' });
    return;
  }
  
  if (step.value === 1) isLoading.value = true;
  else isResending.value = true;

  try {
    const response = await fetch(`${API_URL}/admin/forgot-password/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ 
        email: form.value.email.trim(),
        'g-recaptcha-response': recaptchaToken.value 
      })
    });

    if (response.ok) {
        Swal.fire({ icon: 'success', title: 'Hoàn tất', text: 'Nếu email hợp lệ, mã OTP sẽ được gửi đến bạn.', confirmButtonColor: '#009981', timer: 2000, showConfirmButton: false });
        step.value = 2;
        nextTick(() => {
          if(otpInputs.value[0]) otpInputs.value[0].focus();
          recaptchaToken.value = '';
          recaptchaWidgetId = null;
          recaptchaError.value = false;
          renderRecaptcha();
        });
        startCountdown();
    } else {
        await handleFetchErrors(response, 'Lỗi gửi OTP.');
        if(window.grecaptcha && recaptchaWidgetId !== null) {
          try { window.grecaptcha.reset(recaptchaWidgetId); } catch (e) {}
        }
        recaptchaToken.value = '';
    }
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Lỗi kết nối', text: 'Không thể kết nối đến máy chủ.', confirmButtonColor: '#009981' });
  } finally {
    isLoading.value = false;
    isResending.value = false;
  }
};

const handleVerifyOtp = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(`${API_URL}/admin/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email: form.value.email.trim(), otp: form.value.otp })
    });

    if (response.ok) {
        const data = await response.json();
        if (data.reset_token) {
           form.value.reset_token = data.reset_token;
           step.value = 3;
           Swal.fire({ icon: 'success', title: 'Đã xác thực', text: 'Vui lòng tạo mật khẩu mới.', confirmButtonColor: '#009981', timer: 1500, showConfirmButton: false });
           if (timer) clearInterval(timer);
        } else {
           Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không nhận được mã bảo mật từ máy chủ.', confirmButtonColor: '#009981' });
        }
    } else {
        const err = await handleFetchErrors(response, 'Mã OTP không hợp lệ.');
        otpArray.value = ['', '', '', '', '', ''];
        form.value.otp = '';
        nextTick(() => { if(otpInputs.value[0]) otpInputs.value[0].focus(); });

        if (err.status === 403 && err.errorMessage.includes('hủy')) {
            setTimeout(() => { goBackToStep1(); }, 2000);
        }
    }
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Lỗi kết nối', text: 'Không thể kết nối đến máy chủ.', confirmButtonColor: '#009981' });
  } finally {
    isLoading.value = false;
  }
};

const handleResetPassword = async () => {
  if (form.value.password !== form.value.password_confirmation) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Mật khẩu xác nhận không khớp.', confirmButtonColor: '#009981' });
      return;
  }
  
  isLoading.value = true;
  try {
    const response = await fetch(`${API_URL}/admin/forgot-password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
         email: form.value.email.trim(),
         reset_token: form.value.reset_token,
         password: form.value.password,
         password_confirmation: form.value.password_confirmation
      })
    });

    if (response.ok) {
        Swal.fire({ icon: 'success', title: 'Hoàn tất', text: 'Đổi mật khẩu thành công! Bạn có thể đăng nhập.', confirmButtonColor: '#009981', timer: 2000, showConfirmButton: false });
        router.push({ name: 'admin-login' });
    } else {
        const err = await handleFetchErrors(response, 'Lỗi đặt lại mật khẩu.');
        if (err.status === 403) {
            setTimeout(() => { goBackToStep1(); }, 2000);
        }
    }
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Lỗi kết nối', text: 'Không thể kết nối đến máy chủ.', confirmButtonColor: '#009981' });
  } finally {
    isLoading.value = false;
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
</script>

<style scoped>
.auth-box {
  width: 900px;
  max-width: 95%;
}

.text-brand {
  color: #009981;
}

.hover-brand:hover {
  color: #009981 !important;
}

.btn-brand {
  background-color: #009981;
  border-radius: 8px;
  border: none;
  transition: 0.2s;
}

.btn-brand:hover {
  background-color: #007a67;
}

.form-control:focus {
  border-color: #009981;
  box-shadow: 0 0 0 0.25rem rgba(0, 153, 129, 0.25);
}

.otp-input {
  width: 50px;
  height: 60px;
  border-radius: 8px;
  transition: all 0.2s;
}

.otp-input:focus {
  transform: translateY(-2px);
}

.animation-fade-in {
  animation: fadeIn 0.4s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
