<template>
  <div class="profile-page bg-light-custom font-sans pb-5 min-vh-100 position-relative">
    <div class="container py-2 mt-2">
      <div v-if="!isLoggedIn" class="text-center py-5 bg-white shadow-sm p-5 border border-light mb-5">
        <h4 class="text-danger-custom mb-3">Bạn chưa đăng nhập!</h4>
        <p class="text-secondary mb-4">Vui lòng đăng nhập để xem và quản lý tài khoản.</p>
        <router-link to="/login" class="editorial-btn px-5 py-2">Đăng nhập ngay</router-link>
      </div>

      <div v-else class="row g-4 g-lg-5">
        <!-- SIDEBAR -->
        <div class="col-lg-3">
          <div class="position-sticky sidebar-sticky" :style="{ top: sidebarTop }">
            <ProfileSidebar />
          </div>
        </div>

        <!-- MAIN CONTENT -->
        <div class="col-lg-9">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import ProfileSidebar from '@/components/ui/ProfileSidebar.vue';
import { getUserToken } from '@/composables/useUtilities';

const router = useRouter();
const isLoggedIn = ref(true);

const sidebarTop = ref('100px');
let lastScrollY = 0;
let isHeaderHidden = false;

const handleScroll = () => {
  const currentScrollY = window.scrollY;
  if (currentScrollY > 200) {
    if (currentScrollY > lastScrollY && !isHeaderHidden) {
      isHeaderHidden = true;
    } else if (currentScrollY < lastScrollY && isHeaderHidden) {
      isHeaderHidden = false;
    }
  } else {
    isHeaderHidden = false;
  }
  sidebarTop.value = isHeaderHidden ? '20px' : '100px';
  lastScrollY = currentScrollY;
};

onMounted(() => {
  const token = getUserToken();
  if (!token) {
    isLoggedIn.value = false;
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.bg-light-custom { background-color: #faf9f8 !important; }
.text-danger-custom { color: #cc1e2e !important; }

.sidebar-sticky {
  z-index: 10;
  transition: top 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

</style>
