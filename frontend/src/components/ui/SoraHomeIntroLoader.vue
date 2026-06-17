<template>
  <Transition name="home-logo-loader">
    <div v-if="show"
      class="home-logo-loader vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
      <div class="logo-pulse-wrapper mb-4">
        <img src="@/assets/images/icon-logo.png" alt="SORA Logo" class="logo-pulse-img">
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true
  }
});
</script>

<style scoped>
.home-logo-loader {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background:
    radial-gradient(circle at 50% 50%, rgba(var(--sora-secondary-rgb), 0.12), transparent 26%),
    #f8f9fa !important;
}

.logo-pulse-wrapper {
  display: inline-block;
}

.logo-pulse-img {
  width: 90px;
  height: auto;
  object-fit: contain;
  animation: luxury-pulse 1.8s infinite alternate ease-in-out;
}

.home-logo-loader-enter-active,
.home-logo-loader-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease, filter 0.5s ease;
}

.home-logo-loader-enter-from,
.home-logo-loader-leave-to {
  opacity: 0;
  transform: scale(1.035);
  filter: blur(8px);
}

@keyframes luxury-pulse {
  0% {
    transform: scale(0.95);
    filter: drop-shadow(0 0 5px rgba(var(--sora-primary-rgb), 0.2)) brightness(1);
  }

  100% {
    transform: scale(1.05);
    filter: drop-shadow(0 0 25px rgba(var(--sora-primary-rgb), 0.8)) brightness(1.15);
  }
}
</style>
