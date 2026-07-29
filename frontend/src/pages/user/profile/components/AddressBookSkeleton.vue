<template>
  <div class="address-book-skeleton p-4 p-md-5 mb-4 rounded-4" aria-hidden="true">
    <div class="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
      <div>
        <SoraSkeleton width="145px" height="26px" radius="6px" class="mb-2" />
        <SoraSkeleton width="230px" height="15px" radius="5px" />
      </div>
      <SoraSkeleton width="145px" height="42px" radius="10px" />
    </div>

    <div v-for="row in 3" :key="row" class="address-card-skeleton p-4 rounded-4 mb-3">
      <div class="row align-items-center">
        <div class="col-md-8 col-lg-9">
          <SoraSkeleton width="52%" height="22px" radius="5px" class="mb-3" />
          <SoraSkeleton width="76%" height="16px" radius="5px" class="mb-2" />
          <SoraSkeleton width="61%" height="15px" radius="5px" />
        </div>
        <div class="col-md-4 col-lg-3 mt-4 mt-md-0">
          <div class="d-flex justify-content-md-end gap-2 mb-3">
            <SoraSkeleton width="88px" height="40px" radius="7px" />
            <SoraSkeleton width="65px" height="40px" radius="7px" />
          </div>
          <SoraSkeleton width="100%" height="40px" radius="8px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SoraSkeleton from '@/components/ui/SoraSkeleton.vue';
</script>

<style scoped>
.address-book-skeleton {
  background: linear-gradient(145deg, #fffdf9 0%, #faf4ed 100%);
  border: 1px solid rgba(159, 39, 59, 0.16);
  box-shadow: 0 18px 45px rgba(77, 39, 28, 0.08);
}

.address-card-skeleton {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(159, 39, 59, 0.12);
}

@media (max-width: 767.98px) {
  .address-book-skeleton {
    padding: 1.25rem !important;
  }

  .address-book-skeleton > .d-flex {
    align-items: flex-start !important;
    flex-direction: column;
    gap: 1rem;
  }

  .address-book-skeleton > .d-flex > :last-child {
    width: 100%;
  }
}
</style>
