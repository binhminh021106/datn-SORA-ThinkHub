import clientApiClient from '@/utils/clientApiClient';

export function useAuthSync() {
  const syncAfterLogin = async (queryClient) => {
    // Merge cart
    const sessionId = localStorage.getItem('cart_session_id');
    if (sessionId) {
      try {
        await clientApiClient.post('/client/cart/merge', {}, {
          ensureCartSession: true,
          ignoreAuthRedirect: true
        });
        localStorage.removeItem('cart_session_id');
        window.dispatchEvent(new CustomEvent('update-cart-count'));
      } catch (e) {
        console.error('Merge cart error:', e);
      }
    }

    if (queryClient) {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['user_profile'] });
    }

    window.dispatchEvent(new CustomEvent('auth-status-changed'));
  };

  const clearAuthSession = (queryClient) => {
    localStorage.removeItem('userData');
    localStorage.removeItem('auth_token');
    
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('auth_token');

    if (queryClient) {
      queryClient.clear();
    }
    
    window.dispatchEvent(new CustomEvent('auth-status-changed'));
  };

  return {
    syncAfterLogin,
    clearAuthSession
  };
}
