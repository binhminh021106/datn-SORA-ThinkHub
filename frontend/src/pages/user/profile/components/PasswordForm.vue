<template>
  <div class="bg-white p-4 p-md-5 shadow-sm border border-light mb-4 rounded-3">
    <h3 class="h4 font-serif text-dark mb-1">Đổi Mật Khẩu</h3>
    <p class="text-secondary fw-light mb-4 border-bottom pb-3">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
    
    <form @submit.prevent="changePassword">
      <div class="row mb-4 align-items-center">
        <label for="currentPassword" class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium">Mật Khẩu Hiện Tại</label>
        <div class="col-sm-9 col-md-7 position-relative">
          <input :type="showCurrentPassword ? 'text' : 'password'" class="form-control custom-input pe-5" id="currentPassword" v-model="passwordForm.current_password" required placeholder="Nhập mật khẩu hiện tại">
          <button type="button" class="password-toggle" @click="showCurrentPassword = !showCurrentPassword">
            <i :class="showCurrentPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
        </div>
      </div>
      
      <div class="row mb-4 align-items-center">
        <label for="newPassword" class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium">Mật Khẩu Mới</label>
        <div class="col-sm-9 col-md-7 position-relative">
          <input :type="showNewPassword ? 'text' : 'password'" class="form-control custom-input pe-5" id="newPassword" v-model="passwordForm.password" required minlength="8" placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)">
          <button type="button" class="password-toggle" @click="showNewPassword = !showNewPassword">
            <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
        </div>
      </div>

      <div class="row mb-4 align-items-center">
        <label for="confirmPassword" class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium">Xác Nhận Mật Khẩu</label>
        <div class="col-sm-9 col-md-7 position-relative">
          <input :type="showConfirmPassword ? 'text' : 'password'" class="form-control custom-input pe-5" id="confirmPassword" v-model="passwordForm.password_confirmation" required placeholder="Nhập lại mật khẩu mới">
          <button type="button" class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
            <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
        </div>
      </div>

      <div class="row">
        <div class="col-sm-9 offset-sm-3">
          <button type="submit" class="editorial-btn px-5 py-2" :disabled="isChangingPassword">
            <span v-if="isChangingPassword" class="spinner-border spinner-border-sm me-2" role="status"></span>
            Đổi Mật Khẩu
          </button>
        </div>
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
.custom-input:focus {
  border-color: #9f273b;
  box-shadow: 0 0 0 0.2rem rgba(159, 39, 59, 0.15);
  outline: none;
}

.password-toggle {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
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
</style>
