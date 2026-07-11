import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import SmartImage from '../components/SmartImage';
import { API_BASE_URL } from '../config/api';
import { PRICE_FONT_FAMILY, PRICE_FONT_WEIGHT } from '../styles/typography';

const MINI_CARD_WIDTH = 158;
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=900&auto=format&fit=crop';

const COLLECTIONS = [
  {
    id: 'celestial',
    name: 'Celestial Diamond',
    theme: 'Dạ tiệc ánh sao',
    desc: 'Kim cương trắng, vàng 18K và những đường cắt thanh thoát dành cho các khoảnh khắc trang trọng.',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=900&auto=format&fit=crop',
    price: 'Từ 25.000.000đ',
    badge: 'LIMITED',
  },
  {
    id: 'pearl',
    name: 'Pearl Sonata',
    theme: 'Ngọc trai biển Nam',
    desc: 'Sắc ngọc dịu nhẹ, thiết kế tối giản và tinh thần thanh lịch cho mọi ngày.',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=900&auto=format&fit=crop',
    price: 'Từ 12.500.000đ',
    badge: 'NEW',
  },
  {
    id: 'ruby',
    name: 'Ruby Signature',
    theme: 'Dấu ấn đỏ SORA',
    desc: 'Ruby, vàng hồng và những chi tiết nổi bật dành cho phong cách cá nhân mạnh mẽ.',
    image: 'https://images.unsplash.com/photo-1573408301185-9519df1f2c1f?q=80&w=900&auto=format&fit=crop',
    price: 'Từ 15.600.000đ',
    badge: 'HOT',
  },
];

const CURATED_PRODUCTS = [
  {
    id: 'p1',
    name: 'Nhẫn Eternal Trắng 18K',
    category: 'Celestial Diamond',
    price: '25.000.000đ',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b854d4?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'p2',
    name: 'Dây Chuyền Pearl Sonata',
    category: 'Pearl Sonata',
    price: '12.500.000đ',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'p3',
    name: 'Bông Tai Sapphire Xanh',
    category: 'Celestial Diamond',
    price: '18.200.000đ',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'p4',
    name: 'Lắc Tay Charm Hoa',
    category: 'Ruby Signature',
    price: '9.800.000đ',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop',
  },
];

const STORY_POINTS = [
  { id: 'craft', icon: 'hammer-outline', title: 'Chế tác thủ công', text: 'Mỗi chi tiết được hoàn thiện qua nhiều lớp kiểm định.' },
  { id: 'stone', icon: 'diamond-stone', title: 'Đá tuyển chọn', text: 'Ưu tiên độ trong, sắc độ và độ bền theo tiêu chuẩn SORA.' },
  { id: 'limited', icon: 'sparkles-outline', title: 'Số lượng giới hạn', text: 'Mỗi bộ sưu tập được phát hành theo mùa hoặc chủ đề riêng.' },
];

