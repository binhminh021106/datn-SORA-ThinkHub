import React, { useState, useRef, useCallback } from "react";
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
  Animated,
  PanResponder,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showCustomAlert } from '../components/CustomAlert';

const Alert = {
  alert: (title, message, buttons) => showCustomAlert(title, message, buttons)
};

const { width, height } = Dimensions.get("window");

const REVEAL_THRESHOLD = width * 0.20;   // 20% → hiện nút xoá
const DELETE_BTN_BASE  = 80;             // chiều rộng nút xoá

// ── Swipeable Favorite Card ──────────────────────────────────────────────────
function SwipeableWishlistItem({ item, isChecked, onToggle, onDelete, onAddToCart, onOpenImage, onSwipeStart, onSwipeEnd }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [revealed, setRevealed] = useState(false);

  const deleteWidth = translateX.interpolate({
    inputRange: [-width, 0],
    outputRange: [width, 0],
    extrapolate: 'clamp',
  });

  const snapTo = useCallback((toValue) => {
    Animated.spring(translateX, {
      toValue,
      useNativeDriver: false,
      bounciness: 4,
    }).start();
  }, [translateX]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => {
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
          snapTo(-DELETE_BTN_BASE);
          setRevealed(true);
        } else {
          snapTo(0);
          setRevealed(false);
        }
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: () => {
        translateX.flattenOffset();
        snapTo(revealed ? -DELETE_BTN_BASE : 0);
        onSwipeEnd && onSwipeEnd();
      },
    })
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
          <Text style={sw.deleteTxt}>Xoá</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Card trượt */}
      <Animated.View
        style={[sw.card, isChecked && sw.cardSelected, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {/* Checkbox */}
        <TouchableOpacity style={sw.checkBox} onPress={() => { closeSwipe(); onToggle(item.id); }}>
          <Ionicons
            name={isChecked ? "checkbox" : "square-outline"}
            size={22}
            color={isChecked ? "#9f273b" : "#ccc"}
          />
        </TouchableOpacity>

        {/* Info */}
        <View style={sw.info}>
          <Text style={sw.itemCategory}>{item.category}</Text>
          <Text style={sw.itemName} numberOfLines={2}>{item.name}</Text>
          <Text style={sw.itemVariant}>{item.variant}</Text>
          
          <View style={sw.priceRow}>
            <Text style={sw.newPrice}>{fmt(item.price)}</Text>
            {item.oldPrice && <Text style={sw.oldPrice}>{fmt(item.oldPrice)}</Text>}
          </View>

          {/* Nút Thêm Vào Giỏ hàng riêng biệt vô cùng sang trọng */}
          <TouchableOpacity 
            style={sw.addToCartBtn} 
            onPress={() => { closeSwipe(); onAddToCart(item); }}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={14} color="#9f273b" style={{ marginRight: 4 }} />
            <Text style={sw.addToCartTxt}>THÊM VÀO GIỎ HÀNG</Text>
          </TouchableOpacity>
        </View>

        {/* Thumbnail RIGHT */}
        <TouchableOpacity onPress={() => onOpenImage(item.image)} activeOpacity={0.85} style={sw.thumbWrapper}>
          <Image source={{ uri: item.image }} style={sw.thumb} />
          <View style={sw.thumbOverlay}>
            <Ionicons name="expand-outline" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── Styles SwipeableWishlistItem ─────────────────────────────────────────────
const sw = StyleSheet.create({
  wrapper: {
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  deleteBg: {
    position: 'absolute',
    right: 0,
    height: 110, // Tăng nhẹ chiều cao để tương thích nút "Thêm vào giỏ" bên trong thẻ
    top: '50%',
    marginTop: -55,
    backgroundColor: '#9f273b', // Đồng bộ màu đỏ thương hiệu SORA
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 10,
    overflow: 'hidden',
    borderLeftWidth: 3,
    borderLeftColor: '#e7ce7d', // Đường viền gold sang trọng
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteBtn: {
    width: DELETE_BTN_BASE,
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deleteIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(231, 206, 125, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(231, 206, 125, 0.3)',
  },
  deleteTxt: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 11,
    color: '#fff',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    paddingLeft: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: { borderColor: '#9f273b' },
  checkBox: { paddingHorizontal: 8, paddingVertical: 10, alignSelf: 'center' },
  info: { flex: 1, paddingLeft: 12, paddingVertical: 12 },
  itemCategory: { fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 10, color: '#aaa', marginBottom: 2 },
  itemName: { fontFamily: 'Oswald_500Medium', fontSize: 12, color: '#222', textTransform: 'uppercase', lineHeight: 16, marginBottom: 3 },
  itemVariant: { fontFamily: 'Oswald_400Regular', fontSize: 11, color: '#888', marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  newPrice: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 14, color: '#9f273b' },
  oldPrice: { fontFamily: 'PlayfairDisplay_400Regular', fontSize: 11, color: '#bbb', textDecorationLine: 'line-through' },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#9f273b',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#fffafa',
  },
  addToCartTxt: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 10,
    color: '#9f273b',
    letterSpacing: 0.5,
  },
  thumbWrapper: { position: 'relative' },
  thumb: { width: 90, height: 110, borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  thumbOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 26, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', borderBottomRightRadius: 8 },
});

const parsePriceToNumber = (v) => {
  if (!v) return 0;
  const str = String(v);
  
  // If it is a clean numeric string with a dot (like "25000000.00"), parse as float
  if (/^\d+\.\d+$/.test(str)) {
    return Math.floor(parseFloat(str));
  }
  
  // Otherwise, it is a formatted string with dots (like "25.000.000đ"). Clean non-digits
  const cleanStr = str.replace(/[^\d]/g, '');
  return parseInt(cleanStr, 10) || 0;
};

const fmt = (v) => {
  if (v === null || v === undefined) return '';
  const str = String(v);
  if (str.includes('đ') || str.includes('₫')) {
    return str;
  }
  // Check for numeric decimal string like "25000000.00"
  if (str.includes('.') && !str.includes(',') && /^\d+\.\d+$/.test(str)) {
    const num = parseFloat(str);
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  }
  const num = parsePriceToNumber(str);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

// ── Dummy wishlist data ──────────────────────────────────────────────────────
const INITIAL_WISHLIST = [
  {
    id: "101",
    name: "Nhẫn Kim Cương Eternal Trắng 18K",
    category: "Nhẫn Cao Cấp",
    variant: "Vàng Trắng 18K / Size 12",
    price: 25000000,
    oldPrice: 30500000,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b854d4?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "102",
    name: "Bông Tai Sapphire Xanh Cao Cấp",
    category: "Bông Tai",
    variant: "Vàng Vàng 18K",
    price: 18200000,
    oldPrice: 22000000,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "103",
    name: "Lắc Tay Vàng Hồng Charm Hoa Anh Đào",
    category: "Lắc Tay",
    variant: "Vàng Hồng 18K",
    price: 9800000,
    oldPrice: 12000000,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop",
  },
];

export default function WishlistScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadWishlist = useCallback(async () => {
    setIsLoading(true);
    try {
      const stored = await AsyncStorage.getItem('sora_wishlist_items');
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        setItems([]);
      }
    } catch (e) {
      console.log('Error loading wishlist items in WishlistScreen:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWishlist();
    }, [loadWishlist])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWishlist();
    setRefreshing(false);
  }, [loadWishlist]);

  const allSelected = items.length > 0 && selected.length === items.length;

  const toggleSelect = (id) => {
    const idStr = id.toString();
    setSelected((prev) =>
      prev.includes(idStr) ? prev.filter((x) => x !== idStr) : [...prev, idStr],
    );
  };

  const toggleSelectAll = () => {
    setSelected(allSelected ? [] : items.map((i) => i.id.toString()));
  };

  const deleteWishlistItem = async (id) => {
    try {
      const idStr = id.toString();
      const storedIds = await AsyncStorage.getItem('sora_wishlist_ids');
      const storedItems = await AsyncStorage.getItem('sora_wishlist_items');

      let currentIds = storedIds ? JSON.parse(storedIds) : [];
      let currentItems = storedItems ? JSON.parse(storedItems) : [];

      const updatedIds = currentIds.filter(x => x.toString() !== idStr);
      const updatedItems = currentItems.filter(i => i.id.toString() !== idStr);

      setItems(updatedItems);
      setSelected((prev) => prev.filter((x) => x !== idStr));

      await AsyncStorage.setItem('sora_wishlist_ids', JSON.stringify(updatedIds));
      await AsyncStorage.setItem('sora_wishlist_items', JSON.stringify(updatedItems));

      Alert.alert("Yêu thích", "Đã xoá sản phẩm khỏi danh sách yêu thích!");
    } catch (e) {
      console.log('Error deleting item from wishlist screen:', e);
    }
  };

  const deleteSelected = () => {
    if (selected.length === 0) return;
    Alert.alert(
      "Xoá yêu thích",
      `Bạn muốn bỏ yêu thích ${selected.length} sản phẩm đã chọn?`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            try {
              const storedIds = await AsyncStorage.getItem('sora_wishlist_ids');
              const storedItems = await AsyncStorage.getItem('sora_wishlist_items');

              let currentIds = storedIds ? JSON.parse(storedIds) : [];
              let currentItems = storedItems ? JSON.parse(storedItems) : [];

              const updatedIds = currentIds.filter(x => !selected.includes(x.toString()));
              const updatedItems = currentItems.filter(i => !selected.includes(i.id.toString()));

              setItems(updatedItems);
              setSelected([]);

              await AsyncStorage.setItem('sora_wishlist_ids', JSON.stringify(updatedIds));
              await AsyncStorage.setItem('sora_wishlist_items', JSON.stringify(updatedItems));

              Alert.alert("Yêu thích", "Đã xoá các sản phẩm khỏi danh sách yêu thích!");
            } catch (e) {
              console.log('Error deleting selected items:', e);
            }
          },
        },
      ],
    );
  };

  const addSingleToCart = (item) => {
    Alert.alert("Giỏ hàng", `Đã thêm "${item.name}" vào giỏ hàng thành công!`);
  };

  const addSelectedToCart = () => {
    if (selected.length === 0) return;
    Alert.alert("Giỏ hàng", `Đã thêm ${selected.length} sản phẩm được chọn vào giỏ hàng thành công!`);
  };

  const selectedItems = items.filter((i) => selected.includes(i.id.toString()));
  const totalValue = selectedItems.reduce(
    (sum, i) => sum + parsePriceToNumber(i.price),
    0,
  );

  if (isLoading && !refreshing && items.length === 0) {
    return (
      <SafeAreaView style={[s.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#9f273b" />
        <Text style={{ marginTop: 10, fontFamily: "Oswald_500Medium", color: "#9f273b", fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>Đang tải yêu thích SORA...</Text>
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
            <Ionicons name="heart" size={18} color="#e7ce7d" />
            <Text style={s.headerSupTitle}>SORA JEWELRY</Text>
          </View>
          <Text style={s.headerTitle}>Yêu Thích</Text>
          <View style={s.headerGoldLine} />
        </View>
      </View>

      {/* ── TOOLBAR ── */}
      <View style={s.toolbar}>
        {/* Count badge */}
        <View style={s.toolBadge}>
          <Ionicons name="heart-outline" size={15} color="#9f273b" />
          <Text style={s.toolBadgeTxt}>{items.length} sản phẩm</Text>
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

      {/* ── WISHLIST ITEMS ── */}
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
            <Ionicons name="heart-outline" size={72} color="#e0e0e0" />
            <Text style={s.emptyTitle}>Danh sách trống</Text>
            <Text style={s.emptySub}>
              Hãy thả tim những sản phẩm bạn yêu thích để lưu trữ tại đây
            </Text>
            <TouchableOpacity
              style={s.shopBtn}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={s.shopBtnTxt}>KHÁM PHÁ CỬA HÀNG</Text>
            </TouchableOpacity>
          </View>
        ) : (
          items.map((item) => {
            const isChecked = selected.includes(item.id);
            return (
              <SwipeableWishlistItem
                key={item.id}
                item={item}
                isChecked={isChecked}
                onToggle={toggleSelect}
                onDelete={deleteWishlistItem}
                onAddToCart={addSingleToCart}
                onOpenImage={setLightboxImg}
                onSwipeStart={() => setScrollEnabled(false)}
                onSwipeEnd={() => setScrollEnabled(true)}
              />
            );
          })
        )}
      </ScrollView>

      {/* ── ACTION BAR (ADD SELECTED TO CART) ── */}
      {items.length > 0 && (
        <View style={s.checkoutBar}>
          <View style={s.checkoutSummary}>
            <Text style={s.checkoutLabel}>
              {selected.length > 0 ? `${selected.length} đã chọn` : "Ước tính giá trị"}
            </Text>
            <Text style={s.checkoutTotal}>{fmt(totalValue)}</Text>
          </View>
          <TouchableOpacity
            style={[s.checkoutBtn, selected.length === 0 && s.checkoutBtnDisabled]}
            onPress={addSelectedToCart}
            disabled={selected.length === 0}
          >
            <Ionicons
              name="cart-outline"
              size={18}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={s.checkoutBtnTxt}>THÊM VÀO GIỎ</Text>
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

  // BOTTOM ACTION BAR
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
  },
  checkoutBtnDisabled: {
    backgroundColor: "#ccc",
  },
  checkoutBtnTxt: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 13,
    color: "#fff",
    letterSpacing: 1,
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
