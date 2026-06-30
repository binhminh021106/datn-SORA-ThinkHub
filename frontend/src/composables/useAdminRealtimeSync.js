import { onMounted, onBeforeUnmount } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';

export function useAdminRealtimeSync() {
  const queryClient = useQueryClient();
  let channel = null;
  let connectionListener = null;

  const handleAdminSyncEvent = (payload) => {
    console.log('[Admin Realtime] Received Event:', payload);
    
    // Invalidate chung cho các danh sách
    queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
    queryClient.invalidateQueries({ queryKey: ['adminBrands'] });
    queryClient.invalidateQueries({ queryKey: ['adminCombos'] });
    queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard-main'] });
    
    // Phát event truyền thống nếu có component nào vẫn dùng CustomEvent
    window.dispatchEvent(new CustomEvent('admin-refresh', { detail: payload }));
  };

  const handleReconnect = () => {
    console.log('[Admin Realtime] Reconnected to WebSocket! Invalidating all active queries...');
    // Khi mạng có lại, invalidate toàn bộ active queries để đảm bảo dữ liệu không bị hụt
    queryClient.invalidateQueries({ type: 'active' });
    // Phát event cho các component không dùng Vue Query
    window.dispatchEvent(new CustomEvent('admin-reconnected'));
  };

  let retryCount = 0;
  let retryTimer = null;

  const initEcho = () => {
    if (window.Echo && typeof window.Echo.private === 'function') {
      channel = window.Echo.private('admin');
      
      channel.listen('.AdminRefresh', (payload) => {
        handleAdminSyncEvent(payload);
      });
      
      channel.listen('.ProductUpdated', (payload) => {
        handleAdminSyncEvent(payload);
        window.dispatchEvent(new CustomEvent('admin-product-updated', { detail: payload }));
      });
      
      channel.listen('.ProductDeleted', (payload) => {
        handleAdminSyncEvent(payload);
        window.dispatchEvent(new CustomEvent('admin-product-deleted', { detail: payload }));
      });
      
      channel.listen('.OrderUpdated', (payload) => {
        handleAdminSyncEvent(payload);
        window.dispatchEvent(new CustomEvent('admin-order-updated', { detail: payload }));
      });
      
      channel.listen('.NewOrderReceived', (payload) => {
        handleAdminSyncEvent(payload);
        // Có thể gọi thông báo Toast ở đây nếu cần, hoặc để AdminHeader lo
        window.dispatchEvent(new CustomEvent('admin-new-order', { detail: payload }));
      });

      // Lắng nghe sự kiện kết nối lại (khi bị đứt mạng ngầm)
      if (window.Echo.connector.pusher) {
        connectionListener = () => handleReconnect();
        window.Echo.connector.pusher.connection.bind('connected', connectionListener);
      }

    } else if (retryCount < 20) {
      retryCount++;
      retryTimer = setTimeout(initEcho, 500);
    }
  };

  onMounted(() => {
    initEcho();
  });

  onBeforeUnmount(() => {
    if (retryTimer) clearTimeout(retryTimer);
    if (channel && typeof channel.stopListening === 'function') {
      channel.stopListening('.AdminRefresh');
      channel.stopListening('.ProductUpdated');
      channel.stopListening('.ProductDeleted');
      channel.stopListening('.OrderUpdated');
      channel.stopListening('.NewOrderReceived');
      window.Echo.leave('admin');
    }
    
    if (window.Echo && window.Echo.connector.pusher && connectionListener) {
      window.Echo.connector.pusher.connection.unbind('connected', connectionListener);
    }
  });
}
