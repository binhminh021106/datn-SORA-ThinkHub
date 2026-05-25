import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar,
  ScrollView, ActivityIndicator, Platform, Image, RefreshControl,
  TextInput, Modal, Animated, PanResponder, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../config/api';
import { showCustomAlert } from '../components/CustomAlert';

const Alert = {
  alert: (title, message, buttons) => showCustomAlert(title, message, buttons)
};

const { height: SCREEN_H } = Dimensions.get('window');

// Snap points for the draggable sheet
const SNAP_COLLAPSED = SCREEN_H * 0.38; // collapsed: header + progress only
const SNAP_EXPANDED  = SCREEN_H * 0.92; // expanded: full content

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatCurrency = (v) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v) || 0);

const formatDate = (dateStr, short = false) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const hm = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  const dm = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
  if (short) return `${hm}\n${dm}`;
  return `${dm}/${d.getFullYear()}  ${hm}`;
};

const STATUS_CONFIG = {
  pending:          { label: 'Chờ xác nhận',      color: '#9f273b', bg: '#fffbeb', icon: 'receipt-outline' },
  confirmed:        { label: 'Đã xác nhận',        color: '#9f273b', bg: '#eff6ff', icon: 'cube-outline' },
  shipping:         { label: 'Đang giao hàng',     color: '#9f273b', bg: '#eef2ff', icon: 'bicycle-outline' },
  delivered:        { label: 'Đã giao thành công', color: '#9f273b', bg: '#f0fdf4', icon: 'checkmark-circle-outline' },
  cancelled:        { label: 'Đã huỷ',             color: '#ef4444', bg: '#fef2f2', icon: 'close-circle-outline' },
  return_requested: { label: 'Yêu cầu trả hàng',  color: '#a855f7', bg: '#faf5ff', icon: 'return-down-back-outline' },
  returned:         { label: 'Đã hoàn trả',        color: '#6b7280', bg: '#f9fafb', icon: 'archive-outline' },
};

const getStatusConfig = (s) => STATUS_CONFIG[s] || { label: s, color: '#6b7280', bg: '#f9fafb', icon: 'ellipse-outline' };

// Steps for the progress timeline (normal flow)
const PROGRESS_STEPS = [
  { key: 'pending',   label: 'Chờ xác nhận', icon: 'receipt-outline' },
  { key: 'confirmed', label: 'Đã xác nhận',  icon: 'cube-outline' },
  { key: 'shipping',  label: 'Đang giao',     icon: 'bicycle-outline' },
  { key: 'delivered', label: 'Hoàn tất',      icon: 'checkmark-circle-outline' },
];

const STATUS_STEP_INDEX = { pending: 0, confirmed: 1, shipping: 2, delivered: 3 };

const getPaymentMethodLabel = (m) => ({ cod: 'COD', momo: 'Ví MoMo', bank: 'Chuyển khoản', vnpay: 'VNPay' }[m] || m || 'N/A');
const getPaymentStatusLabel = (ps) => ps === 'paid' ? { label: 'Đã thanh toán', color: '#22c55e' } : { label: 'Chờ thanh toán', color: '#f59e0b' };
const getItemImage = (path) => {
  if (!path) return 'https://images.unsplash.com/photo-1605100804763-247f67b854d4?q=80&w=300';
  return path.startsWith('http') ? path : `${API_BASE_URL.replace('/api','')}/storage/${path}`;
};

// ─── Progress Timeline Component ─────────────────────────────────────────────
const ProgressTimeline = ({ order }) => {
  const histories  = order?.histories || [];
  const curStatus  = order?.status;
  const isNormal   = !['cancelled','return_requested','returned'].includes(curStatus);
  const curStepIdx = STATUS_STEP_INDEX[curStatus] ?? -1;

  // Build timestamp map from histories
  const timeMap = {};
  histories.forEach(h => { timeMap[h.new_status] = h.created_at; });
  if (!timeMap['pending']) timeMap['pending'] = order?.created_at;

  // Pulse animation for the current active step outer ring
  const pulseAnim = useRef(new Animated.Value(0.92)).current;
  useEffect(() => {
    if (isNormal && curStepIdx !== -1) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.92,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [pulseAnim, isNormal, curStepIdx]);

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0.92, 1.15],
    outputRange: [0.6, 0.95],
    extrapolate: 'clamp',
  });

  if (!isNormal) {
    const st = getStatusConfig(curStatus);
    return (
      <View style={pt.abnormalRow}>
        <View style={[pt.abnormalIcon, { backgroundColor: st.bg }]}>
          <Ionicons name={st.icon} size={22} color={st.color} />
        </View>
        <View>
          <Text style={[pt.abnormalLabel, { color: st.color }]}>{st.label}</Text>
          <Text style={pt.abnormalDate}>{formatDate(timeMap[curStatus] || order?.updated_at)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={pt.container}>
      {PROGRESS_STEPS.map((step, idx) => {
        const done    = curStepIdx >= idx;
        const current = curStepIdx === idx;
        const ts      = timeMap[step.key];

        return (
          <View key={step.key} style={pt.stepCol}>
            {/* Wrapper for line and circle to ensure stable layout */}
            <View style={pt.iconWrapper}>
              {/* Connector line to next step */}
              {idx < PROGRESS_STEPS.length - 1 && (
                <View style={[pt.lineRight, done && curStepIdx > idx && pt.lineActive]} />
              )}

              {/* Render outer ring ONLY for current step, otherwise render circle directly */}
              {current ? (
                <Animated.View style={[pt.outerRingCurrent, { transform: [{ scale: pulseAnim }], opacity: pulseOpacity }]}>
                  <View style={[pt.iconCircle, done && pt.iconCircleDone]}>
                    <Ionicons name={step.icon} size={18} color="#fff" />
                  </View>
                </Animated.View>
              ) : (
                <View style={[pt.iconCircle, done && pt.iconCircleDone]}>
                  <Ionicons name={step.icon} size={done ? 18 : 16} color={done ? '#fff' : '#9ca3af'} />
                </View>
              )}
            </View>

            {/* Label + Time */}
            <Text style={[pt.stepLabel, done && pt.stepLabelDone]} numberOfLines={2}>{step.label}</Text>
            {ts && <Text style={pt.stepTime}>{formatDate(ts, true)}</Text>}
          </View>
        );
      })}
    </View>
  );
};

const pt = StyleSheet.create({
  container: { flexDirection: 'row', paddingHorizontal: 6, paddingVertical: 12, alignItems: 'flex-start', position: 'relative' },
  stepCol: { flex: 1, alignItems: 'center', position: 'relative' },

  iconWrapper: {
    width: '100%',
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  lineRight: {
    position: 'absolute', top: 30, left: '50%', right: '-50%',
    height: 2, backgroundColor: '#e5e7eb', zIndex: 0,
  },
  lineActive: { backgroundColor: '#9f273b' },

  outerRingCurrent: {
    width: 62, height: 62, borderRadius: 31,
    backgroundColor: 'rgba(159, 39, 59, 0.22)', // Đỏ nhạt dày bao ngoài
    alignItems: 'center', justifyContent: 'center',
    zIndex: 2,
  },

  iconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center',
    zIndex: 1, borderWidth: 2, borderColor: '#e5e7eb',
  },
  iconCircleDone: { backgroundColor: '#9f273b', borderColor: '#9f273b' },

  stepLabel: {
    fontFamily: 'Oswald_500Medium', fontSize: 10, color: '#9ca3af',
    textAlign: 'center', marginTop: 6, lineHeight: 13,
  },
  stepLabelDone: { fontFamily: 'Oswald_600SemiBold', color: '#9f273b' },
  stepTime: { fontFamily: 'Oswald_400Regular', fontSize: 9, color: '#9ca3af', textAlign: 'center', marginTop: 2, lineHeight: 12 },

  abnormalRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  abnormalIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  abnormalLabel: { fontFamily: 'Oswald_600SemiBold', fontSize: 14 },
  abnormalDate: { fontFamily: 'Oswald_400Regular', fontSize: 11, color: '#9ca3af', marginTop: 2 },
});

// ─── Star Rating ─────────────────────────────────────────────────────────────
const StarRating = ({ rating, onRate, size = 28 }) => (
  <View style={{ flexDirection: 'row', gap: 6 }}>
    {[1,2,3,4,5].map(star => (
      <TouchableOpacity key={star} onPress={() => onRate?.(star)} activeOpacity={0.7}>
        <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={size} color={star <= rating ? '#f59e0b' : '#d1d5db'} />
      </TouchableOpacity>
    ))}
  </View>
);

const RETURN_REASONS = [
  'Sản phẩm bị lỗi, trầy xước từ trước',
  'Giao sai sản phẩm / sai phân loại',
  'Sản phẩm không giống như mô tả',
  'Thiếu phụ kiện, hộp, quà tặng',
  'Tôi đổi ý, không muốn mua nữa',
  'Lý do khác...',
];

// ─── DetailRow Component ──────────────────────────────────────────────────────
const DetailRow = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <View style={dr.row}>
      <Ionicons name={icon} size={14} color="#9ca3af" style={dr.icon} />
      <Text style={dr.label}>{label}</Text>
      <Text style={dr.value} numberOfLines={3}>{value}</Text>
    </View>
  );
};
const dr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  icon: { marginTop: 1, marginRight: 8, width: 16 },
  label: { width: 110, fontFamily: 'Oswald_400Regular', fontSize: 12, color: '#6b7280' },
  value: { flex: 1, fontFamily: 'Oswald_400Regular', fontSize: 13, color: '#111', textAlign: 'right' },
});