const getStorageUrl = (path) => {
  if (!path) return FALLBACK_IMAGE;
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

const getComboProductPrice = (item) => {
  const variantPromo = Number(item?.variant?.promotional_price || 0);
  const variantPrice = Number(item?.variant?.price || 0);
  const productPromo = Number(item?.product?.promotional_price || 0);
  const productPrice = Number(item?.product?.base_price || 0);
  return variantPromo > 0
    ? variantPromo
    : (variantPrice > 0 ? variantPrice : (productPromo > 0 ? productPromo : productPrice));
};

const calculateComboPrice = (combo) => {
  const basePrice = (combo.items || []).reduce((total, item) => {
    return total + getComboProductPrice(item) * Number(item.quantity || 1);
  }, 0);
  const discountValue = Number(combo.discount_value || 0);

  if (!basePrice) return 0;
  if (!discountValue) return basePrice;

  if (combo.discount_type === 'percentage' || combo.discount_type === 'percent') {
    return Math.max(basePrice - (basePrice * discountValue / 100), 0);
  }

  return Math.max(basePrice - discountValue, 0);
};

const mapComboProduct = (item, comboName) => {
  const product = item.product;
  if (!product) return null;

  return {
    id: item.id || `${product.id}-${item.product_variant_id || 'default'}`,
    productId: product.id,
    slug: product.slug,
    name: product.name,
    category: comboName,
    price: formatCurrency(getComboProductPrice(item)),
    image: getStorageUrl(product.thumbnail_image),
  };
};

const mapComboToCollection = (combo, index) => {
  const products = (combo.items || [])
    .map((item) => mapComboProduct(item, combo.name))
    .filter(Boolean);
  const imagePath = combo.thumbnail_image || products[0]?.image;
  const price = calculateComboPrice(combo);

  return {
    id: String(combo.slug || combo.id || index),
    slug: combo.slug,
    name: combo.name || 'Bộ sưu tập SORA',
    theme: combo.theme || combo.target_gender || 'SORA Jewelry',
    desc: combo.description || 'Tổ hợp trang sức được tuyển chọn theo tinh thần SORA.',
    image: imagePath ? getStorageUrl(imagePath) : FALLBACK_IMAGE,
    price: price > 0 ? `Từ ${formatCurrency(price)}` : 'Liên hệ SORA',
    badge: combo.theme ? 'COLLECTION' : 'SORA SET',
    products,
    raw: combo,
  };
};

const fetchCollectionsQuery = async () => {
  const response = await fetch(`${API_BASE_URL}/client/combos`, {
    headers: { Accept: 'application/json' },
  });
  const result = await response.json();
  const rawCombos = result?.data?.data || result?.data || [];
  const mapped = Array.isArray(rawCombos)
    ? rawCombos.map(mapComboToCollection).filter((item) => item.name)
    : [];

  if (!response.ok || !result.success || mapped.length === 0) {
    throw new Error(result?.message || 'Chưa có bộ sưu tập từ hệ thống.');
  }

  return mapped;
};

export default function CollectionScreen({ navigation }) {
  const { width: viewportWidth } = useWindowDimensions();
  const heroWidth = Math.min(Math.max(viewportWidth - 36, 0), 620);
  const heroHeight = Math.min(Math.max(heroWidth * 1.18, 340), 440);
  const [activeId, setActiveId] = useState(COLLECTIONS[0].id);
  const collectionQuery = useQuery({
    queryKey: ['collections', 'combos'],
    queryFn: fetchCollectionsQuery,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 15,
  });
  const collections = collectionQuery.data?.length ? collectionQuery.data : COLLECTIONS;
  const isLoading = collectionQuery.isLoading && !collectionQuery.data;
  const isRefreshing = collectionQuery.isRefetching && !!collectionQuery.data;
  const errorText = collectionQuery.isError
    ? collectionQuery.error?.message || 'Không thể tải bộ sưu tập từ máy chủ.'
    : '';
  const activeCollection = collections.find((item) => item.id === activeId) || collections[0] || COLLECTIONS[0];
  const activeProducts = activeCollection?.products?.length ? activeCollection.products : CURATED_PRODUCTS;

  useEffect(() => {
    if (!collections.some((item) => item.id === activeId)) {
      setActiveId(collections[0]?.id || COLLECTIONS[0].id);
    }
  }, [activeId, collections]);

  const onRefresh = () => {
    collectionQuery.refetch();
  };

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={styles.loadingPage}>
        <ActivityIndicator size="large" color="#9f273b" />
        <Text style={styles.loadingPageText}>ĐANG TẢI BỘ SƯU TẬP SORA...</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: '#9f273b' }} />
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#9f273b" />

        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerEyebrow}>SORA JEWELRY</Text>
            <Text style={styles.headerTitle}>Bộ sưu tập</Text>
          </View>
          <View style={styles.headerIconBtn}>
            <MaterialCommunityIcons name="diamond-stone" size={19} color="#e7ce7d" />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={(
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={['#9f273b']}
              tintColor="#9f273b"
            />
          )}
        >
          <View style={[styles.hero, { width: heroWidth, height: heroHeight }]}>
            <SmartImage source={{ uri: activeCollection.image }} style={styles.heroImage} resizeMode="cover" />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Text style={styles.heroBadge}>{activeCollection.badge}</Text>
              <Text style={styles.heroTitle}>{activeCollection.name}</Text>
              <Text style={styles.heroTheme}>{activeCollection.theme}</Text>
              <Text style={styles.heroDesc}>{activeCollection.desc}</Text>
              <View style={styles.heroFooter}>
                <Text style={styles.heroPrice}>{activeCollection.price}</Text>
                <TouchableOpacity
                  style={styles.heroButton}
                  onPress={() => navigation.navigate('CollectionDetail', {
                    slug: activeCollection.slug,
                    initialCollection: activeCollection.raw || activeCollection,
                  })}
                  activeOpacity={0.9}
                >
                  <Text style={styles.heroButtonText}>KHÁM PHÁ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.selectorSection}>
            <Text style={styles.sectionLabel}>CURATED EDIT</Text>
            <Text style={styles.sectionTitle}>Chọn chủ đề</Text>
            {!!errorText && !isLoading && <Text style={styles.errorText}>{errorText}</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.collectionSelector}>
              {collections.map((collection) => {
                const active = collection.id === activeId;
                return (
                  <TouchableOpacity
                    key={collection.id}
                    style={[styles.selectorCard, active && styles.selectorCardActive]}
                    onPress={() => setActiveId(collection.id)}
                    activeOpacity={0.85}
                  >
                    <SmartImage source={{ uri: collection.image }} style={styles.selectorImage} resizeMode="cover" />
                    <View style={styles.selectorBody}>
                      <Text style={[styles.selectorName, active && styles.selectorNameActive]} numberOfLines={1}>
                        {collection.name}
                      </Text>
                      <Text style={styles.selectorTheme} numberOfLines={1}>{collection.theme}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.storySection}>
            <Text style={styles.sectionLabel}>SORA STANDARD</Text>
            <Text style={styles.sectionTitle}>Tinh thần bộ sưu tập</Text>
            {STORY_POINTS.map((point) => (
              <View key={point.id} style={styles.storyRow}>
                <View style={styles.storyIcon}>
                  {point.icon === 'diamond-stone' ? (
                    <MaterialCommunityIcons name="diamond-stone" size={18} color="#9f273b" />
                  ) : (
                    <Ionicons name={point.icon} size={18} color="#9f273b" />
                  )}
                </View>
                <View style={styles.storyTextWrap}>
                  <Text style={styles.storyTitle}>{point.title}</Text>
                  <Text style={styles.storyText}>{point.text}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.productsSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionLabel}>MATCHING PIECES</Text>
                <Text style={styles.sectionTitle}>Tác phẩm gợi ý</Text>
              </View>
              <Text style={styles.countText}>{activeProducts.length} mẫu</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productList}>
              {activeProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  activeOpacity={0.9}
                  onPress={() => product.slug && navigation.navigate('ProductDetail', { slug: product.slug })}
                >
                  <SmartImage source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
                  <View style={styles.productBody}>
                    <Text style={styles.productCategory} numberOfLines={1}>{product.category}</Text>
                    <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                    <Text style={styles.productPrice}>{product.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  loadingPage: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingPageText: {
    marginTop: 12,
    fontFamily: 'Oswald_500Medium',
    fontSize: 13,
    color: '#9f273b',
    letterSpacing: 1,
  },
  header: {
    backgroundColor: '#9f273b',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(231,206,125,0.25)',
  },
  headerTitleWrap: { flex: 1, alignItems: 'center' },
  headerEyebrow: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 10,
    color: '#e7ce7d',
    letterSpacing: 2.4,
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: '#fff',
    marginTop: 1,
  },
  content: {
    paddingBottom: 32,
    backgroundColor: '#f7f4ef',
  },
  hero: {
    alignSelf: 'center',
    marginTop: 16,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.44)',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e7ce7d',
    color: '#111',
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginBottom: 12,
  },
  heroTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 30,
    color: '#fff',
    lineHeight: 36,
  },
  heroTheme: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 12,
    color: '#e7ce7d',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 5,
  },
  heroDesc: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.84)',
    lineHeight: 20,
    marginTop: 10,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  heroPrice: {
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
    fontSize: 16,
    color: '#fff',
  },
  heroButton: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: 19,
    backgroundColor: '#9f273b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroButtonText: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 11,
    color: '#fff',
    letterSpacing: 1.2,
  },
  selectorSection: {
    paddingTop: 22,
    paddingBottom: 10,
  },
  sectionLabel: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 10,
    color: '#9f273b',
    letterSpacing: 1.8,
    marginHorizontal: 18,
    marginBottom: 3,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 21,
    color: '#111',
    marginHorizontal: 18,
    marginBottom: 12,
  },
  errorText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#9f273b',
    lineHeight: 18,
    marginHorizontal: 18,
    marginTop: -6,
    marginBottom: 12,
  },
  collectionSelector: {
    paddingHorizontal: 18,
    gap: 12,
  },
  selectorCard: {
    width: 190,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  selectorCardActive: {
    borderColor: '#9f273b',
  },
  selectorImage: {
    width: '100%',
    height: 96,
  },
  selectorBody: {
    padding: 10,
  },
  selectorName: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 12,
    color: '#222',
    textTransform: 'uppercase',
  },
  selectorNameActive: { color: '#9f273b' },
  selectorTheme: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  storySection: {
    marginHorizontal: 18,
    marginTop: 14,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  storyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  storyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f6',
    marginRight: 11,
  },
  storyTextWrap: { flex: 1 },
  storyTitle: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 13,
    color: '#222',
    textTransform: 'uppercase',
  },
  storyText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    color: '#777',
    lineHeight: 18,
    marginTop: 2,
  },
  productsSection: {
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  countText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 11,
    color: '#999',
    marginRight: 18,
    marginTop: 5,
    textTransform: 'uppercase',
  },
  productList: {
    paddingHorizontal: 18,
    gap: 12,
  },
  productCard: {
    width: MINI_CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  productBody: {
    padding: 10,
    minHeight: 108,
  },
  productCategory: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 10.5,
    color: '#9f273b',
    marginBottom: 3,
  },
  productName: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 12,
    color: '#222',
    lineHeight: 16,
    textTransform: 'uppercase',
    minHeight: 34,
  },
  productPrice: {
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
    fontSize: 14,
    color: '#9f273b',
    marginTop: 8,
  },
});
