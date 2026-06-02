import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import SmartImage from '../components/SmartImage';
import ProductCard from '../components/ProductCard';
import { showCustomAlert } from '../components/CustomAlert';

const CARD_GAP = 12;

const CATEGORIES = [
  {
    id: 'rings',
    name: 'Nhan',
    label: 'Nhẫn',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b854d4?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 'necklaces',
    name: 'Day chuyen',
    label: 'Dây chuyền',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 'earrings',
    name: 'Bong tai',
    label: 'Bông tai',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 'bracelets',
    name: 'Lac tay',
    label: 'Lắc tay',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 'sets',
    name: 'Bo suu tap',
    label: 'Bộ sưu tập',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 'brooches',
    name: 'Ghim cai',
    label: 'Ghim cài',
    image: 'https://images.unsplash.com/photo-1573408301185-9519df1f2c1f?q=80&w=500&auto=format&fit=crop',
  },
];

const PRODUCTS = [
  {
    id: 'p1',
    name: 'Nhẫn Kim Cương Eternal Trắng 18K',
    category: 'Nhẫn cao cấp',
    price: '25.000.000đ',
    oldPrice: '30.500.000đ',
    discount: '-18%',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b854d4?q=80&w=700&auto=format&fit=crop',
  },
  {
    id: 'p2',
    name: 'Dây Chuyền Ngọc Trai Biển Nam',
    category: 'Dây chuyền',
    price: '12.500.000đ',
    oldPrice: null,
    discount: null,
    rating: 5,
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=700&auto=format&fit=crop',
  },
  {
    id: 'p3',
    name: 'Bông Tai Sapphire Xanh Hoàng Gia',
    category: 'Bông tai',
    price: '18.200.000đ',
    oldPrice: '22.000.000đ',
    discount: '-20%',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=700&auto=format&fit=crop',
  },
  {
    id: 'p4',
    name: 'Lắc Tay Vàng Hồng Charm Hoa',
    category: 'Lắc tay',
    price: '9.800.000đ',
    oldPrice: null,
    discount: null,
    rating: 4,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=700&auto=format&fit=crop',
  },
  {
    id: 'p5',
    name: 'Vòng Cổ Diamond Halo Limited',
    category: 'Vòng cổ',
    price: '42.000.000đ',
    oldPrice: '48.000.000đ',
    discount: '-13%',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=700&auto=format&fit=crop',
  },
  {
    id: 'p6',
    name: 'Ghim Cài Ruby SORA Signature',
    category: 'Ghim cài',
    price: '15.600.000đ',
    oldPrice: null,
    discount: null,
    rating: 4,
    image: 'https://images.unsplash.com/photo-1573408301185-9519df1f2c1f?q=80&w=700&auto=format&fit=crop',
  },
];

const FILTERS = ['Tất cả', 'Mới nhất', 'Đang giảm', 'Kim cương', 'Vàng 18K'];
const COLOR_FILTERS = [
  { id: 'white-gold', label: 'Vàng trắng', color: '#e9edf2' },
  { id: 'yellow-gold', label: 'Vàng vàng', color: '#d9a928' },
  { id: 'rose-gold', label: 'Vàng hồng', color: '#d69a8b' },
  { id: 'blue', label: 'Sapphire', color: '#2457a6' },
  { id: 'red', label: 'Ruby', color: '#a91f35' },
];
const MATERIAL_FILTERS = ['Kim cương', 'Vàng 18K', 'Ngọc trai', 'Sapphire', 'Ruby'];
const PRICE_FILTERS = ['Dưới 10 triệu', '10 - 20 triệu', '20 - 40 triệu', 'Trên 40 triệu'];

const DIMENSION_FILTERS = ['1', '2'];
const SIZE_FILTERS = ['14 – 2', '16 cm', '18 cm', '45 cm', '50 cm', '8 – 14', 'Ni 10', 'Ni 12', 'Ni 14'];

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
  const hasDatabasePrice = product.base_price !== undefined;
  return {
    id: product.id?.toString(),
    slug: product.slug,
    name: product.name,
    category: product.category?.name || product.category || 'Trang sức SORA',
    variant: product.variant || 'Chọn phiên bản tại trang chi tiết',
    price: hasDatabasePrice
      ? (product.promotional_price > 0 ? product.promotional_price : product.base_price)
      : product.price,
    oldPrice: hasDatabasePrice
      ? (product.promotional_price > 0 ? product.base_price : null)
      : product.oldPrice,
    image: product.thumbnail_image ? getStorageUrl(product.thumbnail_image) : product.image,
  };
};

