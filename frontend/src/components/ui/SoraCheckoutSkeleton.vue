<template>
  <div class="row g-5" aria-hidden="true">
    <div class="col-lg-7">
      <div class="sora-checkout-skeleton-card">
        <SoraSkeleton width="44%" height="24px" radius="6px" class="mb-4" />
        <div class="row g-3">
          <div class="col-12">
            <SoraSkeleton height="48px" radius="4px" />
          </div>
          <div class="col-md-6">
            <SoraSkeleton height="48px" radius="4px" />
          </div>
          <div class="col-md-6">
            <SoraSkeleton height="48px" radius="4px" />
          </div>
          <div class="col-12">
            <SoraSkeleton height="96px" radius="6px" />
          </div>
        </div>
        <SoraSkeleton width="42%" height="24px" radius="6px" class="mt-5 mb-4" />
        <SoraSkeleton height="78px" radius="6px" class="mb-3" />
        <SoraSkeleton height="78px" radius="6px" />
      </div>
    </div>
    <div class="col-lg-5">
      <div class="sora-checkout-skeleton-card">
        <SoraSkeleton width="58%" height="24px" radius="6px" class="mb-4" />
        <SoraListSkeleton :rows="3" image-size="75px" />
        <div class="mt-4 pt-4 border-top">
          <SoraSkeleton width="100%" height="16px" class="mb-3" />
          <SoraSkeleton width="88%" height="16px" class="mb-4" />
          <SoraSkeleton width="100%" height="52px" radius="999px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SoraSkeleton from './SoraSkeleton.vue';
import SoraListSkeleton from './SoraListSkeleton.vue';
</script>

<style scoped>
.sora-checkout-skeleton-card {
  padding: 28px;
  border: 1px solid rgba(231, 206, 125, 0.22);
  background: #fff;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
}
</style>
