<template>
  <div class="bg-white p-4 p-md-5 shadow-sm border border-light mb-4 rounded-3">
    <h3 class="h4 font-serif text-dark mb-1">Đổi Mật Khẩu</h3>
    <p class="text-secondary fw-light mb-4 border-bottom pb-3">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
    
    <form @submit.prevent="changePassword">
      <div class="row mb-4 align-items-center">
        <label for="currentPassword" class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium">Mật Khẩu Hiện Tại</label>
        <div class="col-sm-9 col-md-7">
          <input type="password" class="form-control custom-input" id="currentPassword" v-model="passwordForm.current_password" required placeholder="Nhập mật khẩu hiện tại">
        </div>
      </div>
      
      <div class="row mb-4 align-items-center">
        <label for="newPassword" class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium">Mật Khẩu Mới</label>
        <div class="col-sm-9 col-md-7">
          <input type="password" class="form-control custom-input" id="newPassword" v-model="passwordForm.password" required minlength="6" placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)">
        </div>
      </div>

      <div class="row mb-4 align-items-center">
        <label for="confirmPassword" class="col-sm-3 col-form-label text-sm-end text-secondary fw-medium">Xác Nhận Mật Khẩu</label>
        <div class="col-sm-9 col-md-7">
          <input type="password" class="form-control custom-input" id="confirmPassword" v-model="passwordForm.password_confirmation" required placeholder="Nhập lại mật khẩu mới">
        </div>
      </div>

      <div class="row">
        <div class="col-sm-9 offset-sm-3">
          <button type="submit" class="btn btn-main px-5 py-2 text-uppercase fw-medium tracking-wide" :disabled="isChangingPassword">
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
import axios from 'axios';
import Swal from 'sweetalert2';

const isChangingPassword = ref(false);
const passwordForm = ref({
  current_password: '', password: '', password_confirmation: ''
});

const soraAlert = Swal.mixin({
  buttonsStyling: true,
  confirmButtonColor: '#9f273b',
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

const apiBase = `${import.meta.env.VITE_API_BASE_URL}/client/profile`; 
const getToken = () => {
  const commonKeys = ['access_token', 'token', 'auth_token', 'userToken', 'user_token'];
  for (const k of commonKeys) {
    const val = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (val && val.length > 15) return val; 
  }
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      if (parsed && typeof parsed === 'object') {
        if (parsed.access_token) return parsed.access_token;
        if (parsed.token) return parsed.token;
      }
    } catch(e) {}
  }
  return '';
};

const changePassword = async () => {
  if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
    showToast('Mật khẩu xác nhận không khớp!', 'error');
    return;
  }
  isChangingPassword.value = true;
  try {
    const response = await axios.post(`${apiBase}/password`, passwordForm.value, {
      headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' }
    });
    if (response.data.status) {
      showToast(response.data.message, 'success');
      passwordForm.value = { current_password: '', password: '', password_confirmation: '' };
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
.btn-main {
  background-color: #9f273b;
  color: white;
  border: 1px solid #9f273b;
  border-radius: 4px;
  transition: all 0.3s ease;
}
.btn-main:hover {
  background-color: #7a1c2d;
  border-color: #7a1c2d;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(159,39,59,0.3);
}

.btn-outline-main {
  color: #9f273b;
  border: 1px solid #9f273b;
  border-radius: 4px;
  background: transparent;
  transition: all 0.3s ease;
}
.btn-outline-main:hover {
  background-color: #9f273b;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(159,39,59,0.3);
}

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
</style>
