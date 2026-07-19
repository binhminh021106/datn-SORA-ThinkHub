<template>
  <div v-if="isCheckingAuth" class="app-auth-check-screen"></div>

  <div v-else>
    <router-view></router-view>
    <QuickAddModal />

    <!-- Overlay Loading Xác thực Google -->
    <div v-if="isGoogleAuthenticating" class="google-auth-overlay">
      <div class="google-auth-box">
        <svg class="shadcn-spinner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="2" x2="12" y2="6" opacity="1"></line>
          <line x1="12" y1="2" x2="12" y2="6" transform="rotate(30 12 12)" opacity="0.916"></line>
          <line x1="12" y1="2" x2="12" y2="6" transform="rotate(60 12 12)" opacity="0.833"></line>
          <line x1="12" y1="2" x2="12" y2="6" transform="rotate(90 12 12)" opacity="0.75"></line>
          <line x1="12" y1="2" x2="12" y2="6" transform="rotate(120 12 12)" opacity="0.666"></line>
          <line x1="12" y1="2" x2="12" y2="6" transform="rotate(150 12 12)" opacity="0.583"></line>
          <line x1="12" y1="2" x2="12" y2="6" transform="rotate(180 12 12)" opacity="0.5"></line>
          <line x1="12" y1="2" x2="12" y2="6" transform="rotate(210 12 12)" opacity="0.416"></line>
          <line x1="12" y1="2" x2="12" y2="6" transform="rotate(240 12 12)" opacity="0.333"></line>
          <line x1="12" y1="2" x2="12" y2="6" transform="rotate(270 12 12)" opacity="0.25"></line>
          <line x1="12" y1="2" x2="12" y2="6" transform="rotate(300 12 12)" opacity="0.166"></line>
          <line x1="12" y1="2" x2="12" y2="6" transform="rotate(330 12 12)" opacity="0.083"></line>
        </svg>
        <p class="google-auth-text">{{ googleAuthStatus }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, provide, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';
import apiClient from '@/utils/apiClient';
import clientApiClient from '@/utils/clientApiClient';
import { useAdminRefreshListener } from '@/composables/useAdminRealtime.js';
import { useRealtimeSync } from '@/composables/useRealtimeSync.js';

// Nhúng modal global vào App
import QuickAddModal from '@/components/ui/QuickAddModal.vue';

const router = useRouter();
const route = useRoute();
const queryClient = useQueryClient();
const isCheckingAuth = ref(true);
const currentUser = ref(null);

const isGoogleAuthenticating = ref(false);
const googleAuthStatus = ref('Đang đồng bộ dữ liệu...');

provide('currentUser', currentUser);

watch(
  () => route.query.ref,
  (newRef) => {
    if (newRef) {
      localStorage.setItem('sora_affiliate_code', newRef);
      console.log('Đã lưu mã giới thiệu:', newRef);
    }
  },
  { immediate: true }
);

// ===== XỬ LÝ GOOGLE AUTH OVERLAY =====
watch(
  () => route.query.google_token,
  async (token) => {
    if (token) {
      // Bật overlay loading
      isGoogleAuthenticating.value = true;
      googleAuthStatus.value = 'Đang đồng bộ tài khoản...';

      // Xóa token khỏi URL để URL sạch đẹp
      const currentQuery = { ...route.query };
      delete currentQuery.google_token;
      router.replace({ query: currentQuery });

      try {
        localStorage.setItem('auth_token', token);
        const response = await clientApiClient.get('/user');
        localStorage.setItem('userData', JSON.stringify(response.data));

        const sessionId = localStorage.getItem('cart_session_id');
        if (sessionId) {
            try {
                await clientApiClient.post('/client/cart/merge', {}, {
                    ensureCartSession: true,
                    ignoreAuthRedirect: true
                });
                localStorage.removeItem('cart_session_id');
                window.dispatchEvent(new CustomEvent('update-cart-count'));
            } catch (e) {}
        }

        queryClient.invalidateQueries({ queryKey: ['cart'] });
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        queryClient.invalidateQueries({ queryKey: ['user_profile'] });
        
        window.dispatchEvent(new CustomEvent('auth-status-changed'));

        googleAuthStatus.value = 'Thành công!';
        setTimeout(() => {
          isGoogleAuthenticating.value = false;
        }, 500);

      } catch (err) {
        localStorage.removeItem('auth_token');
        isGoogleAuthenticating.value = false;
        router.push({ path: '/login', query: { error: 'google_auth_failed' } });
      }
    }
  },
  { immediate: true }
);
// ===== KẾT THÚC: LOGIC LƯU MÃ AFFILIATE TỰ ĐỘNG =====

const checkAuthentication = async () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') ||
    localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');

  if (!token) {
    currentUser.value = null;
    isCheckingAuth.value = false;
    return;
  }

  try {
    const result = await apiClient.get('/admin/me', { ignoreAuthRedirect: true });
    currentUser.value = result.data?.data;
    if (result.data?.data?.role) {
      localStorage.setItem('admin_level', result.data.data.role.level);
    }
  } catch (err) {
    console.error('Lỗi xác thực:', err);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_level');
    currentUser.value = null;
    if (route.path.startsWith('/admin') && !route.path.includes('/admin/login')) {
      router.push('/admin/login');
    }
  } finally {
    isCheckingAuth.value = false;
  }
};

