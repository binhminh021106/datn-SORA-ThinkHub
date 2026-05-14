<template>
  <div class="product-price mb-3">
    <template v-if="isAllAttributesSelected && currentVariant">
      <span class="price-current">{{ formatMoney(currentVariant.promotional_price || currentVariant.price) }}</span>
      <span v-if="currentVariant.promotional_price" class="price-old">
        {{ formatMoney(currentVariant.price) }}
      </span>
      <span v-if="currentVariant.promotional_price" class="discount-badge">
        -{{ Math.round((1 - currentVariant.promotional_price / currentVariant.price) * 100) }}%
      </span>
    </template>
    <template v-else>
      <span class="price-current">{{ formatMoney(defaultPrice) }}</span>
    </template>
  </div>
</template>

<script setup>
import { formatMoney } from '@/composables/useUtilities';

defineProps({
  isAllAttributesSelected: {
    type: Boolean,
    required: true
  },
  currentVariant: {
    type: Object,
    default: null
  },
  defaultPrice: {
    type: Number,
    default: 0
  }
});
</script>

<style scoped>
.product-price { display: flex; align-items: center; gap: 15px; }
.price-current { font-size: 24px; font-weight: 700; color: rgb(159,39,59); }
.price-old { font-size: 16px; color: #999; text-decoration: line-through; }
.discount-badge { background: #fff0f2; color: rgb(159,39,59); padding: 3px 8px; font-size: 12px; font-weight: 600; border-radius: 4px; }
</style>
