<template>
  <div class="google-auth-fullscreen">
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
      <p class="google-auth-text">Đang xác thực Google...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import clientApiClient from '@/utils/clientApiClient';

const route = useRoute();
const router = useRouter();

const isSafeClientRedirect = (value) => typeof value === 'string'
  && value.startsWith('/')
  && !value.startsWith('//')
  && !value.startsWith('/\\')
  && !value.startsWith('/admin');

onMounted(async () => {
  const code = route.query.code;
  const error = route.query.error;

  const storedRedirect = localStorage.getItem('redirect_after_login');
  const redirectPath = isSafeClientRedirect(storedRedirect) ? storedRedirect : '/';
  localStorage.removeItem('redirect_after_login');

  if (error) {
    router.replace({ path: '/login', query: { error: 'google_auth_failed' } });
  } else if (code) {
    try {
      const response = await clientApiClient.post('/auth/google/exchange', { code }, { withCredentials: true });
      
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
.google-auth-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: #f8f9fa;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
