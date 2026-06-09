import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import SmartImage from '../components/SmartImage';
import ProductCard from '../components/ProductCard';
import { showCustomAlert } from '../components/CustomAlert';
import { PRICE_FONT_FAMILY, PRICE_FONT_WEIGHT } from '../styles/typography';
import useWishlist from '../hooks/useWishlist';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = Math.min(width * 1.12, 470);
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=900&auto=format&fit=crop';

const MOCK_COLLECTION = {
  id: 'sora-signature-set',
  slug: 'sora-signature-set',
  name: 'SORA Signature Set',
  theme: 'Dấu ấn đỏ SORA',
  description: 'Một tổ hợp trang sức được tuyển chọn cho những khoảnh khắc trang trọng, cân bằng giữa sắc đỏ thương hiệu, ánh vàng 18K và độ lấp lánh tinh tế.',
  thumbnail_image: FALLBACK_IMAGE,
  discount_type: 'percentage',
  discount_value: 12,
  usage_limit: 24,
  items: [
    {
      id: 'm1',
      quantity: 1,
      product: {
        id: 'p1',
        name: 'Nhẫn Eternal Trắng 18K',
        slug: 'nhan-eternal-trang-18k',
        base_price: 25000000,
        promotional_price: 0,
        thumbnail_image: 'https://images.unsplash.com/photo-1605100804763-247f67b854d4?q=80&w=700&auto=format&fit=crop',
        category: { name: 'Nhẫn cao cấp' },
      },
      variant: { sku: 'WHITE-18K', price: 25000000, promotional_price: 0, formatted_attributes: { 'Chất liệu': 'Vàng trắng 18K', Size: '12' } },
    },
    {
      id: 'm2',
      quantity: 1,
      product: {
        id: 'p2',
        name: 'Dây Chuyền Pearl Sonata',
        slug: 'day-chuyen-pearl-sonata',
        base_price: 12500000,
        promotional_price: 10900000,
        thumbnail_image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=700&auto=format&fit=crop',
        category: { name: 'Dây chuyền' },
      },
      variant: { sku: 'PEARL-SOUTH', price: 12500000, promotional_price: 10900000, formatted_attributes: { Ngọc: 'South Sea', Dài: '45cm' } },
    },
    {
      id: 'm3',
      quantity: 1,
      product: {
        id: 'p3',
        name: 'Bông Tai Ruby Signature',
        slug: 'bong-tai-ruby-signature',
        base_price: 15600000,
        promotional_price: 0,
        thumbnail_image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=700&auto=format&fit=crop',
        category: { name: 'Bông tai' },
      },
      variant: { sku: 'RUBY-ROSE', price: 15600000, promotional_price: 0, formatted_attributes: { Đá: 'Ruby', Nền: 'Vàng hồng' } },
    },
  ],
};

const FEATURES = [
  { icon: 'car-outline', title: 'Miễn phí giao', text: 'Áp dụng toàn quốc' },
  { icon: 'shield-checkmark-outline', title: 'Bảo hành SORA', text: 'Theo tiêu chuẩn hãng' },
  { icon: 'ribbon-outline', title: 'Đóng gói quà', text: 'Hộp cao cấp' },
  { icon: 'diamond-stone', title: 'Tuyển chọn', text: 'Đồng bộ phong cách' },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value) || 0);

const getStorageUrl = (path) => {
  if (!path) return FALLBACK_IMAGE;
  if (path.startsWith('http')) {
    const origin = API_BASE_URL.replace('/api', '');
    return path
      .replace('http://127.0.0.1:8000', origin)
      .replace('http://localhost:8000', origin)
      .replace('https://127.0.0.1:8000', origin)
      .replace('https://localhost:8000', origin);
  }

  const origin = API_BASE_URL.replace('/api', '');
  if (path.startsWith('/storage/')) return `${origin}${path}`;
  if (path.startsWith('storage/')) return `${origin}/${path}`;
  return `${origin}/storage/${path.startsWith('/') ? path.slice(1) : path}`;
};

