<template>
  <!-- Route pass-through (không cần render UI) -->
  <div></div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import clientApiClient from '@/utils/clientApiClient';

const route = useRoute();
const router = useRouter();

onMounted(async () => {
  const code = route.query.code;
  const error = route.query.error;

  let redirectPath = localStorage.getItem('redirect_after_login') || '/';
  if (redirectPath.startsWith('/admin')) {
    redirectPath = '/';
  }
  localStorage.removeItem('redirect_after_login');

  if (error) {
    router.replace({ path: '/login', query: { error: 'google_auth_failed' } });
  } else if (code) {
    try {
      const response = await clientApiClient.post('/auth/google/exchange', { code });
      
      localStorage.setItem('auth_token', response.data.access_token);
      localStorage.setItem('pending_google_sync', 'true');
      router.replace(redirectPath);
    } catch (err) {
      router.replace({ path: '/login', query: { error: 'google_auth_failed' } });
    }
  } else {
    router.replace({ path: '/login' });
  }
});
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
  font-family: 'Josefin Sans', sans-serif;
}

.auth-title {
  color: #9f273b;
  font-size: 26px;
  margin: 0 0 8px;
  font-family: 'Josefin Sans', sans-serif;
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
.shadcn-spinner {
  width: 50px;
  height: 50px;
  color: #9f273b; /* Sử dụng màu chủ đề */
  animation: spin 1s steps(12) infinite;
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
