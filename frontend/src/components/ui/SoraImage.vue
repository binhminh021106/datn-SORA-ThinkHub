<template>
  <img
    :src="computedSrc"
    :alt="alt || ''"
    :class="imgClass"
    :width="width"
    :height="height"
    loading="lazy"
    @error="onError"
    @load="$emit('load', $event)"
    :style="imgStyle"
  />
</template>

<script setup>
import { computed } from 'vue';
import { getStorageUrl } from '@/utils/env';

const props = defineProps({
  src: { type: [String, Number], default: '' },
  alt: { type: String, default: '' },
  imgClass: { type: [String, Object, Array], default: '' },
  width: { type: [String, Number], default: null },
  height: { type: [String, Number], default: null },
  fit: { type: String, default: 'cover' },
  placeholder: { type: String, default: '/Sora-placeholder.png' }
});

const emit = defineEmits(['load', 'error']);

const computedSrc = computed(() => {
  return getStorageUrl(String(props.src || ''), props.placeholder);
});

const imgStyle = computed(() => ({
  objectFit: props.fit,
  width: props.width != null ? (typeof props.width === 'number' ? `${props.width}px` : props.width) : '100%',
  height: props.height != null ? (typeof props.height === 'number' ? `${props.height}px` : props.height) : '100%'
}));

function onError(e) {
  const el = e?.target;
  if (!el) return;
  el.onerror = null;
  el.src = props.placeholder;
  emit('error', e);
}
</script>

<style scoped>
img { display: block; }
</style>
