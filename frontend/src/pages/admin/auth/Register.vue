<template>
  <div class="auth-page d-flex justify-content-center align-items-center bg-light min-vh-100 py-5">
    <div class="auth-box shadow-lg rounded-4 overflow-hidden bg-white row g-0">

      <div
        class="col-md-5 d-none d-md-flex flex-column justify-content-center align-items-center text-white p-5 brand-banner">
        <i class="bi bi-person-plus-fill brand-icon"></i>
        <h2 class="fw-bold mt-3 text-center">Tham gia MyShop</h2>
        <p class="text-center mt-2 opacity-75">Đăng ký tài khoản quản trị viên để bắt đầu vận hành hệ thống cửa hàng của
          bạn.</p>
      </div>

      <div class="col-md-7 p-5">
        <div class="text-center mb-4 d-md-none">
          <i class="bi bi-person-plus-fill text-brand mobile-icon"></i>
          <h3 class="fw-bold mt-2 text-brand">Đăng ký MyShop</h3>
        </div>

        <h4 class="fw-bold mb-1 text-dark">Tạo tài khoản mới</h4>
        <p class="text-muted mb-4 small">Điền đầy đủ thông tin bên dưới để đăng ký</p>

        <form @submit.prevent="handleRegister">
          <div class="form-floating mb-3">
            <input type="text" class="form-control" id="fullname" v-model="form.fullname" placeholder="Nguyễn Văn A"
              required>
            <label for="fullname">Họ và tên</label>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="form-floating">
                <input type="email" class="form-control" id="email" v-model="form.email" placeholder="name@example.com"
                  required>
                <label for="email">Địa chỉ Email</label>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="form-floating">
                <input type="tel" class="form-control" id="phone" v-model="form.phone" placeholder="0912345678"
                  required>
                <label for="phone">Số điện thoại</label>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3 position-relative">
              <div class="form-floating">
                <input :type="showPassword ? 'text' : 'password'" class="form-control pe-5" id="password"
                  v-model="form.password" placeholder="Password" required>
                <label for="password">Mật khẩu</label>
              </div>
              <button type="button"
                class="btn border-0 position-absolute top-50 end-0 translate-middle-y text-muted me-1"
                @click="showPassword = !showPassword">
                <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
              </button>
            </div>

            <div class="col-md-6 mb-4 position-relative">
              <div class="form-floating">
                <input :type="showConfirmPassword ? 'text' : 'password'" class="form-control pe-5"
                  id="password_confirmation" v-model="form.password_confirmation" placeholder="Confirm Password"
                  required>
                <label for="password_confirmation">Xác nhận mật khẩu</label>
              </div>
              <button type="button"
                class="btn border-0 position-absolute top-50 end-0 translate-middle-y text-muted me-1"
                @click="showConfirmPassword = !showConfirmPassword">
                <i class="bi" :class="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-brand w-100 py-2 fw-bold text-white shadow-sm mb-3"
            :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            {{ isLoading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ TÀI KHOẢN' }}
          </button>

          <div class="text-center small text-muted">
            Đã có tài khoản?
            <router-link :to="{ name: 'admin-login' }" class="text-decoration-none fw-semibold text-brand">
              Đăng nhập ngay
            </router-link>
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

const router = useRouter();

const API_URL = import.meta.env.VITE_API_BASE_URL;

const form = ref({
  fullname: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  role_id: 1,
  status: 'active'
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isLoading = ref(false);

const handleRegister = async () => {
  if (form.value.password !== form.value.password_confirmation) {
    Swal.fire({
      icon: 'warning',
      title: 'Lỗi nhập liệu',
      text: 'Mật khẩu xác nhận không khớp!',
      confirmButtonColor: '#009981'
    });
    return;
  }

  isLoading.value = true;

  try {
    const response = await fetch(`${API_URL}/admin/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(form.value)
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Đăng ký tài khoản quản trị thành công.',
        confirmButtonColor: '#009981'
      }).then(() => {
        router.push({ name: 'admin-login' });
      });
    } else {
      let errorMessage = data.message || 'Có lỗi xảy ra khi đăng ký!';
      if (data.errors) {
        errorMessage = Object.values(data.errors).flat().join('\n');
      }

      Swal.fire({
        icon: 'error',
        title: 'Đăng ký thất bại',
        text: errorMessage,
        confirmButtonColor: '#009981'
      });
    }
  } catch (error) {
    console.error('Lỗi:', error);
    Swal.fire({
      icon: 'error',
      title: 'Lỗi hệ thống',
      text: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại!',
      confirmButtonColor: '#009981'
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.auth-box {
  width: 1000px;
  max-width: 95%;
  min-height: 550px;
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
  transition: all 0.2s;
}

.btn-brand:hover {
  background-color: #007a67;
}

.form-control:focus {
  border-color: #009981;
  box-shadow: 0 0 0 0.25rem rgba(0, 153, 129, 0.25);
}
</style>