import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Dimensions,
  Alert,
  Animated,
  PanResponder,
  RefreshControl,
  ActivityIndicator
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/api";
import { showCustomAlert } from "../components/CustomAlert";

const { width, height } = Dimensions.get("window");

const REVEAL_THRESHOLD = width * 0.2; // 20% → hiện nút xoá
const DELETE_THRESHOLD = width * 0.5; // 50% → xoá luôn
const DELETE_BTN_BASE = 80; // chiều rộng nút xoá tối thiểu

// ── Swipeable Card ──────────────────────────────────────────────────────────
function SwipeableCartItem({
  item,
  isChecked,
  onToggle,
  onDelete,
  onOpenImage,
  onQtyChange,
  onSwipeStart,
  onSwipeEnd,
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [revealed, setRevealed] = useState(false);

  // Chiều rộng nút xoá = -translateX (luôn bám khít và đi cùng với thẻ sản phẩm)
  const deleteWidth = translateX.interpolate({
    inputRange: [-width, 0],
    outputRange: [width, 0],
    extrapolate: "clamp",
  });

  const snapTo = useCallback(
    (toValue) => {
      Animated.spring(translateX, {
        toValue,
        useNativeDriver: false,
        bounciness: 4,
      }).start();
    },
    [translateX],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => {
        // Kích hoạt khi vuốt ngang rõ rệt hơn dọc và khoảng cách di chuyển đủ lớn (>6px)
        return Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy);
      },
      onPanResponderGrant: () => {
        onSwipeStart && onSwipeStart();
        translateX.setOffset(translateX._value);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, g) => {
        const offset = translateX._offset || 0;
        const nextValue = g.dx;
        // Giới hạn giá trị sau khi cộng offset không vượt quá 0 (không cho lệch sang phải quá mức)
        if (offset + nextValue > 0) {
          translateX.setValue(-offset);
        } else {
          translateX.setValue(nextValue);
        }
      },
      onPanResponderRelease: (_, g) => {
        translateX.flattenOffset();
        const cur = translateX._value;
        onSwipeEnd && onSwipeEnd();

        if (cur < -REVEAL_THRESHOLD) {
          // Vuốt qua 20% → snap về vị trí hiện nút xoá cố định (không tự động xoá khi kéo sâu nữa)
          snapTo(-DELETE_BTN_BASE);
          setRevealed(true);
        } else {
          // Vuốt ít → đóng lại
          snapTo(0);
          setRevealed(false);
        }
      },
      onPanResponderTerminationRequest: () => false, // Không nhường quyền điều khiển cử chỉ cho ScrollView khi đang vuốt
      onPanResponderTerminate: () => {
        translateX.flattenOffset();
        snapTo(revealed ? -DELETE_BTN_BASE : 0);
        onSwipeEnd && onSwipeEnd();
      },
    }),
  ).current;

  const closeSwipe = () => {
    snapTo(0);
    setRevealed(false);
  };

  return (
    <View style={sw.wrapper}>
      {/* Nền đỏ + nút XOÁ (phía sau, bên phải) */}
      <Animated.View style={[sw.deleteBg, { width: deleteWidth }]}>
        <TouchableOpacity
          style={sw.deleteBtn}
          onPress={() => onDelete(item.id)}
          activeOpacity={0.8}
        >
          <View style={sw.deleteIconWrapper}>
            <Ionicons name="trash-outline" size={20} color="#e7ce7d" />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Card trượt */}
      <Animated.View
        style={[
          sw.card,
          isChecked && sw.cardSelected,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Checkbox */}
        <TouchableOpacity
          style={sw.checkBox}
          onPress={() => {
            closeSwipe();
            onToggle(item.id);
          }}
        >
          <Ionicons
            name={isChecked ? "checkbox" : "square-outline"}
            size={22}
            color={isChecked ? "#9f273b" : "#ccc"}
          />
        </TouchableOpacity>

        {/* Info */}
        <View style={sw.info}>
          <Text style={sw.itemCategory}>{item.category}</Text>
          <Text style={sw.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={sw.itemVariant}>{item.variant}</Text>
          <View style={sw.priceRow}>
            <Text style={sw.newPrice}>{fmt(item.price)}</Text>
            <Text style={sw.oldPrice}>{fmt(item.oldPrice)}</Text>
          </View>
          <View style={sw.qtyRow}>
            <TouchableOpacity
              style={sw.qtyBtn}
              onPress={() => onQtyChange(item.id, -1)}
            >
              <Ionicons name="remove" size={16} color="#9f273b" />
            </TouchableOpacity>
            <Text style={sw.qtyVal}>{item.qty}</Text>
            <TouchableOpacity
              style={sw.qtyBtn}
              onPress={() => onQtyChange(item.id, +1)}
            >
              <Ionicons name="add" size={16} color="#9f273b" />
            </TouchableOpacity>
            <Text style={sw.lineTotal}>{fmt(item.price * item.qty)}</Text>
          </View>
        </View>

        {/* Thumbnail RIGHT */}
        <TouchableOpacity
          onPress={() => onOpenImage(item.image)}
          activeOpacity={0.85}
          style={sw.thumbWrapper}
        >
          <Image source={{ uri: item.image }} style={sw.thumb} />
          <View style={sw.thumbOverlay}>
            <Ionicons name="expand-outline" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── Styles SwipeableCartItem ─────────────────────────────────────────────────
const sw = StyleSheet.create({
  wrapper: {
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  deleteBg: {
    position: "absolute",
    right: 0,
    height: 100, // Chiều cao bằng đúng hình ảnh (100px)
    top: "50%",
    marginTop: -50, // Căn giữa dọc hoàn hảo
    backgroundColor: "#9f273b", // Đồng bộ màu đỏ chính của SORA Jewelry
    alignItems: "center",
    justifyContent: "flex-start", // Căn lề trái để nút chạy bám sát theo thẻ sản phẩm khi kéo
    borderRadius: 10,
    overflow: "hidden", // Ẩn phần thừa và bo góc
    borderLeftWidth: 3,
    borderLeftColor: "#e7ce7d", // Đường viền gold sang trọng làm phân cách kéo
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteBtn: {
    width: DELETE_BTN_BASE, // Chiều rộng cố định (80px), không bao giờ bị bóp méo chữ hay nhảy dòng
    height: "100%",
    flexDirection: "column", // Bố cục dọc vô cùng thời thượng và gọn gàng
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  deleteIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(231, 206, 125, 0.15)", // Nền gold mờ tạo độ sâu thương hiệu SORA
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(231, 206, 125, 0.3)",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    paddingLeft: 4,
    borderWidth: 1.5,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: { borderColor: "#9f273b" },
  checkBox: { paddingHorizontal: 8, paddingVertical: 10, alignSelf: "center" },
  info: { flex: 1, paddingLeft: 12, paddingVertical: 10 },
  itemCategory: {
    fontFamily: "PlayfairDisplay_400Regular_Italic",
    fontSize: 10,
    color: "#aaa",
    marginBottom: 2,
  },
  itemName: {
    fontFamily: "Oswald_500Medium",
    fontSize: 12,
    color: "#222",
    textTransform: "uppercase",
    lineHeight: 16,
    marginBottom: 3,
  },
  itemVariant: {
    fontFamily: "Oswald_400Regular",
    fontSize: 11,
    color: "#888",
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  newPrice: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 14,
    color: "#9f273b",
  },
  oldPrice: {
    fontFamily: "PlayfairDisplay_400Regular",
    fontSize: 11,
    color: "#bbb",
    textDecorationLine: "line-through",
  },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#9f273b",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyVal: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 14,
    color: "#333",
    minWidth: 22,
    textAlign: "center",
  },
  lineTotal: {
    fontFamily: "Oswald_500Medium",
    fontSize: 12,
    color: "#555",
    marginLeft: 6,
  },
  thumbWrapper: { position: "relative" },
  thumb: {
    width: 90,
    height: 100,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  thumbOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 26,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    borderBottomRightRadius: 8,
  },
});

// Helper to resolve storage paths
const getStorageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL.replace('/api', '')}/storage/${path}`;
};

// Helper to format currency
const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(n) || 0);

// Helper to map backend cart item payload into SwipeableCartItem schema
const mapBackendItem = (item) => {
  const isCombo = !!item.combo_id;
  
  let name = 'Sản phẩm Trang sức SORA';
  let category = 'Trang sức';
  let variant = '';
  let price = 0;
  let oldPrice = null;
  let image = 'https://images.unsplash.com/photo-1605100804763-247f67b854d4?q=80&w=600';

  if (isCombo && item.combo) {
    name = item.combo.name || 'Gói Ưu Đãi SORA';
    category = 'Combo cao cấp';
    variant = `Bộ ${item.combo_selections?.length || 0} món tự chọn`;
    price = Number(item.price) || 0;
    image = item.combo.thumbnail_image 
      ? getStorageUrl(item.combo.thumbnail_image)
      : 'https://images.unsplash.com/photo-1605100804763-247f67b854d4?q=80&w=600';
  } else if (item.variant) {
    name = item.variant.product?.name || 'Sản phẩm Trang sức SORA';
    category = item.variant.product?.category?.name || 'Trang sức';
    
    // Process multi-attributes object, e.g., "VÀNG HỒNG / SIZE 11"
    if (item.variant.attributes) {
      variant = Object.entries(item.variant.attributes)
        .map(([key, val]) => `${key}: ${val}`)
        .join(' / ');
    } else {
      variant = 'Bản Giới Hạn SORA';
    }

    const basePrice = Number(item.variant.price) || 0;
    const promoPrice = Number(item.variant.promotional_price) || 0;
    
    if (promoPrice > 0 && promoPrice < basePrice) {
      price = promoPrice;
      oldPrice = basePrice;
    } else {
      price = basePrice;
    }

    const relativeImage = item.variant.image_url || item.variant.product?.thumbnail_image;
    if (relativeImage) {
      image = getStorageUrl(relativeImage);
    }
  }

  return {
    id: item.id.toString(),
    name,
    category,
    variant,
    price,
    oldPrice,
    qty: item.quantity || 1,
    image,
    rawItem: item
  };
};

export default function CartScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // Fetch items from Laravel API
  const fetchCartItems = async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/client/cart`, {
        method: 'GET',
        headers
      });
      const result = await response.json();
      if (result.success && result.data) {
        const mapped = result.data.map(mapBackendItem);
        setItems(mapped);
        
        // Auto-select all items on first load
        if (!isBackground) {
          setSelected(mapped.map(i => i.id));
        }
      }
    } catch (e) {
      console.log('Error fetching cart:', e);
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  // Reload cart whenever screen comes into focus
  useEffect(() => {
    if (isFocused) {
      fetchCartItems();
    }
  }, [isFocused]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCartItems(true);
    setRefreshing(false);
  }, []);

  const allSelected = items.length > 0 && selected.length === items.length;

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    setSelected(allSelected ? [] : items.map((i) => i.id));
  };

  // Deletes multiple selected items from the backend cart
  const deleteSelected = () => {
    if (selected.length === 0) return;
    showCustomAlert(
      "Xoá sản phẩm",
      `Bạn muốn xoá ${selected.length} sản phẩm đã chọn?`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              const headers = await getHeaders();
              // Delete each item on backend in parallel
              await Promise.all(
                selected.map(async (id) => {
                  const targetItem = items.find(i => i.id === id);
                  if (targetItem) {
                    await fetch(`${API_BASE_URL}/client/cart/${targetItem.rawItem.id}`, {
                      method: 'DELETE',
                      headers
                    });
                  }
                })
              );
              showCustomAlert("GIỎ HÀNG", "Đã xóa các sản phẩm được chọn khỏi giỏ hàng thành công!", [{ text: "ĐỒNG Ý" }]);
              setSelected([]);
              await fetchCartItems(false);
            } catch (e) {
              console.log('Error deleting selected items:', e);
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  // Syncs quantity modifications with backend with optimistic UI updates
  const changeQty = async (id, delta) => {
    const targetItem = items.find((i) => i.id === id);
    if (!targetItem) return;

    const newQty = targetItem.qty + delta;
    if (newQty < 1) return;

    // Check stock boundaries
    const maxStock = targetItem.rawItem.variant?.stock || targetItem.rawItem.variant?.stock_quantity || 99;
    if (newQty > maxStock) {
      showCustomAlert("KHO KHÔNG ĐỦ", `Sản phẩm này hiện chỉ còn ${maxStock} sản phẩm trong kho!`);
      return;
    }

    // Optimistic UI updates
    const originalQty = targetItem.qty;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: newQty } : i))
    );

    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/client/cart/${targetItem.rawItem.id}`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQty })
      });
      const result = await response.json();
      if (result.success) {
        await fetchCartItems(true); // background sync
      } else {
        // Revert on error
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, qty: originalQty } : i))
        );
      }
    } catch (e) {
      console.log('Error updating quantity:', e);
      // Revert on error
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, qty: originalQty } : i))
      );
    }
  };

  // Deletes a single cart item from the backend with optimistic UI updates
  const deleteSingleItem = (id) => {
    const targetItem = items.find(i => i.id === id);
    if (!targetItem) return;

    showCustomAlert(
      "Xoá sản phẩm",
      "Bạn có chắc chắn muốn bỏ sản phẩm này khỏi giỏ hàng?",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            // Optimistic UI updates
            setItems((prev) => prev.filter((i) => i.id !== id));
            setSelected((prev) => prev.filter((x) => x !== id));
            
            try {
              const headers = await getHeaders();
              const response = await fetch(`${API_BASE_URL}/client/cart/${targetItem.rawItem.id}`, {
                method: 'DELETE',
                headers
              });
              const result = await response.json();
              if (result.success) {
                // Background sync
                await fetchCartItems(true);
              }
            } catch (e) {
              console.log('Error deleting single item:', e);
              // Restore state on failure
              await fetchCartItems(false);
            }
          }
        }
      ]
    );
  };

  const selectedItems = items.filter((i) => selected.includes(i.id));
  const subtotal = (selected.length > 0 ? selectedItems : items).reduce(
    (sum, i) => sum + i.price * i.qty,
    0,
  );

  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);

  if (isLoading) {
    return (
      <SafeAreaView style={[s.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#9f273b" />
        <Text style={{ fontFamily: 'Oswald_500Medium', fontSize: 13, color: '#9f273b', marginTop: 14, letterSpacing: 1 }}>ĐANG TẢI GIỎ HÀNG SORA...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* ── HEADER ── */}
      <View style={s.header}>
        <View style={s.headerInner}>
          <View style={s.headerIconRow}>
            <Ionicons name="cart" size={18} color="#e7ce7d" />
            <Text style={s.headerSupTitle}>SORA JEWELRY</Text>
          </View>
          <Text style={s.headerTitle}>Giỏ Hàng</Text>
          <View style={s.headerGoldLine} />
        </View>
      </View>

      {/* ── TOOLBAR ── */}
      <View style={s.toolbar}>
        {/* Count badge */}
        <View style={s.toolBadge}>
          <Ionicons name="cart-outline" size={15} color="#9f273b" />
          <Text style={s.toolBadgeTxt}>{totalQty} sản phẩm</Text>
        </View>

        <View style={s.toolActions}>
          {/* Select All */}
          <TouchableOpacity style={s.toolBtn} onPress={toggleSelectAll}>
            <Ionicons
              name={allSelected ? "checkbox" : "checkbox-outline"}
              size={16}
              color={allSelected ? "#9f273b" : "#666"}
            />
            <Text style={[s.toolBtnTxt, allSelected && { color: "#9f273b" }]}>
              Tất cả
            </Text>
          </TouchableOpacity>

          {/* Delete Selected */}
          <TouchableOpacity
            style={[
              s.toolBtn,
              s.toolBtnDelete,
              selected.length === 0 && s.toolBtnDisabled,
            ]}
            onPress={deleteSelected}
            disabled={selected.length === 0}
          >
            <Ionicons
              name="trash-outline"
              size={16}
              color={selected.length > 0 ? "#cc1e2e" : "#bbb"}
            />
            <Text
              style={[
                s.toolBtnTxt,
                { color: selected.length > 0 ? "#cc1e2e" : "#bbb" },
              ]}
            >
              Xoá{selected.length > 0 ? ` (${selected.length})` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── CART ITEMS ── */}
      <ScrollView
        style={s.list}
        contentContainerStyle={[
          { paddingBottom: 130 },
          items.length === 0 && { flexGrow: 1, justifyContent: "center" }
        ]}
        scrollEnabled={scrollEnabled}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#9f273b"]}
            tintColor="#9f273b"
          />
        }
      >
        {items.length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons name="cart-outline" size={72} color="#e0e0e0" />
            <Text style={s.emptyTitle}>Giỏ hàng trống</Text>
            <Text style={s.emptySub}>
              Thêm sản phẩm yêu thích vào giỏ để tiếp tục
            </Text>
            <TouchableOpacity
              style={s.shopBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={s.shopBtnTxt}>TIẾP TỤC MUA SẮM</Text>
            </TouchableOpacity>
          </View>
        ) : (
          items.map((item) => {
            const isChecked = selected.includes(item.id);
            return (
              <SwipeableCartItem
                key={item.id}
                item={item}
                isChecked={isChecked}
                onToggle={toggleSelect}
                onDelete={deleteSingleItem}
                onOpenImage={setLightboxImg}
                onQtyChange={changeQty}
                onSwipeStart={() => setScrollEnabled(false)}
                onSwipeEnd={() => setScrollEnabled(true)}
              />
            );
          })
        )}
      </ScrollView>

      {/* ── CHECKOUT BAR ── */}
      {items.length > 0 && (
        <View style={s.checkoutBar}>
          <View style={s.checkoutSummary}>
            <Text style={s.checkoutLabel}>
              {selected.length > 0 ? `${selected.length} đã chọn` : "Tổng cộng"}
            </Text>
            <Text style={s.checkoutTotal}>{fmt(subtotal)}</Text>
          </View>
          <TouchableOpacity
            style={s.checkoutBtn}
            onPress={() => {
              const selectedItems = items.filter((i) => selected.includes(i.id));
              if (selectedItems.length === 0) {
                showCustomAlert(
                  "Giỏ hàng",
                  "Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!"
                );
                return;
              }
              navigation.navigate("Checkout", { checkoutItems: selectedItems });
            }}
          >
            <Ionicons
              name="card-outline"
              size={18}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={s.checkoutBtnTxt}>THANH TOÁN</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── LIGHTBOX MODAL ── */}
      <Modal visible={!!lightboxImg} transparent animationType="fade">
        <View style={s.lightboxBg}>
          <TouchableOpacity
            style={s.lightboxClose}
            onPress={() => setLightboxImg(null)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {lightboxImg && (
            <Image
              source={{ uri: lightboxImg }}
              style={s.lightboxImg}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f5f5" },

  // HEADER
  header: {
    backgroundColor: "#9f273b",
    paddingTop: 16,
    paddingBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInner: {
    alignItems: "center",
  },
  headerIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  headerSupTitle: {
    fontFamily: "Oswald_400Regular",
    fontSize: 10,
    letterSpacing: 3,
    color: "#e7ce7d",
    textTransform: "uppercase",
  },
  headerTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 26,
    color: "#fff",
    marginBottom: 10,
  },
  headerGoldLine: {
    width: 44,
    height: 2,
    backgroundColor: "#e7ce7d",
    borderRadius: 2,
  },

  // TOOLBAR
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  toolBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fdf5f6",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  toolBadgeTxt: {
    fontFamily: "Oswald_500Medium",
    fontSize: 12,
    color: "#9f273b",
  },
  toolActions: { flexDirection: "row", gap: 8 },
  toolBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  toolBtnDelete: { borderColor: "#f5c0c0" },
  toolBtnDisabled: { opacity: 0.5 },
  toolBtnTxt: {
    fontFamily: "Oswald_400Regular",
    fontSize: 12,
    color: "#555",
  },

  // LIST
  list: { flex: 1 },

  // CARD
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
    paddingLeft: 4,
    paddingRight: 0,
    borderWidth: 1.5,
    borderColor: "#fff", // luôn có border, tránh xô layout khi active
  },
  cardSelected: {
    borderColor: "#9f273b", // chỉ đổi màu, không thêm/bớt borderWidth
  },
  checkBox: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignSelf: "center",
  },
  thumbWrapper: {
    position: "relative",
  },
  thumb: {
    width: 90,
    height: 100,
  },
  thumbOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, paddingLeft: 12, paddingVertical: 10 },
  itemCategory: {
    fontFamily: "PlayfairDisplay_400Regular_Italic",
    fontSize: 10,
    color: "#aaa",
    marginBottom: 2,
  },
  itemName: {
    fontFamily: "Oswald_500Medium",
    fontSize: 12,
    color: "#222",
    textTransform: "uppercase",
    lineHeight: 16,
    marginBottom: 3,
  },
  itemVariant: {
    fontFamily: "Oswald_400Regular",
    fontSize: 11,
    color: "#888",
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  newPrice: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 14,
    color: "#9f273b",
  },
  oldPrice: {
    fontFamily: "PlayfairDisplay_400Regular",
    fontSize: 11,
    color: "#bbb",
    textDecorationLine: "line-through",
  },

  // QTY STEPPER
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#9f273b",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyVal: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 14,
    color: "#333",
    minWidth: 22,
    textAlign: "center",
  },
  lineTotal: {
    fontFamily: "Oswald_500Medium",
    fontSize: 12,
    color: "#555",
    marginLeft: 6,
  },

  // EMPTY
  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 22,
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontFamily: "Oswald_400Regular",
    fontSize: 13,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 28,
  },
  shopBtn: {
    backgroundColor: "#9f273b",
    borderRadius: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  shopBtnTxt: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 13,
    color: "#fff",
    letterSpacing: 1.5,
  },

  // CHECKOUT BAR
  checkoutBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 12,
  },
  checkoutSummary: { flex: 1 },
  checkoutLabel: {
    fontFamily: "Oswald_400Regular",
    fontSize: 11,
    color: "#888",
  },
  checkoutTotal: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 18,
    color: "#9f273b",
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#9f273b",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 10,
  },
  checkoutBtnTxt: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 14,
    color: "#fff",
    letterSpacing: 1.5,
  },

  // LIGHTBOX
  lightboxBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  lightboxClose: {
    position: "absolute",
    top: 55,
    right: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  lightboxImg: {
    width: width,
    height: height * 0.75,
    borderRadius: 16,
  },
});
