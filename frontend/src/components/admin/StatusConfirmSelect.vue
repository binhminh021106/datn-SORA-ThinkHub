<template>
  <div class="d-flex flex-column align-items-end align-items-md-center w-100" style="max-width: 150px; margin: 0 auto;">
    <select
      class="form-select form-select-sm border shadow-sm fw-bold cursor-pointer w-100"
      style="font-size: 0.75rem;"
      :class="selectClass"
      :value="modelValue"
      @change="handleChange"
      :disabled="disabled || isUpdating">
      <slot></slot>
    </select>

    <div class="d-flex align-items-start justify-content-center w-100" style="min-height: 38px;">
      <div v-if="isUpdating" class="mt-2 text-center w-100">
        <div class="spinner-border text-brand" style="width: 1.1rem; height: 1.1rem; border-width: 0.15em;" role="status"></div>
      </div>

      <div v-else-if="isChanged" class="mt-2 w-100 d-flex gap-1 animate-fade-in">
        <button @click="handleConfirm"
          class="btn btn-sm btn-brand text-white flex-grow-1 shadow-sm d-flex align-items-center justify-content-center action-btn-hover"
          style="padding: 0.35rem; font-size: 0.75rem;" title="Xác nhận">
          <i class="bi bi-send-check-fill me-1"></i> Xác nhận
        </button>
        <button @click="handleCancel"
          class="btn btn-sm btn-light border shadow-sm d-flex align-items-center justify-content-center action-btn-hover"
          style="padding: 0.35rem 0.5rem;" title="Hủy">
          <i class="bi bi-x-lg text-danger" style="font-size: 0.75rem;"></i>
        </button>
      </div>

      <div v-else class="w-100 mt-2 d-flex justify-content-center">
        <slot name="display"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true
  },
  originalValue: {
    type: [String, Number],
    required: true
  },
  selectClass: {
    type: [String, Object, Array],
    default: ''
  },
  isUpdating: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change', 'confirm', 'cancel']);

const isChanged = computed(() => {
  return String(props.modelValue) !== String(props.originalValue);
});

const handleChange = (e) => {
  emit('update:modelValue', e.target.value);
  emit('change', e.target.value);
};

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('update:modelValue', props.originalValue);
  emit('cancel');
};
</script>

<style scoped>
.text-brand {
  color: #009981 !important;
}
.bg-brand {
  background-color: #009981 !important;
}
.border-brand {
  border-color: #009981 !important;
}
.btn-brand {
  background-color: #009981;
  border-color: #009981;
  transition: 0.2s;
  color: white;
}
.btn-brand:hover {
  background-color: #007a67;
  border-color: #007a67;
  color: white;
}
.action-btn-hover {
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.action-btn-hover:hover:not(:disabled) {
  transform: translateY(-3px) !important;
  box-shadow: 0 5px 15px rgba(0, 153, 129, 0.25) !important;
  filter: brightness(1.1) !important;
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
