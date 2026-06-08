import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, SafeAreaView, TextInput, useWindowDimensions, StatusBar, Animated, TouchableWithoutFeedback, RefreshControl, ActivityIndicator, Linking } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { MOBILE_AUTH_URL, API_BASE_URL } from '../config/api';
import { showCustomAlert } from '../components/CustomAlert';
import ProductCard from '../components/ProductCard';
import HomeSideMenu from '../components/home/HomeSideMenu';
import GoldPriceModal from '../components/home/GoldPriceModal';
import { PRICE_FONT_FAMILY, PRICE_FONT_WEIGHT } from '../styles/typography';
import { prefetchImageUrls } from '../utils/imagePrefetch';

const COMBO_CARD_GAP = 14;
const COMBO_SIDE_SPACER = 24;

// Top-level require để Metro bundler nhận đúng static asset
const SORA_PLACEHOLDER = require('../../assets/Sora-placeholder.png');

// Dummy Data
const BANNERS = [
  { id: '1', image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1000&auto=format&fit=crop' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getStorageUrl = (path) => {
  if (!path) return '';
  const origin = API_BASE_URL.replace('/api', '');
  let formattedPath = path;
  if (path.startsWith('http')) {
    formattedPath = path
      .replace('http://127.0.0.1:8000', origin)
      .replace('http://localhost:8000', origin)
      .replace('https://127.0.0.1:8000', origin)
      .replace('https://localhost:8000', origin);
    return formattedPath;
  }
  if (path.startsWith('/storage/')) {
    return `${origin}${path}`;
  }
  if (path.startsWith('storage/')) {
    return `${origin}/${path}`;
  }
  if (path.startsWith('/')) {
    formattedPath = path.slice(1);
  }
  return `${origin}/storage/${formattedPath}`;
};

const formatCurrency = (v) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v) || 0);

const formatVoucherValue = (coupon) => (
  coupon.discount_type === 'percent'
    ? coupon.discount_value
    : new Intl.NumberFormat('vi-VN').format(Number(coupon.discount_value) || 0)
);

const getAuthToken = async () => AsyncStorage.getItem('auth_token');

const getFavouriteHeaders = (token) => ({
  Accept: 'application/json',
  Authorization: `Bearer ${token}`,
});

const mapProductToWishlistItem = (product) => {
  const isDbProduct = !!product.thumbnail_image;
  return {
    id: product.id?.toString(),
    slug: product.slug,
    name: product.name,
    category: isDbProduct ? (product.category?.name || 'Trang Suc SORA') : product.category,
    variant: isDbProduct ? 'Chon phien ban tai trang chi tiet' : product.variant,
    price: isDbProduct
      ? (product.promotional_price > 0 ? product.promotional_price : product.base_price)
      : product.price,
    oldPrice: isDbProduct
      ? (product.promotional_price > 0 ? product.base_price : null)
      : product.oldPrice,
    image: isDbProduct ? getStorageUrl(product.thumbnail_image) : product.image,
  };
};

const saveLocalWishlist = async (nextItems) => {
  const nextIds = nextItems.map((item) => item.id?.toString()).filter(Boolean);
  await AsyncStorage.setItem('sora_wishlist_ids', JSON.stringify(nextIds));
  await AsyncStorage.setItem('sora_wishlist_items', JSON.stringify(nextItems));
};

