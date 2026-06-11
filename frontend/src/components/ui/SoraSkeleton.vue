<template>
  <span
    class="sora-skeleton"
    :class="[
      variantClass,
      { 'sora-skeleton--block': block, 'sora-skeleton--circle': circle },
    ]"
    :style="skeletonStyle"
    aria-hidden="true"
  />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '1rem',
  },
  radius: {
    type: String,
    default: '999px',
  },
  variant: {
    type: String,
    default: 'line',
  },
  block: {
    type: Boolean,
    default: true,
  },
  circle: {
    type: Boolean,
    default: false,
  },
});

const variantClass = computed(() => `sora-skeleton--${props.variant}`);

const skeletonStyle = computed(() => ({
  width: props.width,
  height: props.height,
  borderRadius: props.circle ? '50%' : props.radius,
}));
</script>

<style scoped>
.sora-skeleton {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(231, 206, 125, 0.12), rgba(159, 39, 59, 0.04)),
    #eadfd6;
}

.sora-skeleton--block {
  display: block;
}

.sora-skeleton--image,
.sora-skeleton--card {
  background:
    linear-gradient(135deg, rgba(231, 206, 125, 0.16), rgba(159, 39, 59, 0.06)),
    #f5efe8;
}

.sora-skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.35) 25%,
    rgba(255, 255, 255, 0.82) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: soraSkeletonShimmer 1.45s infinite;
}

@keyframes soraSkeletonShimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