const getItemPrice = (item) => {
  const variantPromo = Number(item?.variant?.promotional_price || 0);
  const variantPrice = Number(item?.variant?.price || 0);
  const productPromo = Number(item?.product?.promotional_price || 0);
  const productPrice = Number(item?.product?.base_price || 0);

  if (variantPromo > 0) return variantPromo;
  if (variantPrice > 0) return variantPrice;
  if (productPromo > 0) return productPromo;
  return productPrice;
};

const calculateOriginalTotal = (combo) =>
  (combo?.items || []).reduce((total, item) => total + getItemPrice(item) * Number(item.quantity || 1), 0);

const calculateFinalTotal = (combo, originalTotal) => {
  const discountValue = Number(combo?.discount_value || 0);
  if (!discountValue) return originalTotal;

  if (combo?.discount_type === 'percentage' || combo?.discount_type === 'percent') {
    return Math.max(originalTotal - (originalTotal * Math.min(discountValue, 100) / 100), 0);
  }

  return Math.max(originalTotal - discountValue, 0);
};

const getDiscountText = (combo) => {
  const value = Number(combo?.discount_value || 0);
  if (!value) return 'SORA SET';
  if (combo?.discount_type === 'percentage' || combo?.discount_type === 'percent') return `GIẢM ${value}%`;
  return `GIẢM ${formatCurrency(value)}`;
};

const getVariantText = (item) => {
  const attrs = item?.variant?.formatted_attributes;
  if (attrs && typeof attrs === 'object') return Object.values(attrs).filter(Boolean).join(' - ');
  return item?.variant?.sku || 'Phiên bản tuyển chọn';
};

const parseJsonSafely = async (response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch (_) {
    return { message: text };
  }
};

const getFirstValidationError = (result) => {
  if (result?.errors && typeof result.errors === 'object') {
    const firstError = Object.values(result.errors)[0];
    if (Array.isArray(firstError)) return firstError[0];
    if (typeof firstError === 'string') return firstError;
  }

  return result?.message;
};

const fetchComboDetailQuery = async (slug) => {
  const response = await fetch(`${API_BASE_URL}/client/combos/${slug}`, {
    headers: { Accept: 'application/json' },
  });
  const result = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result?.message || 'Không thể tải bộ sưu tập từ máy chủ.');
  }

  return {
    combo: result.data,
    relatedProducts: result.related_products || [],
  };
};

