<template>
  <div v-if="isCheckingAuth" class="app-auth-check-screen"></div>

  <div v-else>
    <router-view></router-view>

    <QuickAddModal />
    <CompareModal shop-slug="sora" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, provide, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import apiClient from '@/utils/apiClient';
import { useAdminRefreshListener } from '@/composables/useAdminRealtime.js';

// Nhúng 2 Modal Global vào App
import QuickAddModal from '@/components/ui/QuickAddModal.vue';
import CompareModal from '@/components/ui/CompareModal.vue';

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
  to { background-position: 200% center; }
}
</style>
