<template>
  <div class="sora-combo-detail-skeleton w-100" aria-hidden="true">
    <div class="row g-0 g-lg-5">
      <div class="col-lg-6 mb-4 mb-lg-0">
        <!-- Main Image -->
        <SoraSkeleton variant="image" width="100%" height="auto" radius="4px" style="aspect-ratio: 1 / 1;" />
      </div>
      <div class="col-lg-6">
        <div class="ps-lg-4 pt-2">
          <!-- Meta -->
          <div class="d-flex gap-3 mb-3">
            <SoraSkeleton width="30%" height="16px" radius="4px" />
            <SoraSkeleton width="20%" height="16px" radius="20px" />
          </div>
          
          <!-- Title -->
          <SoraSkeleton width="85%" height="48px" class="mb-4" radius="4px" />
          
          <!-- Description -->
          <SoraSkeleton width="100%" height="16px" class="mb-2" />
          <SoraSkeleton width="90%" height="16px" class="mb-2" />
          <SoraSkeleton width="95%" height="16px" class="mb-5" />
          
          <!-- Timer -->
          <div class="d-flex justify-content-between align-items-center mb-5">
            <div class="d-flex align-items-center gap-2">
              <SoraSkeleton width="12px" height="12px" circle />
              <SoraSkeleton width="100px" height="16px" radius="4px" />
            </div>
            <div class="d-flex gap-2">
              <SoraSkeleton v-for="i in 4" :key="i" width="36px" height="36px" radius="4px" />
            </div>
          </div>
          
          <!-- Items Heading -->
          <SoraSkeleton width="40%" height="28px" class="mb-4" radius="4px" />
          
          <!-- Item Cards -->
          <div class="mb-4" v-for="i in 2" :key="'item-'+i">
            <SoraSkeleton width="100%" height="200px" radius="8px" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SoraSkeleton from './SoraSkeleton.vue';
</script>
