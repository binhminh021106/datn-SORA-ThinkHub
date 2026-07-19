import { ref } from 'vue';
import { getToken } from './useUtilities';
import clientApiClient from '@/utils/clientApiClient';

export const useWishlist = () => {
  const favourites = ref([]);
  const isTogglingFav = ref(null);

  const fetchFavorites = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const data = await clientApiClient.get('/client/favourites', { ignoreAuthRedirect: true });
      if (data.data?.status) {
        favourites.value = data.data.data.map(fav => fav.product_id);
      } else if (data.data?.require_login) {
        import('@/composables/useUtilities').then(({ clearUserAuthStorage }) => {
          clearUserAuthStorage();
        });
      }
    } catch (e) {
      if (e?.response?.status !== 401) {
        console.error('Không thể tải danh sách yêu thích', e);
      }
    }
  };

  const isFavourited = (productId) => {
    if (!productId) return false;
    return favourites.value.includes(productId);
  };

  const toggleFavourite = async (prod, Toast, soraAlert, router) => {
    if (!prod || !prod.id) return;
    const token = getToken();

    if (!token) {
      soraAlert.fire({
        icon: 'warning',
        title: 'Bạn chưa đăng nhập!',
        text: 'Vui lòng đăng nhập để lưu trữ bộ sưu tập yêu thích của mình.',
        confirmButtonText: 'Đăng Nhập Ngay',
        showCancelButton: true,
        cancelButtonText: 'Đóng'
      }).then((result) => {
        if (result.isConfirmed) {
          router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } });
        }
      });
      return;
    }

    isTogglingFav.value = prod.id;

    try {
      const response = await clientApiClient.post('/client/favourites/toggle', { product_id: prod.id });

      if (response.data?.status) {
        if (response.data?.action === 'added') {
          favourites.value.push(prod.id);
          Toast.fire({ icon: 'success', title: 'Đã thêm vào yêu thích' });
        } else if (response.data?.action === 'removed') {
          favourites.value = favourites.value.filter(id => id !== prod.id);
          Toast.fire({ icon: 'info', title: 'Đã bỏ yêu thích' });
        }
      }
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Có lỗi xảy ra, thử lại sau' });
    } finally {
      isTogglingFav.value = null;
    }
  };

  return {
    favourites,
    isTogglingFav,
    fetchFavorites,
    isFavourited,
    toggleFavourite
  };
};