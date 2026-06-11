<template>
  <div class="sora-list-skeleton" :class="{ 'sora-list-skeleton--card': card }" aria-hidden="true">
    <div v-if="title" class="mb-4">
      <SoraSkeleton width="34%" height="24px" radius="6px" />
    </div>

    <div v-for="row in rows" :key="row" class="sora-list-skeleton-row">
      <SoraSkeleton
        v-if="image"
        variant="image"
        :width="imageSize"
        :height="imageSize"
        radius="8px"
        class="flex-shrink-0"
      />
      <div class="sora-list-skeleton-content">
        <SoraSkeleton width="76%" height="17px" class="mb-2" />
        <SoraSkeleton width="52%" height="13px" class="mb-3" />
        <SoraSkeleton width="36%" height="18px" />
      </div>
    </div>
  </div>
</template>

<script setup>
import SoraSkeleton from './SoraSkeleton.vue';

defineProps({
  rows: {
    type: Number,
    default: 4,
  },
  image: {
    type: Boolean,
    default: true,
  },
  imageSize: {
    type: String,
    default: '88px',
  },
  title: {
    type: Boolean,
    default: false,
  },
  card: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.sora-list-skeleton--card {
  padding: 24px;
  border: 1px solid rgba(231, 206, 125, 0.24);
  border-radius: 10px;
  background: #fffdf8;
}

.sora-list-skeleton-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 0;
  border-bottom: 1px solid rgba(231, 206, 125, 0.18);
}

.sora-list-skeleton-row:first-of-type {
  padding-top: 0;
}

.sora-list-skeleton-row:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.sora-list-skeleton-content {
  flex: 1;
  min-width: 0;
}
</style>
