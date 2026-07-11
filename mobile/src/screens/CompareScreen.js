import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config/api';
import SmartImage from '../components/SmartImage';
import { showCustomAlert } from '../components/CustomAlert';
import { PRICE_FONT_FAMILY, PRICE_FONT_WEIGHT } from '../styles/typography';

const STORAGE_KEY = 'sora_compare_products';
const MAX_COMPARE_PRODUCTS = 4;
const PRODUCT_COLUMN_WIDTH = 164;

const getStorageUrl = (path) => {
  if (!path) return '';
  const origin = API_BASE_URL.replace(/\/api$/, '');
  if (path.startsWith('http')) {
    return path
      .replace(/http:\/\/(127\.0\.0\.1|localhost):8000/g, origin)
      .replace(/https:\/\/(127\.0\.0\.1|localhost):8000/g, origin);
  }
  if (path.startsWith('/storage/')) return `${origin}${path}`;
  if (path.startsWith('storage/')) return `${origin}/${path}`;
  return `${origin}/storage/${path.startsWith('/') ? path.slice(1) : path}`;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0);

const getPrice = (product) => Number(product?.promotional_price || product?.base_price || 0);

const getDescription = (value) => {
  if (!value) return 'Chưa cập nhật';
  return value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

const getCompareRecommendation = (products) => {
  if (products.length < 2) {
    return 'Thêm ít nhất 2 sản phẩm để SORA chỉ ra điểm khác biệt rõ hơn.';
  }

  const availableProducts = products.filter((product) => Number(product.stock_quantity || 0) > 0);
  const candidates = availableProducts.length > 0 ? availableProducts : products;
  const best = candidates.reduce((winner, product) => {
    if (!winner) return product;
    const productPrice = getPrice(product);
    const winnerPrice = getPrice(winner);
    if (productPrice > 0 && (winnerPrice === 0 || productPrice < winnerPrice)) return product;
    return winner;
  }, null);

  if (!best) {
    return 'Các sản phẩm đang khá tương đồng, hãy ưu tiên mẫu hợp phong cách của bạn nhất.';
  }

  return `${best.name} đang là lựa chọn đáng cân nhắc nhờ mức giá tốt${Number(best.stock_quantity || 0) > 0 ? ' và còn hàng' : ''}.`;
};

const readStoredCompareProducts = async () => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  const items = stored ? JSON.parse(stored) : [];
  return Array.isArray(items) ? items.slice(0, MAX_COMPARE_PRODUCTS) : [];
};

const fetchCompareProducts = async (items) => {
  const ids = items.map((item) => item.id);
  if (ids.length === 0) return [];

  const response = await fetch(`${API_BASE_URL}/shop/sora/compare`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ product_ids: ids }),
  });
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Không thể tải dữ liệu so sánh.');
  }

  return result.data || [];
};

const fetchCompareSuggestions = async () => {
  const response = await fetch(`${API_BASE_URL}/shop/sora/products?per_page=30&sort=recommended`, {
    headers: { Accept: 'application/json' },
  });
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Không thể tải sản phẩm gợi ý.');
  }

  return result.data?.data || [];
};

