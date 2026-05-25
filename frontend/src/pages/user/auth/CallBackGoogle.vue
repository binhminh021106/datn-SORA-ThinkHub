<template>
  <div class="auth-wrapper">
    <div class="auth-container callback-container">
      <div class="auth-box text-center">
        <h1 class="brand-name-large callback-logo">SORA</h1>
        
        <div v-if="!isError" class="loading-state">
          <div class="spinner"></div>
          <h2 class="auth-title mt-4">Đang xác thực...</h2>
          <p class="subtitle">{{ statusMessage }}</p>
        </div>

        <div v-else class="error-state">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <h2 class="auth-title mt-4 text-error">Đăng nhập thất bại</h2>
          <p class="subtitle">{{ statusMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const statusMessage = ref('Đang kết nối với hệ thống...');
const isError = ref(false);

onMounted(async () => {
  // Lấy params từ URL do Laravel trả về
  const token = route.query.token;
  const error = route.query.error;

  // 1. Nếu Google trả về lỗi
  if (error) {
    handleError('Xác thực Google bị từ chối. Đang quay lại trang đăng nhập...');
    return;
  }

  // 2. Nếu nhận được Token
  if (token) {
    try {
      statusMessage.value = 'Đang đồng bộ dữ liệu tài khoản...';
      
      // Lưu token và set Header cho Axios
      localStorage.setItem('auth_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Gọi API lấy thông tin User để lưu vào userData (Đồng bộ với logic của bạn)
      // Lưu ý: Laravel của bạn cần có route GET /api/user (mặc định đã có trong routes/api.php)
      const response = await axios.get(`${API_BASE_URL}/user`);
      
      // Lưu thông tin user
      localStorage.setItem('userData', JSON.stringify(response.data));

      // Đồng bộ giỏ hàng Guest vào tài khoản
      const sessionId = localStorage.getItem('cart_session_id');
      if (sessionId) {
          try {
              await axios.post(`${API_BASE_URL}/client/cart/merge`, {}, {
                  headers: {
                      'Authorization': `Bearer ${token}`,
                      'X-Cart-Session-Id': sessionId,
                      'Accept': 'application/json'
                  }
              });
              localStorage.removeItem('cart_session_id');
              window.dispatchEvent(new CustomEvent('update-cart-count'));
          } catch (e) {
              console.error('Merge cart error:', e);
          }
      }

      statusMessage.value = 'Đăng nhập thành công! Đang đưa bạn vào cửa hàng...';
      
      // Chuyển về trang chủ sau 1 giây
      setTimeout(() => {
        window.location.href = '/'; 
      }, 1000);

    } catch (err) {
      handleError('Không thể lấy thông tin tài khoản. Vui lòng thử lại.', err);
      // Xóa token rác nếu gọi API user thất bại
      localStorage.removeItem('auth_token'); 
      delete axios.defaults.headers.common['Authorization'];
    }
  } else {
    handleError('Yêu cầu không hợp lệ.');
  }
});

const handleError = (msg) => {
  isError.value = true;
  statusMessage.value = msg;
  setTimeout(() => {
    window.location.href = '/login';
  }, 2500);
};
</script>

<style scoped>
/* Tái sử dụng Base CSS của bạn */
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fcf9f5;
  padding: 40px 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.auth-container.callback-container {
  max-width: 500px;
  min-height: 400px;
}

.auth-box {
  flex: 1;
  padding: 50px 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
}

.text-center {
  text-align: center;
}

.callback-logo {
  color: #9f273b;
  text-shadow: none;
  margin-bottom: 40px;
}

.brand-name-large {
  font-size: 48px;
  font-weight: bold;
  letter-spacing: 12px;
  font-family: 'Playfair Display', 'Times New Roman', serif;
}

.auth-title {
  color: #9f273b;
  font-size: 26px;
  margin: 0 0 8px;
  font-family: 'Playfair Display', serif;
}

.text-error {
  color: #cc1e2e;
}

.subtitle {
  color: #666;
  font-size: 15px;
  margin: 0;
}

.mt-4 {
  margin-top: 24px;
}

/* Spinner Animation */
.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #9f273b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Icon */
.error-icon {
  width: 60px;
  height: 60px;
  color: #cc1e2e;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .auth-box {
    padding: 40px 25px;
  }
}
</style>