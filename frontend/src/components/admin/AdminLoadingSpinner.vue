<template>
  <svg
    class="admin-loading-spinner"
    :style="spinnerStyle"
    viewBox="0 0 24 24"
    role="status"
    :aria-label="label"
  >
    <g
      v-for="index in 12"
      :key="index"
      :transform="`rotate(${(index - 1) * 30} 12 12)`"
      :style="{ animationDelay: `${(index - 12) * 0.1}s` }"
    >
      <line x1="12" y1="2.5" x2="12" y2="6.5" />
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: [Number, String],
    default: 20,
  },
  label: {
    type: String,
    default: 'Đang tải',
  },
});

const normalizedSize = computed(() => (
  typeof props.size === 'number' ? `${props.size}px` : props.size
));

const spinnerStyle = computed(() => ({
  width: normalizedSize.value,
  height: normalizedSize.value,
}));
</script>

<style scoped>
.admin-loading-spinner {
  display: inline-block;
  flex: 0 0 auto;
  color: #009981;
  vertical-align: middle;
}

.admin-loading-spinner g {
  animation: admin-spinner-fade 1.2s linear infinite;
}

.admin-loading-spinner line {
  stroke: currentColor;
  stroke-width: 2.25;
  stroke-linecap: round;
}

@keyframes admin-spinner-fade {
  0%, 39%, 100% {
    opacity: 0.18;
  }

  40% {
    opacity: 1;
  }
}
</style>
