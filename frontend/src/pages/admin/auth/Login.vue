<template>
  <div class="auth-page d-flex justify-content-center align-items-center bg-light min-vh-100 py-5">
    <div class="auth-box shadow-lg rounded-4 overflow-hidden bg-white row g-0">

      <!-- Cột trái: Banner -->
      <div
        class="col-md-6 d-none d-md-flex flex-column justify-content-center align-items-center text-white p-5 brand-banner">
        <i class="bi bi-box-seam-fill brand-icon"></i>
        <h2 class="fw-bold mt-3 text-center">MyShop Admin</h2>
        <p class="text-center mt-2 opacity-75">Hệ thống quản trị và vận hành cửa hàng toàn diện.</p>
      </div>

      <!-- Cột phải: Form -->
      <div class="col-md-6 p-5">
        <div class="text-center mb-4 d-md-none">
          <i class="bi bi-box-seam-fill text-brand mobile-icon"></i>
          <h3 class="fw-bold mt-2 text-brand">MyShop Admin</h3>
        </div>

        <h4 class="fw-bold mb-1 text-dark">Đăng nhập</h4>
        <p class="text-muted mb-4 small">Vui lòng điền thông tin để truy cập hệ thống</p>

        <form @submit.prevent="handleLogin">
          <div class="form-floating mb-3">
            <input type="email" class="form-control" id="email" v-model="form.email" placeholder="name@example.com"
              required>
            <label for="email">Địa chỉ Email</label>
          </div>

          <div class="form-floating mb-3 position-relative">
            <input :type="showPassword ? 'text' : 'password'" class="form-control pe-5" id="password"
              v-model="form.password" placeholder="Password" required>
            <label for="password">Mật khẩu</label>
            <button type="button" class="btn border-0 position-absolute top-50 end-0 translate-middle-y text-muted me-1"
              @click="showPassword = !showPassword">
              <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
            </button>
          </div>

          <div class="d-flex justify-content-between align-items-center mb-4 small">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="rememberMe" v-model="form.remember">
              <label class="form-check-label text-muted" for="rememberMe">Ghi nhớ tôi</label>
            </div>

            <!-- ĐÃ SỬA: Thay thẻ <a> thành <router-link> trỏ về route quên mật khẩu -->
            <router-link :to="{ name: 'admin-forgot-password' }" class="text-decoration-none fw-semibold text-brand">
              Quên mật khẩu?
            </router-link>
          </div>

          <button type="submit" class="btn btn-brand w-100 py-2 fw-bold text-white shadow-sm mb-3"
            :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            {{ isLoading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP' }}
          </button>

          <div class="text-center small text-muted">
            Chưa có tài khoản?
            <router-link :to="{ name: 'admin-register' }" class="text-decoration-none fw-semibold text-brand">Đăng ký
              ngay</router-link>
          </div>
        </form>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();
const form = ref({ email: '', password: '', remember: false });
const showPassword = ref(false);
const isLoading = ref(false);

const handleLogin = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email: form.value.email, password: form.value.password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_role', data.admin.role_id);

      if (data.admin.role && data.admin.role.level) {
        localStorage.setItem('admin_level', data.admin.role.level);
      }

      localStorage.setItem('admin_info', JSON.stringify(data.admin));

      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Đăng nhập hệ thống thành công.',
        confirmButtonColor: '#009981',
        timer: 1500,
        showConfirmButton: false
      }).then(() => router.push({ name: 'admin-dashboard' }));
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Thất bại',
        text: data.message || 'Thông tin đăng nhập không chính xác!',
        confirmButtonColor: '#009981'
      });
    }
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể kết nối máy chủ!', confirmButtonColor: '#009981' });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.auth-box {
  width: 900px;
  max-width: 95%;
  min-height: 500px;
}

.brand-banner {
  background: linear-gradient(135deg, #009981 0%, #00cba9 100%);
}

.brand-icon {
  font-size: 5rem;
}

.mobile-icon {
  font-size: 3rem;
}

.text-brand {
  color: #009981;
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
</style>