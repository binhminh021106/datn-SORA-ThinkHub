<template>
  <div class="affiliate-skeleton p-4 p-md-5 mb-4 rounded-3" aria-hidden="true">
    <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
      <SoraSkeleton width="45px" height="45px" circle />
      <div>
        <SoraSkeleton width="190px" height="21px" radius="5px" class="mb-2" />
        <SoraSkeleton width="240px" height="13px" radius="4px" />
      </div>
    </div>

    <div class="row g-4 mb-5">
      <div v-for="card in 3" :key="card" class="col-md-4">
        <div class="affiliate-stat-skeleton p-4 rounded-4 h-100">
          <div class="d-flex align-items-center gap-3 mb-4">
            <SoraSkeleton width="48px" height="48px" circle />
            <SoraSkeleton width="58%" height="14px" radius="4px" />
          </div>
          <SoraSkeleton width="72%" height="27px" radius="5px" class="mb-3" />
          <SoraSkeleton width="58%" height="12px" radius="4px" />
        </div>
      </div>
    </div>

    <div class="affiliate-history-skeleton rounded-4 p-4">
      <SoraSkeleton width="230px" height="18px" radius="5px" class="mb-4" />
      <div v-for="row in 4" :key="row" class="d-flex gap-3 mb-3">
        <SoraSkeleton width="20%" height="14px" radius="4px" />
        <SoraSkeleton width="26%" height="14px" radius="4px" />
        <SoraSkeleton width="18%" height="14px" radius="4px" />
        <SoraSkeleton width="20%" height="14px" radius="4px" />
      </div>
    </div>
  </div>
</template>

<script setup>
import SoraSkeleton from '@/components/ui/SoraSkeleton.vue';
</script>

<style scoped>
.affiliate-skeleton {
  background: #fffdf9;
  border: 1px solid rgba(159, 39, 59, 0.12);
  box-shadow: 0 10px 28px rgba(77, 39, 28, 0.06);
}

.affiliate-stat-skeleton {
  background: #fff;
  border: 1px solid rgba(159, 39, 59, 0.1);
}

.affiliate-history-skeleton {
  background: #fff;
  border: 1px solid rgba(159, 39, 59, 0.1);
}
</style>