export default function CompareScreen({ navigation }) {
  const queryClient = useQueryClient();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [showDiffOnly, setShowDiffOnly] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [removingProductId, setRemovingProductId] = useState(null);

  const selectedIds = useMemo(
    () => selectedProducts.map((item) => item.id).join(','),
    [selectedProducts]
  );

  const storedCompareQuery = useQuery({
    queryKey: ['compare', 'selected'],
    queryFn: readStoredCompareProducts,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (storedCompareQuery.data) {
      setSelectedProducts(storedCompareQuery.data);
    }
  }, [storedCompareQuery.data]);

  const compareQuery = useQuery({
    queryKey: ['compare', 'products', selectedIds],
    queryFn: () => fetchCompareProducts(selectedProducts),
    enabled: !storedCompareQuery.isLoading,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
  });

  const suggestionQuery = useQuery({
    queryKey: ['compare', 'suggestions'],
    queryFn: fetchCompareSuggestions,
    enabled: isPickerVisible,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });

  useEffect(() => {
    if (compareQuery.isError) {
      console.log('Error loading compare products:', compareQuery.error);
      showCustomAlert('So sánh sản phẩm', compareQuery.error?.message || 'Không thể tải dữ liệu so sánh.');
    }
  }, [compareQuery.isError, compareQuery.error]);

  useEffect(() => {
    if (suggestionQuery.isError) {
      console.log('Error loading compare suggestions:', suggestionQuery.error);
    }
  }, [suggestionQuery.isError, suggestionQuery.error]);

  const products = compareQuery.data || [];
  const suggestions = suggestionQuery.data || [];
  const isLoading = (storedCompareQuery.isLoading || compareQuery.isLoading) && products.length === 0;
  const isRefreshing = compareQuery.isRefetching && products.length > 0;
  const isSuggestionLoading = suggestionQuery.isFetching && suggestions.length === 0;

  const openPicker = () => {
    setIsPickerVisible(true);
  };

  const persistAndRefresh = async (items) => {
    setSelectedProducts(items);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    queryClient.setQueryData(['compare', 'selected'], items);
    queryClient.invalidateQueries({ queryKey: ['compare', 'products'] });
  };

  const toggleProduct = async (product) => {
    const exists = selectedProducts.some((item) => item.id === product.id);
    if (!exists && selectedProducts.length >= MAX_COMPARE_PRODUCTS) {
      showCustomAlert('So sánh sản phẩm', 'Bạn chỉ có thể so sánh tối đa 4 sản phẩm.');
      return;
    }

    const nextItems = exists
      ? selectedProducts.filter((item) => item.id !== product.id)
      : [...selectedProducts, { id: product.id, name: product.name, slug: product.slug }];
    await persistAndRefresh(nextItems);
  };

  const removeProduct = async (productId) => {
    if (removingProductId !== null) return;

    setRemovingProductId(productId);
    try {
      await persistAndRefresh(selectedProducts.filter((item) => item.id !== productId));
    } finally {
      setRemovingProductId(null);
    }
  };

  const clearProducts = async () => {
    await persistAndRefresh([]);
  };

  const onRefresh = async () => {
    await Promise.all([
      compareQuery.refetch(),
      suggestionQuery.data ? suggestionQuery.refetch() : Promise.resolve(),
    ]);
  };

  const specificationKeys = useMemo(() => {
    const keys = products.flatMap((product) => Object.keys(product.specifications || {}));
    return [...new Set(keys)];
  }, [products]);

  const bestPrice = useMemo(() => {
    const prices = products.map(getPrice).filter((price) => price > 0);
    return prices.length > 0 ? Math.min(...prices) : null;
  }, [products]);

  const hasDifference = (getter) => {
    const values = products.map((product) => String(getter(product) ?? ''));
    return new Set(values).size > 1;
  };

  const rawCriteria = useMemo(() => ([
      { label: 'Mức giá', type: 'price', value: (product) => formatCurrency(getPrice(product)) },
      {
        label: 'Tồn kho',
        type: 'stock',
        value: (product) => product.stock_quantity > 0 ? `Còn hàng (${product.stock_quantity})` : 'Hết hàng',
      },
      { label: 'Thương hiệu', value: (product) => product.brand_name || 'Chưa cập nhật' },
      { label: 'Danh mục', value: (product) => product.category_name || 'Chưa cập nhật' },
      ...specificationKeys.map((key) => ({
        label: key,
        value: (product) => product.specifications?.[key] || 'Chưa cập nhật',
      })),
      { label: 'Mô tả', type: 'description', value: (product) => getDescription(product.description) },
  ]), [specificationKeys]);

  const differenceCount = useMemo(
    () => rawCriteria.filter((row) => hasDifference(row.value)).length,
    [rawCriteria, products]
  );

  const compareRecommendation = useMemo(
    () => getCompareRecommendation(products),
    [products]
  );

  const criteria = useMemo(
    () => showDiffOnly ? rawCriteria.filter((row) => hasDifference(row.value)) : rawCriteria,
    [products, rawCriteria, showDiffOnly]
  );

  return (
    <>
      <SafeAreaView style={styles.topSafe} />
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#9f273b" translucent={false} />

        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerEyebrow}>SORA JEWELRY</Text>
            <Text style={styles.headerTitle}>So Sánh Sản Phẩm</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn} onPress={openPicker}>
            <Ionicons name="add" size={24} color="#fff" />
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
          <View style={styles.introBand}>
            <View style={styles.introIcon}>
              <MaterialCommunityIcons name="diamond-stone" size={18} color="#e7ce7d" />
            </View>
            <View style={styles.introCopy}>
              <Text style={styles.introTitle}>Chọn lựa rõ ràng hơn</Text>
              <Text style={styles.introText}>Đối chiếu giá, tồn kho và thông tin nổi bật.</Text>
            </View>
          </View>

          <View style={styles.toolbar}>
            <View style={styles.countBadge}>
              <Ionicons name="git-compare-outline" size={14} color="#9f273b" />
              <Text style={styles.toolbarCount}>{products.length}/{MAX_COMPARE_PRODUCTS} sản phẩm</Text>
            </View>
            <View style={styles.toolbarActions}>
              <TouchableOpacity style={styles.diffToggle} onPress={() => setShowDiffOnly((value) => !value)}>
                <Ionicons
                  name={showDiffOnly ? 'checkbox' : 'square-outline'}
                  size={18}
                  color={showDiffOnly ? '#9f273b' : '#999'}
                />
                <Text style={styles.diffToggleText}>Chỉ xem khác biệt</Text>
              </TouchableOpacity>
              {products.length > 0 && (
                <TouchableOpacity style={styles.clearBtn} onPress={clearProducts}>
                  <Ionicons name="trash-outline" size={15} color="#9f273b" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {products.length > 0 && (
            <View style={styles.insightPanel}>
              <View style={styles.insightMetric}>
                <Text style={styles.insightNumber}>{differenceCount}</Text>
                <Text style={styles.insightLabel}>điểm khác biệt</Text>
              </View>
              <View style={styles.insightDivider} />
              <View style={styles.insightCopy}>
                <View style={styles.insightTitleRow}>
                  <Ionicons name="sparkles-outline" size={15} color="#9f273b" />
                  <Text style={styles.insightTitle}>Gợi ý nhanh</Text>
                </View>
                <Text style={styles.insightText}>{compareRecommendation}</Text>
              </View>
            </View>
          )}

          {isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color="#9f273b" />
              <Text style={styles.stateText}>Đang tải dữ liệu so sánh...</Text>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.centerState}>
              <MaterialCommunityIcons name="compare-horizontal" size={44} color="#d8c69a" />
              <Text style={styles.emptyTitle}>Chưa có sản phẩm so sánh</Text>
              <Text style={styles.stateText}>Thêm từ 2 đến 4 sản phẩm để bắt đầu.</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={openPicker}>
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>THÊM SẢN PHẨM</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.sectionHeading}>
                <Text style={styles.sectionTitle}>CHI TIẾT SO SÁNH</Text>
                <View style={styles.scrollHint}>
                  <Ionicons name="swap-horizontal-outline" size={15} color="#8c826e" />
                  <Text style={styles.scrollHintText}>Kéo ngang để xem thêm</Text>
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.criteriaTable}>
                  <View style={[styles.criteriaBlock, styles.criteriaIdentityBlock]}>
                    <Text style={styles.criteriaTitle}>SẢN PHẨM</Text>
                    <View style={styles.criteriaValueRow}>
                      {products.map((product) => (
                        <View key={`identity-${product.id}`} style={styles.productColumn}>
                          {bestPrice !== null && getPrice(product) === bestPrice && products.length > 1 && (
                            <View style={styles.bestPriceBadge}>
                              <Text style={styles.bestPriceBadgeText}>GIÁ TỐT</Text>
                            </View>
                          )}
                          <TouchableOpacity
                            style={styles.removeBtn}
                            onPress={() => removeProduct(product.id)}
                            disabled={removingProductId !== null}
                          >
                            {removingProductId === product.id ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <Ionicons name="close" size={15} color="#fff" />
                            )}
                          </TouchableOpacity>
                          <SmartImage
                            source={{ uri: getStorageUrl(product.thumbnail_image) }}
                            style={styles.productImage}
                            resizeMode="cover"
                          />
                          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                          <Text style={styles.productPrice}>{formatCurrency(getPrice(product))}</Text>
                          <TouchableOpacity
                            style={styles.detailBtn}
                            onPress={() => navigation.navigate('ProductDetail', { slug: product.slug })}
                          >
                            <Text style={styles.detailBtnText}>XEM CHI TIẾT</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                      {products.length < MAX_COMPARE_PRODUCTS && (
                        <TouchableOpacity style={[styles.productColumn, styles.addColumn]} onPress={openPicker}>
                          <Ionicons name="add-circle-outline" size={34} color="#9f273b" />
                          <Text style={styles.addColumnText}>Thêm sản phẩm</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  {criteria.map((row, rowIndex) => {
                    const isDifferentRow = hasDifference(row.value);
                    const rowKey = `${row.type || 'criteria'}-${rowIndex}-${row.label}`;
                    return (
                    <View
                      key={rowKey}
                      style={[
                        styles.criteriaBlock,
                        rowIndex % 2 === 1 && styles.criteriaBlockAlt,
                        isDifferentRow && styles.criteriaBlockDifferent,
                      ]}
                    >
                      <View style={styles.criteriaTitleRow}>
                        <Text style={[styles.criteriaTitle, styles.criteriaTitleInRow]}>{row.label}</Text>
                        {isDifferentRow && (
                          <View style={styles.differenceBadge}>
                            <Text style={styles.differenceBadgeText}>KHÁC BIỆT</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.criteriaValueRow}>
                        {products.map((product) => {
                          const value = row.value(product);
                          const isDescriptionExpanded = !!expandedDescriptions[product.id];
                          return (
                            <View
                              key={`${rowKey}-${product.id}`}
                              style={[
                                styles.criteriaValueCell,
                                isDifferentRow && styles.criteriaDifferentCell,
                                row.type === 'price' && bestPrice !== null && getPrice(product) === bestPrice && styles.criteriaBestCell,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.criteriaValue,
                                  row.type === 'price' && styles.criteriaPriceValue,
                                  row.type === 'stock' && (
                                    product.stock_quantity > 0 ? styles.criteriaStockIn : styles.criteriaStockOut
                                  ),
                                ]}
                                numberOfLines={row.type === 'description' && !isDescriptionExpanded ? 3 : undefined}
                              >
                                {value}
                              </Text>
                              {row.type === 'description' && value.length > 100 && (
                                <TouchableOpacity
                                  style={styles.descriptionToggle}
                                  onPress={() => setExpandedDescriptions((current) => ({
                                    ...current,
                                    [product.id]: !current[product.id],
                                  }))}
                                >
                                  <Text style={styles.descriptionToggleText}>
                                    {isDescriptionExpanded ? 'Thu gọn' : 'Xem thêm'}
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          );
                        })}
                        {products.length < MAX_COMPARE_PRODUCTS && (
                          <View style={[styles.criteriaValueCell, styles.criteriaPlaceholderCell]} />
                        )}
                      </View>
                    </View>
                  );
                  })}
                </View>
              </ScrollView>
            </>
          )}
        </ScrollView>

        <Modal visible={isPickerVisible} transparent animationType="slide" onRequestClose={() => setIsPickerVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsPickerVisible(false)} />
            <View style={styles.pickerSheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetEyebrow}>SORA JEWELRY</Text>
                  <Text style={styles.sheetTitle}>Chọn Sản Phẩm So Sánh</Text>
                </View>
                <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setIsPickerVisible(false)}>
                  <Ionicons name="close" size={22} color="#222" />
                </TouchableOpacity>
              </View>

              {isSuggestionLoading ? (
                <View style={styles.sheetLoading}>
                  <ActivityIndicator size="large" color="#9f273b" />
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.suggestionList}>
                  {suggestions.map((product) => {
                    const selected = selectedProducts.some((item) => item.id === product.id);
                    return (
                      <TouchableOpacity
                        key={product.id}
                        style={[styles.suggestionRow, selected && styles.suggestionRowSelected]}
                        onPress={() => toggleProduct(product)}
                        activeOpacity={0.85}
                      >
                        <SmartImage
                          source={{ uri: getStorageUrl(product.thumbnail_image) }}
                          style={styles.suggestionImage}
                          resizeMode="cover"
                        />
                        <View style={styles.suggestionInfo}>
                          <Text style={styles.suggestionName} numberOfLines={2}>{product.name}</Text>
                          <Text style={styles.suggestionPrice}>{formatCurrency(getPrice(product))}</Text>
                        </View>
                        <Ionicons
                          name={selected ? 'checkmark-circle' : 'add-circle-outline'}
                          size={23}
                          color={selected ? '#9f273b' : '#999'}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              <TouchableOpacity style={styles.sheetDoneBtn} onPress={() => setIsPickerVisible(false)}>
                <Text style={styles.sheetDoneText}>HOÀN TẤT ({selectedProducts.length})</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  topSafe: { flex: 0, backgroundColor: '#9f273b' },
  safe: { flex: 1, backgroundColor: '#f7f7f7' },
  header: { minHeight: 68, paddingHorizontal: 14, backgroundColor: '#9f273b', flexDirection: 'row', alignItems: 'center' },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.13)' },
  headerTitleWrap: { flex: 1, alignItems: 'center' },
  headerEyebrow: { fontFamily: 'Oswald_500Medium', fontSize: 9, color: '#e7ce7d', letterSpacing: 2 },
  headerTitle: { marginTop: 2, fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: '#fff' },
  content: { paddingBottom: 34 },
  introBand: { paddingHorizontal: 16, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff' },
  introIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#9f273b' },
  introCopy: { flex: 1, marginLeft: 11 },
  introTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: '#9f273b' },
  introText: { marginTop: 2, fontFamily: 'Oswald_400Regular', fontSize: 11.5, lineHeight: 16, color: '#777' },
  toolbar: { minHeight: 52, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee' },
  countBadge: { height: 28, paddingHorizontal: 9, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fffafa', borderWidth: 1, borderColor: '#ead9dc' },
  toolbarCount: { fontFamily: 'Oswald_600SemiBold', fontSize: 12, color: '#333' },
  toolbarActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  diffToggle: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  diffToggleText: { fontFamily: 'Oswald_400Regular', fontSize: 11, color: '#666' },
  clearBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fffafa' },
  insightPanel: { marginHorizontal: 14, marginTop: 12, marginBottom: 4, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ead8a3', backgroundColor: '#fffdf6', flexDirection: 'row', alignItems: 'center' },
  insightMetric: { width: 74, alignItems: 'center', justifyContent: 'center' },
  insightNumber: { fontFamily: PRICE_FONT_FAMILY, fontWeight: PRICE_FONT_WEIGHT, fontSize: 25, color: '#9f273b' },
  insightLabel: { marginTop: 1, textAlign: 'center', fontFamily: 'Oswald_400Regular', fontSize: 10, color: '#8c826e' },
  insightDivider: { width: 1, alignSelf: 'stretch', marginHorizontal: 10, backgroundColor: '#ead8a3' },
  insightCopy: { flex: 1 },
  insightTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  insightTitle: { fontFamily: 'Oswald_600SemiBold', fontSize: 12, color: '#9f273b', letterSpacing: 0.5 },
  insightText: { fontFamily: 'Oswald_400Regular', fontSize: 12, lineHeight: 17, color: '#5f5647' },
  centerState: { minHeight: 330, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center' },
  stateText: { marginTop: 9, textAlign: 'center', fontFamily: 'Oswald_400Regular', fontSize: 13, color: '#888' },
  emptyTitle: { marginTop: 12, fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, color: '#333' },
  primaryBtn: { minWidth: 170, height: 44, marginTop: 18, borderRadius: 7, flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: '#9f273b' },
  primaryBtnText: { fontFamily: 'Oswald_600SemiBold', fontSize: 12, color: '#fff', letterSpacing: 1 },
  productColumn: { width: PRODUCT_COLUMN_WIDTH, minHeight: 258, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fff', position: 'relative' },
  bestPriceBadge: { position: 'absolute', zIndex: 2, top: 8, left: 7, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, backgroundColor: '#e7ce7d' },
  bestPriceBadgeText: { fontFamily: 'Oswald_600SemiBold', fontSize: 9, color: '#6e5315', letterSpacing: 0.5 },
  removeBtn: { position: 'absolute', zIndex: 2, top: 5, right: 5, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#9f273b' },
  productImage: { width: '100%', height: 116, borderRadius: 5, backgroundColor: '#f1f1f1' },
  productName: { minHeight: 38, marginTop: 9, fontFamily: 'Oswald_500Medium', fontSize: 12, lineHeight: 17, color: '#222', textTransform: 'uppercase' },
  productPrice: { marginTop: 6, fontFamily: PRICE_FONT_FAMILY, fontWeight: PRICE_FONT_WEIGHT, fontSize: 15, color: '#9f273b' },
  detailBtn: { height: 34, marginTop: 10, borderRadius: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: '#9f273b' },
  detailBtnText: { fontFamily: 'Oswald_600SemiBold', fontSize: 10, color: '#fff', letterSpacing: 0.7 },
  addColumn: { minHeight: 258, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderColor: '#caa8ae', backgroundColor: '#fffafa' },
  addColumnText: { marginTop: 8, fontFamily: 'Oswald_500Medium', fontSize: 12, color: '#9f273b' },
  sectionHeading: { minHeight: 42, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f7f7f7' },
  sectionTitle: { fontFamily: 'Oswald_600SemiBold', fontSize: 13, color: '#333', letterSpacing: 1 },
  scrollHint: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scrollHintText: { fontFamily: 'Oswald_400Regular', fontSize: 10.5, color: '#8c826e' },
  criteriaTable: { minWidth: '100%' },
  criteriaBlock: { paddingTop: 11, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
  criteriaBlockAlt: { backgroundColor: '#fffdf9' },
  criteriaBlockDifferent: { borderLeftWidth: 3, borderLeftColor: '#e7ce7d', backgroundColor: '#fffaf0' },
  criteriaIdentityBlock: { backgroundColor: '#fffafa' },
  criteriaTitleRow: { paddingHorizontal: 14, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  criteriaTitle: { paddingHorizontal: 14, paddingBottom: 8, fontFamily: 'Oswald_600SemiBold', fontSize: 12, color: '#9f273b', textTransform: 'uppercase' },
  criteriaTitleInRow: { paddingHorizontal: 0, paddingBottom: 0 },
  differenceBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: '#e7ce7d' },
  differenceBadgeText: { fontFamily: 'Oswald_600SemiBold', fontSize: 8.5, color: '#6e5315', letterSpacing: 0.4 },
  criteriaValueRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 10 },
  criteriaValueCell: { width: PRODUCT_COLUMN_WIDTH, minHeight: 54, padding: 10, borderRadius: 6, backgroundColor: '#fafafa' },
  criteriaDifferentCell: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#f0dfb1' },
  criteriaBestCell: { backgroundColor: '#fff7df', borderColor: '#e7ce7d' },
  criteriaPlaceholderCell: { borderWidth: 1, borderStyle: 'dashed', borderColor: '#ead9dc', backgroundColor: '#fffafa' },
  criteriaValue: { fontFamily: 'Oswald_400Regular', fontSize: 12, lineHeight: 17, color: '#555' },
  criteriaPriceValue: { fontFamily: PRICE_FONT_FAMILY, fontWeight: PRICE_FONT_WEIGHT, fontSize: 14, color: '#9f273b' },
  criteriaStockIn: { fontFamily: 'Oswald_500Medium', color: '#23733d' },
  criteriaStockOut: { fontFamily: 'Oswald_500Medium', color: '#b42332' },
  descriptionToggle: { alignSelf: 'flex-start', marginTop: 6, paddingVertical: 2 },
  descriptionToggleText: { fontFamily: 'Oswald_600SemiBold', fontSize: 11, color: '#9f273b', textDecorationLine: 'underline' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  pickerSheet: { maxHeight: '82%', borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: '#fff', overflow: 'hidden' },
  sheetHandle: { width: 42, height: 4, marginTop: 8, marginBottom: 5, alignSelf: 'center', borderRadius: 2, backgroundColor: '#d6d6d6' },
  sheetHeader: { minHeight: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#eee' },
  sheetEyebrow: { fontFamily: 'Oswald_500Medium', fontSize: 9, color: '#9f273b', letterSpacing: 1.5 },
  sheetTitle: { marginTop: 2, fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: '#222' },
  sheetCloseBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  sheetLoading: { minHeight: 240, alignItems: 'center', justifyContent: 'center' },
  suggestionList: { padding: 12, gap: 8 },
  suggestionRow: { minHeight: 76, padding: 8, borderRadius: 7, borderWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff' },
  suggestionRowSelected: { borderColor: '#9f273b', backgroundColor: '#fffafa' },
  suggestionImage: { width: 58, height: 58, borderRadius: 5, backgroundColor: '#f1f1f1' },
  suggestionInfo: { flex: 1, marginHorizontal: 10 },
  suggestionName: { fontFamily: 'Oswald_500Medium', fontSize: 12, lineHeight: 16, color: '#333', textTransform: 'uppercase' },
  suggestionPrice: { marginTop: 4, fontFamily: PRICE_FONT_FAMILY, fontWeight: PRICE_FONT_WEIGHT, fontSize: 14, color: '#9f273b' },
  sheetDoneBtn: { height: 48, marginHorizontal: 14, marginTop: 7, marginBottom: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: '#9f273b' },
  sheetDoneText: { fontFamily: 'Oswald_600SemiBold', fontSize: 13, color: '#fff', letterSpacing: 1.1 },
});
