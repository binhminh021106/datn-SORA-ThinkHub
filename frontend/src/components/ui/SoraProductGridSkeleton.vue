<template>
  <div v-if="colClass" :class="gridClass" aria-hidden="true">
    <div v-for="item in count" :key="item" :class="colClass">
      <div class="sora-product-skeleton-card h-100 bg-white d-flex flex-column border border-light-subtle position-relative overflow-hidden">
        <div class="border-bottom border-light-subtle position-relative">
          <SoraSkeleton variant="image" height="auto" radius="0" class="sora-product-skeleton-image" />
        </div>
        <div class="position-relative flex-grow-1 bg-white d-flex flex-column">
          <div class="p-4 text-start d-flex flex-column flex-grow-1" style="padding-bottom: 64px !important;">
            <!-- Title -->
            <SoraSkeleton width="85%" height="24px" class="mb-2" radius="4px" />
            <SoraSkeleton width="50%" height="24px" class="mb-2" radius="4px" />
            
            <!-- Category & Status -->
            <div class="d-flex justify-content-between align-items-center mb-2">
              <SoraSkeleton width="35%" height="16px" radius="4px" />
              <SoraSkeleton width="25%" height="16px" radius="4px" />
            </div>
            
            <!-- Rating -->
            <div class="d-flex justify-content-start align-items-center mb-3">
              <SoraSkeleton width="45%" height="16px" radius="4px" />
            </div>

            <!-- Price -->
            <div class="mt-auto">
              <div class="d-flex align-items-baseline gap-2">
                <SoraSkeleton width="40%" height="28px" radius="4px" />
                <SoraSkeleton width="20%" height="16px" radius="4px" />
              </div>
            </div>

            <!-- Add to Cart Button -->
            <div class="position-absolute bottom-0 start-0 w-100">
              <SoraSkeleton width="100%" height="54px" radius="0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="sora-product-grid-skeleton" :class="{ 'is-slider': isSlider }" :style="gridStyle" aria-hidden="true">
    <div v-for="item in count" :key="item" class="sora-product-skeleton-card bg-white d-flex flex-column border border-light-subtle position-relative overflow-hidden h-100">
      <div class="border-bottom border-light-subtle position-relative">
        <SoraSkeleton variant="image" height="auto" radius="0" class="sora-product-skeleton-image" />
      </div>
      <div class="position-relative flex-grow-1 bg-white d-flex flex-column">
        <div class="p-4 text-start d-flex flex-column flex-grow-1" style="padding-bottom: 64px !important;">
          <!-- Title -->
          <SoraSkeleton width="85%" height="24px" class="mb-2" radius="4px" />
          <SoraSkeleton width="50%" height="24px" class="mb-2" radius="4px" />
          
          <!-- Category & Status -->
          <div class="d-flex justify-content-between align-items-center mb-2">
            <SoraSkeleton width="35%" height="16px" radius="4px" />
            <SoraSkeleton width="25%" height="16px" radius="4px" />
          </div>
          
          <!-- Rating -->
          <div class="d-flex justify-content-start align-items-center mb-3">
            <SoraSkeleton width="45%" height="16px" radius="4px" />
          </div>

          <!-- Price -->
          <div class="mt-auto">
            <div class="d-flex align-items-baseline gap-2">
              <SoraSkeleton width="40%" height="28px" radius="4px" />
              <SoraSkeleton width="20%" height="16px" radius="4px" />
            </div>
          </div>

          <!-- Add to Cart Button -->
          <div class="position-absolute bottom-0 start-0 w-100">
            <SoraSkeleton width="100%" height="54px" radius="0" />
          </div>
        </div>
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
  isSlider: {
    type: Boolean,
    default: false,
  },
  gridClass: {
    type: String,
    default: '',
  },
  colClass: {
    type: String,
    default: '',
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
}

.sora-product-skeleton-image {
  width: 100%;
  aspect-ratio: 1 / 1;
}

.sora-product-grid-skeleton.is-slider {
  display: flex;
  overflow: hidden;
  flex-wrap: nowrap;
}

.sora-product-grid-skeleton.is-slider .sora-product-skeleton-card {
  flex-shrink: 0;
  width: calc(25% - 15px);
}

@media (max-width: 1024px) {
  .sora-product-grid-skeleton.is-slider .sora-product-skeleton-card { width: calc(33.333% - 13.33px); }
}
@media (max-width: 768px) {
  .sora-product-grid-skeleton.is-slider .sora-product-skeleton-card { width: calc(50% - 10px); }
}
@media (max-width: 480px) {
  .sora-product-grid-skeleton.is-slider .sora-product-skeleton-card { width: 85%; }
}
</style>
