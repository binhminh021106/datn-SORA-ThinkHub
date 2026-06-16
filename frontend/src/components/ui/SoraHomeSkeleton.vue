<template>
  <div class="sora-home-skeleton">
    <!-- Hero Section Skeleton -->
    <section class="home-hero-skeleton position-relative bg-light overflow-hidden d-flex align-items-center justify-content-center">
      <div class="position-absolute w-100 h-100 top-0 start-0 z-index-1">
        <SoraSkeleton variant="image" height="100%" radius="0" />
      </div>
      <div class="hero-loading-content text-center position-relative z-index-2 w-100 px-4" style="max-width: 600px;">
        <SoraSkeleton width="180px" height="40px" class="mx-auto mb-4" />
        <SoraSkeleton width="80%" height="20px" class="mx-auto mb-3" />
        <SoraSkeleton width="60%" height="20px" class="mx-auto mb-5" />
        <SoraSkeleton width="160px" height="45px" class="mx-auto" radius="30px" />
      </div>
    </section>

    <!-- Stats Band Skeleton -->
    <section class="home-stats-skeleton py-4 border-top border-bottom">
      <div class="container d-flex justify-content-around align-items-center flex-wrap gap-4">
        <div v-for="i in 3" :key="i" class="text-center" style="width: 150px;">
          <SoraSkeleton width="80px" height="36px" class="mx-auto mb-2" />
          <SoraSkeleton width="120px" height="16px" class="mx-auto" />
        </div>
      </div>
    </section>

    <!-- Story Section Skeleton -->
    <section class="story-skeleton py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6 mb-4 mb-lg-0">
            <SoraSkeleton variant="image" height="500px" radius="8px" />
          </div>
          <div class="col-lg-6 ps-lg-5 text-center text-lg-start">
            <SoraSkeleton width="120px" height="16px" class="mb-3 mx-auto mx-lg-0" />
            <SoraSkeleton width="70%" height="40px" class="mb-4 mx-auto mx-lg-0" />
            <SoraSkeleton width="100%" height="16px" class="mb-2" />
            <SoraSkeleton width="90%" height="16px" class="mb-2" />
            <SoraSkeleton width="80%" height="16px" class="mb-4" />
            <SoraSkeleton width="150px" height="45px" radius="30px" class="mx-auto mx-lg-0" />
          </div>
        </div>
      </div>
    </section>

    <!-- Top Selling / Products Skeleton -->
    <section class="products-skeleton py-5 bg-light">
      <div class="container">
        <div class="text-center mb-5">
          <SoraSkeleton width="100px" height="16px" class="mx-auto mb-3" />
          <SoraSkeleton width="50%" height="32px" class="mx-auto" />
        </div>
        <SoraProductGridSkeleton :count="4" gridClass="row" colClass="col-6 col-md-4 col-lg-3 mb-4" />
      </div>
    </section>
  </div>
</template>

<script setup>
import SoraSkeleton from './SoraSkeleton.vue';
import SoraProductGridSkeleton from './SoraProductGridSkeleton.vue';
</script>

<style scoped>
.sora-home-skeleton {
  width: 100%;
}

.home-hero-skeleton {
  height: calc(100vh - 120px);
  min-height: 500px;
}

@media (max-width: 768px) {
  .home-hero-skeleton {
    height: 70vh;
  }
}

.z-index-1 {
  z-index: 1;
}

.z-index-2 {
  z-index: 2;
}
</style>
