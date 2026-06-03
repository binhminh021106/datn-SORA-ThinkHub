import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import { showCustomAlert } from '../components/CustomAlert';

const getStorageUrl = (path) => {
  if (!path) return '';
  const origin = API_BASE_URL.replace('/api', '');
  if (path.startsWith('http')) {
    return path
      .replace('http://127.0.0.1:8000', origin)
      .replace('http://localhost:8000', origin)
      .replace('https://127.0.0.1:8000', origin)
      .replace('https://localhost:8000', origin);
  }
  if (path.startsWith('/storage/')) return `${origin}${path}`;
  if (path.startsWith('storage/')) return `${origin}/${path}`;
  return `${origin}/storage/${path.startsWith('/') ? path.slice(1) : path}`;
};

const getAuthToken = async () => AsyncStorage.getItem('auth_token');

const getFavouriteHeaders = (token) => ({
  Accept: 'application/json',
  Authorization: `Bearer ${token}`,
});

const mapProductToWishlistItem = (product) => {
  const firstVariant = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants[0]
    : null;
  const promotionalPrice = product.promotional_price || firstVariant?.promotional_price || 0;
  const basePrice = product.base_price || firstVariant?.price || 0;

  return {
    id: product.id?.toString(),
    slug: product.slug,
    name: product.name,
    category: product.category?.name || product.category || 'Trang sức SORA',
    variant: 'Chọn phiên bản tại trang chi tiết',
    variantId: firstVariant?.id,
    price: promotionalPrice > 0 ? promotionalPrice : basePrice,
    oldPrice: promotionalPrice > 0 ? basePrice : null,
    image: getStorageUrl(product.thumbnail_image || product.image || product.images?.[0]),
  };
};

const saveLocalWishlist = async (items) => {
  const ids = items.map((item) => item.id?.toString()).filter(Boolean);
  await AsyncStorage.setItem('sora_wishlist_ids', JSON.stringify(ids));
  await AsyncStorage.setItem('sora_wishlist_items', JSON.stringify(items));
};

export default function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistLoadingIds, setWishlistLoadingIds] = useState([]);

  const loadWishlist = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        const response = await fetch(`${API_BASE_URL}/client/favourites`, {
          headers: getFavouriteHeaders(token),
        });
        const result = await response.json();

        if (response.ok && (result.success || result.status)) {
          const serverItems = (result.data || [])
            .map((favourite) => favourite.product)
            .filter(Boolean)
            .map(mapProductToWishlistItem);

          setWishlistIds(serverItems.map((item) => item.id));
          await saveLocalWishlist(serverItems);
          return;
        }
      }

      const storedIds = await AsyncStorage.getItem('sora_wishlist_ids');
      setWishlistIds(storedIds ? JSON.parse(storedIds).map((id) => id.toString()) : []);
    } catch (error) {
      console.log('Error loading wishlist:', error);
    }
  }, []);

  const toggleWishlist = useCallback(async (product) => {
    const productId = product.id?.toString();
    if (!productId || wishlistLoadingIds.includes(productId)) return;

    setWishlistLoadingIds((previousIds) => [...previousIds, productId]);
    try {
      const token = await getAuthToken();
      const storedItems = await AsyncStorage.getItem('sora_wishlist_items');
      const currentItems = storedItems ? JSON.parse(storedItems) : [];
      const isFavourite = wishlistIds.includes(productId);
      let nextItems;
      let wasRemoved = isFavourite;

      if (token) {
        const response = await fetch(`${API_BASE_URL}/client/favourites/toggle`, {
          method: 'POST',
          headers: {
            ...getFavouriteHeaders(token),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ product_id: productId }),
        });
        const result = await response.json();

        if (!response.ok || !(result.success || result.status)) {
          showCustomAlert(
            'YÊU THÍCH',
            result.message || 'Không thể cập nhật danh sách yêu thích.',
            [{ text: 'ĐỒNG Ý' }]
          );
          return;
        }

        wasRemoved = result.action === 'removed';
      }

      nextItems = wasRemoved
        ? currentItems.filter((item) => item.id?.toString() !== productId)
        : [
            ...currentItems.filter((item) => item.id?.toString() !== productId),
            mapProductToWishlistItem(product),
          ];

      setWishlistIds((previousIds) => (
        wasRemoved
          ? previousIds.filter((id) => id !== productId)
          : [...previousIds.filter((id) => id !== productId), productId]
      ));
      await saveLocalWishlist(nextItems);
      showCustomAlert(
        'YÊU THÍCH',
        wasRemoved
          ? `Đã xóa "${product.name}" khỏi danh sách yêu thích.`
          : `Đã thêm "${product.name}" vào danh sách yêu thích.`,
        [{ text: 'ĐỒNG Ý' }]
      );
    } catch (error) {
      console.log('Error updating wishlist:', error);
      showCustomAlert(
        'YÊU THÍCH',
        'Không thể cập nhật danh sách yêu thích. Vui lòng thử lại.',
        [{ text: 'ĐỒNG Ý' }]
      );
    } finally {
      setWishlistLoadingIds((previousIds) => previousIds.filter((id) => id !== productId));
    }
  }, [wishlistIds, wishlistLoadingIds]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  return {
    wishlistIds,
    wishlistLoadingIds,
    toggleWishlist,
    loadWishlist,
  };
}
