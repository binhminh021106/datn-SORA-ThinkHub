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

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';

const computedSrc = computed(() => {
  const s = props.src;
  if (!s) return props.placeholder;
  const str = String(s);
  if (str.startsWith('http') || str.startsWith('data:image')) return str;
  let clean = str.startsWith('/') ? str.substring(1) : str;
  if (clean.startsWith('storage/')) {
    clean = clean.substring(8);
  }
  return `${STORAGE_URL}/${clean}`;
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