const fetchHomeQueryData = async () => {
  const response = await fetch(`${API_BASE_URL}/client/home-data`, {
    headers: { Accept: 'application/json' },
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Không thể tải dữ liệu trang chủ.');
  }
  const data = result.data || {};
  prefetchImageUrls([
    ...(data.banners || []).map((banner) => (
      banner.image_url ? getStorageUrl(banner.image_url) : banner.image
    )),
    ...(data.categories || []).map((category) => (
      category.thumbnail ? getStorageUrl(category.thumbnail) : category.image
    )),
    ...(data.products || []).map((product) => (
      product.thumbnail_image ? getStorageUrl(product.thumbnail_image) : product.image
    )),
    ...(data.combos || []).map((combo) => {
      const imagePath = combo.thumbnail_image || combo.image || combo.products?.[0]?.thumbnail_image;
      return imagePath ? getStorageUrl(imagePath) : '';
    }),
    ...(data.news || []).map((article) => (
      article.thumbnail ? getStorageUrl(article.thumbnail) : article.image
    )),
  ]);
  return data;
};

const fetchHeaderQueryData = async () => {
  const response = await fetch(`${API_BASE_URL}/client/header-data`, {
    headers: { Accept: 'application/json' },
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Không thể tải dữ liệu danh mục.');
  }
  return result.data || {};
};

function SoraFallbackImage({ uri, style, resizeMode = 'cover' }) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [uri]);

  if (!uri || hasError) {
    return (
      <View style={[{ overflow: 'hidden' }, style]}>
        <Image
          source={SORA_PLACEHOLDER}
          style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={[{ overflow: 'hidden', backgroundColor: '#fff' }, style]}>
      <Image
        source={SORA_PLACEHOLDER}
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
        resizeMode="cover"
      />
      <Image
        source={{ uri }}
        style={[
          StyleSheet.absoluteFill,
          { width: '100%', height: '100%', opacity: isLoaded ? 1 : 0 },
        ]}
        resizeMode={resizeMode}
        onLoadEnd={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { width: viewportWidth } = useWindowDimensions();
  const bannerWidth = Math.min(viewportWidth, 720);
  const bannerHeight = Math.min(bannerWidth * 0.62, 420);
  const comboCardWidth = Math.min(Math.max(viewportWidth - 72, 248), 520);
  const contentCardWidth = Math.min(Math.max(viewportWidth - 24, 0), 720);
  const menuWidth = Math.min(viewportWidth * 0.8, 360);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTopTab, setActiveTopTab] = useState('home');
  const slideAnim = useRef(new Animated.Value(-360)).current;

  // Real-time search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [categoryResults, setCategoryResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isCategoryFallback, setIsCategoryFallback] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const searchDebounce = useRef(null);

  const {
    data: homeData,
    isLoading: isHomeQueryLoading,
    refetch: refetchHomeData,
  } = useQuery({
    queryKey: ['home-data'],
    queryFn: fetchHomeQueryData,
    staleTime: 1000 * 60 * 3,
  });
  const {
    data: headerData,
    refetch: refetchHeaderData,
  } = useQuery({
    queryKey: ['client-header-data'],
    queryFn: fetchHeaderQueryData,
    staleTime: 1000 * 60 * 10,
  });

  const banners = homeData?.banners || [];
  const homeCategories = homeData?.categories || [];
  const bestSellers = homeData?.products || [];
  const newsList = homeData?.news || [];
  const coupons = homeData?.coupons || [];
  const combos = homeData?.combos || [];
  const tiers = homeData?.tiers || [];
  const dbCategories = headerData?.categories || [];
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistLoadingIds, setWishlistLoadingIds] = useState([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const bannerDotAnimations = useRef([]).current;
  const bannerFlatListRef = useRef(null);
  const bannerIntervalRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) slideAnim.setValue(-menuWidth);
  }, [isMenuOpen, menuWidth, slideAnim]);

  const onBannerScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    if (slideSize > 0) {
      const index = Math.round(offset / slideSize);
      setActiveBannerIndex(index);
    }
  };

  const getBannerUrl = (banner) => {
    if (!banner) return '';
    const path = banner.image_mobile || banner.image_desktop;
    return getStorageUrl(path);
  };

  const handleBannerPress = (banner) => {
    if (banner.target_url) {
      Linking.openURL(banner.target_url).catch((err) => {
        console.log('Error opening URL:', err);
        showCustomAlert("SORA JEWELRY", `Đang mở chiến dịch:\n"${banner.title || 'SORA Exclusive'}"\n\nĐường dẫn: ${banner.target_url}`, [{ text: "ĐỒNG Ý", style: "default" }]);
      });
    } else {
      showCustomAlert(
        "SORA JEWELRY",
        `Đang xem chiến dịch:\n"${banner.title || 'SORA Exclusive'}"\n\nChiến dịch này sẽ đưa bạn đến các ưu đãi đặc quyền tại cửa hàng!`,
        [{ text: "ĐỒNG Ý", style: "default" }]
      );
    }
  };

  const handleToggleWishlist = async (product) => {
    const productId = product.id?.toString();
    if (!productId || wishlistLoadingIds.includes(productId)) return;

    setWishlistLoadingIds((prev) => [...prev, productId]);
    try {
      let updatedIds;
      let updatedItems;
      const token = await getAuthToken();

      const storedIds = await AsyncStorage.getItem('sora_wishlist_ids');
      const storedItems = await AsyncStorage.getItem('sora_wishlist_items');

      let currentIds = storedIds ? JSON.parse(storedIds) : [];
      let currentItems = storedItems ? JSON.parse(storedItems) : [];

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
          showCustomAlert("YÊU THÍCH", result.message || "Không thể cập nhật danh sách yêu thích.", [{ text: "ĐỒNG Ý" }]);
          return;
        }

        if (result.action === 'removed') {
          updatedIds = currentIds.filter(id => id.toString() !== productId);
          updatedItems = currentItems.filter(item => item.id.toString() !== productId);
          showCustomAlert("YÊU THÍCH", `Đã xóa "${product.name}" khỏi danh sách yêu thích.`, [{ text: "ĐỒNG Ý" }]);
        } else {
          updatedIds = currentIds.some(id => id.toString() === productId)
            ? currentIds
            : [...currentIds, productId];
          const mappedProduct = mapProductToWishlistItem(product);
          updatedItems = [
            ...currentItems.filter(item => item.id.toString() !== productId),
            mappedProduct,
          ];
          showCustomAlert("YÊU THÍCH", `Đã thêm "${product.name}" vào danh sách yêu thích.`, [{ text: "OK" }]);
        }

        setWishlistIds(updatedIds.map(id => id.toString()));
        await saveLocalWishlist(updatedItems);
        return;
      }

      const isFav = currentIds.some(id => id.toString() === productId);

      if (isFav) {
        updatedIds = currentIds.filter(id => id.toString() !== productId);
        updatedItems = currentItems.filter(item => item.id.toString() !== productId);
        showCustomAlert(
          "YÊU THÍCH",
          `Đã xóa sản phẩm:\n"${product.name}"\nkhỏi danh sách Yêu Thích thành công!`,
          [{ text: "ĐỒNG Ý", style: "default" }]
        );
      } else {
        updatedIds = [...currentIds, productId];

        // Map the product details correctly to the wishlist item structure
        const isDbProduct = !!product.thumbnail_image;
        const mappedProduct = {
          id: product.id.toString(),
          slug: product.slug,
          name: product.name,
          category: isDbProduct ? (product.category?.name || 'Trang Sức SORA') : product.category,
          variant: isDbProduct ? 'Bản Giới Hạn SORA' : product.variant,
          price: isDbProduct
            ? (product.promotional_price > 0 ? product.promotional_price : product.base_price)
            : product.price,
          oldPrice: isDbProduct
            ? (product.promotional_price > 0 ? product.base_price : null)
            : product.oldPrice,
          image: isDbProduct ? getStorageUrl(product.thumbnail_image) : product.image,
        };

        updatedItems = [...currentItems, mappedProduct];

        showCustomAlert(
          "YÊU THÍCH",
          `Đã thêm sản phẩm:\n"${product.name}"\nvào danh sách Yêu Thích thành công!`,
          [{ text: "ĐỒNG Ý", style: "default" }]
        );
      }

      setWishlistIds(updatedIds.map(id => id.toString()));
      await saveLocalWishlist(updatedItems);
    } catch (e) {
      console.log('Error saving wishlist in HomeScreen:', e);
    } finally {
      setWishlistLoadingIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const formatDateString = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${d.getDate()} Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  };

  const handleSelectNews = (article) => {
    if (article?.slug) {
      navigation.navigate('NewsDetail', { slug: article.slug, article });
      return;
    }
    navigation.navigate('News');
  };

  const loadWishlist = async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        const response = await fetch(`${API_BASE_URL}/client/favourites`, {
          headers: getFavouriteHeaders(token),
        });
        const result = await response.json();

        if (response.ok && (result.success || result.status)) {
          const serverItems = (result.data || [])
            .map((fav) => fav.product)
            .filter(Boolean)
            .map(mapProductToWishlistItem);
          const storedLocalItems = await AsyncStorage.getItem('sora_wishlist_items');
          const localItems = storedLocalItems ? JSON.parse(storedLocalItems) : [];
          const serverIds = new Set(serverItems.map((item) => item.id?.toString()));
          const missingLocalItems = localItems.filter((item) => item.id && !serverIds.has(item.id.toString()));

          if (missingLocalItems.length > 0) {
            await Promise.all(missingLocalItems.map((item) => (
              fetch(`${API_BASE_URL}/client/favourites/toggle`, {
                method: 'POST',
                headers: {
                  ...getFavouriteHeaders(token),
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product_id: item.id }),
              })
            )));
          }

          const mergedItems = [...serverItems, ...missingLocalItems];
          setWishlistIds(mergedItems.map((item) => item.id));
          await saveLocalWishlist(mergedItems);
          return;
        }
      }

      const stored = await AsyncStorage.getItem('sora_wishlist_ids');
      if (stored) {
        setWishlistIds(JSON.parse(stored).map(id => id.toString()));
      }
    } catch (e) {
      console.log('Error loading wishlist ids in HomeScreen:', e);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  useEffect(() => {
    const totalBanners = banners.length > 0 ? banners.length : BANNERS.length;
    if (bannerIntervalRef.current) {
      clearInterval(bannerIntervalRef.current);
      bannerIntervalRef.current = null;
    }

    if (totalBanners <= 1) {
      setActiveBannerIndex(0);
      return undefined;
    }

    bannerIntervalRef.current = setInterval(() => {
      setActiveBannerIndex(prev => {
        const nextIndex = (prev + 1) % totalBanners;
        try {
          bannerFlatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
        } catch (e) {
          console.log('Banner auto-scroll failed:', e);
        }
        return nextIndex;
      });
    }, 4000);

    return () => {
      if (bannerIntervalRef.current) {
        clearInterval(bannerIntervalRef.current);
        bannerIntervalRef.current = null;
      }
    };
  }, [banners.length]);

  const performSearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      setCategoryResults([]);
      setIsCategoryFallback(false);
      return;
    }
    setIsSearchLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/client/search?keyword=${encodeURIComponent(query)}&category=${encodeURIComponent(selectedCategory)}`, {
        headers: { Accept: 'application/json' },
      });
      const result = await response.json();
      if (result.success) {
        setSearchResults(result.data.products || []);
        setCategoryResults(result.data.categories || []);
        setIsCategoryFallback(result.data.is_category_fallback || false);
      }
    } catch (e) {
      console.log('Error performing search:', e);
    } finally {
      setIsSearchLoading(false);
    }
  };

  const onSearchInput = (text) => {
    setSearchQuery(text);
    const query = text.trim();
    if (!query) {
      setShowSearchResults(false);
      setSearchResults([]);
      setCategoryResults([]);
      return;
    }
    setShowSearchResults(true);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
    setCategoryResults([]);
    setSelectedCategory('Tất cả');
  };

  const handleSelectProduct = (prod) => {
    setShowSearchResults(false);
    navigation.navigate("ProductDetail", {
      slug: prod.slug,
      previewImage: prod.previewImage || prod.image || null,
      previewProduct: prod.previewProduct || null,
    });
  };

  const handleSelectCategory = (cat) => {
    setShowSearchResults(false);
    navigation.navigate('Shop', {
      categorySlug: cat.slug || cat.id,
      categoryRequestId: Date.now(),
    });
  };

  const getSelectedCategorySlug = () => {
    if (selectedCategory === 'Tất cả') return '';
    const matchedCategory = dbCategories.find((cat) => cat.name === selectedCategory);
    return matchedCategory?.slug || matchedCategory?.id || '';
  };

  const bannerItems = banners.length > 0 ? banners : BANNERS;
  while (bannerDotAnimations.length < bannerItems.length) {
    bannerDotAnimations.push(new Animated.Value(bannerDotAnimations.length === activeBannerIndex ? 1 : 0));
  }

  useEffect(() => {
    bannerDotAnimations.forEach((animation, index) => {
      Animated.timing(animation, {
        toValue: index === activeBannerIndex ? 1 : 0,
        duration: 220,
        useNativeDriver: false,
      }).start();
    });
  }, [activeBannerIndex, bannerDotAnimations]);

  const handleSelectCombo = (combo) => {
    navigation.navigate('CollectionDetail', {
      slug: combo.slug,
      initialCollection: combo,
    });
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    setShowSearchResults(false);
    setShowCategoryDropdown(false);
    navigation.navigate('Shop', {
      keyword: searchQuery.trim(),
      categorySlug: getSelectedCategorySlug(),
      searchRequestId: Date.now(),
    });
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  }, [selectedCategory]);

  const [isGoldModalVisible, setIsGoldModalVisible] = useState(false);

  const openGoldModal = () => {
    setIsGoldModalVisible(true);
  };

  const closeGoldModal = () => {
    setIsGoldModalVisible(false);
    setActiveTopTab('home');
  };

  const loadUser = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }

      const cached = await AsyncStorage.getItem('user');
      if (cached) {
        setUser(JSON.parse(cached));
        setIsLoggedIn(true);
      }

      const res = await fetch(`${MOBILE_AUTH_URL}/me`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsLoggedIn(true);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
      } else {
        await AsyncStorage.multiRemove(['auth_token', 'user', 'sora_wishlist_ids', 'sora_wishlist_items']);
        setWishlistIds([]);
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (e) {
      console.log('Error loading user in HomeScreen:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setActiveTopTab('home');
      loadUser();
      loadWishlist();
    }, [loadUser])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([loadUser(), refetchHomeData(), refetchHeaderData()]).finally(() => setRefreshing(false));
  }, [loadUser, refetchHeaderData, refetchHomeData]);

  const toggleMenu = () => {
    if (isMenuOpen) {
      Animated.timing(slideAnim, {
        toValue: -menuWidth,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsMenuOpen(false));
    } else {
      setIsMenuOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const closeMenu = () => {
    if (isMenuOpen) {
      Animated.timing(slideAnim, {
        toValue: -menuWidth,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsMenuOpen(false));
    }
  };

  const renderProduct = ({ item }) => {
    const isFav = wishlistIds.includes(item.id?.toString());
    const isWishlistLoading = wishlistLoadingIds.includes(item.id?.toString());

    return (
      <ProductCard
        product={item}
        style={styles.bestSellerProductCard}
        onPress={handleSelectProduct}
        onToggleWishlist={handleToggleWishlist}
        isFavorite={isFav}
        isWishlistLoading={isWishlistLoading}
      />
    );
  };

  if (isHomeQueryLoading && !refreshing && banners.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#9f273b" />
        <Text style={{ marginTop: 10, fontFamily: "Oswald_500Medium", color: "#9f273b", fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>Đang tải trang chủ SORA...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* Transparent backdrop to click outside search results or category selector */}
      {(showSearchResults && searchQuery.trim().length > 0) || showCategoryDropdown ? (
        <TouchableWithoutFeedback onPress={() => {
          setShowSearchResults(false);
          setShowCategoryDropdown(false);
        }}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>
      ) : null}

      {/* HEADER SECTION (Like Emart Mall but SORA colors) */}
      <View style={styles.headerContainer}>
        {/* Top Row: Menu, Logo, Icon */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleMenu}>
            <Ionicons name="menu" size={28} color="#333" />
          </TouchableOpacity>

          <Image
            source={require('../../assets/logo1.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="globe-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Search Bar Wrapper */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <TouchableOpacity
              style={styles.searchDropdown}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <Text style={styles.searchDropdownText} numberOfLines={1}>{selectedCategory}</Text>
              <Ionicons name="caret-down" size={12} color="#333" />
            </TouchableOpacity>

            {showCategoryDropdown && (
              <View style={styles.categoryDropdown}>
                <ScrollView style={{ maxHeight: 180 }} showsVerticalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[
                      styles.categoryDropdownItem,
                      selectedCategory === 'Tất cả' && styles.categoryDropdownItemActive
                    ]}
                    onPress={() => {
                      setSelectedCategory('Tất cả');
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.categoryDropdownItemText,
                      selectedCategory === 'Tất cả' && styles.categoryDropdownItemTextActive
                    ]}>
                      Tất cả
                    </Text>
                  </TouchableOpacity>

                  {dbCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id.toString()}
                      style={[
                        styles.categoryDropdownItem,
                        selectedCategory === cat.name && styles.categoryDropdownItemActive
                      ]}
                      onPress={() => {
                        setSelectedCategory(cat.name);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text style={[
                        styles.categoryDropdownItemText,
                        selectedCategory === cat.name && styles.categoryDropdownItemTextActive
                      ]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm trong SORA..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={onSearchInput}
              onFocus={() => setShowSearchResults(true)}
              onSubmitEditing={handleSearchSubmit}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={{ padding: 5, marginRight: 2 }}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
            {isSearchLoading ? (
              <ActivityIndicator size="small" color="#9f273b" style={{ marginRight: 10 }} />
            ) : (
              <TouchableOpacity style={styles.barcodeIcon} onPress={handleSearchSubmit}>
                <Ionicons name="search" size={18} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Dropdown Overlay */}
          {showSearchResults && searchQuery.trim().length > 0 && (
            <View style={styles.searchResultsDropdown}>
              <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                {isSearchLoading && searchResults.length === 0 && categoryResults.length === 0 ? (
                  <View style={styles.searchLoadingBox}>
                    <ActivityIndicator size="small" color="#9f273b" />
                    <Text style={styles.searchLoadingTxt}>Đang tìm kiếm...</Text>
                  </View>
                ) : !isSearchLoading && searchResults.length === 0 && categoryResults.length === 0 ? (
                  <View style={styles.searchEmptyBox}>
                    <Ionicons name="sad-outline" size={24} color="#999" style={{ marginBottom: 6 }} />
                    <Text style={styles.searchEmptyTxt}>Không tìm thấy kết quả cho "{searchQuery}"</Text>
                  </View>
                ) : (
                  <>
                    {categoryResults.length > 0 && (
                      <View style={styles.searchSection}>
                        <Text style={styles.searchSectionTitle}>DANH MỤC</Text>
                        {categoryResults.map((cat) => (
                          <TouchableOpacity
                            key={cat.id}
                            style={styles.searchCatRow}
                            onPress={() => handleSelectCategory(cat)}
                          >
                            <Ionicons name="folder-open-outline" size={14} color="#9f273b" style={{ marginRight: 8 }} />
                            <Text style={styles.searchCatName}>{cat.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {searchResults.length > 0 && (
                      <View style={styles.searchSection}>
                        <Text style={styles.searchSectionTitle}>
                          {isCategoryFallback ? 'GỢI Ý TỪ DANH MỤC' : 'SẢN PHẨM'}
                        </Text>
                        {searchResults.map((prod) => (
                          <TouchableOpacity
                            key={prod.id}
                            style={styles.searchProdRow}
                            onPress={() => handleSelectProduct(prod)}
                          >
                            <SoraFallbackImage
                              uri={getStorageUrl(prod.thumbnail_image)}
                              style={styles.searchProdImg}
                            />
                            <View style={styles.searchProdInfo}>
                              <Text style={styles.searchProdName} numberOfLines={1}>
                                {prod.name}
                              </Text>
                              <Text style={styles.searchProdPrice}>
                                {formatCurrency(prod.promotional_price || prod.base_price)}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </>
                )}
              </ScrollView>

              {!isSearchLoading && searchResults.length > 0 && (
                <TouchableOpacity style={styles.searchAllBtn} onPress={handleSearchSubmit}>
                  <Text style={styles.searchAllBtnTxt}>Xem tất cả kết quả</Text>
                  <Ionicons name="arrow-forward" size={12} color="#9f273b" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Top Tab Menu */}
        <View style={styles.topTabMenu}>
          <TouchableOpacity
            style={[styles.topTabItem, activeTopTab === 'gold' && styles.topTabItemActive]}
            onPress={() => {
              setActiveTopTab('gold');
              openGoldModal();
            }}
          >
            <Text style={[styles.topTabText, activeTopTab === 'gold' && styles.topTabTextActive]}>
              BẢNG GIÁ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.topTabItem, activeTopTab === 'home' && styles.topTabItemActive]}
            onPress={() => setActiveTopTab('home')}
          >
            <Text style={[styles.topTabText, activeTopTab === 'home' && styles.topTabTextActive]}>
              TRANG CHỦ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.topTabItem, activeTopTab === 'collections' && styles.topTabItemActive]}
            onPress={() => {
              setActiveTopTab('collections');
              navigation.navigate("Collections");
            }}
          >
            <Text style={[styles.topTabText, activeTopTab === 'collections' && styles.topTabTextActive]}>
              BỘ SƯU TẬP
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BODY SECTION */}
      <ScrollView
        style={styles.bodyContainer}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#9f273b']}
            tintColor="#9f273b"
          />
        }
      >

        {/* Hero Banner Carousel */}
        <View style={[styles.bannerSection, { width: bannerWidth }]}>
          <FlatList
            ref={bannerFlatListRef}
            data={banners.length > 0 ? banners : BANNERS}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onBannerScroll}
            scrollEventThrottle={16}
            getItemLayout={(data, index) => (
              { length: bannerWidth, offset: bannerWidth * index, index }
            )}
            renderItem={({ item }) => {
              const imgUrl = item.image_mobile ? getBannerUrl(item) : (item.image || getBannerUrl(item));
              return (
                <View style={[styles.bannerSlideWrapper, { width: bannerWidth, height: bannerHeight }]}>
                  <SoraFallbackImage uri={imgUrl} style={[styles.heroBannerImage, { width: bannerWidth, height: bannerHeight }]} />
                  {/* Dark overlay for readability */}
                  <View style={styles.heroBannerOverlay} />

                  {/* Campaign Information Caption */}
                  <View style={styles.heroBannerCaption}>
                    <View style={styles.bannerSubtitleContainer}>
                      <View style={styles.bannerGoldDivider} />
                      <Text style={styles.bannerSubtitleText}>SORA EXCLUSIVE</Text>
                      <View style={styles.bannerGoldDivider} />
                    </View>

                    <Text style={styles.heroBannerTitle} numberOfLines={2}>
                      {item.title || 'VẺ ĐẸP VĨNH CỬU'}
                    </Text>

                    <TouchableOpacity
                      style={styles.bannerExploreButton}
                      onPress={() => handleBannerPress(item)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.bannerExploreButtonText}>KHÁM PHÁ CỬA HÀNG</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
          {/* Pagination dots */}
          <View style={styles.paginationContainer}>
            {bannerItems.map((b, idx) => (
              <View
                key={b.id.toString()}
                style={styles.dotSlot}
              >
                <Animated.View
                  style={[
                    styles.dot,
                    {
                      width: bannerDotAnimations[idx].interpolate({
                        inputRange: [0, 1],
                        outputRange: [6, 15],
                      }),
                      backgroundColor: bannerDotAnimations[idx].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['#ddd', '#9f273b'],
                      }),
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>DANH MỤC</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
            {homeCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id.toString()}
                style={styles.categoryItem}
                onPress={() => handleSelectCategory(cat)}
              >
                <View style={styles.categoryCircle}>
                  <SoraFallbackImage
                    uri={cat.thumbnail ? getStorageUrl(cat.thumbnail) : (cat.image ? getStorageUrl(cat.image) : cat.icon)}
                    style={styles.categoryImage}
                  />
                  <View style={styles.categoryOverlay} />
                </View>
                <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SẢN PHẨM BÁN CHẠY</Text>
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={() => showCustomAlert("SORA JEWELRY", "Tính năng xem toàn bộ sản phẩm đang được tích lũy cập nhật.", [{ text: "ĐỒNG Ý", style: "default" }])}
            >
              <Text style={styles.viewMoreText}>Xem Thêm</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={bestSellers}
            renderItem={renderProduct}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        </View>

        {/* Coupons/Voucher Section */}
        {coupons.length > 0 && (
          <View style={styles.couponsContainer}>
            <View style={styles.sectionHeaderCompact}>
              <Text style={styles.sectionGoldLabel}>ĐẶC QUYỀN MUA SẮM</Text>
              <Text style={styles.sectionTitleLuxury}>Món Quà Từ SORA</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.couponsList}
            >
              {coupons.map((coupon) => (
                <View key={coupon.id.toString()} style={styles.couponCard}>
                  <View style={styles.couponCardInner}>
                    <View style={styles.couponTop}>
                      <Text style={styles.couponCode}>{coupon.code}</Text>
                      <View style={styles.couponDividerLine} />
                      <View style={styles.couponValueContainer}>
                        <Text style={styles.couponValue}>
                          {formatVoucherValue(coupon)}
                        </Text>
                        <Text style={styles.couponUnit}>
                          {coupon.discount_type === 'percent' ? '%' : ' đ'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.couponBottom}>
                      <Text style={styles.couponMinSpend} numberOfLines={1}>
                        Đơn từ {formatCurrency(coupon.min_order_value)}
                      </Text>
                      <TouchableOpacity
                        style={styles.couponSaveBtn}
                        onPress={() => showCustomAlert(
                          "SORA JEWELRY",
                          `Chúc mừng! Bạn đã lưu voucher mã "${coupon.code}" thành công vào ví ưu đãi cá nhân.`,
                          [{ text: "ĐỒNG Ý", style: "default" }]
                        )}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.couponSaveBtnTxt}>LƯU MÃ NGAY</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Limited Combos Section */}
        {combos.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderCompact}>
              <Text style={styles.sectionGoldLabel}>ĐỒNG ĐIỆU</Text>
              <Text style={styles.sectionTitleLuxury}>Bộ Sưu Tập Giới Hạn</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.combosList}
              snapToInterval={comboCardWidth + COMBO_CARD_GAP}
              snapToAlignment="start"
              decelerationRate="fast"
              disableIntervalMomentum={true}
            >
              {combos.map((combo) => {
                const comboKey = combo.id.toString();
                const comboImagePath = combo.thumbnail_image || combo.image || combo.products?.[0]?.thumbnail_image;
                const comboImageUrl = comboImagePath ? getStorageUrl(comboImagePath) : '';

                return (
                  <TouchableOpacity
                    key={comboKey}
                    style={[styles.comboCard, { width: comboCardWidth }]}
                    onPress={() => handleSelectCombo(combo)}
                    activeOpacity={0.92}
                  >
                    <SoraFallbackImage uri={comboImageUrl} style={styles.comboCardImg} />
                    <View style={styles.comboCardBody}>
                      <Text style={styles.comboCardCollName}>SORA COLLECTION</Text>
                      <Text style={styles.comboCardTitle} numberOfLines={1}>{combo.name}</Text>
                      <Text style={styles.comboCardDesc} numberOfLines={2}>
                        {combo.description || 'Sự kết hợp hoàn mỹ giữa nghệ thuật chế tác kim hoàn và vẻ đẹp vượt thời gian.'}
                      </Text>

                      <View style={styles.comboCardPriceRow}>
                        <Text style={styles.comboPromoPrice}>
                          {formatCurrency(combo.promotional_price)}
                        </Text>
                        {combo.base_price > 0 && (
                          <Text style={styles.comboBasePrice}>
                            {formatCurrency(combo.base_price)}
                          </Text>
                        )}
                      </View>

                      <TouchableOpacity
                        style={styles.comboDetailBtn}
                        onPress={() => handleSelectCombo(combo)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.comboDetailBtnTxt}>KHÁM PHÁ NGAY</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Privilege Club Membership Section */}
        <View style={[styles.membershipSectionContainer, { width: contentCardWidth }]}>
          <View style={styles.membershipBgOverlay} />
          <View style={styles.membershipContent}>
            <MaterialCommunityIcons name="diamond" size={28} color="#e7ce7d" style={{ marginBottom: 10 }} />
            <Text style={styles.membershipGoldLabel}>SORA PRIVILEGE CLUB</Text>
            <Text style={styles.membershipTitle}>Đặc Quyền Hội Viên</Text>
            <Text style={styles.membershipDesc}>
              Đăng ký thành viên để tận hưởng đặc quyền chăm sóc trang sức trọn đời và chiết khấu VIP dành riêng cho bạn.
            </Text>

            <View style={styles.membershipTiersList}>
              <View style={styles.membershipTierMiniCard}>
                <Text style={styles.membershipTierNameGold}>BẠC</Text>
                <Text style={styles.membershipTierValue}>VIP 1</Text>
                <Text style={styles.membershipTierDiscount}>Chiết khấu 2%</Text>
              </View>
              <View style={[styles.membershipTierMiniCard, { borderColor: '#e7ce7d' }]}>
                <Text style={[styles.membershipTierNameGold, { color: '#e7ce7d' }]}>VÀNG</Text>
                <Text style={styles.membershipTierValue}>VIP 2</Text>
                <Text style={styles.membershipTierDiscount}>Chiết khấu 5%</Text>
              </View>
              <View style={styles.membershipTierMiniCard}>
                <Text style={styles.membershipTierNameGold}>KIM CƯƠNG</Text>
                <Text style={styles.membershipTierValue}>VIP 3</Text>
                <Text style={styles.membershipTierDiscount}>Chiết khấu 10%</Text>
              </View>
            </View>

            {!isLoggedIn && (
              <TouchableOpacity
                style={styles.membershipRegisterBtn}
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.8}
              >
                <Text style={styles.membershipRegisterBtnTxt}>TẠO TÀI KHOẢN NGAY</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Brand Story / Artistic Section */}
        <View style={[styles.brandStoryContainer, { width: contentCardWidth }]}>
          <SoraFallbackImage
            uri="https://images.unsplash.com/photo-1589674781759-c21c37956a44?q=80&w=800&auto=format&fit=crop"
            style={styles.brandStoryBgImage}
          />
          <View style={styles.brandStoryOverlay} />

          <View style={styles.brandStoryContent}>
            <Text style={styles.brandStoryLabel}>NGHỆ THUẬT CHẾ TÁC</Text>
            <Text style={styles.brandStoryTitle}>Tinh Hoa Hội Tụ</Text>
            <Text style={styles.brandStorySubtitle}>TRONG TỪNG GIỌT VÀNG</Text>
            <Text style={styles.brandStoryDesc}>
              Tại SORA, mỗi tác phẩm là một di sản mang đậm dấu ấn cá nhân. Bằng đôi bàn tay tài hoa của nghệ nhân kim hoàn bậc thầy, chúng tôi gọt giũa trang sức thành biểu tượng của sự sang trọng và vẻ đẹp vượt thời gian.
            </Text>
            <TouchableOpacity
              style={styles.brandStoryBtn}
              onPress={() => showCustomAlert(
                "SORA JEWELRY",
                "Di sản chế tác SORA Jewelry được bảo hộ toàn cầu với chính sách bảo hành đá quý trọn đời.",
                [{ text: "ĐỒNG Ý", style: "default" }]
              )}
              activeOpacity={0.8}
            >
              <Text style={styles.brandStoryBtnTxt}>KHÁM PHÁ DI SẢN</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* News Section */}
        <View style={styles.newsSectionContainer}>
          {/* Section header */}
          <View style={styles.newsSectionHeader}>
            <Text style={styles.newsTagLabel}>CẨM NANG</Text>
            <Text style={styles.sectionTitle}>Kiến Thức Trang Sức</Text>
          </View>

          {(newsList.length > 0 ? newsList : NEWS).map((article) => {
            const isDbNews = !!article.image_url;
            const imgUrl = isDbNews ? getStorageUrl(article.image_url) : article.image;
            const tag = isDbNews ? (article.category || 'CẨM NANG') : article.tag;
            const title = article.title;
            const excerpt = article.excerpt;
            const dateText = isDbNews
              ? formatDateString(article.created_at || article.published_at || article.updated_at)
              : article.date;

            return (
              <TouchableOpacity
                key={article.id.toString()}
                style={styles.newsCard}
                onPress={() => handleSelectNews(article)}
                activeOpacity={0.9}
              >
                <SoraFallbackImage uri={imgUrl} style={styles.newsCardImage} />
                <View style={styles.newsCardBody}>
                  <Text style={styles.newsCardTag}>{tag}</Text>
                  <Text style={styles.newsCardTitle} numberOfLines={2}>{title}</Text>
                  <Text style={styles.newsCardExcerpt} numberOfLines={2}>{excerpt}</Text>
                  <View style={styles.newsCardFooter}>
                    <Ionicons name="calendar-outline" size={12} color="#999" />
                    <Text style={styles.newsCardDate}> {dateText}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Extra Space at bottom */}
        <View style={{ height: 40 }} />
      </ScrollView>

      <HomeSideMenu
        visible={isMenuOpen}
        width={menuWidth}
        translateX={slideAnim}
        isLoggedIn={isLoggedIn}
        user={user}
        navigation={navigation}
        onClose={closeMenu}
        onOpenGold={openGoldModal}
        getStorageUrl={getStorageUrl}
      />

      <GoldPriceModal visible={isGoldModalVisible} onClose={closeGoldModal} />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f3ef',
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingTop: 10,
    zIndex: 100,
    elevation: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e9dd',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  iconButton: {
    padding: 5,
  },
  logo: {
    height: 48,
    width: 190,

  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fbfaf8',
    marginHorizontal: 15,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee2d0',
  },
  searchDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    height: '100%',
  },
  searchDropdownText: {
    fontSize: 13,
    fontFamily: 'Oswald_500Medium',
    marginRight: 5,
    color: '#333',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontSize: 14,
    fontFamily: 'Oswald_400Regular',
  },
  barcodeIcon: {
    paddingHorizontal: 10,
  },
  topTabMenu: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingTop: 2,
  },
  topTabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  topTabItemActive: {
    borderBottomColor: '#9f273b',
  },
  topTabText: {
    fontSize: 12,
    fontFamily: 'Oswald_400Regular',
    color: '#999',
    textTransform: 'uppercase',
  },
  topTabTextActive: {
    color: '#9f273b',
    fontFamily: 'Oswald_600SemiBold',
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: '#f6f3ef',
  },
  bodyContent: {
    paddingBottom: 18,
  },
  bannerSection: {
    alignSelf: 'center',
    maxWidth: 720,
    backgroundColor: '#fff',
    paddingBottom: 12,
    overflow: 'hidden',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 15,
    marginTop: 10,
    marginHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0e9dd',
  },
  categoriesList: {
    paddingHorizontal: 0,
    gap: 14,
    marginTop: 14,
  },
  categoryItem: {
    alignItems: 'center',
    width: 72,
  },
  categoryCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e7ce7d',
    marginBottom: 7,
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(159,39,59,0.10)',
  },
  categoryName: {
    fontSize: 11,
    fontFamily: 'Oswald_400Regular',
    textTransform: 'uppercase',
    color: '#555',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  heroBannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerSlideWrapper: {
    position: 'relative',
  },
  heroBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.20)', // Much lighter overlay to keep the image bright and vibrant
  },
  heroBannerCaption: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bannerGoldDivider: {
    width: 25,
    height: 1,
    backgroundColor: '#e7ce7d',
    marginHorizontal: 8,
  },
  bannerSubtitleText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 10,
    letterSpacing: 2,
    color: '#e7ce7d',
    textTransform: 'uppercase',
  },
  heroBannerTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.80)', // Stronger shadow so it remains highly readable on bright images
    textShadowOffset: { width: 1, height: 1.5 },
    textShadowRadius: 5,
  },
  bannerExploreButton: {
    borderWidth: 1,
    borderColor: '#e7ce7d',
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  bannerExploreButtonText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 11,
    letterSpacing: 1.5,
    color: '#e7ce7d',
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dotSlot: {
    width: 21,
    height: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  // === NEW HOME LUXURY SECTIONS ===
  sectionHeaderCompact: {
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  sectionGoldLabel: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 11,
    color: '#e7ce7d',
    letterSpacing: 2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  sectionTitleLuxury: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#111',
    fontWeight: 'bold',
  },

  // 1. Coupons/Vouchers
  couponsContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 18,
    marginHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0e9dd',
    overflow: 'hidden',
  },
  couponsList: {
    paddingLeft: 15,
    paddingRight: 10,
    gap: 12,
  },
  couponCard: {
    width: 250,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e7ce7d',
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#e7ce7d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  couponCardInner: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(231, 206, 125, 0.05)',
  },
  couponTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponCode: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 14,
    color: '#111',
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  couponDividerLine: {
    width: 1,
    height: 25,
    backgroundColor: 'rgba(231, 206, 125, 0.3)',
    marginHorizontal: 10,
  },
  couponValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  couponValue: {
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
    fontSize: 21,
    color: '#9f273b',
  },
  couponUnit: {
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
    fontSize: 13,
    color: '#9f273b',
  },
  couponBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  couponMinSpend: {
    fontSize: 10.5,
    color: '#666',
    flex: 1,
    marginRight: 10,
  },
  couponSaveBtn: {
    backgroundColor: '#9f273b',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  couponSaveBtnTxt: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 9.5,
    color: '#fef3ce',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  // 2. Brand Story
  brandStoryContainer: {
    alignSelf: 'center',
    maxWidth: 720,
    height: 250,
    position: 'relative',
    backgroundColor: '#000',
    marginTop: 18,
    marginHorizontal: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  brandStoryBgImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.5,
  },
  brandStoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  brandStoryContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandStoryLabel: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 10,
    color: '#e7ce7d',
    letterSpacing: 2,
    marginBottom: 4,
  },
  brandStoryTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  brandStorySubtitle: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 11,
    color: '#e7ce7d',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  brandStoryDesc: {
    fontSize: 11.5,
    color: '#ddd',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 16,
    paddingHorizontal: 15,
  },
  brandStoryBtn: {
    borderColor: '#e7ce7d',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 7,
  },
  brandStoryBtnTxt: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 11,
    color: '#e7ce7d',
    letterSpacing: 1,
  },

  // 3. Limited Combos
  combosList: {
    paddingHorizontal: COMBO_SIDE_SPACER,
    gap: 14,
    paddingVertical: 5,
  },
  comboCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  comboCardImg: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  soraImageFallback: {
    backgroundColor: '#f8f8f8',
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soraImageFallbackText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 18,
    color: '#d0d0d0',
    letterSpacing: 6,
    textTransform: 'lowercase',
  },
  soraImageFallbackSub: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 8,
    color: '#d8d8d8',
    letterSpacing: 3,
    marginTop: 2,
  },
  comboCardBody: {
    padding: 14,
  },
  comboCardCollName: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 9,
    color: '#e7ce7d',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  comboCardTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 15,
    color: '#111',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  comboCardDesc: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
    marginBottom: 12,
  },
  comboCardPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  comboPromoPrice: {
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
    fontSize: 15,
    color: '#9f273b',
    fontWeight: 'bold',
    marginRight: 10,
  },
  comboBasePrice: {
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  comboDetailBtn: {
    borderWidth: 1,
    borderColor: '#9f273b',
    borderRadius: 20,
    paddingVertical: 7,
    alignItems: 'center',
    backgroundColor: 'rgba(159, 39, 59, 0.02)',
  },
  comboDetailBtnTxt: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 10.5,
    color: '#9f273b',
    letterSpacing: 1,
    fontWeight: 'bold',
  },

  // 4. Privilege Club
  membershipSectionContainer: {
    alignSelf: 'center',
    maxWidth: 720,
    backgroundColor: '#111',
    paddingVertical: 32,
    position: 'relative',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 14,
    marginHorizontal: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  membershipBgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(159, 39, 59, 0.05)',
  },
  membershipContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  membershipGoldLabel: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 10,
    color: '#e7ce7d',
    letterSpacing: 2,
    marginBottom: 4,
  },
  membershipTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  membershipDesc: {
    fontSize: 11.5,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  membershipTiersList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
    marginBottom: 24,
  },
  membershipTierMiniCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(231, 206, 125, 0.2)',
    padding: 10,
    alignItems: 'center',
  },
  membershipTierNameGold: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 11.5,
    color: '#e7ce7d',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  membershipTierValue: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 10,
    color: '#fff',
    marginBottom: 6,
  },
  membershipTierDiscount: {
    fontSize: 9.5,
    color: '#888',
    textAlign: 'center',
  },
  membershipRegisterBtn: {
    borderColor: '#e7ce7d',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 9,
    backgroundColor: 'rgba(231, 206, 125, 0.05)',
  },
  membershipRegisterBtnTxt: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 11,
    color: '#e7ce7d',
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 15,
    marginHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0e9dd',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#333',
  },

  // === NEWS SECTION ===
  newsSectionContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    marginHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0e9dd',
    overflow: 'hidden',
    paddingBottom: 10,
  },
  newsSectionHeader: {
    paddingHorizontal: 15,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 5,
    backgroundColor: '#fff',
  },
  newsTagLabel: {
    fontSize: 11,
    fontFamily: 'Oswald_500Medium',
    color: '#9f273b',
    letterSpacing: 2,
    marginBottom: 4,
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 6,
    borderRadius: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  newsCardImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  newsCardBody: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  newsCardTag: {
    fontSize: 10,
    fontFamily: 'Oswald_500Medium',
    color: '#9f273b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  newsCardTitle: {
    fontSize: 13,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#222',
    lineHeight: 18,
    marginBottom: 4,
  },
  newsCardExcerpt: {
    fontSize: 11,
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    color: '#777',
    lineHeight: 15,
    marginBottom: 6,
  },
  newsCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsCardDate: {
    fontSize: 10,
    fontFamily: 'Oswald_400Regular',
    color: '#aaa',
  },


  viewMoreButton: {
    backgroundColor: '#e7ce7d', // Gold button
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
  },
  viewMoreText: {
    fontSize: 12,
    fontFamily: 'Oswald_500Medium',
    color: '#fff',
  },
  productList: {
    paddingHorizontal: 10,
  },
  bestSellerProductCard: {
    width: 165,
    marginHorizontal: 5,
  },
  // Real-time search dropdown styles
  searchWrapper: {
    position: 'relative',
    zIndex: 110,
    elevation: 11,
  },
  searchResultsDropdown: {
    position: 'absolute',
    top: 42,
    left: 15,
    right: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ebd5a3',
    maxHeight: 350,
    shadowColor: '#ebd5a3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 15,
    zIndex: 120,
    padding: 6,
  },
  searchLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  searchLoadingTxt: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#9f273b',
    letterSpacing: 0.5,
  },
  searchSection: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f6f0',
  },
  searchSectionTitle: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 10,
    color: '#999',
    letterSpacing: 1.5,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  searchCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  searchCatName: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 13,
    color: '#333',
  },
  searchProdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
    gap: 12,
  },
  searchProdImg: {
    width: 36,
    height: 36,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  searchProdInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  searchProdName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 12,
    color: '#222',
    lineHeight: 16,
  },
  searchProdPrice: {
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
    fontSize: 11,
    color: '#9f273b',
    marginTop: 2,
  },
  searchEmptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  searchEmptyTxt: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
  },
  searchAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#fffbf6',
    borderTopWidth: 1,
    borderTopColor: '#f9f6f0',
    gap: 6,
    marginTop: 2,
  },
  searchAllBtnTxt: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 12,
    color: '#9f273b',
    letterSpacing: 0.5,
  },

  // Real-time category selector dropdown styles
  categoryDropdown: {
    position: 'absolute',
    top: 42,
    left: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ebd5a3',
    maxHeight: 280,
    shadowColor: '#ebd5a3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 15,
    zIndex: 130,
    width: 120,
    paddingVertical: 4,
  },
  categoryDropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  categoryDropdownItemActive: {
    backgroundColor: '#fffdf6',
  },
  categoryDropdownItemText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#555',
  },
  categoryDropdownItemTextActive: {
    fontFamily: 'Oswald_600SemiBold',
    color: '#9f273b',
  },
});
