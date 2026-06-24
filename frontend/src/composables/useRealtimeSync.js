import { onMounted, onBeforeUnmount } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { refetchCartCount } from '../stores/cartStore';

export function useRealtimeSync() {
  const queryClient = useQueryClient();
  let channel = null;

  const handleSyncEvent = (payload) => {
    // 1. Gạch bỏ (invalidate) các cache liên quan đến hiển thị sản phẩm và giỏ hàng
    // Điều này sẽ buộc các component đang hiển thị tự động fetch lại API mới
    queryClient.invalidateQueries({ queryKey: ['shopProducts'] });
    queryClient.invalidateQueries({ queryKey: ['shopCategories'] });
    queryClient.invalidateQueries({ queryKey: ['product-detail'] });
    queryClient.invalidateQueries({ queryKey: ['client-combos'] });
    queryClient.invalidateQueries({ queryKey: ['combo-detail'] });
    queryClient.invalidateQueries({ queryKey: ['homeData'] });
    
    // Invalidate cho News
    queryClient.invalidateQueries({ queryKey: ['newsList'] });
    queryClient.invalidateQueries({ queryKey: ['popularNews'] });
    queryClient.invalidateQueries({ queryKey: ['postDetail'] });
    queryClient.invalidateQueries({ queryKey: ['relatedNews'] });

    // Phát custom event cho các component không dùng TanStack Query (như trang Combo cũ)
    window.dispatchEvent(new CustomEvent('realtime-refresh-data'));
    
    // Đặc biệt quan trọng: Invalidate giỏ hàng để loại bỏ/hiển thị hết hàng
    queryClient.invalidateQueries({ queryKey: ['cart-details'] });

    // 2. Cập nhật lại số lượng bong bóng trên header và kích hoạt trang Giỏ hàng tải lại
    refetchCartCount().then(() => {
        window.dispatchEvent(new CustomEvent('update-cart-count', {
            detail: { source: 'realtime-sync' }
        }));
    });
  };

  onMounted(() => {
    if (window.Echo && typeof window.Echo.channel === 'function') {
      channel = window.Echo.channel('public-admin');
      
      // Lắng nghe các event từ Backend
      channel.listen('.ProductUpdated', (payload) => {
        console.log('[Reverb] Product Updated:', payload);
        handleSyncEvent(payload);
      });
      
      channel.listen('.ComboUpdated', (payload) => {
        console.log('[Reverb] Combo Updated:', payload);
        handleSyncEvent(payload);
      });

      channel.listen('.NewsUpdated', (payload) => {
        console.log('[Reverb] News Updated:', payload);
        handleSyncEvent(payload);
      });
    }
  });

  onBeforeUnmount(() => {
    if (channel && typeof channel.stopListening === 'function') {
      channel.stopListening('.ProductUpdated');
      channel.stopListening('.ComboUpdated');
      channel.stopListening('.NewsUpdated');
    }
  });
}
