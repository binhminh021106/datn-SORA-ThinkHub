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
  placeholder: { type: String, default: null }
});

const emit = defineEmits(['load', 'error']);

import { useSettingsStore } from '@/stores/settingsStore';
import { useRoute } from 'vue-router';
const settingsStore = useSettingsStore();
const route = useRoute();

const activePlaceholder = computed(() => {
  if (props.placeholder && props.placeholder !== '/Sora-placeholder.png') {
    return props.placeholder;
  }
  
  if (settingsStore && settingsStore.settings) {
      const isAdmin = route?.path?.startsWith('/admin');
      
      if (isAdmin && settingsStore.settings.placeholder_admin_active) {
          return getStorageUrl(settingsStore.settings.placeholder_admin_active);
      }
      
      if (!isAdmin && settingsStore.settings.placeholder_client_active) {
          return getStorageUrl(settingsStore.settings.placeholder_client_active);
      }
  }
  
  return '/Sora-placeholder.png';
});

const computedSrc = computed(() => {
  return getStorageUrl(String(props.src || ''), activePlaceholder.value);
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
  el.src = activePlaceholder.value;
  emit('error', e);
}
</script>

<style scoped>
img { display: block; }
</style>
