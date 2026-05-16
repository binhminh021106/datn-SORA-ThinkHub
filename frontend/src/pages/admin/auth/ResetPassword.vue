<template>
  <div class="auth-page d-flex justify-content-center align-items-center bg-light min-vh-100 py-5">
    <div class="auth-box shadow-lg rounded-4 overflow-hidden bg-white row g-0" style="max-width: 500px; width: 90%;">
      <div class="col-12 p-5">
        <div class="text-center mb-4">
          <i class="bi bi-key-fill text-brand" style="font-size: 3.5rem;"></i>
          <h3 class="fw-bold mt-2 text-dark">Đặt lại mật khẩu</h3>
          <p class="text-muted small">Vui lòng nhập mật khẩu mới cho tài khoản của bạn.</p>
        </div>

        <form @submit.prevent="handleResetPassword">
          <!-- Hiển thị email dạng readonly để user biết đang đổi cho tài khoản nào -->
          <div class="mb-3">
            <label class="form-label fw-semibold text-muted small">Email tài khoản</label>
            <input type="email" class="form-control bg-light text-muted" :value="email" readonly disabled>
          </div>

          <div class="form-floating mb-3 position-relative">
            <input :type="showPassword ? 'text' : 'password'" class="form-control pe-5" id="password" v-model="form.password" placeholder="Password" required minlength="8">
            <label for="password">Mật khẩu mới</label>
            <button type="button" class="btn border-0 position-absolute top-50 end-0 translate-middle-y text-muted me-1" @click="showPassword = !showPassword">
              <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
            </button>
          </div>

          <div class="form-floating mb-4 position-relative">
            <input :type="showConfirmPassword ? 'text' : 'password'" class="form-control pe-5" id="password_confirmation" v-model="form.password_confirmation" placeholder="Confirm Password" required minlength="8">
            <label for="password_confirmation">Xác nhận mật khẩu mới</label>
            <button type="button" class="btn border-0 position-absolute top-50 end-0 translate-middle-y text-muted me-1" @click="showConfirmPassword = !showConfirmPassword">
              <i class="bi" :class="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
            </button>
          </div>

          <button type="submit" class="btn btn-brand w-100 py-2 fw-bold text-white shadow-sm mb-3" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            {{ isLoading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐỔI MẬT KHẨU' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { apiClient } from '@/utils/axios';

const route = useRoute();
const router = useRouter();

const email = ref('');
const token = ref('');
const isLoading = ref(false);

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const form = ref({
  password: '',
  password_confirmation: ''
});

onMounted(() => {
  token.value = route.query.token || '';
  email.value = route.query.email || '';

  if (!token.value || !email.value) {
    Swal.fire('Lỗi', 'Đường dẫn đặt lại mật khẩu không hợp lệ!', 'error').then(() => {
      router.push({ name: 'admin-login' });
    });
  }
});

const handleResetPassword = async () => {
  if (form.value.password !== form.value.password_confirmation) {
    Swal.fire('Lỗi', 'Mật khẩu xác nhận không khớp!', 'warning');
    return;
  }

  isLoading.value = true;
  try {
    const response = await apiClient.post('/admin/reset-password', {
      token: token.value,
      email: email.value,
      password: form.value.password,
      password_confirmation: form.value.password_confirmation
    });

    Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: response.data.message || 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập bằng mật khẩu mới.',
      confirmButtonColor: '#009981'
    }).then(() => {
      router.push({ name: 'admin-login' });
    });
  } catch (error) {
    const message = error.response?.data?.message || 'Không thể kết nối máy chủ!';
    Swal.fire({ icon: 'error', title: 'Lỗi', text: message, confirmButtonColor: '#009981' });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.text-brand { color: #009981; }
.btn-brand { background-color: #009981; border-radius: 8px; border: none; transition: 0.2s; }
.btn-brand:hover { background-color: #007a67; }
.form-control:focus { border-color: #009981; box-shadow: 0 0 0 0.25rem rgba(0, 153, 129, 0.25); }
</style>