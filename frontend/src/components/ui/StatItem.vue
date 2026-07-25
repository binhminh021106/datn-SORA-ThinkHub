<template>
  <div class="stat-item">
    <strong>{{ displayValue }}{{ item.suffix }}</strong>
    <span>{{ item.label }}</span>
  </div>
</template>

<script setup>
import { useCountAnimation } from '@/composables/useCountAnimation';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
});

// Initialize animation for this specific stat
const { displayValue } = useCountAnimation(
  () => props.item.value,
  2500,
  100 + props.index * 150  // Stagger: mỗi stat delay 150ms
);
</script>

<style scoped>
.stat-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 120px;
  will-change: contents;
}

.stat-item strong {
  display: block;
  color: var(--sora-secondary, #e7ce7d);
  font-family: 'Oswald', sans-serif;
  font-weight: 500;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.2;
  min-height: 4.5rem;
  word-break: break-word;
  white-space: nowrap;
  overflow: visible;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: opacity 0.1s ease-out;
}

.stat-item span {
  display: block;
  margin-top: 0.5rem;
  font-family: 'Oswald', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  line-height: 1.4;
}

@media (max-width: 767px) {
  .stat-item {
    min-height: 80px;
  }

  .stat-item strong {
    font-size: 1.25rem !important;
    min-height: 2.5rem;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  }

  .stat-item span {
    font-size: 0.55rem !important;
    margin-top: 0.25rem;
  }
}
</style>
