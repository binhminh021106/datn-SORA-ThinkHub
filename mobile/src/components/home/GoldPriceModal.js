import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../config/api';
import { PRICE_FONT_FAMILY, PRICE_FONT_WEIGHT } from '../../styles/typography';

const { height: SCREEN_H } = Dimensions.get('window');
const GOLD_PRICE_TIMEOUT_MS = 10000;

const fetchWithTimeout = async (url, options = {}, timeoutMs = GOLD_PRICE_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

export default function GoldPriceModal({ visible, onClose }) {
  const [prices, setPrices] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;

  const fetchGoldPrices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/client/gold-prices`, {
        headers: { Accept: 'application/json' },
      });
      const result = await response.json();
      if (result.success) {
        setPrices(result.data.prices || []);
        setLastUpdated(result.data.last_updated || '');
      } else {
        setError(result.message || 'Lỗi tải giá vàng từ hệ thống.');
      }
    } catch (e) {
      console.log('Error fetching gold prices:', e);
      if (e?.name === 'AbortError') {
        setError('Kết nối giá vàng quá lâu. Vui lòng thử lại sau.');
        return;
      }
      setError('Không thể kết nối đến máy chủ SORA. Vui lòng kiểm tra mạng!');
    } finally {
      setLoading(false);
    }
  };

  const closeWithAnimation = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_H,
      duration: 250,
      useNativeDriver: true,
    }).start(onClose);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        const clampedY = Math.max(0, gestureState.dy);
        translateY.setValue(clampedY);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.8) {
          closeWithAnimation();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 70,
            friction: 9,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (!visible) return;
    translateY.setValue(SCREEN_H);
    fetchGoldPrices();
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 70,
      friction: 9,
    }).start();
  }, [visible, translateY]);

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={closeWithAnimation}>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={closeWithAnimation}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.goldModalContent,
            { height: SCREEN_H * 0.85, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.goldHeader} {...panResponder.panHandlers}>
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
                Cập nhật lúc: {lastUpdated || (loading ? 'Đang tải...' : 'Chưa cập nhật')}
              </Text>
            </View>
          </View>

          <View style={styles.goldBody}>
            {loading ? (
              <View style={styles.goldLoadingContainer}>
                <ActivityIndicator size="large" color="#e7ce7d" />
                <Text style={styles.goldLoadingText}>Đang kết nối kho dữ liệu SORA Jewelry...</Text>
              </View>
            ) : error ? (
              <View style={styles.goldErrorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#9f273b" />
                <Text style={styles.goldErrorText}>{error}</Text>
                <TouchableOpacity style={styles.goldRetryButton} onPress={fetchGoldPrices}>
                  <Text style={styles.goldRetryButtonText}>TẢI LẠI DỮ LIỆU</Text>
                </TouchableOpacity>
              </View>
            ) : prices.length === 0 ? (
              <View style={styles.goldErrorContainer}>
                <Ionicons name="information-circle-outline" size={48} color="#e7ce7d" />
                <Text style={styles.goldErrorText}>Tạm thời chưa có dữ liệu giá vàng. Vui lòng quay lại sau!</Text>
                <TouchableOpacity style={styles.goldRetryButton} onPress={fetchGoldPrices}>
                  <Text style={styles.goldRetryButtonText}>THỬ LẠI</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={prices}
                keyExtractor={(item, index) => index.toString()}
                ListHeaderComponent={() => (
                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: 'left', paddingLeft: 12 }]}>LOẠI VÀNG</Text>
                    <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>MUA VÀO</Text>
                    <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center', paddingRight: 12 }]}>BÁN RA</Text>
                  </View>
                )}
                renderItem={({ item, index }) => (
                  <View style={[styles.tableDataRow, { backgroundColor: index % 2 === 0 ? '#ffffff' : '#faf8f5' }]}>
                    <Text style={[styles.tableDataCellName, { flex: 2, textAlign: 'left', paddingLeft: 12 }]} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={[styles.tableDataCellPriceBuy, { flex: 1, textAlign: 'center' }]}>{item.buy}</Text>
                    <Text style={[styles.tableDataCellPriceSell, { flex: 1, textAlign: 'center', paddingRight: 12 }]}>{item.sell}</Text>
                  </View>
                )}
                contentContainerStyle={{ paddingBottom: 15 }}
              />
            )}
          </View>

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

            <TouchableOpacity style={styles.goldCloseBtn} onPress={closeWithAnimation}>
              <Text style={styles.goldCloseBtnText}>ĐÓNG BẢNG GIÁ</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  goldModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  goldHeaderTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  goldHeaderTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: '#ffffff',
    letterSpacing: 1,
  },
  goldDivider: { width: 40, height: 1, backgroundColor: '#e7ce7d', marginVertical: 6 },
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
  goldBody: { flex: 1, backgroundColor: '#fffdf9' },
  goldLoadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
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
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
    fontSize: 15,
    color: '#1e7e34',
    letterSpacing: 0.5,
  },
  tableDataCellPriceSell: {
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
    fontSize: 15,
    color: '#c82333',
    letterSpacing: 0.5,
  },
  goldFooter: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
    padding: 16,
  },
  goldInfoItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
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
});
