import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, SafeAreaView, TextInput, Dimensions, StatusBar, Animated, TouchableWithoutFeedback, RefreshControl, Modal, ActivityIndicator, PanResponder, Linking } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOBILE_AUTH_URL, API_BASE_URL } from '../config/api';
import { showCustomAlert } from '../components/CustomAlert';

const { width, height: SCREEN_H } = Dimensions.get('window');

// Dummy Data
const BANNERS = [
  { id: '1', image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1000&auto=format&fit=crop' },
];

const BEST_SELLERS = [
  { id: '1', name: 'Nhẫn Kim Cương Eternal Trắng 18K', category: 'Nhẫn Cao Cấp', price: '25.000.000đ', oldPrice: '30.500.000đ', discount: '-18%', image: 'https://images.unsplash.com/photo-1605100804763-247f67b854d4?q=80&w=600&auto=format&fit=crop', rating: 5 },
  { id: '2', name: 'Dây Chuyền Ngọc Trai Tự Nhiên Biển Nam', category: 'Dây Chuyền', price: '12.500.000đ', oldPrice: '15.000.000đ', discount: '-16%', image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop', rating: 4 },
  { id: '3', name: 'Bông Tai Sapphire Xanh Cao Cấp', category: 'Bông Tai', price: '18.200.000đ', oldPrice: '22.000.000đ', discount: '-20%', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop', rating: 5 },
];

const CATEGORIES = [
  { id: '1', name: 'Nhẫn', icon: 'https://images.unsplash.com/photo-1605100804763-247f67b854d4?q=80&w=300&auto=format&fit=crop' },
  { id: '2', name: 'Dây Chuyền', icon: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=300&auto=format&fit=crop' },
  { id: '3', name: 'Bông Tai', icon: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=300&auto=format&fit=crop' },
  { id: '4', name: 'Lắc Tay', icon: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=300&auto=format&fit=crop' },
  { id: '5', name: 'Vòng Cổ', icon: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=300&auto=format&fit=crop' },
  { id: '6', name: 'Ghim Cài', icon: 'https://images.unsplash.com/photo-1573408301185-9519df1f2c1f?q=80&w=300&auto=format&fit=crop' },
];

const NEWS = [
  {
    id: '1',
    tag: 'Cẩm Nang',
    title: 'Hướng dẫn chọn nhẫn kim cương cưới phù hợp',
    excerpt: 'Kiến thức cần biết giúp bạn lựa chọn cặp nhẫn cưới đẹp và ý nghĩa, phù hợp với tài chính và thẩm mỹ riêng.',
    date: '15 Tháng 5, 2025',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b854d4?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '2',
    tag: 'Xu Hướng',
    title: 'Top 5 xu hướng trang sức năm 2025 bạn không thể bỏ lỡ',
    excerpt: 'Từ phong trào tả năng đến tối giản sang trọng, khám phá những điều dần xuất hiện trên bản thảm đỏ tính đến tháng 6.',
    date: '10 Tháng 5, 2025',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '3',
    tag: 'Chăm Sóc',
    title: 'Cách bảo quản trang sức vàng & đá quý đúng cách',
    excerpt: 'Những mẹo nhỏ giúp trang sức của bạn luôn sáng bóng và bền đẹp theo thời gian dù sử dụng hàng ngày.',
    date: '05 Tháng 5, 2025',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop',
  },
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
  return `${origin}/storage/${formattedPath}`;
};

const formatCurrency = (v) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v) || 0);

const TIER_CONFIG = {
  silver: { label: 'Bạc', icon: 'medal-outline', from: '#c0c0c0', to: '#a9a9a9', border: '#c8c8c8', text: '#555' },
  gold: { label: 'Vàng', icon: 'trophy-outline', from: '#ffd700', to: '#f5a623', border: '#e7ce7d', text: '#7a5800' },
  diamond: { label: 'Kim cương', icon: 'diamond-outline', from: '#76d7f5', to: '#4dd0e1', border: '#4dd0e1', text: '#006080' },
  default: { label: 'Thành viên', icon: 'person-circle-outline', from: '#e0e0e0', to: '#bdbdbd', border: '#e7ce7d', text: '#555' },
};

const getTierConfig = (tierName) => {
  if (!tierName) return TIER_CONFIG.default;
  const n = tierName.toLowerCase();
  if (n.includes('kim') || n.includes('diamond')) return TIER_CONFIG.diamond;
  if (n.includes('vàng') || n.includes('gold')) return TIER_CONFIG.gold;
  if (n.includes('bạc') || n.includes('silver')) return TIER_CONFIG.silver;
  return TIER_CONFIG.default;
};

const TIER_THEMES = {
  silver: {
    bg: '#f8f9fa',
    safeBg: '#f1f5f9',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    border: '#cbd5e1',
    shadow: 'rgba(71, 85, 105, 0.15)',
    text: '#475569',
    accent: '#475569',
    iconWrapBg: '#e2e8f0',
    glow1: '#e2e8f0',
    glow2: '#f1f5f9',
    progressColors: ['#64748b', '#cbd5e1'],
    avatarBorder: '#cbd5e1',
    labelColor: '#64748b',
    nameColor: '#334155',
  },
  gold: {
    bg: '#fffdf6',
    safeBg: '#fffbf0',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    border: '#ebd5a3',
    shadow: 'rgba(235, 213, 163, 0.5)',
    text: '#92400e',
    accent: '#9f273b',
    iconWrapBg: '#fef4cb',
    glow1: '#fde9b8',
    glow2: '#fef4cb',
    progressColors: ['#9f273b', '#ebd5a3'],
    avatarBorder: '#ebd5a3',
    labelColor: '#8c826e',
    nameColor: '#1a1a1a',
  },
  diamond: {
    bg: '#f4fdff',
    safeBg: '#ecfeff',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    border: '#a5f3fc',
    shadow: 'rgba(6, 182, 212, 0.2)',
    text: '#0369a1',
    accent: '#0891b2',
    iconWrapBg: '#e0f7fa',
    glow1: '#cffafe',
    glow2: '#ecfeff',
    progressColors: ['#0891b2', '#a5f3fc'],
    avatarBorder: '#a5f3fc',
    labelColor: '#0e7490',
    nameColor: '#0f172a',
  },
  default: {
    bg: '#fafafa',
    safeBg: '#f5f5f5',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    border: '#e5e7eb',
    shadow: 'rgba(0, 0, 0, 0.05)',
    text: '#555555',
    accent: '#9f273b',
    iconWrapBg: '#f3f4f6',
    glow1: '#f3f4f6',
    glow2: '#f9fafb',
    progressColors: ['#9f273b', '#d1d5db'],
    avatarBorder: '#d1d5db',
    labelColor: '#6b7280',
    nameColor: '#1f2937',
  },
};

const getTierTheme = (tierName) => {
  if (!tierName) return TIER_THEMES.default;
  const n = tierName.toLowerCase();
  if (n.includes('kim') || n.includes('diamond')) return TIER_THEMES.diamond;
  if (n.includes('vàng') || n.includes('gold')) return TIER_THEMES.gold;
  if (n.includes('bạc') || n.includes('silver')) return TIER_THEMES.silver;
  return TIER_THEMES.default;
};

// ─── TierBadge ───────────────────────────────────────────────────────────────
function TierBadge({ tierName }) {
  const cfg = getTierConfig(tierName);
  const theme = getTierTheme(tierName);
  return (
    <View style={[styles.tierBadge, { backgroundColor: theme.iconWrapBg, borderColor: theme.border }]}>
      <Ionicons name={cfg.icon} size={13} color={theme.text} />
      <Text style={[styles.tierBadgeTxt, { color: theme.text }]}>{tierName || 'Thành viên'}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;

  // Real-time search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [categoryResults, setCategoryResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isCategoryFallback, setIsCategoryFallback] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [dbCategories, setDbCategories] = useState([]);
  const searchDebounce = useRef(null);

  // Dynamic homepage states
  const [banners, setBanners] = useState([]);
  const [homeCategories, setHomeCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [combos, setCombos] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [isHomeLoading, setIsHomeLoading] = useState(true);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const bannerFlatListRef = useRef(null);
  const bannerIntervalRef = useRef(null);

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
    try {
      let updatedIds;
      let updatedItems;

      const storedIds = await AsyncStorage.getItem('sora_wishlist_ids');
      const storedItems = await AsyncStorage.getItem('sora_wishlist_items');

      let currentIds = storedIds ? JSON.parse(storedIds) : [];
      let currentItems = storedItems ? JSON.parse(storedItems) : [];

      const isFav = currentIds.includes(product.id);
      
      if (isFav) {
        updatedIds = currentIds.filter(id => id !== product.id);
        updatedItems = currentItems.filter(item => item.id.toString() !== product.id.toString());
        showCustomAlert(
          "YÊU THÍCH", 
          `Đã xóa sản phẩm:\n"${product.name}"\nkhỏi danh sách Yêu Thích thành công!`, 
          [{ text: "ĐỒNG Ý", style: "default" }]
        );
      } else {
        updatedIds = [...currentIds, product.id];
        
        // Map the product details correctly to the wishlist item structure
        const isDbProduct = !!product.thumbnail_image;
        const mappedProduct = {
          id: product.id.toString(),
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
      
      setWishlistIds(updatedIds);
      await AsyncStorage.setItem('sora_wishlist_ids', JSON.stringify(updatedIds));
      await AsyncStorage.setItem('sora_wishlist_items', JSON.stringify(updatedItems));
    } catch (e) {
      console.log('Error saving wishlist in HomeScreen:', e);
    }
  };

  const getProductDiscount = (prod) => {
    if (prod.discount) return prod.discount;
    if (prod.promotional_price > 0 && prod.base_price > 0) {
      const pct = Math.round(((prod.base_price - prod.promotional_price) / prod.base_price) * 100);
      return `-${pct}%`;
    }
    return null;
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

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/client/header-data`, {
        headers: { Accept: 'application/json' },
      });
      const result = await response.json();
      if (result.success) {
        setDbCategories(result.data.categories || []);
      }
    } catch (e) {
      console.log('Error fetching categories from DB:', e);
    }
  };

  const fetchHomeData = async () => {
    setIsHomeLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/client/home-data`, {
        headers: { Accept: 'application/json' },
      });
      const result = await response.json();
      if (result.success) {
        setBanners(result.data.banners || []);
        setHomeCategories(result.data.categories || []);
        setBestSellers(result.data.products || []);
        setNewsList(result.data.news || []);
        setCoupons(result.data.coupons || []);
        setCombos(result.data.combos || []);
        setTiers(result.data.tiers || []);
      }
    } catch (e) {
      console.log('Error fetching home data:', e);
    } finally {
      setIsHomeLoading(false);
    }
  };

  const handleSelectNews = (article) => {
    showCustomAlert(
      "BÀI VIẾT SORA",
      `"${article.title}"\n\nTác giả: SORA Jewelry\n\nNội dung chi tiết bài viết đang được đồng bộ tải lên ứng dụng di động.`,
      [{ text: "ĐỒNG Ý", style: "default" }]
    );
  };

  const loadWishlist = async () => {
    try {
      const stored = await AsyncStorage.getItem('sora_wishlist_ids');
      if (stored) {
        setWishlistIds(JSON.parse(stored));
      }
    } catch (e) {
      console.log('Error loading wishlist ids in HomeScreen:', e);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchHomeData();
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
    navigation.navigate("ProductDetail", { slug: prod.slug });
  };

  const handleSelectCategory = (cat) => {
    setShowSearchResults(false);
    showCustomAlert(
      "SORA JEWELRY",
      `Bạn vừa chọn lọc danh mục:\n"${cat.name}"\n\nTính năng hiển thị sản phẩm theo danh mục đang được phát triển.`,
      [{ text: "ĐỒNG Ý", style: "default" }]
    );
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    setShowSearchResults(false);
    showCustomAlert(
      "SORA JEWELRY",
      `Tìm kiếm từ khóa: "${searchQuery}"\n\nDanh mục lọc: "${selectedCategory}"\n\nĐã lọc danh sách sản phẩm thành công!`,
      [{ text: "ĐỒNG Ý", style: "default" }]
    );
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  }, [selectedCategory]);

  // Gold prices state
  const [isGoldModalVisible, setIsGoldModalVisible] = useState(false);
  const [goldPrices, setGoldPrices] = useState([]);
  const [goldLastUpdated, setGoldLastUpdated] = useState('');
  const [isGoldLoading, setIsGoldLoading] = useState(false);
  const [goldError, setGoldError] = useState(null);

  // Drag animation for gold prices modal
  const goldTranslateY = useRef(new Animated.Value(SCREEN_H)).current;

  const fetchGoldPrices = async () => {
    setIsGoldLoading(true);
    setGoldError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/client/gold-prices`, {
        headers: { Accept: 'application/json' },
      });
      const result = await response.json();
      if (result.success) {
        setGoldPrices(result.data.prices || []);
        setGoldLastUpdated(result.data.last_updated || '');
      } else {
        setGoldError(result.message || 'Lỗi tải giá vàng từ hệ thống.');
      }
    } catch (e) {
      console.log('Error fetching gold prices:', e);
      setGoldError('Không thể kết nối đến máy chủ SORA. Vui lòng kiểm tra mạng!');
    } finally {
      setIsGoldLoading(false);
    }
  };

  // Open modal with slide up animation
  const openGoldModal = () => {
    setIsGoldModalVisible(true);
    goldTranslateY.setValue(SCREEN_H);
    fetchGoldPrices();
    Animated.spring(goldTranslateY, {
      toValue: 0,
      damping: 22,
      stiffness: 130,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  // Close modal with slide down animation
  const closeGoldModal = () => {
    Animated.timing(goldTranslateY, {
      toValue: SCREEN_H,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsGoldModalVisible(false);
    });
  };

  const goldPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        const clampedY = Math.max(0, gestureState.dy);
        goldTranslateY.setValue(clampedY);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          closeGoldModal();
        } else {
          Animated.spring(goldTranslateY, {
            toValue: 0,
            damping: 22,
            stiffness: 130,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

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
        await AsyncStorage.multiRemove(['auth_token', 'user']);
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (e) {
      console.log('Error loading user in HomeScreen:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([loadUser(), fetchHomeData()]).finally(() => setRefreshing(false));
  }, [loadUser]);

  const toggleMenu = () => {
    if (isMenuOpen) {
      Animated.timing(slideAnim, {
        toValue: -width * 0.8,
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
        toValue: -width * 0.8,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsMenuOpen(false));
    }
  };

  const renderProduct = ({ item }) => {
    const isDbProduct = !!item.thumbnail_image;
    const imageUrl = isDbProduct ? getStorageUrl(item.thumbnail_image) : item.image;
    const name = item.name;
    const category = isDbProduct ? (item.category?.name || 'Trang Sức SORA') : item.category;
    
    const discountText = getProductDiscount(item);
    const hasDiscount = !!discountText;

    const oldPriceText = isDbProduct 
      ? (item.promotional_price > 0 ? formatCurrency(item.base_price) : null)
      : item.oldPrice;

    const newPriceText = isDbProduct 
      ? formatCurrency(item.promotional_price > 0 ? item.promotional_price : item.base_price)
      : item.price;

    const isFav = wishlistIds.includes(item.id);

    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => handleSelectProduct(item)}
        activeOpacity={0.9}
      >
        {/* Discount Badge */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountText}</Text>
          </View>
        )}

        <Image source={{ uri: imageUrl }} style={styles.productImage} />

        <View style={styles.productInfo}>
          <View style={styles.productTopDetails}>
            <Text style={styles.productName} numberOfLines={2}>{name}</Text>
            <Text style={styles.productCategory} numberOfLines={1}>{category}</Text>
          </View>
          
          <View style={styles.productBottomDetails}>
            {oldPriceText ? (
              <Text style={styles.oldPrice} numberOfLines={1}>{oldPriceText}</Text>
            ) : (
              <View style={{ height: 16 }} />
            )}
            
            <Text 
              style={styles.newPrice} 
              numberOfLines={1} 
              adjustsFontSizeToFit={true} 
              minimumFontScale={0.8}
            >
              {newPriceText}
            </Text>

            <View style={styles.productFooter}>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star, index) => (
                  <Ionicons 
                    key={star}
                    name={index < (item.rating || 5) ? "star" : "star-outline"} 
                    size={11} 
                    color="#f1c40f" 
                  />
                ))}
              </View>
              <TouchableOpacity onPress={(e) => {
                e.stopPropagation();
                handleToggleWishlist(item);
              }}>
                <Ionicons 
                  name={isFav ? "heart" : "heart-outline"} 
                  size={18} 
                  color={isFav ? "#9f273b" : "#999"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isHomeLoading && !refreshing && banners.length === 0) {
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
                            <Image
                              source={{ uri: getStorageUrl(prod.thumbnail_image) }}
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
          <TouchableOpacity style={styles.topTabItem}>
            <Text style={styles.topTabText}>XU HƯỚNG</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.topTabItem, styles.topTabItemActive]}>
            <Text style={[styles.topTabText, styles.topTabTextActive]}>TRANG CHỦ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topTabItem}>
            <Text style={styles.topTabText}>BỘ SƯU TẬP</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BODY SECTION */}
      <ScrollView
        style={styles.bodyContainer}
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
        <View style={styles.bannerSection}>
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
              { length: width, offset: width * index, index }
            )}
            renderItem={({ item }) => {
              const imgUrl = item.image_mobile ? getBannerUrl(item) : (item.image || getBannerUrl(item));
              return (
                <View style={styles.bannerSlideWrapper}>
                  <Image 
                    source={{ uri: imgUrl }} 
                    style={styles.heroBannerImage} 
                  />
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
            {(banners.length > 0 ? banners : BANNERS).map((b, idx) => (
              <View 
                key={b.id.toString()} 
                style={[
                  styles.dot, 
                  idx === activeBannerIndex && styles.dotActive
                ]} 
              />
            ))}
          </View>
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
                          {coupon.discount_type === 'percent' 
                            ? coupon.discount_value 
                            : coupon.discount_value >= 1000000 
                              ? (coupon.discount_value / 1000000) + 'Tr'
                              : coupon.discount_value >= 1000 
                                ? (coupon.discount_value / 1000) + 'K'
                                : coupon.discount_value
                          }
                        </Text>
                        <Text style={styles.couponUnit}>
                          {coupon.discount_type === 'percent' ? '%' : '₫'}
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

        {/* Categories Section */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>DANH MỤC</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
            {(homeCategories.length > 0 ? homeCategories : CATEGORIES).map((cat) => (
              <TouchableOpacity 
                key={cat.id.toString()} 
                style={styles.categoryItem} 
                onPress={() => handleSelectCategory(cat)}
              >
                <View style={styles.categoryCircle}>
                  <Image 
                    source={{ uri: cat.image ? getStorageUrl(cat.image) : (cat.icon || 'https://images.unsplash.com/photo-1605100804763-247f67b854d4?q=80&w=300') }} 
                    style={styles.categoryImage} 
                  />
                  <View style={styles.categoryOverlay} />
                </View>
                <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Brand Story / Artistic Section */}
        <View style={styles.brandStoryContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1589674781759-c21c37956a44?q=80&w=800&auto=format&fit=crop' }} 
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
            data={bestSellers.length > 0 ? bestSellers : BEST_SELLERS}
            renderItem={renderProduct}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        </View>

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
            >
              {combos.map((combo) => (
                <View key={combo.id.toString()} style={styles.comboCard}>
                  <Image 
                    source={{ uri: getStorageUrl(combo.thumbnail_image || combo.image) }} 
                    style={styles.comboCardImg}
                  />
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
                      onPress={() => showCustomAlert(
                        "SORA JEWELRY", 
                        `Bạn vừa chọn xem bộ sưu tập:\n"${combo.name}"\n\nTính năng xem chi tiết bộ sưu tập giới hạn đang được cập nhật.`, 
                        [{ text: "ĐỒNG Ý", style: "default" }]
                      )}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.comboDetailBtnTxt}>KHÁM PHÁ NGAY</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Privilege Club Membership Section */}
        <View style={styles.membershipSectionContainer}>
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
            const dateText = isDbNews ? formatDateString(article.created_at) : article.date;

            return (
              <TouchableOpacity 
                key={article.id.toString()} 
                style={styles.newsCard}
                onPress={() => handleSelectNews(article)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: imgUrl }} style={styles.newsCardImage} />
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

      {/* SIDE MENU (DRAWER OVERLAY) */}
      {isMenuOpen && (
        <View style={styles.menuOverlayWrapper}>
          <TouchableWithoutFeedback onPress={toggleMenu}>
            <View style={styles.menuOverlay} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
            <SafeAreaView style={{ flex: 1 }}>
              {/* Menu Header */}
              <View style={styles.menuHeader}>
                <Image source={require('../../assets/logo1.png')} style={styles.menuLogo} resizeMode="contain" />
                <TouchableOpacity onPress={toggleMenu} style={styles.menuCloseBtn}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.menuBody} showsVerticalScrollIndicator={false}>
                {/* User Section */}
                {isLoggedIn ? (() => {
                  const theme = getTierTheme(user?.tier?.name);
                  return (
                    <TouchableOpacity
                      style={[
                        styles.heroCard,
                        {
                          backgroundColor: theme.bg,
                          borderColor: theme.border,
                          shadowColor: theme.border,
                        }
                      ]}
                      activeOpacity={0.8}
                      onPress={() => {
                        toggleMenu();
                        navigation.navigate('Profile');
                      }}
                    >
                      <View style={[styles.heroAvatarWrap, { borderColor: theme.avatarBorder }]}>
                        <Image
                          source={{
                            uri: user?.avatar_url
                              ? getStorageUrl(user.avatar_url)
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=9f273b&color=fff&size=200`
                          }}
                          style={styles.heroAvatar}
                        />
                      </View>
                      <View style={styles.heroInfo}>
                        <Text style={[styles.heroName, { color: theme.nameColor }]} numberOfLines={1}>
                          {user?.fullName || 'Thành viên SORA'}
                        </Text>
                        <Text style={[styles.heroEmail, { color: theme.labelColor }]} numberOfLines={1}>
                          {user?.email}
                        </Text>
                        <TierBadge tierName={user?.tier?.name} />
                      </View>
                    </TouchableOpacity>
                  );
                })() : (
                  <TouchableOpacity
                    style={styles.menuUserSection}
                    onPress={() => {
                      toggleMenu();
                      navigation.navigate('Login');
                    }}
                  >
                    <View style={styles.menuAvatar}>
                      <Ionicons name="person" size={30} color="#9f273b" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuUserName}>Đăng nhập / Đăng ký</Text>
                      <Text style={styles.menuUserSub}>Nhận ưu đãi hạng thành viên</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#ccc" />
                  </TouchableOpacity>
                )}

                {/* Menu Items */}
                <View style={styles.menuSection}>
                  <Text style={styles.menuSectionTitle}>KHÁM PHÁ</Text>
                  <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="diamond-outline" size={22} color="#555" style={styles.menuItemIcon} />
                    <Text style={styles.menuItemText}>Cửa hàng Trang sức</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="sparkles-outline" size={22} color="#555" style={styles.menuItemIcon} />
                    <Text style={styles.menuItemText}>Bộ Sưu Tập Giới Hạn</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      closeMenu();
                      openGoldModal();
                    }}
                  >
                    <MaterialCommunityIcons name="gold" size={22} color="#555" style={styles.menuItemIcon} />
                    <Text style={styles.menuItemText}>Bảng Giá Vàng</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.menuSection}>
                  <Text style={styles.menuSectionTitle}>HỖ TRỢ & DỊCH VỤ</Text>
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      closeMenu();
                      navigation.navigate('About');
                    }}
                  >
                    <Ionicons name="information-circle-outline" size={22} color="#555" style={styles.menuItemIcon} />
                    <Text style={styles.menuItemText}>Về SORA</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      closeMenu();
                      navigation.navigate('Warranty');
                    }}
                  >
                    <Ionicons name="shield-checkmark-outline" size={22} color="#555" style={styles.menuItemIcon} />
                    <Text style={styles.menuItemText}>Chính sách bảo hành</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      closeMenu();
                      navigation.navigate('ContactCSKH');
                    }}
                  >
                    <Ionicons name="call-outline" size={22} color="#555" style={styles.menuItemIcon} />
                    <Text style={styles.menuItemText}>Liên hệ CSKH</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <View style={styles.menuFooter}>
                <Text style={styles.menuFooterText}>SORA JEWELRY v1.0.0</Text>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      )}

      {/* Premium Gold Price Modal */}
      <Modal
        visible={isGoldModalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={closeGoldModal}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop Sibling */}
          <TouchableWithoutFeedback onPress={closeGoldModal}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          <Animated.View 
            style={[
              styles.goldModalContent,
              { transform: [{ translateY: goldTranslateY }] }
            ]}
          >
            {/* Header section (Draggable) */}
            <View style={styles.goldHeader} {...goldPanResponder.panHandlers}>
              <View style={styles.goldHeaderIndicator} />
              <View style={styles.goldHeaderTitleRow}>
                <Ionicons name="diamond-outline" size={22} color="#e7ce7d" style={{ marginRight: 8 }} />
                <Text style={styles.goldHeaderTitle}>BẢNG GIÁ VÀNG HÔM NAY</Text>
              </View>
              <View style={styles.goldDivider} />
              <Text style={styles.goldSubtitle}>Niêm Yết Hệ Thống SORA Jewelry</Text>
              
              <View style={styles.goldUpdateTimeRow}>
                <Ionicons name="time-outline" size={14} color="#e7ce7d" style={{ marginRight: 4 }} />
                <Text style={styles.goldUpdateTime}>
                  Cập nhật lúc: {goldLastUpdated || (isGoldLoading ? 'Đang tải...' : 'Chưa cập nhật')}
                </Text>
              </View>
            </View>

            {/* Content body */}
            <View style={styles.goldBody}>
              {isGoldLoading ? (
                <View style={styles.goldLoadingContainer}>
                  <ActivityIndicator size="large" color="#e7ce7d" />
                  <Text style={styles.goldLoadingText}>Đang kết nối kho dữ liệu SORA Jewelry...</Text>
                </View>
              ) : goldError ? (
                <View style={styles.goldErrorContainer}>
                  <Ionicons name="alert-circle-outline" size={48} color="#9f273b" />
                  <Text style={styles.goldErrorText}>{goldError}</Text>
                  <TouchableOpacity style={styles.goldRetryButton} onPress={fetchGoldPrices}>
                    <Text style={styles.goldRetryButtonText}>TẢI LẠI DỮ LIỆU</Text>
                  </TouchableOpacity>
                </View>
              ) : goldPrices.length === 0 ? (
                <View style={styles.goldErrorContainer}>
                  <Ionicons name="information-circle-outline" size={48} color="#e7ce7d" />
                  <Text style={styles.goldErrorText}>Tạm thời chưa có dữ liệu giá vàng. Vui lòng quay lại sau!</Text>
                  <TouchableOpacity style={styles.goldRetryButton} onPress={fetchGoldPrices}>
                    <Text style={styles.goldRetryButtonText}>THỬ LẠI</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={goldPrices}
                  keyExtractor={(item, index) => index.toString()}
                  ListHeaderComponent={() => (
                    <View style={styles.tableHeaderRow}>
                      <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: 'left', paddingLeft: 12 }]}>LOẠI VÀNG</Text>
                      <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>MUA VÀO</Text>
                      <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center', paddingRight: 12 }]}>BÁN RA</Text>
                    </View>
                  )}
                  renderItem={({ item, index }) => (
                    <View style={[
                      styles.tableDataRow,
                      { backgroundColor: index % 2 === 0 ? '#ffffff' : '#faf8f5' }
                    ]}>
                      <Text style={[styles.tableDataCellName, { flex: 2, textAlign: 'left', paddingLeft: 12 }]} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text style={[styles.tableDataCellPriceBuy, { flex: 1, textAlign: 'center' }]}>
                        {item.buy}
                      </Text>
                      <Text style={[styles.tableDataCellPriceSell, { flex: 1, textAlign: 'center', paddingRight: 12 }]}>
                        {item.sell}
                      </Text>
                    </View>
                  )}
                  contentContainerStyle={{ paddingBottom: 15 }}
                />
              )}
            </View>

            {/* Footer / Notes */}
            <View style={styles.goldFooter}>
              <View style={styles.goldInfoItem}>
                <Ionicons name="information-circle-outline" size={13} color="#e7ce7d" style={{ marginRight: 4 }} />
                <Text style={styles.goldFooterNote}>Đơn vị tính: Nghìn VNĐ / Chỉ.</Text>
              </View>
              <View style={styles.goldInfoItem}>
                <Ionicons name="shield-checkmark-outline" size={13} color="#e7ce7d" style={{ marginRight: 4, marginTop: 2 }} />
                <Text style={[styles.goldFooterNote, { fontStyle: 'italic', flex: 1 }]}>
                  Bảng giá chỉ mang tính chất tham khảo trực tuyến. Vui lòng liên hệ SORA Jewelry để chốt giao dịch.
                </Text>
              </View>

              {/* Close Button */}
              <TouchableOpacity style={styles.goldCloseBtn} onPress={closeGoldModal}>
                <Text style={styles.goldCloseBtnText}>ĐÓNG BẢNG GIÁ</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // Match header color for safe area
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingTop: 10,
    zIndex: 100,
    elevation: 10,
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
    height: 55, // Tăng kích thước logo
    width: 220,

  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 15,
    height: 40,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
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
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingTop: 10,
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
    color: '#333',
    fontFamily: 'Oswald_500Medium',
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  bannerSection: {
    backgroundColor: '#fff',
    paddingBottom: 15,
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingTop: 15,
    paddingBottom: 18,
    paddingHorizontal: 15,
    marginTop: 10,
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
    width: width,
    height: width * 0.75,
    resizeMode: 'cover',
  },
  bannerSlideWrapper: {
    width: width,
    height: width * 0.75,
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
    fontSize: 20,
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
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: '#9f273b',
    width: 15,
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
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 26,
    color: '#9f273b',
    fontWeight: 'bold',
  },
  couponUnit: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 14,
    color: '#9f273b',
    marginLeft: 1,
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
    width: width,
    height: 280,
    position: 'relative',
    backgroundColor: '#000',
    marginTop: 10,
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
    paddingLeft: 15,
    paddingRight: 10,
    gap: 14,
    paddingVertical: 5,
  },
  comboCard: {
    width: 280,
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
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 15,
    color: '#9f273b',
    fontWeight: 'bold',
    marginRight: 10,
  },
  comboBasePrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'through',
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
    width: width,
    backgroundColor: '#111',
    paddingVertical: 32,
    position: 'relative',
    alignItems: 'center',
    marginTop: 10,
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
    backgroundColor: '#f9f9f9',
    marginTop: 10,
    paddingBottom: 10,
  },
  newsSectionHeader: {
    paddingHorizontal: 15,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 5,
    backgroundColor: '#f9f9f9',
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
  productCard: {
    width: 165,
    backgroundColor: '#fff',
    marginHorizontal: 5,
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
  productImage: {
    width: '100%',
    height: 155,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 140, // Fixed height area to guarantee that stars, heart icons, and prices align across cards
  },
  productTopDetails: {
    marginBottom: 4,
  },
  productBottomDetails: {
    marginTop: 'auto',
  },
  productName: {
    fontSize: 12,
    fontFamily: 'Oswald_500Medium',
    textTransform: 'uppercase',
    color: '#333',
    lineHeight: 16,
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 10.5,
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    color: '#888',
    marginTop: 0,
    marginBottom: 2,
  },
  oldPrice: {
    fontSize: 10.5,
    fontFamily: 'PlayfairDisplay_400Regular',
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 1,
  },
  newPrice: {
    fontSize: 14.5,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#9f273b', // Red price matching website
    marginBottom: 6,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 1,
  },
  menuOverlayWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    flexDirection: 'row',
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    width: width * 0.8,
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuLogo: {
    height: 40,
    width: 150,
  },
  menuCloseBtn: {
    padding: 5,
  },
  menuBody: {
    flex: 1,
  },
  menuUserSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fbf9f6',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e7ce7d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuUserName: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#333',
    marginBottom: 4,
  },
  menuUserSub: {
    fontSize: 12,
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    color: '#9f273b',
  },
  menuSection: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuSectionTitle: {
    fontSize: 12,
    fontFamily: 'Oswald_500Medium',
    color: '#999',
    letterSpacing: 1.5,
    paddingHorizontal: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuItemIcon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  menuItemText: {
    fontSize: 14,
    fontFamily: 'Oswald_400Regular',
    color: '#333',
  },
  menuFooter: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  menuFooterText: {
    fontSize: 11,
    fontFamily: 'Oswald_400Regular',
    color: '#aaa',
    letterSpacing: 1,
  },

  // Hero Card (Logged in)
  heroCard: {
    backgroundColor: '#fffdf6',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ebd5a3',
    shadowColor: '#ebd5a3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 10,
  },
  heroAvatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ebd5a3',
    overflow: 'hidden',
    marginRight: 12,
  },
  heroAvatar: {
    width: '100%',
    height: '100%',
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 2,
  },
  heroEmail: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 11,
    color: '#888',
    marginBottom: 6,
  },

  // Tier Badge (small pill)
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  tierBadgeTxt: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 10,
    letterSpacing: 0.5,
  },

  // Modal gold prices styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  goldModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SCREEN_H * 0.85,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
  },
  goldHeader: {
    backgroundColor: '#9f273b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#e7ce7d',
  },
  goldHeaderIndicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 10,
  },
  goldHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  goldHeaderTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: '#ffffff',
    letterSpacing: 1,
  },
  goldDivider: {
    width: 40,
    height: 1,
    backgroundColor: '#e7ce7d',
    marginVertical: 6,
  },
  goldSubtitle: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 12,
    color: '#e7ce7d',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  goldUpdateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  goldUpdateTime: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 11,
    color: '#fff',
    letterSpacing: 0.5,
  },
  goldBody: {
    flex: 1,
    backgroundColor: '#fffdf9', // Ivory cream background
  },
  goldLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  goldLoadingText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 14,
    color: '#e7ce7d',
    marginTop: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  goldErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  goldErrorText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    lineHeight: 20,
  },
  goldRetryButton: {
    backgroundColor: '#9f273b',
    borderWidth: 1,
    borderColor: '#e7ce7d',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 2,
  },
  goldRetryButtonText: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 13,
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f6f4ef',
    borderBottomWidth: 1,
    borderBottomColor: '#e7ce7d',
    paddingVertical: 12,
    alignItems: 'center',
  },
  tableHeaderCell: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 12,
    color: '#666',
    letterSpacing: 0.8,
  },
  tableDataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(231, 206, 125, 0.15)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  tableDataCellName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 14,
    color: '#222',
  },
  tableDataCellPriceBuy: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 15,
    color: '#1e7e34', // Green for buying
    letterSpacing: 0.5,
  },
  tableDataCellPriceSell: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 15,
    color: '#c82333', // Red for selling
    letterSpacing: 0.5,
  },
  goldFooter: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    padding: 16,
  },
  goldInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  goldFooterNote: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#888',
    lineHeight: 16,
  },
  goldCloseBtn: {
    backgroundColor: '#9f273b',
    borderWidth: 1,
    borderColor: '#e7ce7d',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
    borderRadius: 2,
  },
  goldCloseBtnText: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 14,
    color: '#ffffff',
    letterSpacing: 2,
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
    fontFamily: 'Oswald_600SemiBold',
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