// ─── Draggable Detail Sheet ───────────────────────────────────────────────────
const DraggableDetailSheet = ({ visible, onClose, order, loading, reviewedOrders, onOpenReview, onOpenReturn, onOpenCancel, onReorder }) => {
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const lastY = useRef(SNAP_COLLAPSED);
  const isExpanded = useRef(false);
  const [expanded, setExpanded] = useState(false);

  // Interpolation for pull-up hint opacity (Native-supported)
  const pullHintOpacity = translateY.interpolate({
    inputRange: [SCREEN_H - SNAP_EXPANDED, SCREEN_H - SNAP_COLLAPSED],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const snapTo = useCallback((targetH, animated = true) => {
    const toY = SCREEN_H - targetH;
    lastY.current = targetH;
    const nextExpanded = targetH > SCREEN_H * 0.6;
    isExpanded.current = nextExpanded;
    setExpanded(nextExpanded);
    if (animated) {
      Animated.spring(translateY, {
        toValue: toY,
        useNativeDriver: true,
        damping: 22,
        stiffness: 130,
        mass: 0.8,
      }).start();
    } else {
      translateY.setValue(toY);
    }
  }, [translateY]);

  useEffect(() => {
    if (visible) {
      translateY.setValue(SCREEN_H); // start from bottom
      setExpanded(false);
      setTimeout(() => snapTo(SNAP_COLLAPSED), 30);
    } else {
      Animated.timing(translateY, { toValue: SCREEN_H, duration: 250, useNativeDriver: true }).start();
    }
  }, [visible, snapTo]);

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
    onPanResponderMove: (_, g) => {
      const newY = (SCREEN_H - lastY.current) + g.dy;
      // Clamp between fully offscreen and SNAP_EXPANDED
      const clamped = Math.max(SCREEN_H - SNAP_EXPANDED, Math.min(SCREEN_H, newY));
      translateY.setValue(clamped);
    },
    onPanResponderRelease: (_, g) => {
      const isCurrentlyExpanded = lastY.current === SNAP_EXPANDED;

      if (isCurrentlyExpanded) {
        // We are currently EXPANDED
        if (g.dy > 20 || g.vy > 0.05) {
          // Drag down slightly or quick swipe down -> snap back to COLLAPSED
          snapTo(SNAP_COLLAPSED);
        } else {
          // Stay expanded
          snapTo(SNAP_EXPANDED);
        }
      } else {
        // We are currently COLLAPSED
        if (g.dy < -60 || g.vy < -0.2) {
          // Drag up slightly or quick swipe up -> snap to EXPANDED
          snapTo(SNAP_EXPANDED);
        } else if (g.dy > 80 || g.vy > 0.4) {
          // Drag down -> close sheet
          onClose();
        } else {
          // Stay collapsed
          snapTo(SNAP_COLLAPSED);
        }
      }
    },
  })).current;

  if (!visible) return null;

  const alreadyReviewed = order && reviewedOrders[order.order_code];

  return (
    <View style={ds.overlay} pointerEvents="box-none">
      {/* Backdrop */}
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

      <Animated.View style={[ds.sheet, { transform: [{ translateY }] }]}>
        {/* ── Drag handle area ── */}
        <View style={ds.handleArea} {...panResponder.panHandlers}>
          <View style={ds.handle} />
          <View style={ds.sheetHead}>
            <View>
              <Text style={ds.sheetTitle}>Chi Tiết Đơn Hàng</Text>
              {order && <Text style={ds.sheetCode}>#{order.order_code}</Text>}
            </View>
            <TouchableOpacity onPress={onClose} style={ds.closeBtn}>
              <Ionicons name="close" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* ── Progress Timeline (always visible, in handle area so draggable) ── */}
          {loading ? (
            <View style={ds.loadingBlock}>
              <ActivityIndicator size="small" color="#9f273b" />
              <Text style={ds.loadingTxt}>Đang tải đơn hàng...</Text>
            </View>
          ) : order ? (
            <>
              <View style={[ds.section, { marginTop: 12, marginBottom: 8 }]}>
                <View style={ds.sectionHead}>
                  <Ionicons name="time-outline" size={14} color="#9f273b" />
                  <Text style={ds.sectionTitle}>TIẾN TRÌNH</Text>
                </View>
                <View style={ds.infoBox}>
                  <ProgressTimeline order={order} />
                </View>
              </View>
              {/* Pull-up hint */}
              {!expanded && (
                <Animated.View style={{ opacity: pullHintOpacity }}>
                  <View style={ds.pullHint}>
                    <Ionicons name="chevron-up" size={14} color="#9ca3af" />
                    <Text style={ds.pullHintTxt}>Kéo lên để xem chi tiết</Text>
                  </View>
                </Animated.View>
              )}
            </>
          ) : null}
        </View>

        {/* ── Scrollable detail body ── */}
        {order && !loading && (
          <ScrollView
            style={ds.body}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
          >
            {/* Giao hàng */}
            <View style={ds.section}>
              <View style={ds.sectionHead}>
                <Ionicons name="location-outline" size={14} color="#9f273b" />
                <Text style={ds.sectionTitle}>THÔNG TIN GIAO HÀNG</Text>
              </View>
              <View style={ds.infoBox}>
                <DetailRow icon="person-outline"     label="Người nhận"   value={order.customer_name} />
                <DetailRow icon="call-outline"       label="Điện thoại"   value={order.customer_phone} />
                <DetailRow icon="mail-outline"       label="Email"        value={order.customer_email} />
                <DetailRow icon="map-outline"        label="Địa chỉ"      value={order.customer_address} />
                {order.order_note && <DetailRow icon="chatbubble-outline" label="Ghi chú" value={order.order_note} />}
              </View>
            </View>

            {/* Sản phẩm */}
            <View style={ds.section}>
              <View style={ds.sectionHead}>
                <Ionicons name="bag-outline" size={14} color="#9f273b" />
                <Text style={ds.sectionTitle}>SẢN PHẨM ({order.items?.length || 0})</Text>
              </View>
              {order.items?.map((item, idx) => (
                <View key={idx} style={ds.itemRow}>
                  <Image source={{ uri: getItemImage(item.variant_image) }} style={ds.itemImg} />
                  <View style={ds.itemInfo}>
                    <Text style={ds.itemName} numberOfLines={2}>{item.product_name}</Text>
                    {item.variant_sku && <Text style={ds.itemSku}>SKU: {item.variant_sku}</Text>}
                    {item.variant_attributes && (
                      <Text style={ds.itemAttr}>
                        {typeof item.variant_attributes === 'object'
                          ? Object.entries(item.variant_attributes).map(([k,v]) => `${k}: ${v}`).join(' · ')
                          : item.variant_attributes}
                      </Text>
                    )}
                    <View style={ds.itemPriceRow}>
                      <Text style={ds.itemPrice}>{formatCurrency(item.price)}</Text>
                      <Text style={ds.itemQty}>× {item.quantity}</Text>
                      <Text style={ds.itemSubtotal}>{formatCurrency(Number(item.price) * Number(item.quantity))}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Thanh toán */}
            <View style={ds.section}>
              <View style={ds.sectionHead}>
                <Ionicons name="card-outline" size={14} color="#9f273b" />
                <Text style={ds.sectionTitle}>THANH TOÁN</Text>
              </View>
              <View style={ds.infoBox}>
                <SummaryRow label="Tạm tính"            value={formatCurrency(order.sub_total)} />
                {Number(order.discount_amount) > 0 && (
                  <SummaryRow label={`Coupon${order.coupon_code ? ` (${order.coupon_code})` : ''}`} value={`-${formatCurrency(order.discount_amount)}`} valueColor="#22c55e" />
                )}
                {Number(order.tier_discount_amount) > 0 && (
                  <SummaryRow label="Ưu đãi thành viên" value={`-${formatCurrency(order.tier_discount_amount)}`} valueColor="#22c55e" />
                )}
                <SummaryRow label="Phí vận chuyển"      value={Number(order.shipping_fee) === 0 ? 'Miễn phí' : formatCurrency(order.shipping_fee)} />
                <SummaryRow label="Tổng cộng"           value={formatCurrency(order.total_amount)} total />
                <SummaryRow label="Phương thức"         value={getPaymentMethodLabel(order.payment_method)} />
                {order.payment_status && (() => { const ps = getPaymentStatusLabel(order.payment_status); return <SummaryRow label="Trạng thái TT" value={ps.label} valueColor={ps.color} bold />; })()}
              </View>
            </View>



            {/* Actions */}
            <View style={ds.actions}>
              {order.status === 'pending' && (
                <TouchableOpacity style={[ds.actionBtn, ds.actionRed]} onPress={() => onOpenCancel(order.order_code)} activeOpacity={0.85}>
                  <Ionicons name="close-circle-outline" size={16} color="#dc2626" />
                  <Text style={ds.actionRedTxt}>Huỷ đơn hàng</Text>
                </TouchableOpacity>
              )}
              {order.status === 'delivered' && (
                <>
                  <TouchableOpacity style={[ds.actionBtn, ds.actionPurple]} onPress={() => onOpenReturn(order.order_code)} activeOpacity={0.85}>
                    <Ionicons name="return-down-back-outline" size={16} color="#9333ea" />
                    <Text style={ds.actionPurpleTxt}>Yêu cầu trả hàng</Text>
                  </TouchableOpacity>
                  {!alreadyReviewed && (
                    <TouchableOpacity style={[ds.actionBtn, ds.actionPrimary]} onPress={() => onOpenReview(order)} activeOpacity={0.85}>
                      <Ionicons name="star-outline" size={16} color="#fff" />
                      <Text style={ds.actionPrimaryTxt}>Đánh giá sản phẩm</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[ds.actionBtn, ds.actionGhost]} onPress={() => onReorder(order.order_code)} activeOpacity={0.85}>
                    <Ionicons name="refresh-outline" size={16} color="#374151" />
                    <Text style={ds.actionGhostTxt}>Mua lại đơn này</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
            <View style={{ height: 120 }} />
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
};

const SummaryRow = ({ label, value, valueColor, total, bold }) => (
  <View style={[ds.sumRow, total && ds.sumRowTotal]}>
    <Text style={[ds.sumKey, total && ds.sumKeyTotal]}>{label}</Text>
    <Text style={[ds.sumVal, total && ds.sumValTotal, valueColor && { color: valueColor }, bold && { fontFamily: 'Oswald_600SemiBold' }]}>{value}</Text>
  </View>
);

const ds = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 999 },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    height: SNAP_EXPANDED,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 20,
  },
  handleArea: { paddingBottom: 4 },
  handle: { width: 40, height: 4, backgroundColor: '#d1d5db', borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 8 },
  sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  sheetTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, color: '#111' },
  sheetCode: { fontFamily: 'Oswald_400Regular', fontSize: 12, color: '#9ca3af', marginTop: 2 },
  closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },

  loadingBlock: { alignItems: 'center', paddingVertical: 28, flexDirection: 'row', justifyContent: 'center', gap: 10 },
  loadingTxt: { fontFamily: 'Oswald_400Regular', fontSize: 13, color: '#9ca3af' },

  timelineBlock: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  pullHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 6 },
  pullHintTxt: { fontFamily: 'Oswald_400Regular', fontSize: 11, color: '#9ca3af' },

  body: { flex: 1 },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  sectionTitle: { fontFamily: 'Oswald_600SemiBold', fontSize: 12, color: '#374151', letterSpacing: 0.8 },
  infoBox: { backgroundColor: '#f9fafb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },

  itemRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  itemImg: { width: 60, height: 70, borderRadius: 8, backgroundColor: '#f3f4f6' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontFamily: 'Oswald_500Medium', fontSize: 13, color: '#111', marginBottom: 2 },
  itemSku: { fontFamily: 'Oswald_400Regular', fontSize: 11, color: '#9ca3af', marginBottom: 2 },
  itemAttr: { fontFamily: 'Oswald_400Regular', fontSize: 11, color: '#6b7280', marginBottom: 4 },
  itemPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemPrice: { fontFamily: 'Oswald_400Regular', fontSize: 12, color: '#6b7280' },
  itemQty: { fontFamily: 'Oswald_400Regular', fontSize: 12, color: '#6b7280' },
  itemSubtotal: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 13, color: '#9f273b', marginLeft: 'auto' },

  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  sumRowTotal: { borderBottomWidth: 0, paddingTop: 12, marginTop: 4, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  sumKey: { fontFamily: 'Oswald_400Regular', fontSize: 12, color: '#6b7280', flex: 1 },
  sumKeyTotal: { fontFamily: 'Oswald_600SemiBold', fontSize: 14, color: '#111' },
  sumVal: { fontFamily: 'Oswald_400Regular', fontSize: 13, color: '#111' },
  sumValTotal: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: '#9f273b' },

  histRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  histDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3, marginRight: 10 },
  histInfo: { flex: 1 },
  histStatus: { fontFamily: 'Oswald_600SemiBold', fontSize: 13, marginBottom: 2 },
  histNote: { fontFamily: 'Oswald_400Regular', fontSize: 12, color: '#6b7280', marginBottom: 1 },
  histDate: { fontFamily: 'Oswald_400Regular', fontSize: 11, color: '#9ca3af' },

  actions: { marginHorizontal: 16, marginTop: 20, gap: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 46, borderRadius: 10, gap: 8 },
  actionRed: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fca5a5' },
  actionRedTxt: { fontFamily: 'Oswald_600SemiBold', fontSize: 13, color: '#dc2626' },
  actionPurple: { backgroundColor: '#faf5ff', borderWidth: 1, borderColor: '#d8b4fe' },
  actionPurpleTxt: { fontFamily: 'Oswald_600SemiBold', fontSize: 13, color: '#9333ea' },
  actionPrimary: { backgroundColor: '#9f273b' },
  actionPrimaryTxt: { fontFamily: 'Oswald_600SemiBold', fontSize: 13, color: '#fff' },
  actionGhost: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb' },
  actionGhostTxt: { fontFamily: 'Oswald_600SemiBold', fontSize: 13, color: '#374151' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function OrderHistoryScreen() {
  const navigation = useNavigation();
  const [orders, setOrders]           = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [reviewedOrders, setReviewedOrders] = useState({});

  // Detail sheet
  const [showDetail, setShowDetail]       = useState(false);
  const [detailOrder, setDetailOrder]     = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Cancel
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelCode, setCancelCode]           = useState(null);
  const [cancelReason, setCancelReason]       = useState('');
  const [isCancelling, setIsCancelling]       = useState(false);

  // Review
  const [showReviewModal, setShowReviewModal]     = useState(false);
  const [reviewOrder, setReviewOrder]             = useState(null);
  const [reviewItems, setReviewItems]             = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Return
  const [showReturnModal, setShowReturnModal]         = useState(false);
  const [returnCode, setReturnCode]                   = useState(null);
  const [selectedReason, setSelectedReason]           = useState(null);
  const [customReason, setCustomReason]               = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn]   = useState(false);

  useEffect(() => { fetchOrders(true); }, []);

  const fetchOrders = async (overlay = true) => {
    overlay ? setIsLoading(true) : setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return;
      const res  = await fetch(`${API_BASE_URL}/client/orders`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
      const data = await res.json();
      if (res.ok) {
        const list = data.data || [];
        setOrders(list);
        checkReviewed(list.filter(o => o.status === 'delivered'), token);
      }
    } catch (_) {}
    finally { setIsLoading(false); setRefreshing(false); }
  };

  const checkReviewed = async (list, token) => {
    const result = {};
    await Promise.all(list.map(async o => {
      try {
        const r = await fetch(`${API_BASE_URL}/client/orders/${o.order_code}/review`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
        const d = await r.json();
        result[o.order_code] = (d.count || 0) > 0;
      } catch (_) { result[o.order_code] = false; }
    }));
    setReviewedOrders(result);
  };

  const getFiltered = () => {
    switch (selectedTab) {
      case 1: return orders.filter(o => o.status === 'pending');
      case 2: return orders.filter(o => ['confirmed','shipping'].includes(o.status));
      case 3: return orders.filter(o => o.status === 'delivered');
      case 4: return orders.filter(o => ['cancelled','return_requested','returned'].includes(o.status));
      default: return orders;
    }
  };

  // ── Open detail ──────────────────────────────────────────────────────────
  const openDetail = async (orderCode) => {
    setDetailOrder(null);
    setShowDetail(true);
    setLoadingDetail(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const res   = await fetch(`${API_BASE_URL}/client/orders/${orderCode}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
      const data  = await res.json();
      if (res.ok && data.success) setDetailOrder(data.data);
      else { Alert.alert('Lỗi', data.message || 'Không thể tải chi tiết.'); setShowDetail(false); }
    } catch (_) { Alert.alert('Lỗi', 'Không thể kết nối.'); setShowDetail(false); }
    finally { setLoadingDetail(false); }
  };

  // ── Cancel ───────────────────────────────────────────────────────────────
  const openCancel = (code) => { setShowDetail(false); setTimeout(() => { setCancelCode(code); setCancelReason(''); setShowCancelModal(true); }, 250); };
  const submitCancel = async () => {
    if (!cancelReason.trim()) { Alert.alert('Thông báo', 'Vui lòng nhập lý do huỷ.'); return; }
    setIsCancelling(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const res   = await fetch(`${API_BASE_URL}/client/orders/${cancelCode}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ cancel_reason: cancelReason.trim() }) });
      const d = await res.json();
      if (res.ok && d.success) { setShowCancelModal(false); Alert.alert('Thành công', 'Đã huỷ đơn hàng!'); fetchOrders(true); }
      else Alert.alert('Thất bại', d.message || 'Không thể huỷ.');
    } catch (_) { Alert.alert('Lỗi', 'Không thể kết nối.'); }
    finally { setIsCancelling(false); }
  };

  // ── Review ───────────────────────────────────────────────────────────────
  const openReview = (order) => {
    setShowDetail(false);
    setTimeout(() => {
      setReviewOrder(order);
      setReviewItems((order.items || []).map(item => ({ product_id: item.product_id||null, combo_id: item.combo_id||null, name: item.product_name, image: getItemImage(item.variant_image), rating: 5, comment: '', images: [] })));
      setShowReviewModal(true);
    }, 250);
  };
  const updateReviewItem = (idx, field, val) => setReviewItems(prev => { const c=[...prev]; c[idx]={...c[idx],[field]:val}; return c; });
  const pickReviewImage = async (itemIdx) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.8 });
    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      setReviewItems(prev => { const c=[...prev]; if (c[itemIdx].images.length<3) c[itemIdx]={...c[itemIdx],images:[...c[itemIdx].images,uri]}; return c; });
    }
  };
  const submitReview = async () => {
    setIsSubmittingReview(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const formData = new FormData();
      reviewItems.forEach((item, idx) => {
        if (item.product_id) formData.append(`reviews[${idx}][product_id]`, String(item.product_id));
        if (item.combo_id)   formData.append(`reviews[${idx}][combo_id]`,   String(item.combo_id));
        formData.append(`reviews[${idx}][rating]`,  String(item.rating));
        formData.append(`reviews[${idx}][comment]`, item.comment || '');
        item.images.forEach((uri, imgIdx) => {
          const name = uri.split('/').pop(); const ext = name.split('.').pop().toLowerCase();
          formData.append(`reviews[${idx}][images][${imgIdx}]`, { uri: Platform.OS==='android'?uri:uri.replace('file://',''), name, type:`image/${ext==='jpg'?'jpeg':ext}` });
        });
      });
      const res = await fetch(`${API_BASE_URL}/client/orders/${reviewOrder.order_code}/review`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'multipart/form-data' }, body: formData });
      let result; try { result = await res.json(); } catch(_) {}
      if (result?.success) { setShowReviewModal(false); setReviewedOrders(prev=>({...prev,[reviewOrder.order_code]:true})); Alert.alert('Cảm ơn ⭐', 'Đánh giá đã được ghi nhận!'); }
      else Alert.alert('Lỗi', result?.message || 'Không thể gửi đánh giá.');
    } catch(_) { Alert.alert('Lỗi','Không thể kết nối.'); }
    finally { setIsSubmittingReview(false); }
  };

  // ── Return ───────────────────────────────────────────────────────────────
  const openReturn = (code) => { setShowDetail(false); setTimeout(() => { setReturnCode(code); setSelectedReason(null); setCustomReason(''); setShowReturnModal(true); }, 250); };
  const submitReturn = async () => {
    let finalReason = selectedReason;
    if (selectedReason === 'Lý do khác...') { finalReason = customReason.trim(); if (finalReason.length < 10) { Alert.alert('Thông báo','Vui lòng mô tả thêm (tối thiểu 10 ký tự).'); return; } }
    if (!finalReason) { Alert.alert('Thông báo','Vui lòng chọn lý do hoàn trả.'); return; }
    setIsSubmittingReturn(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const res   = await fetch(`${API_BASE_URL}/client/orders/${returnCode}/return`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ return_reason: finalReason }) });
      let result; try { result = await res.json(); } catch(_) {}
      if (result?.success) { setShowReturnModal(false); Alert.alert('Đã gửi yêu cầu', result.message || 'Yêu cầu hoàn trả đã được ghi nhận.'); fetchOrders(true); }
      else Alert.alert('Không thể gửi', result?.message || 'Có lỗi xảy ra.');
    } catch(_) { Alert.alert('Lỗi','Không thể kết nối.'); }
    finally { setIsSubmittingReturn(false); }
  };

  // ── Reorder ──────────────────────────────────────────────────────────────
  const handleReorder = (code) => Alert.alert('Mua lại','Thêm toàn bộ sản phẩm vào giỏ hàng?',[{text:'Huỷ',style:'cancel'},{text:'MUA LẠI',onPress:async()=>{try{const token=await AsyncStorage.getItem('auth_token');const res=await fetch(`${API_BASE_URL}/client/orders/${code}/reorder`,{method:'POST',headers:{Authorization:`Bearer ${token}`,Accept:'application/json'}});const d=await res.json();if(res.ok&&d.success)Alert.alert('Thành công','Đã thêm vào giỏ!',[{text:'Xem giỏ',onPress:()=>navigation.navigate('Cart')},{text:'OK'}]);else Alert.alert('Thất bại',d.message||'Không thể mua lại.');}catch(_){Alert.alert('Lỗi','Không thể kết nối.');}}}]);

  if (isLoading) return <View style={s.center}><ActivityIndicator size="large" color="#9f273b" /></View>;
  const filtered = getFiltered();

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Lịch Sử Đơn Hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* TABS */}
      <View style={s.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabBarInner}>
          {['Tất cả','Chờ xác nhận','Đang xử lý','Hoàn thành','Đã huỷ/Trả'].map((label, idx) => (
            <TouchableOpacity key={idx} style={[s.tab, selectedTab===idx && s.tabActive]} onPress={() => setSelectedTab(idx)} activeOpacity={0.7}>
              <Text style={[s.tabTxt, selectedTab===idx && s.tabTxtActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* LIST */}
      <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchOrders(false)} colors={['#9f273b']} tintColor="#9f273b" />}>
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
            <Text style={s.emptyTitle}>Chưa có đơn hàng nào</Text>
            <Text style={s.emptySub}>Danh sách đơn hàng trống.</Text>
          </View>
        ) : filtered.map(order => {
          const st = getStatusConfig(order.status);
          const alreadyReviewed = reviewedOrders[order.order_code];
          return (
            <TouchableOpacity key={order.id} style={s.card} onPress={() => openDetail(order.order_code)} activeOpacity={0.93}>
              <View style={s.cardHead}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardCode}>{order.order_code}</Text>
                  <Text style={s.cardDate}>{formatDate(order.created_at)}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: st.bg }]}>
                  <Ionicons name={st.icon} size={11} color={st.color} style={{ marginRight: 3 }} />
                  <Text style={[s.badgeTxt, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>

              <View style={s.cardBody}>
                {order.items?.slice(0,2).map((item, idx) => (
                  <View key={idx} style={s.itemRow}>
                    <Image source={{ uri: getItemImage(item.variant_image) }} style={s.itemImg} />
                    <View style={s.itemInfo}>
                      <Text style={s.itemName} numberOfLines={1}>{item.product_name}</Text>
                      <Text style={s.itemSku}>SKU: {item.variant_sku || '—'}</Text>
                      <View style={s.itemPriceRow}>
                        <Text style={s.itemPrice}>{formatCurrency(item.price)}</Text>
                        <Text style={s.itemQty}>×{item.quantity}</Text>
                      </View>
                    </View>
                  </View>
                ))}
                {(order.items?.length||0) > 2 && <Text style={s.moreItems}>+{order.items.length-2} sản phẩm khác</Text>}
              </View>

              <View style={s.cardFoot}>
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>Tổng cộng</Text>
                  <Text style={s.totalValue}>{formatCurrency(order.total_amount)}</Text>
                </View>
                <View style={s.btnRow}>
                  {order.status === 'pending' && (
                    <TouchableOpacity style={[s.chip,s.chipRed]} onPress={(e) => { e.stopPropagation?.(); openCancel(order.order_code); }} activeOpacity={0.8}>
                      <Text style={s.chipRedTxt}>HỦY ĐƠN</Text>
                    </TouchableOpacity>
                  )}
                  {order.status === 'delivered' && (
                    <>
                      <TouchableOpacity style={[s.chip,s.chipPurple]} onPress={(e)=>{e.stopPropagation?.();openReturn(order.order_code);}} activeOpacity={0.8}>
                        <Text style={s.chipPurpleTxt}>TRẢ HÀNG</Text>
                      </TouchableOpacity>
                      {alreadyReviewed ? (
                        <View style={[s.chip,s.chipGreen]}><Ionicons name="checkmark" size={12} color="#16a34a"/><Text style={s.chipGreenTxt}>ĐÃ ĐÁNH GIÁ</Text></View>
                      ) : (
                        <TouchableOpacity style={[s.chip,s.chipStar]} onPress={(e)=>{e.stopPropagation?.();openReview(order);}} activeOpacity={0.8}>
                          <Ionicons name="star-outline" size={12} color="#92400e"/><Text style={s.chipStarTxt}>ĐÁNH GIÁ</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity style={[s.chip,s.chipPrimary]} onPress={(e)=>{e.stopPropagation?.();handleReorder(order.order_code);}} activeOpacity={0.8}>
                        <Text style={s.chipPrimaryTxt}>MUA LẠI</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  <Ionicons name="chevron-forward" size={14} color="#9ca3af" style={{ marginLeft: 'auto' }} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── DRAGGABLE DETAIL SHEET ── */}
      <DraggableDetailSheet
        visible={showDetail}
        onClose={() => setShowDetail(false)}
        order={detailOrder}
        loading={loadingDetail}
        reviewedOrders={reviewedOrders}
        onOpenReview={openReview}
        onOpenReturn={openReturn}
        onOpenCancel={openCancel}
        onReorder={handleReorder}
      />

      {/* ── CANCEL MODAL ── */}
      <Modal visible={showCancelModal} transparent animationType="fade" onRequestClose={() => setShowCancelModal(false)}>
        <View style={s.dialogBg}>
          <View style={s.dialog}>
            <View style={s.dialogIcon}><Ionicons name="alert-circle" size={28} color="#dc2626" /></View>
            <Text style={s.dialogTitle}>Huỷ Đơn Hàng</Text>
            <Text style={s.dialogMsg}>Vui lòng cho chúng tôi biết lý do bạn muốn huỷ đơn #{cancelCode}</Text>
            <TextInput style={s.dialogInput} value={cancelReason} onChangeText={setCancelReason} placeholder="Nhập lý do huỷ đơn..." placeholderTextColor="#9ca3af" multiline numberOfLines={3} />
            <View style={s.dialogBtnRow}>
              <TouchableOpacity style={[s.dialogBtn,s.dialogBtnGhost]} onPress={() => setShowCancelModal(false)} activeOpacity={0.8}>
                <Text style={s.dialogBtnGhostTxt}>ĐÓNG</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.dialogBtn,{backgroundColor:'#dc2626'}]} onPress={submitCancel} disabled={isCancelling} activeOpacity={0.8}>
                {isCancelling ? <ActivityIndicator size="small" color="#fff"/> : <Text style={s.dialogBtnSolidTxt}>HỦY ĐƠN</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── REVIEW MODAL ── */}
      <Modal visible={showReviewModal} transparent animationType="slide" onRequestClose={() => setShowReviewModal(false)}>
        <View style={s.sheetBg}>
          <View style={s.sheet90}>
            <View style={s.handle2} />
            <View style={s.sheetHead2}>
              <Text style={s.sheetTitle2}>Đánh Giá Sản Phẩm</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)} style={s.closeBtn2}><Ionicons name="close" size={18} color="#6b7280"/></TouchableOpacity>
            </View>
            <Text style={s.sheetSub}>{reviewOrder?.order_code}</Text>
            <ScrollView style={{ paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
              {reviewItems.map((rItem, idx) => (
                <View key={idx} style={s.reviewCard}>
                  <View style={s.reviewHead}>
                    <Image source={{ uri: rItem.image }} style={s.reviewImg}/>
                    <Text style={s.reviewName} numberOfLines={2}>{rItem.name}</Text>
                  </View>
                  <Text style={s.reviewLbl}>Chất lượng sản phẩm</Text>
                  <View style={{ alignItems:'center', marginBottom:4 }}>
                    <StarRating rating={rItem.rating} onRate={(r) => updateReviewItem(idx,'rating',r)} size={32}/>
                    <Text style={s.reviewHint}>{['','Rất tệ','Tệ','Bình thường','Tốt','Rất tốt'][rItem.rating]}</Text>
                  </View>
                  <TextInput style={s.reviewInput} value={rItem.comment} onChangeText={(v)=>updateReviewItem(idx,'comment',v)} placeholder="Chia sẻ trải nghiệm..." placeholderTextColor="#9ca3af" multiline numberOfLines={3} textAlignVertical="top"/>
                  <View style={s.reviewImgRow}>
                    {rItem.images.map((uri,imgIdx)=>(
                      <View key={imgIdx} style={s.reviewImgWrap}>
                        <Image source={{ uri }} style={s.reviewImgThumb}/>
                        <TouchableOpacity style={s.reviewImgDel} onPress={()=>updateReviewItem(idx,'images',rItem.images.filter((_,i)=>i!==imgIdx))}><Ionicons name="close-circle" size={18} color="#dc2626"/></TouchableOpacity>
                      </View>
                    ))}
                    {rItem.images.length < 3 && (
                      <TouchableOpacity style={s.reviewImgAdd} onPress={()=>pickReviewImage(idx)}>
                        <Ionicons name="camera-outline" size={22} color="#6b7280"/>
                        <Text style={s.reviewImgAddTxt}>Thêm ảnh</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
              <View style={{ height:8 }}/>
            </ScrollView>
            <View style={s.sheetFoot}>
              <TouchableOpacity style={[s.submitBtn,isSubmittingReview&&{opacity:0.6}]} onPress={submitReview} disabled={isSubmittingReview}>
                {isSubmittingReview ? <ActivityIndicator size="small" color="#fff"/> : <Text style={s.submitBtnTxt}>GỬI ĐÁNH GIÁ</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── RETURN MODAL ── */}
      <Modal visible={showReturnModal} transparent animationType="slide" onRequestClose={() => setShowReturnModal(false)}>
        <View style={s.sheetBg}>
          <View style={s.sheet90}>
            <View style={s.handle2} />
            <View style={s.sheetHead2}>
              <Text style={[s.sheetTitle2,{color:'#9333ea'}]}>Yêu Cầu Hoàn Trả</Text>
              <TouchableOpacity onPress={() => setShowReturnModal(false)} style={s.closeBtn2}><Ionicons name="close" size={18} color="#6b7280"/></TouchableOpacity>
            </View>
            <Text style={s.sheetSub}>Đơn hàng <Text style={{fontFamily:'Oswald_600SemiBold',color:'#111'}}>#{returnCode}</Text></Text>
            <ScrollView style={{ paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
              <Text style={s.returnLbl}>Chọn lý do hoàn trả:</Text>
              {RETURN_REASONS.map(reason => {
                const active = selectedReason === reason;
                return (
                  <TouchableOpacity key={reason} style={[s.returnItem,active&&s.returnItemActive]} onPress={() => setSelectedReason(reason)} activeOpacity={0.7}>
                    <View style={[s.radio,active&&s.radioActive]}>{active && <View style={s.radioDot}/>}</View>
                    <Text style={[s.returnItemTxt,active&&s.returnItemTxtActive]}>{reason}</Text>
                  </TouchableOpacity>
                );
              })}
              {selectedReason==='Lý do khác...' && (
                <TextInput style={s.returnInput} value={customReason} onChangeText={setCustomReason} placeholder="Mô tả chi tiết (tối thiểu 10 ký tự)..." placeholderTextColor="#9ca3af" multiline numberOfLines={3} textAlignVertical="top" autoFocus/>
              )}
              <View style={{ height:8 }}/>
            </ScrollView>
            <View style={s.returnFoot}>
              <TouchableOpacity style={s.returnCancelBtn} onPress={() => setShowReturnModal(false)}>
                <Text style={s.returnCancelTxt}>HỦY BỎ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.returnSubmitBtn,isSubmittingReturn&&{opacity:0.6}]} onPress={submitReturn} disabled={isSubmittingReturn}>
                {isSubmittingReturn ? <ActivityIndicator size="small" color="#fff"/> : <Text style={s.returnSubmitTxt}>GỬI YÊU CẦU</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex:1, backgroundColor:'#f3f4f6', paddingTop: Platform.OS==='android'?28:0 },
  center: { flex:1, justifyContent:'center', alignItems:'center' },

  header: { height:56, backgroundColor:'#fff', flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, borderBottomWidth:1, borderBottomColor:'#e5e7eb' },
  backBtn: { width:40, height:40, justifyContent:'center' },
  headerTitle: { fontFamily:'PlayfairDisplay_700Bold', fontSize:18, color:'#111' },

  tabBar: { backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor:'#e5e7eb' },
  tabBarInner: { paddingHorizontal:8, height:44, alignItems:'center' },
  tab: { paddingHorizontal:14, height:'100%', justifyContent:'center', borderBottomWidth:2, borderBottomColor:'transparent' },
  tabActive: { borderBottomColor:'#9f273b' },
  tabTxt: { fontFamily:'Oswald_400Regular', fontSize:13, color:'#6b7280' },
  tabTxtActive: { fontFamily:'Oswald_600SemiBold', color:'#9f273b' },

  list: { padding:12, paddingBottom:40 },

  card: { backgroundColor:'#fff', borderRadius:12, marginBottom:10, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.07, shadowRadius:4, elevation:2 },
  cardHead: { flexDirection:'row', alignItems:'center', paddingHorizontal:14, paddingVertical:12, borderBottomWidth:1, borderBottomColor:'#f3f4f6' },
  cardCode: { fontFamily:'Oswald_600SemiBold', fontSize:14, color:'#111' },
  cardDate: { fontFamily:'Oswald_400Regular', fontSize:11, color:'#9ca3af', marginTop:1 },
  badge: { flexDirection:'row', alignItems:'center', paddingHorizontal:8, paddingVertical:4, borderRadius:20 },
  badgeTxt: { fontFamily:'Oswald_500Medium', fontSize:10 },

  cardBody: { paddingHorizontal:14, paddingVertical:10 },
  itemRow: { flexDirection:'row', marginBottom:10 },
  itemImg: { width:56, height:64, borderRadius:6, backgroundColor:'#f3f4f6' },
  itemInfo: { flex:1, marginLeft:10 },
  itemName: { fontFamily:'Oswald_500Medium', fontSize:12, color:'#111', marginBottom:2 },
  itemSku: { fontFamily:'Oswald_400Regular', fontSize:10, color:'#9ca3af', marginBottom:4 },
  itemPriceRow: { flexDirection:'row', alignItems:'center', gap:8 },
  itemPrice: { fontFamily:'PlayfairDisplay_700Bold', fontSize:13, color:'#9f273b' },
  itemQty: { fontFamily:'Oswald_400Regular', fontSize:12, color:'#6b7280' },
  moreItems: { fontFamily:'Oswald_400Regular', fontSize:11, color:'#9ca3af', textAlign:'center', paddingVertical:4 },

  cardFoot: { paddingHorizontal:14, paddingVertical:10, borderTopWidth:1, borderTopColor:'#f3f4f6' },
  totalRow: { flexDirection:'row', justifyContent:'space-between', marginBottom:8 },
  totalLabel: { fontFamily:'Oswald_400Regular', fontSize:12, color:'#6b7280' },
  totalValue: { fontFamily:'PlayfairDisplay_700Bold', fontSize:15, color:'#111' },
  btnRow: { flexDirection:'row', flexWrap:'wrap', gap:6, alignItems:'center' },

  chip: { flexDirection:'row', alignItems:'center', paddingHorizontal:10, paddingVertical:5, borderRadius:20, gap:3 },
  chipRed:     { borderWidth:1, borderColor:'#fca5a5', backgroundColor:'#fef2f2' },
  chipRedTxt:  { fontFamily:'Oswald_600SemiBold', fontSize:10, color:'#dc2626' },
  chipPurple:    { borderWidth:1, borderColor:'#d8b4fe', backgroundColor:'#faf5ff' },
  chipPurpleTxt: { fontFamily:'Oswald_600SemiBold', fontSize:10, color:'#9333ea' },
  chipStar:    { borderWidth:1, borderColor:'#fde68a', backgroundColor:'#fffbeb' },
  chipStarTxt: { fontFamily:'Oswald_600SemiBold', fontSize:10, color:'#92400e' },
  chipGreen:    { borderWidth:1, borderColor:'#bbf7d0', backgroundColor:'#f0fdf4' },
  chipGreenTxt: { fontFamily:'Oswald_600SemiBold', fontSize:10, color:'#16a34a' },
  chipPrimary:    { backgroundColor:'#9f273b' },
  chipPrimaryTxt: { fontFamily:'Oswald_600SemiBold', fontSize:10, color:'#fff' },

  empty: { alignItems:'center', paddingVertical:80 },
  emptyTitle: { fontFamily:'PlayfairDisplay_700Bold', fontSize:17, color:'#374151', marginTop:14, marginBottom:4 },
  emptySub: { fontFamily:'Oswald_400Regular', fontSize:12, color:'#9ca3af' },

  sheetBg: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' },
  dialogBg: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' },

  sheet90: { backgroundColor:'#fff', borderTopLeftRadius:20, borderTopRightRadius:20, maxHeight:'90%' },
  handle2: { width:36, height:4, backgroundColor:'#d1d5db', borderRadius:2, alignSelf:'center', marginTop:10, marginBottom:6 },
  sheetHead2: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingBottom:10, borderBottomWidth:1, borderBottomColor:'#f3f4f6' },
  sheetTitle2: { fontFamily:'PlayfairDisplay_700Bold', fontSize:17, color:'#111' },
  closeBtn2: { width:30, height:30, borderRadius:15, backgroundColor:'#f3f4f6', alignItems:'center', justifyContent:'center' },
  sheetSub: { fontFamily:'Oswald_400Regular', fontSize:12, color:'#9ca3af', paddingHorizontal:16, paddingVertical:8 },
  sheetFoot: { paddingHorizontal:16, paddingVertical:12, borderTopWidth:1, borderTopColor:'#f3f4f6' },

  dialog: { width:'88%', backgroundColor:'#fff', borderRadius:16, padding:22, elevation:8, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.15, shadowRadius:12 },
  dialogIcon: { width:52, height:52, borderRadius:26, backgroundColor:'#fef2f2', alignItems:'center', justifyContent:'center', alignSelf:'center', marginBottom:12 },
  dialogTitle: { fontFamily:'PlayfairDisplay_700Bold', fontSize:18, color:'#dc2626', textAlign:'center', marginBottom:6 },
  dialogMsg: { fontFamily:'Oswald_400Regular', fontSize:13, color:'#6b7280', textAlign:'center', marginBottom:14, lineHeight:18 },
  dialogInput: { borderWidth:1, borderColor:'#e5e7eb', backgroundColor:'#f9fafb', borderRadius:8, paddingHorizontal:12, paddingVertical:8, fontFamily:'Oswald_400Regular', fontSize:13, color:'#111', height:72, textAlignVertical:'top', marginBottom:16 },
  dialogBtnRow: { flexDirection:'row', gap:10 },
  dialogBtn: { flex:1, height:42, borderRadius:8, alignItems:'center', justifyContent:'center' },
  dialogBtnGhost: { backgroundColor:'#f9fafb', borderWidth:1, borderColor:'#e5e7eb' },
  dialogBtnGhostTxt: { fontFamily:'Oswald_600SemiBold', fontSize:12, color:'#374151' },
  dialogBtnSolidTxt: { fontFamily:'Oswald_600SemiBold', fontSize:12, color:'#fff' },

  reviewCard: { backgroundColor:'#f9fafb', borderRadius:10, padding:14, marginBottom:12 },
  reviewHead: { flexDirection:'row', alignItems:'center', marginBottom:12 },
  reviewImg: { width:44, height:44, borderRadius:6, backgroundColor:'#e5e7eb' },
  reviewName: { flex:1, marginLeft:10, fontFamily:'Oswald_500Medium', fontSize:12, color:'#111' },
  reviewLbl: { fontFamily:'Oswald_400Regular', fontSize:11, color:'#6b7280', textAlign:'center', marginBottom:8 },
  reviewHint: { fontFamily:'Oswald_600SemiBold', fontSize:12, color:'#f59e0b', marginTop:4, height:18 },
  reviewInput: { borderWidth:1, borderColor:'#e5e7eb', backgroundColor:'#fff', borderRadius:8, paddingHorizontal:12, paddingVertical:10, fontFamily:'Oswald_400Regular', fontSize:13, color:'#111', minHeight:68, marginTop:10, marginBottom:8 },
  reviewImgRow: { flexDirection:'row', gap:8, flexWrap:'wrap' },
  reviewImgWrap: { position:'relative', width:68, height:68 },
  reviewImgThumb: { width:68, height:68, borderRadius:8, backgroundColor:'#e5e7eb' },
  reviewImgDel: { position:'absolute', top:-6, right:-6 },
  reviewImgAdd: { width:68, height:68, borderRadius:8, borderWidth:1.5, borderColor:'#d1d5db', borderStyle:'dashed', alignItems:'center', justifyContent:'center', backgroundColor:'#fff' },
  reviewImgAddTxt: { fontFamily:'Oswald_400Regular', fontSize:10, color:'#6b7280', marginTop:2 },

  submitBtn: { backgroundColor:'#9f273b', height:48, borderRadius:10, alignItems:'center', justifyContent:'center' },
  submitBtnTxt: { fontFamily:'Oswald_600SemiBold', fontSize:13, color:'#fff', letterSpacing:1.5 },

  returnLbl: { fontFamily:'Oswald_600SemiBold', fontSize:12, color:'#374151', letterSpacing:0.5, marginTop:8, marginBottom:10 },
  returnItem: { flexDirection:'row', alignItems:'center', paddingVertical:13, paddingHorizontal:14, borderRadius:10, marginBottom:6, backgroundColor:'#f9fafb', borderWidth:1, borderColor:'#e5e7eb' },
  returnItemActive: { borderColor:'#9333ea', backgroundColor:'#faf5ff' },
  radio: { width:20, height:20, borderRadius:10, borderWidth:2, borderColor:'#d1d5db', alignItems:'center', justifyContent:'center', marginRight:12 },
  radioActive: { borderColor:'#9333ea' },
  radioDot: { width:10, height:10, borderRadius:5, backgroundColor:'#9333ea' },
  returnItemTxt: { flex:1, fontFamily:'Oswald_400Regular', fontSize:14, color:'#374151' },
  returnItemTxtActive: { fontFamily:'Oswald_600SemiBold', color:'#9333ea' },
  returnInput: { borderWidth:1, borderColor:'#e5e7eb', backgroundColor:'#f9fafb', borderRadius:8, paddingHorizontal:12, paddingVertical:10, fontFamily:'Oswald_400Regular', fontSize:13, color:'#111', minHeight:80, marginTop:8 },
  returnFoot: { flexDirection:'row', paddingHorizontal:16, paddingVertical:12, gap:10, borderTopWidth:1, borderTopColor:'#f3f4f6' },
  returnCancelBtn: { flex:1, height:46, borderRadius:10, borderWidth:1, borderColor:'#374151', alignItems:'center', justifyContent:'center' },
  returnCancelTxt: { fontFamily:'Oswald_600SemiBold', fontSize:13, color:'#374151' },
  returnSubmitBtn: { flex:1.6, height:46, borderRadius:10, backgroundColor:'#9333ea', alignItems:'center', justifyContent:'center' },
  returnSubmitTxt: { fontFamily:'Oswald_600SemiBold', fontSize:13, color:'#fff' },
});