const handleAdminAuthChanged = () => {
  checkAuthentication();
};

onMounted(() => {
  checkAuthentication();
  window.addEventListener('admin-auth-changed', handleAdminAuthChanged);
});

onBeforeUnmount(() => {
  window.removeEventListener('admin-auth-changed', handleAdminAuthChanged);
});

useAdminRefreshListener((payload) => {
  if (!payload || !payload.module) return;
  // Tải lại thông tin user nếu có thay đổi về role hoặc users
  if (payload.module === 'roles' || payload.module === 'users') {
    checkAuthentication();
  }
});

// Khởi chạy listener lắng nghe sự kiện đồng bộ từ Backend (Sản phẩm, Combo)
useRealtimeSync();
</script>

<style>
:root {
  --sora-primary: #9f273b;
  --sora-primary-rgb: 159, 39, 59;
  --sora-secondary: #e7ce7d;
  --sora-secondary-rgb: 231, 206, 125;
  --sora-accent: #cc1e2e;
}

.text-sora-primary {
  color: var(--sora-primary) !important;
}
.bg-sora-primary {
  background-color: var(--sora-primary) !important;
}
.border-sora-primary {
  border-color: var(--sora-primary) !important;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f8f9fa;
}

/* Disable browser default password eye icon */
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear,
input::-webkit-credentials-auto-fill-button {
  display: none !important;
}

.app-auth-check-screen {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.tracking-widest {
  letter-spacing: 0.25em;
}

.logo-shimmer {
  font-size: 3.5rem;
  font-weight: 900;
  letter-spacing: -1.5px;
  background: linear-gradient(120deg, #9f273b 30%, #cc1e2e 50%, #9f273b 70%);
  background-size: 200% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: shine 1.5s linear infinite;
}

@keyframes shine {
  to {
    background-position: 200% center;
  }
}

/* Global button styles for editorial-btn */
.editorial-btn {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0.75rem 1.25rem;
  background: var(--sora-primary);
  color: #fff;
  border: 1px solid rgba(var(--sora-secondary-rgb), 0.5);
  border-radius: 10px;
  font-family: 'Oswald', sans-serif;
  font-size: 0.76rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  text-decoration: none;
}

.sora-popup-gradient {
  background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 50%, #fae8eb 100%) !important;
  border: 1px solid rgba(159, 39, 59, 0.1) !important;
}

.text-gold-gradient {
  background: linear-gradient(135deg, #e7ce7d 0%, #f9f0d1 50%, #d4af37 100%) !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  color: transparent !important;
  text-shadow: 0 2px 10px rgba(231, 206, 125, 0.2);
  padding-top: 0.2em;
  padding-bottom: 0.1em;
  line-height: 1.4 !important;
}

.editorial-btn::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(45deg) translateY(-200%);
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.editorial-btn:hover {
  background: var(--sora-accent);
  color: #fff;
  border-color: var(--sora-secondary);
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
}

.editorial-btn:hover::after {
  transform: rotate(45deg) translateY(200%);
}

.editorial-btn:disabled, .editorial-btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  background: var(--sora-primary);
  border-color: var(--sora-primary);
  color: #fff;
}

.editorial-btn:disabled::after, .editorial-btn[disabled]::after {
  display: none;
}

.editorial-btn-outline {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0.75rem 1.25rem;
  background: transparent;
  color: var(--sora-primary);
  border: 1px solid var(--sora-primary);
  border-radius: 10px;
  font-family: 'Oswald', sans-serif;
  font-size: 0.76rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-decoration: none;
}

.editorial-btn-outline:hover {
  background: var(--sora-primary);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

/* Modal Google Auth Overlay */
.google-auth-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.7); /* Bán trong suốt */
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}

.google-auth-box {
  background: white;
  padding: 30px 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.google-auth-box .shadcn-spinner {
  width: 50px;
  height: 50px;
  color: var(--sora-primary);
  animation: spin-auth 1s steps(12) infinite;
  margin-bottom: 20px;
}

.google-auth-text {
  color: var(--sora-primary);
  font-family: 'Josefin Sans', sans-serif;
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

@keyframes spin-auth {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
