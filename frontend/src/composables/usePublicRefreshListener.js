import { onMounted, onBeforeUnmount } from 'vue';

export function usePublicRefreshListener(handlers) {
  let channel = null;

  const onPublicRefresh = (payload) => {
    const module = payload?.module;
    if (!module) {
      return;
    }

    const handler = handlers[module] || handlers.all;
    if (typeof handler === 'function') {
      handler(payload);
    }
  };

  onMounted(() => {
    if (window.Echo && typeof window.Echo.channel === 'function') {
      channel = window.Echo.channel('public-admin');
      channel.listen('.AdminRefresh', onPublicRefresh);
    }
  });

  onBeforeUnmount(() => {
    if (channel && typeof channel.stopListening === 'function') {
      channel.stopListening('.AdminRefresh');
    }
  });
}