const saveLocalWishlist = async (items) => {
  const ids = items.map((item) => item.id?.toString()).filter(Boolean);
  await AsyncStorage.setItem('sora_wishlist_ids', JSON.stringify(ids));
  await AsyncStorage.setItem('sora_wishlist_items', JSON.stringify(items));
};

export default function ShopScreen({ navigation, route }) {
  const { width: viewportWidth } = useWindowDimensions();
  const productGridWidth = Math.min(viewportWidth, 720);
  const productCardWidth = (productGridWidth - 36 - CARD_GAP) / 2;
  const [categories, setCategories] = useState(CATEGORIES);
  const [products, setProducts] = useState(PRODUCTS);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedDimensions, setSelectedDimensions] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: PRODUCTS.length });
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistLoadingIds, setWishlistLoadingIds] = useState([]);

  const displayCategories = categories.length > 0 ? categories : CATEGORIES;

  const activeCategoryLabel = useMemo(() => {
    const category = displayCategories.find((cat) => (cat.slug || cat.id) === activeCategory);
    return category?.label || category?.name || 'Tất cả';
  }, [activeCategory, displayCategories]);

  const productRangeStart = pagination.total > 0
    ? ((Number(pagination.current_page) - 1) * 6) + 1
    : 0;
  const productRangeEnd = Math.min(Number(pagination.current_page) * 6, Number(pagination.total) || 0);

  const fetchCategories = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) setIsLoadingCategories(true);
    try {
      const response = await fetch(`${API_BASE_URL}/shop/sora/categories`, {
        headers: { Accept: 'application/json' },
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setCategories(result.data || []);
      }
    } catch (error) {
      console.log('Error loading shop categories:', error);
    } finally {
      if (showLoading) setIsLoadingCategories(false);
    }
  }, []);

  const fetchProducts = useCallback(async (page = 1, { showLoading = true } = {}) => {
    if (showLoading) setIsLoadingProducts(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '6',
      });

      if (activeCategory) {
        params.set('categories', activeCategory);
      }

      if (activeFilter === 'Mới nhất') {
        params.set('sort', 'new');
      } else {
        params.set('sort', 'recommended');
      }

      if (selectedColors.length > 0) {
        params.set('color', selectedColors.join(','));
      }

      if (selectedMaterials.length > 0) {
        params.set('attribute_values', selectedMaterials.join(','));
      }

      if (selectedDimensions.length > 0) {
        params.set('dimension', selectedDimensions.join(','));
      }

      if (selectedSizes.length > 0) {
        params.set('size', selectedSizes.join(','));
      }

      const response = await fetch(`${API_BASE_URL}/shop/sora/products?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setProducts(result.data?.data || []);
        setPagination({
          current_page: result.data?.current_page || 1,
          last_page: result.data?.last_page || 1,
          total: result.data?.total || 0,
        });
      }
    } catch (error) {
      console.log('Error loading shop products:', error);
    } finally {
      if (showLoading) setIsLoadingProducts(false);
    }
  }, [activeCategory, activeFilter, selectedColors, selectedMaterials, selectedDimensions, selectedSizes]);

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
      console.log('Error loading wishlist in ShopScreen:', error);
    }
  }, []);

  const handleToggleWishlist = useCallback(async (product) => {
    const productId = product.id?.toString();
    if (!productId || wishlistLoadingIds.includes(productId)) return;

    setWishlistLoadingIds((previousIds) => [...previousIds, productId]);
    try {
      const token = await getAuthToken();
      const storedItems = await AsyncStorage.getItem('sora_wishlist_items');
      const currentItems = storedItems ? JSON.parse(storedItems) : [];
      const isFavourite = wishlistIds.includes(productId);
      let nextItems;

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

        const wasRemoved = result.action === 'removed';
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
        return;
      }

      nextItems = isFavourite
        ? currentItems.filter((item) => item.id?.toString() !== productId)
        : [
            ...currentItems.filter((item) => item.id?.toString() !== productId),
            mapProductToWishlistItem(product),
          ];

      setWishlistIds((previousIds) => (
        isFavourite
          ? previousIds.filter((id) => id !== productId)
          : [...previousIds, productId]
      ));
      await saveLocalWishlist(nextItems);
      showCustomAlert(
        'YÊU THÍCH',
        isFavourite
          ? `Đã xóa "${product.name}" khỏi danh sách yêu thích.`
          : `Đã thêm "${product.name}" vào danh sách yêu thích.`,
        [{ text: 'ĐỒNG Ý' }]
      );
    } catch (error) {
      console.log('Error updating wishlist in ShopScreen:', error);
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
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const categorySlug = route.params?.categorySlug;
    if (!categorySlug) return;

    setActiveCategory(categorySlug.toString());
    setActiveFilter('Tất cả');
    setSelectedColors([]);
    setSelectedMaterials([]);
    setSelectedDimensions([]);
    setSelectedSizes([]);
    setSelectedPrice(null);
  }, [route.params?.categoryRequestId, route.params?.categorySlug]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  useFocusEffect(
    useCallback(() => {
      loadWishlist();
    }, [loadWishlist])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchCategories({ showLoading: false }),
        fetchProducts(Number(pagination.current_page) || 1, { showLoading: false }),
        loadWishlist(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchCategories, fetchProducts, loadWishlist, pagination.current_page]);

  const toggleArrayValue = (value, setter) => {
    setter((prev) => (
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    ));
  };

  const resetFilterModal = () => {
    setActiveCategory('');
    setActiveFilter('Tất cả');
    setSelectedColors([]);
    setSelectedMaterials([]);
    setSelectedDimensions([]);
    setSelectedSizes([]);
    setSelectedPrice(null);
  };

  const handleOpenProductDetail = (product) => {
    if (!product.slug) return;
    navigation.navigate('ProductDetail', { slug: product.slug });
  };

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: '#9f273b' }} />
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#9f273b" translucent={false} />

      <View style={styles.header}>
        <View style={styles.headerSideSpacer} />
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerEyebrow}>SORA JEWELRY</Text>
          <Text style={styles.headerTitle}>Cửa hàng</Text>
        </View>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => navigation.navigate('Compare')}
          accessibilityLabel="So sánh sản phẩm"
        >
          <Ionicons name="git-compare-outline" size={21} color="#fff" />
        </TouchableOpacity>
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
        <View style={styles.heroBand}>
          <Text style={styles.heroTitle}>Lựa chọn lý tưởng</Text>
          <View style={styles.heroDivider}>
            <View style={styles.heroLine} />
            <MaterialCommunityIcons name="diamond-stone" size={15} color="#e7ce7d" />
            <View style={styles.heroLine} />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {displayCategories.map((cat) => {
              const categoryKey = cat.slug || cat.id;
              const categoryImage = cat.thumbnail ? getStorageUrl(cat.thumbnail) : cat.image;
              const categoryName = cat.label || cat.name;
              const active = activeCategory === categoryKey;
              return (
                <TouchableOpacity
                  key={categoryKey}
                  style={styles.categoryItem}
                  activeOpacity={0.85}
                  onPress={() => setActiveCategory(active ? '' : categoryKey)}
                >
                  <View style={[styles.categoryImageWrap, active && styles.categoryImageWrapActive]}>
                    <SmartImage source={{ uri: categoryImage }} style={styles.categoryImage} resizeMode="cover" />
                  </View>
                  <Text style={[styles.categoryName, active && styles.categoryNameActive]} numberOfLines={1}>
                    {categoryName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.shopToolbar}>
          <View>
            <Text style={styles.resultCount}>
              {isLoadingProducts
                ? 'Đang tải sản phẩm...'
                : `Hiển thị ${productRangeStart}-${productRangeEnd} của ${pagination.total}`}
            </Text>
            <Text style={styles.resultSub}>Danh mục: {activeCategoryLabel}</Text>
          </View>
          <TouchableOpacity
            style={styles.sortButton}
            activeOpacity={0.8}
            onPress={() => setIsFilterOpen(true)}
          >
            <Ionicons name="options-outline" size={15} color="#9f273b" />
            <Text style={styles.sortText}>Bộ lọc</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {FILTERS.map((filter) => {
            const active = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, active && styles.filterChipActive]}
                activeOpacity={0.85}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={[styles.productGrid, { width: productGridWidth }]}>
          {isLoadingProducts ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#9f273b" />
              <Text style={styles.loadingText}>Đang tải cửa hàng SORA...</Text>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="diamond-stone" size={36} color="#d8c69a" />
              <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
              <Text style={styles.emptyText}>Thử đổi bộ lọc hoặc danh mục khác.</Text>
            </View>
          ) : products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              width={productCardWidth}
              onPress={handleOpenProductDetail}
              onToggleWishlist={handleToggleWishlist}
              isFavorite={wishlistIds.includes(product.id?.toString())}
              isWishlistLoading={wishlistLoadingIds.includes(product.id?.toString())}
            />
          ))}
        </View>

        {!isLoadingProducts && pagination.last_page > 1 && (
          <View style={styles.paginationBar}>
            <TouchableOpacity
              style={[styles.pageButton, pagination.current_page <= 1 && styles.pageButtonDisabled]}
              disabled={pagination.current_page <= 1}
              onPress={() => fetchProducts(Number(pagination.current_page) - 1)}
            >
              <Ionicons name="chevron-back" size={16} color={pagination.current_page <= 1 ? '#bbb' : '#9f273b'} />
            </TouchableOpacity>

            <Text style={styles.pageStatus}>
              Trang {pagination.current_page} / {pagination.last_page}
            </Text>

            <TouchableOpacity
              style={[styles.pageButton, pagination.current_page >= pagination.last_page && styles.pageButtonDisabled]}
              disabled={pagination.current_page >= pagination.last_page}
              onPress={() => fetchProducts(Number(pagination.current_page) + 1)}
            >
              <Ionicons name="chevron-forward" size={16} color={pagination.current_page >= pagination.last_page ? '#bbb' : '#9f273b'} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isFilterOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsFilterOpen(false)}
      >
        <View style={styles.filterModalOverlay}>
          <TouchableOpacity
            style={styles.filterModalBackdrop}
            activeOpacity={1}
            onPress={() => setIsFilterOpen(false)}
          />
          <View style={styles.filterSheet}>
            <View style={styles.filterSheetHandle} />

            <View style={styles.filterSheetHeader}>
              <View>
                <Text style={styles.filterSheetEyebrow}>SORA JEWELRY</Text>
                <Text style={styles.filterSheetTitle}>Bộ lọc sản phẩm</Text>
              </View>
              <TouchableOpacity style={styles.filterCloseBtn} onPress={() => setIsFilterOpen(false)}>
                <Ionicons name="close" size={22} color="#111" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.filterSheetBody}>
              <View style={styles.filterBlock}>
                <Text style={styles.filterBlockTitle}>Danh mục</Text>
                <View style={styles.filterOptionGrid}>
                  {displayCategories.map((cat) => {
                    const categoryKey = cat.slug || cat.id;
                    const active = activeCategory === categoryKey;
                    return (
                      <TouchableOpacity
                        key={categoryKey}
                        style={[styles.modalChip, active && styles.modalChipActive]}
                        onPress={() => setActiveCategory(active ? '' : categoryKey)}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.modalChipText, active && styles.modalChipTextActive]}>
                          {cat.label || cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.filterBlock}>
                <Text style={styles.filterBlockTitle}>Màu sắc</Text>
                <View style={styles.colorGrid}>
                  {COLOR_FILTERS.map((color) => {
                    const active = selectedColors.includes(color.label);
                    return (
                      <TouchableOpacity
                        key={color.id}
                        style={[styles.colorOption, active && styles.colorOptionActive]}
                        onPress={() => toggleArrayValue(color.label, setSelectedColors)}
                        activeOpacity={0.85}
                      >
                        <View style={[styles.colorSwatch, { backgroundColor: color.color }]}>
                          {active && <Ionicons name="checkmark" size={15} color="#fff" />}
                        </View>
                        <Text style={styles.colorLabel}>{color.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.filterBlock}>
                <Text style={styles.filterBlockTitle}>Chất liệu</Text>
                <View style={styles.filterOptionGrid}>
                  {MATERIAL_FILTERS.map((material) => {
                    const active = selectedMaterials.includes(material);
                    return (
                      <TouchableOpacity
                        key={material}
                        style={[styles.modalChip, active && styles.modalChipActive]}
                        onPress={() => toggleArrayValue(material, setSelectedMaterials)}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.modalChipText, active && styles.modalChipTextActive]}>
                          {material}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.filterBlock}>
                <Text style={styles.filterBlockTitle}>Kích thước</Text>
                <View style={styles.filterOptionGrid}>
                  {DIMENSION_FILTERS.map((dimension) => {
                    const active = selectedDimensions.includes(dimension);
                    return (
                      <TouchableOpacity
                        key={dimension}
                        style={[styles.modalChip, active && styles.modalChipActive]}
                        onPress={() => toggleArrayValue(dimension, setSelectedDimensions)}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.modalChipText, active && styles.modalChipTextActive]}>
                          {dimension}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.filterBlock}>
                <Text style={styles.filterBlockTitle}>Size</Text>
                <View style={styles.filterOptionGrid}>
                  {SIZE_FILTERS.map((size) => {
                    const active = selectedSizes.includes(size);
                    return (
                      <TouchableOpacity
                        key={size}
                        style={[styles.modalChip, active && styles.modalChipActive]}
                        onPress={() => toggleArrayValue(size, setSelectedSizes)}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.modalChipText, active && styles.modalChipTextActive]}>
                          {size}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.filterBlock}>
                <Text style={styles.filterBlockTitle}>Khoảng giá</Text>
                <View style={styles.filterOptionGrid}>
                  {PRICE_FILTERS.map((price) => {
                    const active = selectedPrice === price;
                    return (
                      <TouchableOpacity
                        key={price}
                        style={[styles.modalChip, active && styles.modalChipActive]}
                        onPress={() => setSelectedPrice(active ? null : price)}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.modalChipText, active && styles.modalChipTextActive]}>
                          {price}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <View style={styles.filterSheetFooter}>
              <TouchableOpacity style={styles.filterResetBtn} onPress={resetFilterModal}>
                <Text style={styles.filterResetText}>XOÁ LỌC</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterApplyBtn} onPress={() => setIsFilterOpen(false)}>
                <Text style={styles.filterApplyText}>ÁP DỤNG</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
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
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(231,206,125,0.25)',
  },
  headerSideSpacer: {
    width: 40,
    height: 40,
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
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
    paddingBottom: 34,
  },
  heroBand: {
    backgroundColor: '#fffdf8',
    paddingTop: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e4cf',
  },
  heroTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: '#9f273b',
    textAlign: 'center',
  },
  heroDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  heroLine: {
    width: 48,
    height: 1,
    backgroundColor: '#e7ce7d',
  },
  categoryList: {
    paddingHorizontal: 14,
    gap: 12,
  },
  categoryItem: {
    width: 86,
    alignItems: 'center',
  },
  categoryImageWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0e4cf',
  },
  categoryImageWrapActive: {
    borderColor: '#e7ce7d',
    borderWidth: 2,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
  },
  categoryName: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 11,
    color: '#777',
    marginTop: 7,
    letterSpacing: 0.5,
  },
  categoryNameActive: {
    color: '#9f273b',
  },
  shopToolbar: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultCount: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 17,
    color: '#222',
  },
  resultSub: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  sortButton: {
    height: 34,
    paddingHorizontal: 11,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#ead9bf',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fffdf9',
  },
  sortText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 11,
    color: '#9f273b',
    textTransform: 'uppercase',
  },
  filterList: {
    paddingHorizontal: 18,
    paddingBottom: 15,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 13,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  filterChipActive: {
    backgroundColor: '#9f273b',
    borderColor: '#9f273b',
  },
  filterChipText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  productGrid: {
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    paddingHorizontal: 18,
  },
  loadingBox: {
    width: '100%',
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 12,
    color: '#9f273b',
    marginTop: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  emptyBox: {
    width: '100%',
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f0e9dd',
    borderRadius: 8,
    backgroundColor: '#fffdf9',
    padding: 24,
  },
  emptyTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#222',
    marginTop: 10,
  },
  emptyText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingTop: 20,
    paddingBottom: 4,
  },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ead9bf',
    backgroundColor: '#fff',
  },
  pageButtonDisabled: {
    backgroundColor: '#f7f7f7',
    borderColor: '#eee',
  },
  pageStatus: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 12,
    color: '#555',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  filterModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  filterSheet: {
    maxHeight: '88%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  filterSheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  filterSheetHeader: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0e9dd',
  },
  filterSheetEyebrow: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 10,
    color: '#9f273b',
    letterSpacing: 2,
  },
  filterSheetTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 21,
    color: '#111',
    marginTop: 2,
  },
  filterCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7f7',
  },
  filterSheetBody: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
  },
  filterBlock: {
    paddingBottom: 18,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3eee5',
  },
  filterBlockTitle: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 12,
    color: '#333',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 11,
  },
  filterOptionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalChip: {
    minHeight: 34,
    paddingHorizontal: 13,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#e7e1d6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  modalChipActive: {
    backgroundColor: '#9f273b',
    borderColor: '#9f273b',
  },
  modalChipText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#555',
  },
  modalChipTextActive: {
    color: '#fff',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorOption: {
    flexGrow: 1,
    flexBasis: '46%',
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  colorOptionActive: {
    borderColor: '#9f273b',
    backgroundColor: '#fffafa',
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  colorLabel: {
    flex: 1,
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#444',
  },
  filterSheetFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0e9dd',
    backgroundColor: '#fff',
  },
  filterResetBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9f273b',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  filterResetText: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 12,
    color: '#9f273b',
    letterSpacing: 1,
  },
  filterApplyBtn: {
    flex: 1.4,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9f273b',
  },
  filterApplyText: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 12,
    color: '#fff',
    letterSpacing: 1,
  },
});
