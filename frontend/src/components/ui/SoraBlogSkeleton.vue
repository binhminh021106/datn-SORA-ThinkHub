<template>
  <div class="sora-blog-skeleton" :class="`sora-blog-skeleton--${variant}`" aria-hidden="true">
    <template v-if="variant === 'detail'">
      <div class="sora-blog-main">
        <SoraSkeleton width="28%" height="18px" class="mb-3" />
        <SoraSkeleton width="100%" height="40px" radius="8px" class="mb-2" />
        <SoraSkeleton width="72%" height="40px" radius="8px" class="mb-4" />
        <div class="d-flex align-items-center mb-4 pb-3 border-bottom">
          <SoraSkeleton width="42px" height="42px" circle class="me-3 flex-shrink-0" />
          <SoraSkeleton width="32%" height="15px" class="me-3" />
          <SoraSkeleton width="24%" height="15px" />
        </div>
        <SoraSkeleton variant="image" height="420px" radius="14px" class="mb-4" />
        <SoraSkeleton v-for="line in 7" :key="line" :width="line % 3 === 0 ? '82%' : '100%'" height="16px" class="mb-3" />
      </div>
      <aside class="sora-blog-side">
        <SoraListSkeleton :rows="4" image-size="74px" card title />
      </aside>
    </template>

    <template v-else>
      <section class="sora-blog-main">
        <SoraSkeleton width="42%" height="24px" radius="8px" class="mb-4" />
        <div class="sora-blog-feature">
          <SoraSkeleton variant="image" height="100%" radius="12px 0 0 12px" class="sora-blog-feature-image" />
          <div class="sora-blog-feature-body">
            <SoraSkeleton width="30%" height="15px" class="mb-3" />
            <SoraSkeleton width="100%" height="30px" radius="8px" class="mb-3" />
            <SoraSkeleton width="100%" height="14px" class="mb-2" />
            <SoraSkeleton width="72%" height="14px" class="mb-4" />
            <SoraSkeleton width="42%" height="16px" />
          </div>
        </div>
        <div class="sora-blog-card-grid">
          <div v-for="card in 4" :key="card" class="sora-blog-card">
            <SoraSkeleton variant="image" height="160px" radius="10px 10px 0 0" />
            <div class="p-3">
              <SoraSkeleton width="46%" height="14px" class="mb-3" />
              <SoraSkeleton width="92%" height="22px" radius="7px" class="mb-2" />
              <SoraSkeleton width="78%" height="14px" />
            </div>
          </div>
        </div>
      </section>
      <aside class="sora-blog-side">
        <SoraListSkeleton :rows="4" :image="false" card title />
      </aside>
    </template>
  </div>
</template>

<script setup>
import SoraSkeleton from './SoraSkeleton.vue';
import SoraListSkeleton from './SoraListSkeleton.vue';

defineProps({
  variant: {
    type: String,
    default: 'list',
    validator: (value) => ['list', 'detail'].includes(value),
  },
});
</script>

<style scoped>
.sora-blog-skeleton {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 48px;
  align-items: start;
}

.sora-blog-main,
.sora-blog-side {
  min-width: 0;
}

.sora-blog-skeleton--detail .sora-blog-main {
  padding: 32px;
  border: 1px solid rgba(231, 206, 125, 0.2);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.sora-blog-feature,
.sora-blog-card {
  overflow: hidden;
  border: 1px solid rgba(231, 206, 125, 0.18);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
}

.sora-blog-feature {
  display: grid;
  grid-template-columns: 60% 40%;
  min-height: 360px;
  margin-bottom: 40px;
}

.sora-blog-feature-body {
  padding: 34px;
}

.sora-blog-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

@media (max-width: 992px) {
  .sora-blog-skeleton {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .sora-blog-feature {
    grid-template-columns: 1fr;
  }

  .sora-blog-feature-image {
    min-height: 230px;
    border-radius: 12px 12px 0 0 !important;
  }
}
</style>
