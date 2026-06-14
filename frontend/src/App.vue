<template>
  <div v-if="isCheckingAuth" class="app-auth-check-screen"></div>

  <div v-else>
    <router-view></router-view>

    <QuickAddModal />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, provide, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import apiClient from '@/utils/apiClient';
import { useAdminRefreshListener } from '@/composables/useAdminRealtime.js';

// Nhúng modal global vào App
import QuickAddModal from '@/components/ui/QuickAddModal.vue';

const router = useRouter();
const route = useRoute();
const isCheckingAuth = ref(true);
const currentUser = ref(null);

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
    router.push('/admin/login');
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
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #f8f9fa;
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
  color: #fff !important;
  border: 1px solid rgba(var(--sora-secondary-rgb), 0.5);
  border-radius: 14px;
  font-family: 'Oswald', sans-serif;
  font-size: 0.76rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  text-decoration: none !important;
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
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.editorial-btn:hover {
  background: var(--sora-accent);
  color: #fff !important;
  border-color: var(--sora-secondary);
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
}

.editorial-btn:hover::after {
  transform: rotate(45deg) translateY(200%);
}
</style>