export default function CollectionDetailScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const route = useRoute();
  const { slug, initialCollection } = route.params || {};

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const {
    wishlistIds,
    wishlistLoadingIds,
    toggleWishlist,
  } = useWishlist();

  const comboDetailQuery = useQuery({
    queryKey: ['collection-detail', slug],
    queryFn: () => fetchComboDetailQuery(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 15,
  });

  const combo = comboDetailQuery.data?.combo || initialCollection || MOCK_COLLECTION;
  const relatedProducts = comboDetailQuery.data?.relatedProducts || [];
  const isLoading = comboDetailQuery.isLoading && !!slug && !comboDetailQuery.data && !initialCollection;
  const refreshing = comboDetailQuery.isRefetching && !!comboDetailQuery.data;

  useEffect(() => {
    setActiveImageIndex(0);
  }, [combo?.id, combo?.slug]);

  const onRefresh = useCallback(async () => {
    if (slug) {
      await comboDetailQuery.refetch();
    }
  }, [comboDetailQuery.refetch, slug]);

  const items = combo?.items || [];
  const galleryImages = useMemo(() => {
    const images = [
      getStorageUrl(combo?.thumbnail_image),
      ...items.map((item) => getStorageUrl(item.product?.thumbnail_image || item.variant?.image_url)).filter(Boolean),
    ];
    return [...new Set(images)].filter(Boolean);
  }, [combo, items]);

  const originalTotal = calculateOriginalTotal(combo);
  const finalTotal = calculateFinalTotal(combo, originalTotal);
  const saving = Math.max(originalTotal - finalTotal, 0);
  const savingPercent = originalTotal > 0 ? Math.round((saving / originalTotal) * 100) : 0;

  const getCartHeaders = async () => {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const token = await AsyncStorage.getItem('auth_token');
    if (token) headers.Authorization = `Bearer ${token}`;

    let sessionId = await AsyncStorage.getItem('cart_session_id');
    if (!sessionId && !token) {
      sessionId = `session_${Math.random().toString(36).slice(2, 11)}`;
      await AsyncStorage.setItem('cart_session_id', sessionId);
    }
    if (sessionId) headers['X-Cart-Session-Id'] = sessionId;

    return headers;
  };

  const getSelectedVariantForItem = (item) => {
    if (item.product_variant_id) return item.variant?.id || item.product_variant_id;

    const variants = item.product?.variants || [];
    const inStockVariant = variants.find((variant) => Number(variant.stock_quantity ?? variant.stock ?? 0) > 0);
    return (inStockVariant || variants[0])?.id || null;
  };

  const prepareComboPayload = () => {
    const comboId = Number(combo?.id);
    if (!comboId) {
      return { error: 'Bộ sưu tập mẫu chưa có mã combo thật từ backend nên chưa thể thêm vào giỏ.' };
    }

    const customSelections = items
      .filter((item) => !item.product_variant_id)
      .map((item) => ({
        combo_item_id: Number(item.id),
        selected_variant_id: getSelectedVariantForItem(item),
      }));

    const missingSelection = customSelections.find((selection) => !selection.selected_variant_id);
    if (missingSelection) {
      return { error: 'Một số món trong bộ sưu tập chưa có phiên bản còn hàng để thêm vào giỏ.' };
    }

    return {
      payload: {
        combo_id: comboId,
        quantity: 1,
        combo_selections: customSelections,
      },
    };
  };

  const handleAddComboToCart = async ({ checkout = false } = {}) => {
    if (isAddingToCart) return;

    const prepared = prepareComboPayload();
    if (prepared.error) {
      showCustomAlert('SORA COLLECTION', prepared.error, [{ text: 'ĐÃ HIỂU' }]);
      return;
    }

    setIsAddingToCart(true);
    try {
      const response = await fetch(`${API_BASE_URL}/client/cart/add-combo`, {
        method: 'POST',
        headers: await getCartHeaders(),
        body: JSON.stringify(prepared.payload),
      });
      const result = await parseJsonSafely(response);

      if (response.ok && result.success) {
        if (result.session_id) {
          await AsyncStorage.setItem('cart_session_id', result.session_id);
        }
        queryClient.invalidateQueries({ queryKey: ['cart'] });

        showCustomAlert(
          'GIỎ HÀNG SORA',
          result.message || 'Đã thêm bộ sưu tập vào giỏ hàng.',
          [
            { text: 'MUA TIẾP', style: 'cancel' },
            {
              text: checkout ? 'THANH TOÁN' : 'XEM GIỎ',
              onPress: () => navigation.navigate(checkout ? 'Checkout' : 'MainTabs', checkout ? undefined : { screen: 'Cart' }),
            },
          ]
        );
      } else {
        showCustomAlert('LỖI GIỎ HÀNG', getFirstValidationError(result) || 'Không thể thêm bộ sưu tập vào giỏ hàng.', [{ text: 'ĐÓNG' }]);
      }
    } catch (error) {
      showCustomAlert('LỖI KẾT NỐI', 'Không thể kết nối đến máy chủ.', [{ text: 'ĐÓNG' }]);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9f273b" />
        <Text style={styles.loadingText}>Đang tải bộ sưu tập SORA...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{combo?.name || 'Bộ sưu tập SORA'}</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })} activeOpacity={0.8}>
          <Ionicons name="cart-outline" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#9f273b']} tintColor="#9f273b" />}
      >
        <View style={styles.gallery}>
          <FlatList
            data={galleryImages.length ? galleryImages : [FALLBACK_IMAGE]}
            keyExtractor={(item, index) => `${item}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(index);
            }}
            renderItem={({ item }) => (
              <View style={styles.gallerySlide}>
                <SmartImage source={{ uri: item }} style={styles.galleryImage} resizeMode="cover" />
              </View>
            )}
          />

          <View style={styles.heroBadge}>
            <MaterialCommunityIcons name="diamond-stone" size={13} color="#111" />
            <Text style={styles.heroBadgeText}>{getDiscountText(combo)}</Text>
          </View>

          {galleryImages.length > 1 && (
            <View style={styles.dots}>
              {galleryImages.map((item, index) => (
                <View key={`${item}-dot-${index}`} style={[styles.dot, index === activeImageIndex && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.mainInfo}>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>SORA EXCLUSIVE</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>{items.length} MÓN TUYỂN CHỌN</Text>
          </View>

          <Text style={styles.title}>{combo?.name}</Text>
          {!!combo?.theme && <Text style={styles.theme}>{combo.theme}</Text>}
          <Text style={styles.description}>
            {combo?.description || 'Bộ sưu tập được tuyển chọn theo tinh thần thanh lịch, cân bằng và dễ phối trong nhiều dịp.'}
          </Text>

          <View style={styles.priceBox}>
            <View>
              <Text style={styles.priceLabel}>MỨC GIÁ ƯU ĐÃI</Text>
              <Text style={styles.finalPrice}>{formatCurrency(finalTotal)}</Text>
            </View>
            {saving > 0 && (
              <View style={styles.savingPill}>
                <Text style={styles.savingText}>TIẾT KIỆM {savingPercent}%</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ĐỊNH HÌNH PHONG CÁCH</Text>
          <View style={styles.goldLine} />

          {items.map((item, index) => (
            <TouchableOpacity
              key={(item.id || `${item.product?.id}-${index}`).toString()}
              style={styles.itemCard}
              activeOpacity={0.9}
              onPress={() => item.product?.slug && navigation.navigate('ProductDetail', { slug: item.product.slug })}
            >
              <View style={styles.itemImageWrap}>
                <SmartImage source={{ uri: getStorageUrl(item.product?.thumbnail_image || item.variant?.image_url) }} style={styles.itemImage} resizeMode="cover" />
                <View style={styles.itemIndexBadge}>
                  <Text style={styles.itemIndexText}>MÓN {index + 1}</Text>
                </View>
              </View>

              <View style={styles.itemBody}>
                <Text style={styles.itemCategory} numberOfLines={1}>{item.product?.category?.name || 'Trang sức cao cấp'}</Text>
                <Text style={styles.itemName} numberOfLines={2}>{item.product?.name || 'Tác phẩm SORA'}</Text>
                <Text style={styles.itemVariant} numberOfLines={2}>{getVariantText(item)}</Text>
                <View style={styles.itemFooter}>
                  <Text style={styles.itemPrice} numberOfLines={1}>{formatCurrency(getItemPrice(item))}</Text>
                  <View style={styles.qtyBadge}>
                    <Text style={styles.qtyText}>x{item.quantity || 1}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TỔNG KẾT GIÁ TRỊ</Text>
          <View style={styles.goldLine} />

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Giá trị gốc</Text>
              <Text style={styles.originalPrice}>{formatCurrency(originalTotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ưu đãi bộ sưu tập</Text>
              <Text style={styles.discountText}>-{formatCurrency(saving)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Tổng ưu đãi</Text>
              <Text style={styles.summaryTotal}>{formatCurrency(finalTotal)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.featuresGrid}>
          {FEATURES.map((feature) => (
            <View key={feature.title} style={styles.featureItem}>
              {feature.icon === 'diamond-stone' ? (
                <MaterialCommunityIcons name="diamond-stone" size={20} color="#9f273b" />
              ) : (
                <Ionicons name={feature.icon} size={20} color="#9f273b" />
              )}
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        {relatedProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CÓ THỂ BẠN SẼ THÍCH</Text>
            <View style={styles.goldLine} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedList}>
              {relatedProducts.map((product) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  width={165}
                  onPress={(selectedProduct) => navigation.navigate('ProductDetail', {
                    slug: selectedProduct.slug,
                    previewImage: selectedProduct.previewImage || selectedProduct.image || null,
                    previewProduct: selectedProduct.previewProduct || null,
                  })}
                  onToggleWishlist={toggleWishlist}
                  isFavorite={wishlistIds.includes(product.id?.toString())}
                  isWishlistLoading={wishlistLoadingIds.includes(product.id?.toString())}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceWrap}>
          <Text style={styles.bottomLabel}>TỔNG CỘNG</Text>
          <Text style={styles.bottomPrice}>{formatCurrency(finalTotal)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.outlineBtn, isAddingToCart && styles.actionBtnDisabled]}
          onPress={() => handleAddComboToCart()}
          disabled={isAddingToCart}
          activeOpacity={0.9}
        >
          {isAddingToCart ? (
            <ActivityIndicator size="small" color="#9f273b" />
          ) : (
            <Ionicons name="bag-add-outline" size={17} color="#9f273b" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buyBtn, isAddingToCart && styles.actionBtnDisabled]}
          onPress={() => handleAddComboToCart({ checkout: true })}
          disabled={isAddingToCart}
          activeOpacity={0.9}
        >
          {isAddingToCart ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buyBtnText}>SỞ HỮU NGAY</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f2ed' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 12, fontFamily: 'Oswald_500Medium', fontSize: 13, color: '#9f273b', letterSpacing: 1 },
  header: {
    height: Platform.OS === 'ios' ? 95 : 75,
    paddingTop: Platform.OS === 'ios' ? 45 : 25,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
  },
  headerBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f7f7f7', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, marginHorizontal: 12, fontFamily: 'Oswald_500Medium', fontSize: 14, color: '#111', textAlign: 'center', textTransform: 'uppercase' },
  scrollContent: { paddingBottom: 118 },
  gallery: { height: HERO_HEIGHT, backgroundColor: '#111' },
  gallerySlide: { width, height: HERO_HEIGHT },
  galleryImage: { width: '100%', height: '100%' },
  heroBadge: { position: 'absolute', top: 18, left: 18, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#e7ce7d', paddingHorizontal: 11, paddingVertical: 7 },
  heroBadgeText: { fontFamily: 'Oswald_600SemiBold', fontSize: 11, color: '#111', letterSpacing: 1.2 },
  dots: { position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 7 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { width: 22, backgroundColor: '#e7ce7d' },
  mainInfo: { backgroundColor: '#fff', paddingHorizontal: 18, paddingTop: 20, paddingBottom: 22, borderBottomWidth: 1, borderBottomColor: '#eee' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  metaText: { fontFamily: 'Oswald_500Medium', fontSize: 11, color: '#9f273b', letterSpacing: 1.4 },
  metaDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#d6bb78', marginHorizontal: 9 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 30, lineHeight: 36, color: '#111' },
  theme: { marginTop: 5, fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 14, color: '#9f273b' },
  description: { marginTop: 12, fontFamily: 'PlayfairDisplay_400Regular', fontSize: 13, lineHeight: 21, color: '#666' },
  priceBox: { marginTop: 18, padding: 15, borderWidth: 1, borderColor: '#eadfbe', backgroundColor: '#fffdf8', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceLabel: { fontFamily: 'Oswald_500Medium', fontSize: 10, color: '#8c826e', letterSpacing: 1.4 },
  finalPrice: { marginTop: 3, fontFamily: PRICE_FONT_FAMILY, fontWeight: PRICE_FONT_WEIGHT, fontSize: 25, color: '#9f273b' },
  savingPill: { backgroundColor: '#9f273b', paddingHorizontal: 10, paddingVertical: 7 },
  savingText: { fontFamily: 'Oswald_600SemiBold', fontSize: 10, color: '#fff', letterSpacing: 1 },
  section: { backgroundColor: '#fff', marginTop: 12, paddingHorizontal: 18, paddingVertical: 20 },
  sectionTitle: { fontFamily: 'Oswald_600SemiBold', fontSize: 14, color: '#111', letterSpacing: 1.4 },
  goldLine: { width: 42, height: 2, backgroundColor: '#d6bb78', marginTop: 8, marginBottom: 16 },
  itemCard: { flexDirection: 'row', alignItems: 'stretch', borderWidth: 1, borderColor: '#eee', backgroundColor: '#fff', marginBottom: 12, height: 148, overflow: 'hidden' },
  itemImageWrap: { width: 118, height: 148, backgroundColor: '#f8f6f2', position: 'relative', flexShrink: 0 },
  itemImage: { width: 118, height: 148 },
  itemIndexBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#111', paddingHorizontal: 8, paddingVertical: 4 },
  itemIndexText: { fontFamily: 'Oswald_600SemiBold', fontSize: 9, color: '#e7ce7d', letterSpacing: 0.8 },
  itemBody: { flex: 1, padding: 12, minWidth: 0 },
  itemCategory: { fontFamily: 'Oswald_500Medium', fontSize: 10, color: '#9f273b', letterSpacing: 1, textTransform: 'uppercase' },
  itemName: { marginTop: 4, fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, lineHeight: 20, color: '#111' },
  itemVariant: { marginTop: 7, fontFamily: 'Oswald_400Regular', fontSize: 11.5, lineHeight: 16, color: '#777' },
  itemFooter: { marginTop: 'auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  itemPrice: { flex: 1, fontFamily: PRICE_FONT_FAMILY, fontWeight: PRICE_FONT_WEIGHT, fontSize: 14, color: '#9f273b' },
  qtyBadge: { backgroundColor: '#f5e8ec', paddingHorizontal: 9, paddingVertical: 4 },
  qtyText: { fontFamily: 'Oswald_600SemiBold', fontSize: 11, color: '#9f273b' },
  summaryCard: { borderWidth: 1, borderColor: '#eadfbe', backgroundColor: '#fffdf8', padding: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  summaryLabel: { fontFamily: 'Oswald_400Regular', fontSize: 13, color: '#777' },
  originalPrice: { fontFamily: PRICE_FONT_FAMILY, fontWeight: PRICE_FONT_WEIGHT, fontSize: 15, color: '#999', textDecorationLine: 'line-through' },
  discountText: { fontFamily: PRICE_FONT_FAMILY, fontWeight: PRICE_FONT_WEIGHT, fontSize: 13, color: '#9f273b' },
  summaryDivider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  summaryTotalLabel: { fontFamily: 'Oswald_600SemiBold', fontSize: 14, color: '#111', letterSpacing: 1 },
  summaryTotal: { fontFamily: PRICE_FONT_FAMILY, fontWeight: PRICE_FONT_WEIGHT, fontSize: 24, color: '#9f273b' },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fff', marginTop: 12, paddingHorizontal: 12, paddingVertical: 16 },
  featureItem: { width: '50%', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8 },
  featureTitle: { marginTop: 7, fontFamily: 'Oswald_600SemiBold', fontSize: 12, color: '#111', textTransform: 'uppercase' },
  featureText: { marginTop: 2, fontFamily: 'PlayfairDisplay_400Regular', fontSize: 11, color: '#777', textAlign: 'center' },
  relatedList: { gap: 12, paddingRight: 18 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 82, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 24 : 12, gap: 10 },
  bottomPriceWrap: { flex: 1 },
  bottomLabel: { fontFamily: 'Oswald_500Medium', fontSize: 10, color: '#777', letterSpacing: 1.3 },
  bottomPrice: { marginTop: 2, fontFamily: PRICE_FONT_FAMILY, fontWeight: PRICE_FONT_WEIGHT, fontSize: 20, color: '#9f273b' },
  outlineBtn: { width: 46, height: 46, borderRadius: 4, borderWidth: 1.2, borderColor: '#9f273b', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  buyBtn: { height: 46, borderRadius: 4, backgroundColor: '#9f273b', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  actionBtnDisabled: { opacity: 0.65 },
  buyBtnText: { fontFamily: 'Oswald_600SemiBold', fontSize: 12, color: '#fff', letterSpacing: 1.2 },
});
