import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteSavedCoupon, fetchSavedCoupons } from '../services/savedCoupons';
import { showCustomAlert } from '../components/CustomAlert';
import { PRICE_FONT_FAMILY, PRICE_FONT_WEIGHT } from '../styles/typography';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0);

const formatCouponValue = (coupon) => {
  const type = coupon.discount_type || coupon.type;
  const value = Number(coupon.discount_value ?? coupon.value ?? 0);
  return type === 'percent' || type === 'percentage'
    ? `${value}%`
    : formatCurrency(value);
};

const formatDate = (dateString) => {
  if (!dateString) return 'Không giới hạn';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Không giới hạn';
  return date.toLocaleDateString('vi-VN');
};

export default function SavedCouponsScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState(null);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('transparent');
        StatusBar.setTranslucent(true);
      }
    }, [])
  );

  const savedCouponQuery = useQuery({
    queryKey: ['saved-coupons'],
    queryFn: fetchSavedCoupons,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 15,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSavedCoupon,
    onSuccess: async () => {
      setDeleteTarget(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['saved-coupons'] }),
        queryClient.invalidateQueries({ queryKey: ['checkout', 'init'] }),
      ]);
      showCustomAlert('Mã giảm giá', 'Đã xoá mã khỏi ví ưu đãi.', [{ text: 'Đồng ý' }]);
    },
    onError: (error) => {
      showCustomAlert('Mã giảm giá', error.message || 'Không thể xoá mã lúc này.', [{ text: 'Đồng ý' }]);
    },
  });

  const coupons = savedCouponQuery.data || [];
  const usableCount = useMemo(
    () => coupons.filter((coupon) => coupon.is_selectable).length,
    [coupons]
  );

  const handleUseCoupon = (coupon) => {
    if (!coupon.is_selectable) {
      showCustomAlert('Mã giảm giá', coupon.disabled_reason || 'Mã này hiện không thể sử dụng.', [{ text: 'Đồng ý' }]);
      return;
    }

    navigation.navigate('Checkout', { selectedCouponCode: coupon.code });
  };

  const renderCoupon = (coupon) => {
    const disabled = !coupon.is_selectable;

    return (
      <View key={coupon.id} style={[styles.couponCard, disabled && styles.couponCardDisabled]}>
        <View style={styles.couponHeader}>
          <View>
            <Text style={styles.couponCode}>{coupon.code}</Text>
            <Text style={styles.couponName} numberOfLines={1}>
              {coupon.name || 'Ưu đãi SORA'}
            </Text>
          </View>
          <View style={[styles.couponDivider, disabled && styles.couponDividerDisabled]} />
          <Text style={[styles.couponValue, disabled && styles.textDisabled]}>
            {formatCouponValue(coupon)}
          </Text>
        </View>

        <View style={styles.couponMetaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="bag-check-outline" size={15} color="#9f273b" />
            <Text style={styles.metaText}>Đơn từ {formatCurrency(coupon.min_spend || coupon.min_order_value)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={15} color={disabled ? '#999' : '#9f273b'} />
            <Text style={[styles.metaText, disabled && styles.textDisabled]}>
              HSD {formatDate(coupon.expires_at)}
            </Text>
          </View>
        </View>

        {disabled ? (
          <View style={styles.disabledNotice}>
            <Ionicons name="alert-circle-outline" size={15} color="#999" />
            <Text style={styles.disabledText}>{coupon.disabled_reason || 'Mã không còn khả dụng.'}</Text>
          </View>
        ) : null}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => setDeleteTarget(coupon)}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={16} color="#9f273b" />
            <Text style={styles.removeBtnText}>Xoá</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.useBtn, disabled && styles.useBtnDisabled]}
            onPress={() => handleUseCoupon(coupon)}
            disabled={disabled}
            activeOpacity={0.85}
          >
            <Text style={styles.useBtnText}>DÙNG MÃ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mã Giảm Giá</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={savedCouponQuery.isRefetching}
            onRefresh={savedCouponQuery.refetch}
            colors={['#9f273b']}
            tintColor="#9f273b"
          />
        }
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="ticket-outline" size={22} color="#9f273b" />
          </View>
          <View style={styles.summaryTextWrap}>
            <Text style={styles.summaryTitle}>Ví ưu đãi SORA</Text>
            <Text style={styles.summarySub}>{usableCount}/{coupons.length} mã có thể dùng khi thanh toán</Text>
          </View>
        </View>

        {savedCouponQuery.isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#9f273b" />
            <Text style={styles.loadingText}>Đang tải ví ưu đãi...</Text>
          </View>
        ) : coupons.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={54} color="#d7b9bf" />
            <Text style={styles.emptyTitle}>Bạn chưa lưu mã nào</Text>
            <Text style={styles.emptyText}>Hãy lưu mã ưu đãi từ trang chủ để dùng nhanh khi thanh toán.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
              <Text style={styles.emptyBtnText}>VỀ TRANG CHỦ</Text>
            </TouchableOpacity>
          </View>
        ) : (
          coupons.map(renderCoupon)
        )}
      </ScrollView>

      <Modal transparent visible={!!deleteTarget} animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="trash-outline" size={28} color="#9f273b" />
            <Text style={styles.modalTitle}>Xoá mã giảm giá?</Text>
            <Text style={styles.modalText}>
              Mã {deleteTarget?.code} sẽ được xoá khỏi ví ưu đãi của bạn.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setDeleteTarget(null)}>
                <Text style={styles.modalCancelText}>HUỶ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <ActivityIndicator size={16} color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>XOÁ</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: Platform.OS === 'ios' ? 0 : 28 },
  header: {
    height: 56,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  summaryCard: {
    backgroundColor: '#fffdf9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1e5d5',
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff4f4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryTextWrap: {
    flex: 1,
  },
  summaryTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    color: '#333',
  },
  summarySub: {
    marginTop: 3,
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#777',
  },
  couponCard: {
    backgroundColor: '#fffdf9',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e7ce7d',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#e7ce7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    elevation: 4,
  },
  couponCardDisabled: {
    opacity: 0.72,
    backgroundColor: '#fbfbfb',
    borderColor: '#d8d8d8',
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  couponCode: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 18,
    color: '#1f1a1b',
    letterSpacing: 1,
  },
  couponName: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#777',
    marginTop: 2,
    maxWidth: 190,
  },
  couponDivider: {
    width: 1,
    height: 34,
    backgroundColor: 'rgba(231, 206, 125, 0.45)',
    marginLeft: 'auto',
  },
  couponDividerDisabled: {
    backgroundColor: '#ddd',
  },
  couponValue: {
    fontFamily: PRICE_FONT_FAMILY,
    fontWeight: PRICE_FONT_WEIGHT,
    fontSize: 22,
    color: '#9f273b',
  },
  couponMetaRow: {
    marginTop: 12,
    gap: 7,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#555',
  },
  disabledNotice: {
    marginTop: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 7,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  disabledText: {
    flex: 1,
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#777',
  },
  textDisabled: {
    color: '#999',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  removeBtnText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 12,
    color: '#9f273b',
  },
  useBtn: {
    backgroundColor: '#9f273b',
    borderRadius: 8,
    paddingHorizontal: 18,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  useBtnDisabled: {
    backgroundColor: '#bbb',
  },
  useBtnText: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 12,
    color: '#fff',
    letterSpacing: 1,
  },
  centerState: {
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Oswald_500Medium',
    color: '#9f273b',
  },
  emptyState: {
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: '#1f1a1b',
    marginTop: 14,
  },
  emptyText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  emptyBtn: {
    marginTop: 18,
    backgroundColor: '#9f273b',
    borderRadius: 8,
    paddingHorizontal: 18,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBtnText: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 12,
    color: '#fff',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 19,
    color: '#1f1a1b',
    marginTop: 10,
  },
  modalText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  modalCancel: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontFamily: 'Oswald_600SemiBold',
    color: '#555',
  },
  modalConfirm: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#9f273b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontFamily: 'Oswald_600SemiBold',
    color: '#fff',
  },
});
