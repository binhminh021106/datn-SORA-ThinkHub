<template>
  <div class="sora-product-grid-skeleton" :style="gridStyle" aria-hidden="true">
    <div v-for="item in count" :key="item" class="sora-product-skeleton-card">
      <SoraSkeleton variant="image" height="auto" radius="8px" class="sora-product-skeleton-image" />
      <div class="sora-product-skeleton-body">
        <SoraSkeleton width="74%" height="18px" class="mx-auto mb-2" />
        <SoraSkeleton width="48%" height="14px" class="mx-auto mb-3" />
        <SoraSkeleton width="40%" height="20px" class="mx-auto" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import SoraSkeleton from './SoraSkeleton.vue';

const props = defineProps({
  count: {
    type: Number,
    default: 8,
  },
  min: {
    type: String,
    default: '240px',
  },
  gap: {
    type: String,
    default: '1.5rem',
  },
});

const gridStyle = computed(() => ({
  '--sora-product-skeleton-min': props.min,
  '--sora-product-skeleton-gap': props.gap,
}));
</script>

<style scoped>
.sora-product-grid-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--sora-product-skeleton-min), 1fr));
  gap: var(--sora-product-skeleton-gap);
}

.sora-product-skeleton-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(231, 206, 125, 0.2);
  border-radius: 8px;
  background: #fffdf8;
}

.sora-product-skeleton-image {
  width: 100%;
  aspect-ratio: 1 / 1;
}

.sora-product-skeleton-body {
  padding: 20px 16px 24px;
  text-align: center;
}
</style>
