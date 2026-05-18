<template>
  <div class="product-variants">
    <div v-for="(options, attrName) in attributes" :key="attrName" class="variant-group">
      <div class="variant-label-wrapper d-flex justify-content-between align-items-center gap-2">
        <h3 class="variant-label mb-0">
          {{ attrName }}
          <span v-if="selectedAttributes[attrName]" style="color: #333; font-weight: 600; text-transform: none; font-size: 15px;">
            : {{ getOptionName(attrName, selectedAttributes[attrName]) }}
          </span>
        </h3>
        <button
          v-if="isSizeAttribute(attrName)"
          @click="emit('show-size-guide')"
          class="size-guide-btn-compact"
          type="button"
          title="Xem hướng dẫn kích cỡ"
        >
          <i class="bi bi-rulers"></i>
        </button>
      </div>
      
      <!-- Color Options -->
      <div v-if="isColorAttribute(attrName)" class="variant-options color-options">
        <button 
          v-for="option in options" 
          :key="option.id"
          @click="!isOptionDisabled(attrName, option.id) && emit('select', attrName, option.id)"
          class="color-swatch-btn d-flex justify-content-center align-items-center"
          :class="{ 
            'active': selectedAttributes[attrName] === option.id,
            'disabled': isOptionDisabled(attrName, option.id)
          }"
          :title="option.name"
          :style="{ 
            backgroundColor: getColorCode(option.name),
            opacity: isOptionDisabled(attrName, option.id) ? 0.4 : 1,
            cursor: isOptionDisabled(attrName, option.id) ? 'not-allowed' : 'pointer'
          }"
          :disabled="isOptionDisabled(attrName, option.id)"
        >
          <i v-if="selectedAttributes[attrName] === option.id" class="bi bi-check fw-bold" :class="isLightColor(option.name) ? 'text-dark' : 'text-white'" style="font-size: 1.3rem;"></i>
          <i v-else-if="isOptionDisabled(attrName, option.id)" class="bi bi-slash-circle text-secondary" style="font-size: 1rem;"></i>
        </button>
      </div>
      
      <!-- Text/Size Options -->
      <div v-else class="variant-options">
        <button 
          v-for="option in options" 
          :key="option.id"
          @click="!isOptionDisabled(attrName, option.id) && emit('select', attrName, option.id)"
          class="variant-btn"
          :class="{ 
            'active': selectedAttributes[attrName] === option.id,
            'disabled': isOptionDisabled(attrName, option.id)
          }"
          :disabled="isOptionDisabled(attrName, option.id)"
          :style="{ 
            opacity: isOptionDisabled(attrName, option.id) ? 0.4 : 1,
            cursor: isOptionDisabled(attrName, option.id) ? 'not-allowed' : 'pointer'
          }"
        >
          {{ option.name }}
          <i v-if="isOptionDisabled(attrName, option.id)" class="bi bi-slash-circle ms-1" style="font-size: 0.8rem;"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getColorCode, isLightColor, isColorAttribute, isSizeAttribute } from '@/composables/useColorMapping';

const props = defineProps({
  attributes: {
    type: Object,
    required: true
  },
  selectedAttributes: {
    type: Object,
    required: true
  },
  isOptionAvailable: {
    type: Function,
    required: true
  },
  getOptionName: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['select', 'show-size-guide']);

const isOptionDisabled = (attrName, optionId) => {
  return !props.isOptionAvailable(attrName, optionId);
};
</script>

<style scoped>
.product-variants { margin-bottom: 15px; }
.variant-group { margin-bottom: 20px; }
.variant-label { font-size: 13px; color: #555; margin-bottom: 12px; font-weight: 500; text-transform: uppercase; }
.variant-options { display: flex; flex-wrap: wrap; gap: 12px; }
.color-options { gap: 15px; }

.color-swatch-btn { 
  width: 36px; 
  height: 36px; 
  border-radius: 50%; 
  border: 1px solid #dcdcdc; 
  cursor: pointer; 
  position: relative; 
  transition: all 0.2s ease; 
  padding: 0; 
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05); 
}
.color-swatch-btn:hover:not(.disabled) { transform: scale(1.05); border-color: #999; }
.color-swatch-btn.active { border: 2px solid #222; box-shadow: inset 0 0 0 3px #fff; transform: scale(1.1); }
.color-swatch-btn.disabled { box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1), 0 0 0 1px #ccc; }

.variant-btn { 
  background: #f8f9fa; 
  border: 1px solid #e9ecef; 
  color: #6c757d; 
  padding: 10px 18px; 
  cursor: pointer; 
  font-size: 13px; 
  transition: all 0.3s ease; 
  min-width: 60px; 
  text-align: center; 
  border-radius: 6px; 
}
.variant-btn:hover:not(.disabled) { border-color: rgba(159,39,59, 0.5); color: rgb(159,39,59); background-color: #ffffff; }
.variant-btn.active { background: rgb(159,39,59); border-color: rgb(159,39,59); color: #ffffff; box-shadow: 0 4px 10px rgba(159,39,59,0.2); }
.variant-btn.disabled { background: #f0f0f0; border-color: #ddd; color: #999; box-shadow: none; }

.variant-label-wrapper { position: relative; }

.size-guide-btn-compact {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1.5px solid #ddd;
  background: white;
  color: #9f273b;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.size-guide-btn-compact:hover {
  border-color: #9f273b;
  background: #fdf5f6;
  transform: scale(1.08);
  box-shadow: 0 2px 8px rgba(159, 39, 59, 0.15);
}

.size-guide-btn-compact:active {
  transform: scale(0.95);
}
</style>
