<template>
  <div class="d-flex flex-column justify-content-center align-items-center w-100" style="min-height: 70vh;">
    <h1 class="logo-shimmer mb-3">ZYRO</h1>
    <p class="text-muted fw-semibold small text-uppercase tracking-widest" style="letter-spacing: 2px;">
      {{ text }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: 'Đang tải dữ liệu...'
  }
})
</script>

<style scoped>
.logo-shimmer {
  font-size: 3.5rem;
  font-weight: 900;
  letter-spacing: -1.5px;
  background: linear-gradient(120deg, #1e293b 30%, #64748b 50%, #1e293b 70%);
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
</style>
