import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Platform,
  Modal
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import { showCustomAlert } from '../components/CustomAlert';

const { width, height: SCREEN_H } = Dimensions.get('window');

// Helper to format currency
const formatCurrency = (v) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v) || 0);

// Helper to format review image URLs
const getReviewImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL.replace('/api', '')}/storage/${url}`;
};

// Luxury HTML Parser Component for SORA Product Description
const renderLuxuryHTML = (html) => {
  if (!html) return null;

  // 1. Normalize common HTML character entities
  let clean = html
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');

  // 2. Insert delimiters to identify block segments
  clean = clean
    .replace(/<\/h[1-6]>/gi, '|||HEADER|||')
    .replace(/<\/p>/gi, '|||PARA|||')
    .replace(/<\/div>/gi, '|||PARA|||')
    .replace(/<\/li>/gi, '|||LIST|||')
    .replace(/<br\s*\/?>/gi, '\n');

  // Strip other open/close block-level tags that we just converted
  clean = clean.replace(/<h[1-6][^>]*>/gi, '')
               .replace(/<p[^>]*>/gi, '')
               .replace(/<div[^>]*>/gi, '')
               .replace(/<ul[^>]*>/gi, '')
               .replace(/<ol[^>]*>/gi, '')
               .replace(/<li[^>]*>/gi, '')
               .replace(/<\/ul>/gi, '')
               .replace(/<\/ol>/gi, '');

  // Split by block delimiters
  const blockParts = clean.split(/(\|\|\|[A-Z]+\|\|\|)/g);
  
  const blocks = [];
  let nextType = 'PARA'; // default

  blockParts.forEach(part => {
    if (part === '|||HEADER|||') {
      nextType = 'HEADER';
    } else if (part === '|||PARA|||') {
      nextType = 'PARA';
    } else if (part === '|||LIST|||') {
      nextType = 'LIST';
    } else if (part.startsWith('|||') && part.endsWith('|||')) {
      nextType = 'PARA';
    } else {
      const trimmed = part.trim();
      if (trimmed) {
        blocks.push({
          type: nextType,
          text: part
        });
      }
    }
  });

  if (blocks.length === 0 && clean.trim()) {
    blocks.push({ type: 'PARA', text: clean });
  }

  // 3. Map inline formats and render native elements
  return (
    <View style={s.htmlContainer}>
      {blocks.map((block, bIdx) => {
        const inlineRegex = /(<[^>]+>)/g;
        const inlineParts = block.text.split(inlineRegex);
        
        let currentTags = [];
        const inlineSpans = [];

        inlineParts.forEach(part => {
          if (part.startsWith('<') && part.endsWith('>')) {
            const isClosing = part.startsWith('</');
            const tagMatch = part.match(/<\/?([a-zA-Z0-9]+)/);
            const tagName = tagMatch ? tagMatch[1].toLowerCase() : '';
            
            if (isClosing) {
              currentTags = currentTags.filter(t => t !== tagName);
            } else {
              if (part.endsWith('/>')) {
                // skip self-closing
              } else {
                currentTags.push(tagName);
              }
            }
          } else {
            if (part) {
              inlineSpans.push({
                text: part,
                tags: [...currentTags]
              });
            }
          }
        });

        let blockStyle = s.htmlParaBlock;
        let baseTextStyle = s.htmlParaText;

        if (block.type === 'HEADER') {
          blockStyle = s.htmlHeaderBlock;
          baseTextStyle = s.htmlHeaderText;
        } else if (block.type === 'LIST') {
          blockStyle = s.htmlListBlock;
          baseTextStyle = s.htmlListText;
        }

        return (
          <View key={bIdx} style={blockStyle}>
            {block.type === 'LIST' && (
              <Text style={s.htmlListBullet}>•</Text>
            )}
            <Text style={baseTextStyle}>
              {inlineSpans.map((span, sIdx) => {
                const isBold = span.tags.includes('strong') || span.tags.includes('b');
                const isItalic = span.tags.includes('em') || span.tags.includes('i');
                
                let spanStyle = {};
                if (isBold) {
                  spanStyle.fontFamily = 'PlayfairDisplay_700Bold';
                  spanStyle.color = '#9f273b'; // elegant burgundy accent for headers/bold text
                  spanStyle.fontWeight = 'bold';
                }
                if (isItalic) {
                  spanStyle.fontFamily = 'PlayfairDisplay_400Regular_Italic';
                  spanStyle.fontStyle = 'italic';
                }

                return (
                  <Text key={sIdx} style={spanStyle}>
                    {span.text}
                  </Text>
                );
              })}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default function ProductDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { slug } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Gallery Swiper State
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Selected attributes map: e.g. { "SIZE": 1, "MÀU SẮC": 3 }
  const [selectedAttrs, setSelectedAttrs] = useState({});

  // Favorites state
  const [isFavorite, setIsFavorite] = useState(false);

  // Quantity selection state
  const [quantity, setQuantity] = useState(1);

  // Zoomed review image state
  const [zoomImageUrl, setZoomImageUrl] = useState(null);

  // Load product details
  const fetchProductDetail = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/shop/sora/products/${slug}`, {
        headers: { Accept: 'application/json' },
      });
      const result = await response.json();
      if (result.success) {
        setProduct(result.data);
        
        // Auto-select first in-stock variant attributes
        if (result.data.variants && result.data.variants.length > 0) {
          const firstInStock = result.data.variants.find(v => v.stock > 0) || result.data.variants[0];
          if (firstInStock && firstInStock.attributes) {
            setSelectedAttrs(firstInStock.attributes);
          }
        }
        
        // Fetch related products of the same category
        if (result.data.category && result.data.category.slug) {
          fetchRelatedProducts(result.data.category.slug);
        }
      } else {
        showCustomAlert("SORA JEWELRY", "Không tìm thấy thông tin sản phẩm.", [{ text: "QUAY LẠI", onPress: () => navigation.goBack() }]);
      }
    } catch (e) {
      console.log('Error fetching product details:', e);
      showCustomAlert("SORA JEWELRY", "Lỗi kết nối máy chủ.", [{ text: "THỬ LẠI", onPress: () => fetchProductDetail() }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch related products
  const fetchRelatedProducts = async (catSlug) => {
    try {
      const response = await fetch(`${API_BASE_URL}/shop/sora/products?categories=${catSlug}&per_page=5`, {
        headers: { Accept: 'application/json' },
      });
      const result = await response.json();
      if (result.success && result.data && result.data.data) {
        // Exclude current product
        const filtered = result.data.data.filter(p => p.slug !== slug).slice(0, 4);
        setRelatedProducts(filtered);
      }
    } catch (e) {
      console.log('Error fetching related products:', e);
    }
  };

  // Check wishlist state
  const checkWishlistState = async () => {
    try {
      if (!product) return;
      const storedIds = await AsyncStorage.getItem('sora_wishlist_ids');
      if (storedIds) {
        const ids = JSON.parse(storedIds);
        setIsFavorite(ids.includes(product.id));
      }
    } catch (e) {
      console.log('Error checking wishlist state:', e);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchProductDetail();
  }, [slug]);

  useEffect(() => {
    if (product) {
      checkWishlistState();
    }
  }, [product]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProductDetail();
    setRefreshing(false);
  }, [slug]);

  // Handle Heart Press (Wishlist toggle)
  const handleToggleFavorite = async () => {
    if (!product) return;
    try {
      const storedIds = await AsyncStorage.getItem('sora_wishlist_ids');
      const storedItems = await AsyncStorage.getItem('sora_wishlist_items');

      let currentIds = storedIds ? JSON.parse(storedIds) : [];
      let currentItems = storedItems ? JSON.parse(storedItems) : [];

      const exists = currentIds.includes(product.id);
      let updatedIds;
      let updatedItems;

      if (exists) {
        updatedIds = currentIds.filter(id => id !== product.id);
        updatedItems = currentItems.filter(item => item.id.toString() !== product.id.toString());
        setIsFavorite(false);
        showCustomAlert("YÊU THÍCH", `Đã xóa sản phẩm khỏi danh sách yêu thích thành công!`, [{ text: "ĐỒNG Ý" }]);
      } else {
        updatedIds = [...currentIds, product.id];
        
        // Map product details
        const mappedProduct = {
          id: product.id.toString(),
          name: product.name,
          category: product.category?.name || 'Trang Sức SORA',
          variant: 'Bản Giới Hạn SORA',
          price: product.variants && product.variants.length > 0 
            ? (product.variants[0].promotional_price || product.variants[0].price)
            : 0,
          oldPrice: product.variants && product.variants.length > 0
            ? (product.variants[0].promotional_price ? product.variants[0].price : null)
            : null,
          image: product.images && product.images.length > 0 ? product.images[0] : ''
        };

        updatedItems = [...currentItems, mappedProduct];
        setIsFavorite(true);
        showCustomAlert("YÊU THÍCH", `Đã thêm sản phẩm vào danh sách yêu thích thành công!`, [{ text: "ĐỒNG Ý" }]);
      }

      await AsyncStorage.setItem('sora_wishlist_ids', JSON.stringify(updatedIds));
      await AsyncStorage.setItem('sora_wishlist_items', JSON.stringify(updatedItems));
    } catch (e) {
      console.log('Error toggling favorite:', e);
    }
  };

  // Advanced variant matching algorithm
  const getSelectedVariant = () => {
    if (!product || !product.variants || product.variants.length === 0) return null;
    return product.variants.find(v => {
      return Object.keys(selectedAttrs).every(key => {
        return v.attributes[key] === selectedAttrs[key];
      });
    });
  };

  // Stock constraint check to disable options dynamically
  const isOptionOutOfStock = (attrName, optId) => {
    if (!product || !product.variants || product.variants.length === 0) return false;

    // Checks if there is ANY variant that:
    // 1. Matches this option ID for this attribute type
    // 2. Matches other currently selected attribute types
    // 3. Has stock > 0
    const hasValidVariant = product.variants.some(v => {
      if (v.attributes[attrName] !== optId) return false;

      const matchesOthers = Object.keys(selectedAttrs).every(key => {
        if (key === attrName) return true; // ignore current
        return v.attributes[key] === selectedAttrs[key];
      });

      if (!matchesOthers) return false;
      return v.stock > 0;
    });

    return !hasValidVariant;
  };

  const handleSelectAttribute = (attrName, optId) => {
    setSelectedAttrs(prev => ({
      ...prev,
      [attrName]: optId
    }));
  };

  // Read auth token & guest session ID for API requests
  const getHeaders = async () => {
    const headers = { 'Accept': 'application/json' };
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      let sid = await AsyncStorage.getItem('cart_session_id');
      if (!sid && !token) { 
        sid = 'session_' + Math.random().toString(36).substr(2, 9);
        await AsyncStorage.setItem('cart_session_id', sid);
      }
      if (sid) {
        headers['X-Cart-Session-Id'] = sid;
      }
    } catch (e) {
      console.log('Error getting headers:', e);
    }
    return headers;
  };

  // Add selected variant to cart
  const handleAddToCart = async () => {
    const selectedVariant = getSelectedVariant();
    if (!selectedVariant) {
      showCustomAlert("VUI LÒNG CHỌN", "Vui lòng chọn đầy đủ thuộc tính sản phẩm!");
      return;
    }

    if (selectedVariant.stock <= 0) {
      showCustomAlert("HẾT HÀNG", "Phiên bản thuộc tính này hiện đã hết hàng!");
      return;
    }

    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/client/cart`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_variant_id: selectedVariant.id,
          quantity: quantity
        })
      });

      const result = await response.json();
      
      if (result.success || result.session_id) {
        // Save guest session ID if returned and not logged in
        if (result.session_id) {
          await AsyncStorage.setItem('cart_session_id', result.session_id);
        }

        showCustomAlert(
          "GIỎ HÀNG SORA",
          `Đã thêm sản phẩm:\n"${product.name}"\nvào giỏ hàng thành công!`,
          [
            { 
              text: "MUA TIẾP", 
              style: "cancel" 
            },
            { 
              text: "XEM GIỎ HÀNG", 
              onPress: () => navigation.navigate("MainTabs", { screen: "Cart" }) 
            }
          ]
        );
      } else {
        const errorMsg = result.message || "Không thể thêm vào giỏ hàng.";
        showCustomAlert("LỖI GIỎ HÀNG", errorMsg);
      }
    } catch (e) {
      console.log('Error adding to cart:', e);
      showCustomAlert("LỖI KẾT NỐI", "Không thể kết nối tới máy chủ.");
    }
  };

  if (isLoading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color="#9f273b" />
        <Text style={s.loadingText}>Đang tải tuyệt tác SORA...</Text>
      </View>
    );
  }

  const selectedVariant = getSelectedVariant();
  const currentPrice = selectedVariant 
    ? (selectedVariant.promotional_price > 0 ? selectedVariant.promotional_price : selectedVariant.price)
    : 0;
  const currentOldPrice = selectedVariant && selectedVariant.promotional_price > 0 ? selectedVariant.price : null;
  const currentStock = selectedVariant ? selectedVariant.stock : 0;
  const isOutOfStock = currentStock <= 0;

  // Dynamically compute real review counts and averages to avoid caching errors
  const reviewsCount = product.reviews ? product.reviews.length : 0;
  const ratingAvg = reviewsCount > 0 
    ? (product.reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviewsCount) 
    : (Number(product.rating_avg) || 0);

  // Swiper rendering
  const imagesToRender = product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=800'];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* CUSTOM FLOATING HEADER BAR */}
      <View style={s.headerContainer}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>

        <Text style={s.headerTitle} numberOfLines={1}>{product.name}</Text>

        <View style={s.headerRightActions}>
          <TouchableOpacity style={s.headerBtn} onPress={handleToggleFavorite}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color={isFavorite ? "#9f273b" : "#111"} />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn} onPress={() => navigation.navigate("MainTabs", { screen: "Cart" })}>
            <Ionicons name="cart-outline" size={22} color="#111" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#9f273b']} tintColor="#9f273b" />
        }
      >
        {/* 1. IMAGE GALLERY SWIPER */}
        <View style={s.galleryContainer}>
          <FlatList
            data={imagesToRender}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const offsetX = event.nativeEvent.contentOffset.x;
              const index = Math.round(offsetX / width);
              setActiveImageIndex(index);
            }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={s.galleryImg} />
            )}
          />
          {/* Swiper dots */}
          {imagesToRender.length > 1 && (
            <View style={s.dotsContainer}>
              {imagesToRender.map((_, idx) => (
                <View 
                  key={idx} 
                  style={[s.dot, idx === activeImageIndex && s.dotActive]} 
                />
              ))}
            </View>
          )}
        </View>

        {/* 2. PRODUCT MAIN INFO */}
        <View style={s.mainInfoBlock}>
          <View style={s.brandCategoryRow}>
            <Text style={s.brandText}>{product.brand?.name || 'SORA Exclusive'}</Text>
            <View style={s.bulletPoint} />
            <Text style={s.categoryText}>{product.category?.name || 'Trang sức'}</Text>
          </View>
          
          <Text style={s.productNameText}>{product.name}</Text>

          {/* Review Stats (Real database count & stars) */}
          <View style={s.reviewsSummaryRow}>
            <View style={s.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons 
                  key={star} 
                  name={star <= Math.round(ratingAvg) ? "star" : "star-outline"} 
                  size={14} 
                  color="#f1c40f" 
                />
              ))}
            </View>
            <Text style={s.reviewsCountText}>
              {ratingAvg.toFixed(1)}/5.0 ({reviewsCount} Đánh giá thực)
            </Text>
            <View style={s.verticalDivider} />
            <Text style={s.reviewsCountText}>Đã bán 1.5K+</Text>
          </View>

          {/* Pricing Block */}
          <View style={s.pricingContainer}>
            <Text style={s.promoPrice}>{formatCurrency(currentPrice)}</Text>
            {currentOldPrice && (
              <Text style={s.basePrice}>{formatCurrency(currentOldPrice)}</Text>
            )}
            {currentOldPrice && (
              <View style={s.discountPercentBadge}>
                <Text style={s.discountPercentText}>
                  -{Math.round(((currentOldPrice - currentPrice) / currentOldPrice) * 100)}%
                </Text>
              </View>
            )}
          </View>
          
          {/* Stock Availability */}
          <View style={s.stockContainer}>
            <Ionicons 
              name={isOutOfStock ? "close-circle" : "checkmark-circle"} 
              size={16} 
              color={isOutOfStock ? "#cc1e2e" : "#2ecc71"} 
            />
            <Text style={[s.stockText, isOutOfStock && { color: "#cc1e2e" }]}>
              {isOutOfStock ? "Phiên bản này đã Hết hàng" : `Còn lại: ${currentStock} sản phẩm trong kho`}
            </Text>
          </View>
        </View>

        {/* 3. MULTI-ATTRIBUTES SELECTION GRID */}
        {product.attributes && Object.keys(product.attributes).length > 0 && (
          <View style={s.sectionContainer}>
            <Text style={s.sectionTitle}>TÙY CHỌN SẢN PHẨM</Text>
            <View style={s.dividerGold} />
            
            {Object.keys(product.attributes).map((attrName) => (
              <View key={attrName} style={s.attrTypeContainer}>
                <Text style={s.attrTypeTitle}>{attrName}</Text>
                <View style={s.optionsGrid}>
                  {product.attributes[attrName].map((opt) => {
                    const isSelected = selectedAttrs[attrName] === opt.id;
                    const outOfStock = isOptionOutOfStock(attrName, opt.id);
                    
                    return (
                      <TouchableOpacity
                        key={opt.id.toString()}
                        style={[
                          s.optionButton,
                          isSelected && s.optionButtonActive,
                          outOfStock && s.optionButtonDisabled
                        ]}
                        onPress={() => !outOfStock && handleSelectAttribute(attrName, opt.id)}
                        disabled={outOfStock}
                        activeOpacity={0.8}
                      >
                        <Text style={[
                          s.optionText,
                          isSelected && s.optionTextActive,
                          outOfStock && s.optionTextDisabled
                        ]}>
                          {opt.name} {outOfStock && "(Hết hàng)"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 4. QUANTITY SELECTOR */}
        <View style={s.sectionContainer}>
          <Text style={s.sectionTitle}>SỐ LƯỢNG MUA</Text>
          <View style={s.dividerGold} />
          
          <View style={s.quantityRow}>
            <View style={s.quantityControl}>
              <TouchableOpacity 
                style={s.quantityBtn}
                onPress={() => quantity > 1 && setQuantity(prev => prev - 1)}
                disabled={isOutOfStock}
              >
                <Ionicons name="remove" size={16} color={isOutOfStock ? "#ccc" : "#111"} />
              </TouchableOpacity>
              <Text style={s.quantityValue}>{quantity}</Text>
              <TouchableOpacity 
                style={s.quantityBtn}
                onPress={() => quantity < currentStock && setQuantity(prev => prev + 1)}
                disabled={isOutOfStock || quantity >= currentStock}
              >
                <Ionicons name="add" size={16} color={isOutOfStock || quantity >= currentStock ? "#ccc" : "#111"} />
              </TouchableOpacity>
            </View>
            
            <Text style={s.quantitySubInfo}>
              (Số lượng tối đa: {currentStock})
            </Text>
          </View>
        </View>

        {/* 5. PRODUCT DESCRIPTION */}
        {product.description && (
          <View style={s.sectionContainer}>
            <Text style={s.sectionTitle}>CHI TIẾT MÔ TẢ</Text>
            <View style={s.dividerGold} />
            {renderLuxuryHTML(product.description)}
          </View>
        )}

        {/* 6. REAL REVIEWS SECTION */}
        <View style={s.sectionContainer}>
          <Text style={s.sectionTitle}>ĐÁNH GIÁ THỰC TẾ ({reviewsCount})</Text>
          <View style={s.dividerGold} />
          
          {/* Reviews Overview Box (Web-App style) */}
          {product.reviews && product.reviews.length > 0 && (
            <View style={s.reviewsOverview}>
              <View style={s.overviewLeft}>
                <Text style={s.overviewScore}>{Number(ratingAvg).toFixed(1)}<Text style={{ fontSize: 13, color: '#999' }}>/5</Text></Text>
                <View style={s.overviewStars}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Ionicons 
                      key={n} 
                      name={n <= Math.round(ratingAvg) ? "star" : "star-outline"} 
                      size={15} 
                      color="#f1c40f" 
                    />
                  ))}
                </View>
                <Text style={s.overviewCount}>{reviewsCount} đánh giá thực</Text>
              </View>
              <View style={s.overviewRight}>
                <Text style={s.overviewQuote}>
                  "Những chia sẻ chân thực từ khách hàng đã trải nghiệm sự hoàn mỹ tại SORA."
                </Text>
              </View>
            </View>
          )}

          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <View key={rev.id.toString()} style={s.reviewCard}>
                <View style={s.reviewHeader}>
                  <Image 
                    source={{ uri: rev.user?.avatar_url 
                      ? getReviewImageUrl(rev.user.avatar_url) 
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.user?.fullName || 'K')}&background=9f273b&color=fff` }} 
                    style={s.reviewAvatar} 
                  />
                  <View style={s.reviewUserInfo}>
                    <View style={s.reviewUserRow}>
                      <Text style={s.reviewUsername}>{rev.user?.fullName || 'Khách hàng SORA'}</Text>
                      {/* Verified purchase badge */}
                      <View style={s.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={10} color="#2ecc71" style={{ marginRight: 2 }} />
                        <Text style={s.verifiedText}>Đã mua hàng</Text>
                      </View>
                    </View>
                    <View style={s.reviewStarsRow}>
                      {[1, 2, 3, 4, 5].map((st) => (
                        <Ionicons 
                          key={st} 
                          name={st <= rev.rating ? "star" : "star-outline"} 
                          size={11} 
                          color="#f1c40f" 
                        />
                      ))}
                    </View>
                  </View>
                  <View style={s.reviewDateRow}>
                    <Ionicons name="calendar-outline" size={10} color="#999" style={{ marginRight: 3 }} />
                    <Text style={s.reviewDateText}>
                      {new Date(rev.created_at).toLocaleDateString("vi-VN")}
                    </Text>
                  </View>
                </View>

                {/* Comment Text */}
                <Text style={s.reviewComment}>{rev.comment}</Text>

                {/* Review Images Grid (Web-App style) */}
                {rev.images && rev.images.length > 0 && (
                  <View style={s.reviewImagesContainer}>
                    {rev.images.map((img, index) => {
                      const fullImgUrl = getReviewImageUrl(img);
                      return (
                        <TouchableOpacity 
                          key={index} 
                          style={s.reviewImageWrapper}
                          onPress={() => setZoomImageUrl(fullImgUrl)}
                          activeOpacity={0.9}
                        >
                          <Image source={{ uri: fullImgUrl }} style={s.reviewThumbnail} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Store Admin Reply Box (Web-App style) */}
                {rev.admin_reply && (
                  <View style={s.adminReplyContainer}>
                    <View style={s.adminReplyTitleRow}>
                      <Ionicons name="sparkles" size={12} color="#e7ce7d" style={{ marginRight: 4 }} />
                      <Text style={s.adminReplyTitle}>Phản hồi từ SORA JEWELRY</Text>
                    </View>
                    <Text style={s.adminReplyText}>{rev.admin_reply}</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={s.emptyReviewsBox}>
              <Ionicons name="chatbubbles-outline" size={32} color="#ccc" style={{ marginBottom: 8 }} />
              <Text style={s.emptyReviewsText}>Chưa có đánh giá nào cho sản phẩm này.</Text>
              <Text style={s.emptyReviewsSubText}>Hãy là người đầu tiên sở hữu và chia sẻ cảm nhận về tuyệt tác này.</Text>
            </View>
          )}
        </View>

        {/* 7. "YOU MAY ALSO LIKE" RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <View style={s.sectionContainer}>
            <Text style={s.sectionTitle}>CÓ THỂ BẠN SẼ THÍCH</Text>
            <View style={s.dividerGold} />
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.relatedGrid}>
              {relatedProducts.map((p) => {
                return (
                  <TouchableOpacity 
                    key={p.id.toString()} 
                    style={s.relatedCard}
                    onPress={() => navigation.navigate("ProductDetail", { slug: p.slug })}
                    activeOpacity={0.9}
                  >
                    <Image source={{ uri: `${API_BASE_URL.replace('/api', '')}/storage/${p.thumbnail_image}` }} style={s.relatedCardImg} />
                    <View style={s.relatedCardBody}>
                      <Text style={s.relatedCardTitle} numberOfLines={2}>{p.name}</Text>
                      <Text style={s.relatedCardPrice}>
                        {formatCurrency(p.promotional_price > 0 ? p.promotional_price : p.base_price)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM PURCHASE FIXED ACTION BAR */}
      <View style={s.bottomActionBar}>
        <View style={s.bottomPricing}>
          <Text style={s.bottomPriceLabel}>TỔNG CỘNG</Text>
          <Text style={s.bottomTotalPrice}>{formatCurrency(currentPrice * quantity)}</Text>
        </View>
        
        <TouchableOpacity
          style={[s.addToCartButton, isOutOfStock && s.addToCartButtonDisabled]}
          onPress={handleAddToCart}
          disabled={isOutOfStock}
          activeOpacity={0.9}
        >
          <Ionicons name="cart-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={s.addToCartButtonText}>
            {isOutOfStock ? "HẾT HÀNG" : "THÊM VÀO GIỎ HÀNG"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* FULL SCREEN REVIEW IMAGE ZOOM MODAL */}
      <Modal
        visible={zoomImageUrl !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setZoomImageUrl(null)}
      >
        <TouchableOpacity 
          style={s.zoomModalContainer} 
          activeOpacity={1} 
          onPress={() => setZoomImageUrl(null)}
        >
          <TouchableOpacity style={s.zoomCloseBtn} onPress={() => setZoomImageUrl(null)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {zoomImageUrl && (
            <Image source={{ uri: zoomImageUrl }} style={s.zoomFullImg} />
          )}
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { fontFamily: 'Oswald_500Medium', fontSize: 13, color: '#9f273b', marginTop: 14, letterSpacing: 1 },

  // HEADER BAR
  headerContainer: {
    height: Platform.OS === 'ios' ? 95 : 75,
    paddingTop: Platform.OS === 'ios' ? 45 : 25,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 100,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 15,
    fontSize: 14,
    fontFamily: 'Oswald_500Medium',
    color: '#111',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 8,
  },

  // GALLERY SWIPER
  galleryContainer: {
    width: width,
    height: width * 0.95,
    position: 'relative',
    backgroundColor: '#fff',
  },
  galleryImg: {
    width: width,
    height: width * 0.95,
    resizeMode: 'cover',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#e7ce7d',
    width: 15,
  },

  // PRODUCT MAIN INFO BLOCK
  mainInfoBlock: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  brandCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 11,
    color: '#e7ce7d',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  bulletPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    marginHorizontal: 8,
  },
  categoryText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 12,
    color: '#888',
  },
  productNameText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 21,
    color: '#111',
    lineHeight: 28,
    marginBottom: 12,
  },
  reviewsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginRight: 8,
  },
  reviewsCountText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 11.5,
    color: '#666',
  },
  verticalDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#ccc',
    marginHorizontal: 8,
  },
  pricingContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  promoPrice: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: '#9f273b',
    fontWeight: 'bold',
    marginRight: 10,
  },
  basePrice: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 15,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  discountPercentBadge: {
    backgroundColor: '#fdf5f6',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  discountPercentText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 11,
    color: '#9f273b',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  stockText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#2ecc71',
  },

  // COMMON SECTIONS
  sectionContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 14.5,
    letterSpacing: 0.5,
    color: '#111',
    fontWeight: 'bold',
  },
  dividerGold: {
    width: 25,
    height: 1.5,
    backgroundColor: '#e7ce7d',
    marginTop: 6,
    marginBottom: 16,
  },

  // DYNAMIC OPTIONS
  attrTypeContainer: {
    marginBottom: 18,
  },
  attrTypeTitle: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  optionButtonActive: {
    borderColor: '#9f273b',
    backgroundColor: '#fdf5f6',
  },
  optionButtonDisabled: {
    borderColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    opacity: 0.45,
  },
  optionText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#444',
  },
  optionTextActive: {
    color: '#9f273b',
    fontWeight: 'bold',
  },
  optionTextDisabled: {
    color: '#aaa',
    textDecorationLine: 'line-through',
  },

  // QUANTITY SELECTOR
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    overflow: 'hidden',
  },
  quantityBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 14,
    width: 44,
    textAlign: 'center',
    color: '#111',
  },
  quantitySubInfo: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 11.5,
    color: '#888',
  },

  // LUXURY DESCRIPTION HTML STYLES
  htmlContainer: {
    paddingVertical: 5,
  },
  htmlParaBlock: {
    marginBottom: 12,
  },
  htmlParaText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13.5,
    color: '#444',
    lineHeight: 21,
  },
  htmlHeaderBlock: {
    marginTop: 18,
    marginBottom: 8,
  },
  htmlHeaderText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 15.5,
    color: '#9f273b',
    lineHeight: 23,
  },
  htmlListBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingLeft: 8,
  },
  htmlListBullet: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 14,
    color: '#e7ce7d', // luxury gold bullet point
    marginRight: 8,
    lineHeight: 21,
  },
  htmlListText: {
    flex: 1,
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    color: '#444',
    lineHeight: 21,
  },

  // LUXURY REVIEWS STYLES
  reviewsOverview: {
    flexDirection: 'row',
    backgroundColor: '#faf8f5', // Kem nhẹ tinh khôi
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f3ece1',
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    gap: 15,
  },
  overviewLeft: {
    flex: 1.1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    paddingRight: 10,
  },
  overviewScore: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 32,
    color: '#9f273b',
    lineHeight: 38,
  },
  overviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 4,
  },
  overviewCount: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  overviewRight: {
    flex: 1.9,
    paddingLeft: 5,
  },
  overviewQuote: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 12.5,
    color: '#666',
    lineHeight: 18,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingVertical: 18,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#fff',
    backgroundColor: '#eee',
  },
  reviewUserInfo: {
    flex: 1,
    marginLeft: 10,
  },
  reviewUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  reviewUsername: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 13,
    color: '#222',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 204, 113, 0.08)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
    marginLeft: 6,
  },
  verifiedText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 8.5,
    color: '#2ecc71',
    textTransform: 'uppercase',
  },
  reviewStarsRow: {
    flexDirection: 'row',
    gap: 1.5,
  },
  reviewDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewDateText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 10,
    color: '#999',
  },
  reviewComment: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
    paddingLeft: 48,
    marginBottom: 8,
  },
  reviewImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingLeft: 48,
    marginBottom: 10,
  },
  reviewImageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  reviewThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  adminReplyContainer: {
    backgroundColor: '#fafafa',
    borderLeftWidth: 3,
    borderLeftColor: '#9f273b',
    borderRadius: 4,
    padding: 12,
    marginLeft: 48,
    marginTop: 6,
  },
  adminReplyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  adminReplyTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 12,
    color: '#9f273b',
  },
  adminReplyText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
  },
  emptyReviewsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 35,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  emptyReviewsText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 13.5,
    color: '#333',
    marginBottom: 4,
  },
  emptyReviewsSubText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },

  // FULL SCREEN ZOOM MODAL STYLES
  zoomModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  zoomFullImg: {
    width: width,
    height: width,
    resizeMode: 'contain',
  },

  // RELATED PRODUCTS
  relatedGrid: {
    gap: 12,
  },
  relatedCard: {
    width: 125,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 6,
    overflow: 'hidden',
  },
  relatedCardImg: {
    width: '100%',
    height: 125,
    resizeMode: 'cover',
  },
  relatedCardBody: {
    padding: 8,
  },
  relatedCardTitle: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 11,
    color: '#333',
    lineHeight: 14,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  relatedCardPrice: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 11.5,
    color: '#9f273b',
  },

  // BOTTOM PURCHASING BAR
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 8,
  },
  bottomPricing: {
    flexDirection: 'column',
  },
  bottomPriceLabel: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 10,
    color: '#888',
    letterSpacing: 0.5,
  },
  bottomTotalPrice: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#9f273b',
    fontWeight: 'bold',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9f273b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addToCartButtonText: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 12,
    color: '#fff',
    letterSpacing: 1.2,
  },
});
