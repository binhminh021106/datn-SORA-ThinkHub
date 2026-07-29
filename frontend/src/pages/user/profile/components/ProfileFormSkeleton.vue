<template>
  <div class="profile-form-skeleton p-4 p-md-5 mb-4 rounded-3" aria-hidden="true">
    <SoraSkeleton width="30%" height="26px" radius="6px" class="mb-2" />
    <SoraSkeleton width="52%" height="15px" radius="5px" class="mb-4" />

    <div class="profile-form-skeleton-tier rounded-4 p-4 p-md-5 mb-5">
      <div class="d-flex align-items-center gap-4">
        <SoraSkeleton width="80px" height="80px" circle />
        <div class="flex-grow-1">
          <SoraSkeleton width="38%" height="12px" radius="4px" class="mb-3" />
          <SoraSkeleton width="28%" height="24px" radius="5px" class="mb-2" />
          <SoraSkeleton width="44%" height="12px" radius="4px" />
        </div>
      </div>
    </div>

    <div v-for="row in 5" :key="row" class="row mb-4 align-items-center">
      <div class="col-sm-3 d-flex justify-content-sm-end">
        <SoraSkeleton width="72%" height="14px" radius="4px" />
      </div>
      <div class="col-sm-9 col-md-7 mt-2 mt-sm-0">
        <SoraSkeleton width="100%" height="42px" radius="9px" />
      </div>
    </div>
  </div>
</template>

<script setup>
import SoraSkeleton from '@/components/ui/SoraSkeleton.vue';
</script>

<style scoped>
.profile-form-skeleton {
  background: #fffdf9;
  border: 1px solid rgba(231, 206, 125, 0.28);
  box-shadow: 0 10px 28px rgba(77, 39, 28, 0.06);
}

.profile-form-skeleton-tier {
  background: linear-gradient(135deg, rgba(159, 39, 59, 0.14), rgba(231, 206, 125, 0.2));
  border: 1px solid rgba(159, 39, 59, 0.12);
}
</style>
