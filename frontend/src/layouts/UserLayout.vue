<template>
  <div class="user-layout d-flex flex-column min-vh-100">
    <Header />

    <main class="flex-grow-1">
      <router-view></router-view>
    </main>

    <Footer />
    <ChatDock />

    <transition name="fade">
      <button
        v-show="isVisible"
        @click="scrollToTop"
        class="scroll-to-top-btn"
        title="Lên đầu trang"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-arrow-up-short" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5z"/>
        </svg>
      </button>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Header from '../components/user/Header.vue';
import Footer from '../components/user/Footer.vue';
import ChatDock from '@/pages/user/chatbot/ChatDock.vue';

const isVisible = ref(false);

const handleScroll = () => {
  isVisible.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.scroll-to-top-btn {
  position: fixed;
  bottom: 110px;
  right: 30px;
  z-index: 9999;
  width: 45px;
  height: 45px;
  background-color: #9F273B;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s, transform 0.3s;
}

.scroll-to-top-btn:hover {
  background-color: #a71d2a;
  transform: translateY(-3px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>