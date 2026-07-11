import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config/api';
import SmartImage from './SmartImage';
import { PRICE_FONT_FAMILY, PRICE_FONT_WEIGHT } from '../styles/typography';
import { getProductReviewStats } from '../utils/reviewStats';

const getStorageUrl = (path) => {
  if (!path) return '';
  const origin = API_BASE_URL.replace(/\/api$/, '');
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

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0);

const getProductDisplayData = (product) => {
  const hasDatabasePrice = product.base_price !== undefined;
  const promotionalPrice = Number(product.promotional_price || 0);
  const basePrice = Number(product.base_price || 0);
  const discount = product.discount || (
    promotionalPrice > 0 && basePrice > 0
      ? `-${Math.round(((basePrice - promotionalPrice) / basePrice) * 100)}%`
      : null
  );

  return {
    category: product.category?.name || product.category || 'Trang sức SORA',
    discount,
    imageUrl: product.thumbnail_image ? getStorageUrl(product.thumbnail_image) : product.image,
    oldPrice: hasDatabasePrice && promotionalPrice > 0
      ? formatCurrency(basePrice)
      : product.oldPrice,
    price: hasDatabasePrice
      ? formatCurrency(promotionalPrice > 0 ? promotionalPrice : basePrice)
      : product.price,
  };
};

export default function ProductCard({
  product,
  width = 165,
  style,
  onPress,
  onToggleWishlist,
  isFavorite = false,
  isWishlistLoading = false,
  showWishlist = true,
}) {
  const { category, discount, imageUrl, oldPrice, price } = getProductDisplayData(product);
  const reviewStats = getProductReviewStats(product);
  const previewPrice = Number(
    product.promotional_price
    || product.base_price
    || String(product.price || '').replace(/[^\d]/g, '')
    || 0
  );
  const previewProduct = {
    ...product,
    category: typeof product.category === 'object' ? product.category : { name: category },
    images: [imageUrl],
    variants: previewPrice > 0
      ? [{
          id: null,
          price: Number(product.base_price || previewPrice),
          promotional_price: Number(product.promotional_price || 0),
          stock: 0,
          attributes: {},
        }]
      : [],
    attributes: {},
    reviews: [],
    reviews_count: reviewStats.count,
    rating_avg: reviewStats.average,
  };

  return (
    <TouchableOpacity
      style={[styles.card, { width }, style]}
      onPress={() => onPress?.({ ...product, previewImage: imageUrl, previewProduct })}
      activeOpacity={0.9}
    >
      {discount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discount}</Text>
        </View>
      )}

      <SmartImage source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

      <View style={styles.info}>
        <View style={styles.topDetails}>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.category} numberOfLines={1}>{category}</Text>
        </View>

        <View style={styles.bottomDetails}>
          {oldPrice ? (
            <Text style={styles.oldPrice} numberOfLines={1}>{oldPrice}</Text>
          ) : (
            <View style={styles.oldPricePlaceholder} />
          )}

          <Text
            style={styles.newPrice}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {price}
          </Text>

          <View style={styles.footer}>
            <View style={styles.rating}>
              {[1, 2, 3, 4, 5].map((star, index) => (
                <Ionicons
                  key={star}
                  name={index < Math.round(reviewStats.average) ? 'star' : 'star-outline'}
                  size={11}
                  color="#f1c40f"
                />
              ))}
              {reviewStats.count > 0 && (
                <Text style={styles.ratingCount}>({reviewStats.count})</Text>
              )}
            </View>
            {showWishlist && (
              <TouchableOpacity
                style={[styles.wishlistButton, isFavorite && styles.wishlistButtonActive]}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                activeOpacity={0.75}
                disabled={!onToggleWishlist || isWishlistLoading}
                onPress={(event) => {
                  event.stopPropagation?.();
                  onToggleWishlist?.(product);
                }}
              >
                {isWishlistLoading ? (
                  <ActivityIndicator size={16} color="#9f273b" />
                ) : (
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={21}
                    color={isFavorite ? '#9f273b' : '#999'}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  discountBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#cc1e2e',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    zIndex: 1,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 155,
  },
  info: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 140,
  },
  topDetails: {
    marginBottom: 4,
  },
  bottomDetails: {
    marginTop: 'auto',
  },
  name: {
    fontSize: 12,
    fontFamily: 'Oswald_500Medium',
    textTransform: 'uppercase',
    color: '#333',
    lineHeight: 16,
    marginBottom: 2,
  },
  category: {
    fontSize: 10.5,
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    color: '#888',
    marginBottom: 2,
  },
  oldPrice: {
    fontSize: 10.5,
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 1,
  },
  oldPricePlaceholder: {
    height: 16,
  },
  newPrice: {
    fontSize: 14.5,
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
    color: '#9f273b',
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  wishlistButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -3,
    backgroundColor: '#fff',
  },
  wishlistButtonActive: {
    backgroundColor: '#fff5f6',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  ratingCount: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 10,
    color: '#999',
    marginLeft: 3,
  },
});
