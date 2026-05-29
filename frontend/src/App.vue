<!-- test -->
<template>
  <div v-if="isCheckingAuth" class="vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
    <div class="logo-pulse-wrapper mb-4">
      <img src="@/assets/images/icon-logo.png" alt="SORA Logo" class="logo-pulse-img">
    </div>
  </div>

  <div v-else>
    <router-view></router-view>

    <QuickAddModal />
    <CompareModal shop-slug="sora" />
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/utils/apiClient';
import { useAdminRefreshListener } from '@/composables/useAdminRealtime.js';

// Nhúng 2 Modal Global vào App
import QuickAddModal from '@/components/ui/QuickAddModal.vue';
import CompareModal from '@/components/ui/CompareModal.vue';

const router = useRouter();
const isCheckingAuth = ref(true);
const currentUser = ref(null);

provide('currentUser', currentUser);

const checkAuthentication = async () => {
  const token = localStorage.getItem('admin_token');
  
  if (!token) {
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

onMounted(() => {
  checkAuthentication();
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

.logo-pulse-wrapper {
  display: inline-block;
}

.logo-pulse-img {
  width: 140px; 
  height: auto;
  object-fit: contain;
  animation: luxury-pulse 1.8s infinite alternate ease-in-out;
}

@keyframes luxury-pulse {
  0% {
    transform: scale(0.95);
    filter: drop-shadow(0 0 5px rgba(159, 39, 59, 0.2)) brightness(1);
  }
  100% {
    transform: scale(1.05);
    filter: drop-shadow(0 0 25px rgba(159, 39, 59, 0.8)) brightness(1.15);
  }
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