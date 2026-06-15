<template>
  <div class="sora-product-detail-skeleton fade-in" aria-hidden="true">
    <div class="product-grid">
      <div class="product-gallery">
        <div class="thumbnails-list">
          <SoraSkeleton v-for="item in 4" :key="item" variant="image" width="75px" height="75px" radius="4px" />
        </div>
        <div class="main-image-wrapper">
          <SoraSkeleton variant="image" width="100%" height="100%" radius="8px" style="position: absolute; inset: 0;" />
        </div>
      </div>
      <div class="product-info">
        <SoraSkeleton width="26%" height="15px" class="mb-3" />
        <SoraSkeleton width="82%" height="34px" radius="8px" class="mb-3" />
        <SoraSkeleton width="48%" height="30px" radius="8px" class="mb-4" />
        <SoraSkeleton width="100%" height="62px" radius="6px" class="mb-4" />
        <SoraSkeleton width="24%" height="14px" class="mb-2" />
        <div class="d-flex gap-2 mb-4">
          <SoraSkeleton v-for="item in 4" :key="'color-' + item" width="36px" height="36px" circle />
        </div>
        <SoraSkeleton width="24%" height="14px" class="mb-2" />
        <div class="d-flex gap-2 mb-4">
          <SoraSkeleton v-for="item in 3" :key="'size-' + item" width="60px" height="38px" radius="6px" />
        </div>
        <div class="d-flex gap-3 mb-4">
          <SoraSkeleton width="130px" height="48px" radius="8px" />
          <SoraSkeleton width="100%" height="48px" radius="8px" />
        </div>
        <SoraSkeleton width="100%" height="14px" class="mb-2" />
        <SoraSkeleton width="94%" height="14px" class="mb-2" />
        <SoraSkeleton width="72%" height="14px" />
      </div>
    </div>
  </div>
</template>

<script setup>
import SoraSkeleton from './SoraSkeleton.vue';
</script>

<style scoped>
.sora-product-detail-skeleton {
  width: 100%;
}

.product-grid { display: flex; gap: 50px; align-items: flex-start; }
.product-gallery { display: flex; gap: 15px; width: 58%; }
.thumbnails-list { display: flex; flex-direction: column; gap: 10px; width: 75px; flex-shrink: 0; }
.main-image-wrapper { flex-grow: 1; aspect-ratio: 1 / 1; position: relative; }
.product-info { width: 42%; padding-top: 10px; }

@media (max-width: 1024px) {
  .product-grid { flex-wrap: wrap; }
  .product-gallery { width: 100%; }
  .product-info { width: 100%; }
}
@media (max-width: 768px) {
  .product-gallery { flex-direction: column-reverse; }
  .thumbnails-list { flex-direction: row; width: 100%; overflow-x: auto; }
}

.fade-in { animation: fadeIn 0.4s ease-in; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
