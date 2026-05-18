import { onMounted, onBeforeUnmount } from 'vue';

export function useAdminRefreshListener(handlers) {
  const onAdminRefresh = (event) => {
    const payload = event?.detail;
    if (!payload || !payload.module) {
      return;
    }

    const handler = handlers[payload.module] || handlers.all;
    if (typeof handler === 'function') {
      handler(payload);
    }
  };

  onMounted(() => {
    window.addEventListener('admin-refresh', onAdminRefresh);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('admin-refresh', onAdminRefresh);
  });
}

