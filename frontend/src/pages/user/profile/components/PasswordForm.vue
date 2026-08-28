<template>
  <div class="bg-white p-4 p-md-5 shadow-sm border border-light mb-4 rounded-3">
    <h3 class="h4 font-serif text-dark mb-1">Đổi Mật Khẩu</h3>
    <p class="text-secondary fw-light mb-4 border-bottom pb-3">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
    
    <form @submit.prevent="changePassword">
      <div class="row gx-3 gy-4 mb-5">
        <div class="col-md-12">
          <div class="form-floating position-relative">
            <input :type="showCurrentPassword ? 'text' : 'password'" class="form-control fw-medium profile-floating-input pe-5" id="currentPassword" v-model="passwordForm.current_password" required placeholder="Mật khẩu hiện tại">
            <label for="currentPassword" class="text-secondary"><i class="bi bi-lock me-1"></i>Mật Khẩu Hiện Tại</label>
            <button type="button" class="password-toggle" 
              :aria-label="showCurrentPassword ? 'Ẩn mật khẩu hiện tại' : 'Hiện mật khẩu hiện tại'" 
              :aria-pressed="showCurrentPassword" 
              @click="showCurrentPassword = !showCurrentPassword">
              <i :class="showCurrentPassword ? 'bi bi-eye-slash text-secondary' : 'bi bi-eye text-secondary'"></i>
            </button>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="form-floating position-relative">
            <input :type="showNewPassword ? 'text' : 'password'" class="form-control fw-medium profile-floating-input pe-5" id="newPassword" v-model="passwordForm.password" required minlength="8" placeholder="Mật khẩu mới (ít nhất 8 ký tự)">
            <label for="newPassword" class="text-secondary"><i class="bi bi-key me-1"></i>Mật Khẩu Mới</label>
            <button type="button" class="password-toggle" 
              :aria-label="showNewPassword ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'" 
              :aria-pressed="showNewPassword" 
              @click="showNewPassword = !showNewPassword">
              <i :class="showNewPassword ? 'bi bi-eye-slash text-secondary' : 'bi bi-eye text-secondary'"></i>
            </button>
          </div>
        </div>

        <div class="col-md-6">
          <div class="form-floating position-relative">
            <input :type="showConfirmPassword ? 'text' : 'password'" class="form-control fw-medium profile-floating-input pe-5" id="confirmPassword" v-model="passwordForm.password_confirmation" required placeholder="Nhập lại mật khẩu mới">
            <label for="confirmPassword" class="text-secondary"><i class="bi bi-check-circle me-1"></i>Xác Nhận Mật Khẩu</label>
            <button type="button" class="password-toggle" 
              :aria-label="showConfirmPassword ? 'Ẩn xác nhận mật khẩu' : 'Hiện xác nhận mật khẩu'" 
              :aria-pressed="showConfirmPassword" 
              @click="showConfirmPassword = !showConfirmPassword">
              <i :class="showConfirmPassword ? 'bi bi-eye-slash text-secondary' : 'bi bi-eye text-secondary'"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-end border-top pt-4">
        <button type="submit" class="editorial-btn px-5 py-2 rounded-pill shadow-sm" style="min-width: 200px;" :disabled="isChangingPassword">
          <span v-if="isChangingPassword" class="spinner-border spinner-border-sm me-2" role="status"></span>
          <i v-else class="bi bi-shield-lock me-2"></i>
          Đổi Mật Khẩu
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { createSoraAlert } from '@/utils/soraAlertConfig';
import clientApiClient from '@/utils/clientApiClient';
import { clearUserAuthStorage } from '@/composables/useUtilities';

const isChangingPassword = ref(false);
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const passwordForm = ref({
  current_password: '', password: '', password_confirmation: ''
});

const soraAlert = createSoraAlert({
  customClass: {
    confirmButton: 'px-4 py-2 mx-2 rounded-0 shadow-sm fw-bold font-oswald tracking-widest text-uppercase'
  }
});

const showToast = (message, type = 'success') => {
  soraAlert.fire({
    icon: type,
    title: type === 'success' ? 'Thành Công!' : 'Có Lỗi Xảy Ra!',
    text: message,
    timer: type === 'success' ? 2500 : undefined,
    showConfirmButton: type !== 'success'
  });
};

const changePassword = async () => {
  if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
    showToast('Mật khẩu xác nhận không khớp!', 'error');
    return;
  }
  isChangingPassword.value = true;
  try {
    const response = await clientApiClient.post('/client/profile/password', passwordForm.value);
    if (response.data.status) {
      passwordForm.value = { current_password: '', password: '', password_confirmation: '' };
      await soraAlert.fire({
        icon: 'success',
        title: 'Đổi mật khẩu thành công',
        text: response.data.message,
        confirmButtonText: 'Đăng nhập lại',
      });
      clearUserAuthStorage();
      window.location.assign('/login?password_changed=1');
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      showToast(error.response.data.message, 'error'); 
    } else if (error.response && error.response.status === 422) {
      const errors = error.response.data.errors;
      const firstErrorMsg = Object.values(errors)[0][0]; 
      showToast(`Lỗi: ${firstErrorMsg}`, 'error');
    } else {
      showToast('Có lỗi xảy ra. Vui lòng thử lại.', 'error');
    }
  } finally {
    isChangingPassword.value = false;
  }
};
</script>

<style scoped>
.tracking-wide { letter-spacing: 0.1em; }

.custom-input {
  border-radius: 4px;
  border: 1px solid #ced4da;
  padding: 0.6rem 1rem;
  transition: all 0.3s ease;
}
.profile-floating-input:focus {
  border-color: #9f273b;
  box-shadow: 0 0 0 0.2rem rgba(159, 39, 59, 0.15);
}

.form-floating > label {
  transition: opacity 0.25s ease-in-out, transform 0.25s ease-in-out !important;
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
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
</style>
