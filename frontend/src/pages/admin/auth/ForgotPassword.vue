<template>
    <div class="auth-page d-flex justify-content-center align-items-center bg-light min-vh-100 py-5">
        <div class="auth-box shadow-lg rounded-4 overflow-hidden bg-white row g-0"
            style="max-width: 500px; width: 90%;">
            <div class="col-12 p-5">
                <div class="text-center mb-4">
                    <i class="bi bi-shield-lock-fill text-brand" style="font-size: 3.5rem;"></i>
                    <h3 class="fw-bold mt-2 text-dark">Quên mật khẩu?</h3>
                    <p class="text-muted small">Nhập địa chỉ email quản trị của bạn, chúng tôi sẽ gửi liên kết để đặt
                        lại mật khẩu.</p>
                </div>

                <form @submit.prevent="handleForgotPassword">
                    <div class="form-floating mb-4">
                        <input type="email" class="form-control" id="email" v-model="email"
                            placeholder="name@example.com" required>
                        <label for="email">Địa chỉ Email</label>
                    </div>

                    <button type="submit" class="btn btn-brand w-100 py-2 fw-bold text-white shadow-sm mb-3"
                        :disabled="isLoading">
                        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                        {{ isLoading ? 'ĐANG GỬI...' : 'GỬI LIÊN KẾT ĐẶT LẠI' }}
                    </button>

                    <div class="text-center small">
                        <router-link :to="{ name: 'admin-login' }"
                            class="text-decoration-none fw-semibold text-muted hover-brand">
                            <i class="bi bi-arrow-left me-1"></i> Quay lại đăng nhập
                        </router-link>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import Swal from 'sweetalert2';
import { apiClient } from '@/utils/axios';

const email = ref('');
const isLoading = ref(false);

const handleForgotPassword = async () => {
    isLoading.value = true;
    try {
        const response = await apiClient.post('/admin/forgot-password', {
            email: email.value
        });

        Swal.fire({
            icon: 'success',
            title: 'Đã gửi Email!',
            text: response.data.message || 'Vui lòng kiểm tra hộp thư đến (hoặc thư rác) để đặt lại mật khẩu.',
            confirmButtonColor: '#009981'
        });
        email.value = '';
    } catch (error) {
        const message = error.response?.data?.message || 'Không thể kết nối máy chủ!';
        Swal.fire({ icon: 'error', title: 'Lỗi', text: message, confirmButtonColor: '#009981' });
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
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

.hover-brand:hover {
    color: #009981 !important;
}

.form-control:focus {
    border-color: #009981;
    box-shadow: 0 0 0 0.25rem rgba(0, 153, 129, 0.25);
}
</style>