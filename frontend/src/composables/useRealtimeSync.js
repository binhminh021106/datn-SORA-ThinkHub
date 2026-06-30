import { onMounted, onBeforeUnmount } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { refetchCartCount } from '../stores/cartStore';

export function useRealtimeSync() {
  const queryClient = useQueryClient();
  let channel = null;
  let connectionListener = null;

  const handleReconnect = () => {
    console.log('[Client Realtime] Reconnected to WebSocket! Invalidating all active queries...');
    queryClient.invalidateQueries({ type: 'active' });
  };

  const handleSyncEvent = (payload) => {
    // THUNDERING HERD MITIGATION (Chống DDOS ngầm)
    // Nếu có 1000 user online, khi Admin sửa 1 SP, cả 1000 user sẽ gọi API cùng 1 mili-giây.
    // Việc thêm Jitter (độ trễ ngẫu nhiên 0-2500ms) giúp tản lực tải cho Server.
    const jitter = Math.floor(Math.random() * 2500); 
    
    setTimeout(() => {
        // 1. Gạch bỏ (invalidate) các cache liên quan
        queryClient.invalidateQueries({ queryKey: ['shopProducts'] });
        queryClient.invalidateQueries({ queryKey: ['shopCategories'] });
        queryClient.invalidateQueries({ queryKey: ['product-detail'] });
        queryClient.invalidateQueries({ queryKey: ['userProductDetail'] });
        queryClient.invalidateQueries({ queryKey: ['client-combos'] });
        queryClient.invalidateQueries({ queryKey: ['combo-detail'] });
        queryClient.invalidateQueries({ queryKey: ['homeData'] });
        
        // Invalidate cho News
        queryClient.invalidateQueries({ queryKey: ['newsList'] });
        queryClient.invalidateQueries({ queryKey: ['popularNews'] });
        queryClient.invalidateQueries({ queryKey: ['postDetail'] });
        queryClient.invalidateQueries({ queryKey: ['relatedNews'] });

        // Phát custom event
        window.dispatchEvent(new CustomEvent('realtime-refresh-data'));
        
        // Invalidate giỏ hàng
        queryClient.invalidateQueries({ queryKey: ['cart-details'] });

        // 2. Cập nhật lại bong bóng
        refetchCartCount().then(() => {
            window.dispatchEvent(new CustomEvent('update-cart-count', {
                detail: { source: 'realtime-sync' }
            }));
        });
    }, jitter);
  };

  let retryCount = 0;
  let retryTimer = null;

  const initEcho = () => {
    if (window.Echo && typeof window.Echo.channel === 'function') {
      channel = window.Echo.channel('public-admin');
      
      channel.listen('.ProductUpdated', (payload) => {
        handleSyncEvent(payload);
      });
      
      channel.listen('.ComboUpdated', (payload) => {
        handleSyncEvent(payload);
      });

      channel.listen('.NewsUpdated', (payload) => {
        handleSyncEvent(payload);
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
      channel.stopListening('.ProductUpdated');
      channel.stopListening('.ComboUpdated');
      channel.stopListening('.NewsUpdated');
    }
    
    if (window.Echo && window.Echo.connector.pusher && connectionListener) {
      window.Echo.connector.pusher.connection.unbind('connected', connectionListener);
    }
  });
}
