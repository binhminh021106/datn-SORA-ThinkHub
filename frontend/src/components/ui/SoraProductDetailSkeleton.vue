<template>
  <div class="sora-product-detail-skeleton" aria-hidden="true">
    <SoraSkeleton width="24%" height="16px" class="mb-4" />
    <div class="row g-5 align-items-start">
      <div class="col-lg-6">
        <div class="sora-product-gallery-skeleton">
          <div class="d-none d-md-flex flex-column gap-2">
            <SoraSkeleton v-for="item in 4" :key="item" variant="image" width="76px" height="76px" radius="8px" />
          </div>
          <SoraSkeleton variant="image" height="560px" radius="12px" class="flex-grow-1" />
        </div>
      </div>
      <div class="col-lg-6">
        <SoraSkeleton width="26%" height="15px" class="mb-3" />
        <SoraSkeleton width="82%" height="34px" radius="8px" class="mb-3" />
        <SoraSkeleton width="48%" height="30px" radius="8px" class="mb-4" />
        <SoraSkeleton width="100%" height="62px" radius="10px" class="mb-4" />
        <SoraSkeleton width="24%" height="14px" class="mb-2" />
        <div class="d-flex gap-2 mb-4">
          <SoraSkeleton v-for="item in 4" :key="'color-' + item" width="38px" height="38px" circle />
        </div>
        <SoraSkeleton width="24%" height="14px" class="mb-2" />
        <div class="d-flex gap-2 mb-4">
          <SoraSkeleton v-for="item in 3" :key="'size-' + item" width="64px" height="38px" radius="8px" />
        </div>
        <div class="d-flex gap-3 mb-4">
          <SoraSkeleton width="130px" height="48px" radius="999px" />
          <SoraSkeleton width="100%" height="48px" radius="999px" />
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
  max-width: 1300px;
  margin: 0 auto;
}

.sora-product-gallery-skeleton {
  display: flex;
  gap: 16px;
}

@media (max-width: 991px) {
  .sora-product-gallery-skeleton {
    display: block;
  }
}
</style>
