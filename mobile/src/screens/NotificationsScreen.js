import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteReadNotifications,
  deleteNotification,
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../services/notifications';

const NOTIFICATION_FILTERS = [
  { key: 'all', label: 'Tất cả', icon: 'notifications-outline' },
  { key: 'order', label: 'Đơn hàng', icon: 'receipt-outline' },
  { key: 'affiliate', label: 'Affiliate', icon: 'megaphone-outline' },
  { key: 'coupon', label: 'Mã giảm giá', icon: 'ticket-outline' },
];

const getNotificationMeta = (type) => {
  switch (type) {
    case 'order_success':
      return { icon: 'receipt-outline', color: '#9f273b', bg: '#fff5f6' };
    case 'coupon':
      return { icon: 'ticket-outline', color: '#b9912f', bg: '#fff9e7' };
    case 'order_status':
      return { icon: 'cube-outline', color: '#2563eb', bg: '#eff6ff' };
    case 'affiliate':
      return { icon: 'megaphone-outline', color: '#9f273b', bg: '#fff5f6' };
    default:
      return { icon: 'notifications-outline', color: '#9f273b', bg: '#fff5f6' };
  }
};

const formatNotificationTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const notificationsQuery = useQuery({
    queryKey: ['notifications', activeFilter, page],
    queryFn: () => fetchNotifications({ page, typeGroup: activeFilter }),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const notifications = notificationsQuery.data?.data?.data || [];
  const pagination = notificationsQuery.data?.data || {};
  const hasNextPage = (pagination.current_page || 1) < (pagination.last_page || 1);
  const totalNotifications = Number(pagination.total || notifications.length || 0);
  const unreadInCurrentFilter = Number(
    notificationsQuery.data?.filtered_unread_count ?? notificationsQuery.data?.unread_count ?? 0
  );
  const readNotificationsCount = Math.max(0, totalNotifications - unreadInCurrentFilter);

  const patchNotificationQueries = (updater) => {
    queryClient.setQueriesData({ queryKey: ['notifications'] }, (oldData) => {
      if (!oldData?.data?.data) return oldData;

      return {
        ...oldData,
        unread_count: Math.max(
          0,
          updater.unreadCount?.(oldData.unread_count || 0, oldData.data.data) ?? oldData.unread_count ?? 0
        ),
        data: {
          ...oldData.data,
          data: updater.items(oldData.data.data),
        },
      };
    });
  };

  const readMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      patchNotificationQueries({
        unreadCount: (count, items) => {
          const shouldDecrease = items.some((item) => item.id === id && !item.read_at);
          return shouldDecrease ? count - 1 : count;
        },
        items: (items) => items.map((item) => (
          item.id === id ? { ...item, read_at: item.read_at || new Date().toISOString() } : item
        )),
      });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      patchNotificationQueries({
        unreadCount: () => 0,
        items: (items) => items.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onMutate: async (id) => {
      setDeletingId(id);
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
    },
    onSuccess: (_, id) => {
      patchNotificationQueries({
        unreadCount: (count, items) => {
          const target = items.find((item) => item.id === id);
          return target && !target.read_at ? count - 1 : count;
        },
        items: (items) => items.filter((item) => item.id !== id),
      });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const deleteReadMutation = useMutation({
    mutationFn: deleteReadNotifications,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      patchNotificationQueries({
        unreadCount: (count) => count,
        items: (items) => items.filter((item) => !item.read_at),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleChangeFilter = (filterKey) => {
    if (activeFilter === filterKey) return;
    setActiveFilter(filterKey);
    setPage(1);
  };

  const isInitialLoading = notificationsQuery.isLoading && !notificationsQuery.data;
  const refreshing = notificationsQuery.isRefetching && !!notificationsQuery.data;

  const emptyText = useMemo(() => (
    notificationsQuery.isError
      ? notificationsQuery.error?.message || 'Không thể tải thông báo.'
      : 'Bạn chưa có thông báo nào.'
  ), [notificationsQuery.error?.message, notificationsQuery.isError]);

  const openNotification = async (item) => {
    if (!item.read_at) {
      readMutation.mutate(item.id);
    }

    if (item.action_screen === 'OrderHistory') {
      navigation.navigate('OrderHistory');
    } else if (item.action_screen === 'SavedCoupons') {
      navigation.navigate('SavedCoupons');
    } else if (item.action_screen === 'Affiliate') {
      navigation.navigate('Affiliate');
    }
  };

  const renderNotification = ({ item }) => {
    const unread = !item.read_at;
    const meta = getNotificationMeta(item.type);
    const isDeleting = deletingId === item.id;

    return (
      <TouchableOpacity
        style={[styles.card, unread && styles.cardUnread]}
        activeOpacity={0.82}
        onPress={() => openNotification(item)}
      >
        <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon} size={20} color={meta.color} />
        </View>

        <View style={styles.content}>
          <View style={styles.cardHeader}>
            <Text style={[styles.title, unread && styles.titleUnread]} numberOfLines={2}>
              {item.title}
            </Text>
            {unread && <View style={styles.unreadDot} />}
          </View>
          {!!item.body && (
            <Text style={styles.body} numberOfLines={3}>
              {item.body}
            </Text>
          )}
          <View style={styles.cardFooter}>
            <Text style={styles.time}>{formatNotificationTime(item.created_at)}</Text>
            <TouchableOpacity
              style={styles.deleteBtn}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              disabled={isDeleting}
              onPress={(event) => {
                event.stopPropagation?.();
                deleteMutation.mutate(item.id);
              }}
            >
              {isDeleting ? (
                <ActivityIndicator size={14} color="#9f273b" />
              ) : (
                <Ionicons name="trash-outline" size={15} color="#b8a9a9" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <TouchableOpacity
          style={styles.markAllBtn}
          activeOpacity={0.75}
          disabled={markAllMutation.isPending || notifications.length === 0}
          onPress={() => markAllMutation.mutate()}
        >
          {markAllMutation.isPending ? (
            <ActivityIndicator size={16} color="#9f273b" />
          ) : (
            <>
              <Ionicons name="checkmark-done-outline" size={17} color={notifications.length ? '#9f273b' : '#c9c0c0'} />
              <Text style={[styles.markAllText, notifications.length === 0 && styles.markAllTextDisabled]}>
                Đã đọc
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.smartBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {NOTIFICATION_FILTERS.map((item) => {
            const active = activeFilter === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.filterChip, active && styles.filterChipActive]}
                activeOpacity={0.82}
                onPress={() => handleChangeFilter(item.key)}
              >
                <Ionicons name={item.icon} size={14} color={active ? '#fff' : '#9f273b'} />
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={[
              styles.clearReadBtn,
              (deleteReadMutation.isPending || readNotificationsCount === 0) && styles.clearReadBtnDisabled,
            ]}
            activeOpacity={0.78}
            disabled={deleteReadMutation.isPending || readNotificationsCount === 0}
            onPress={() => deleteReadMutation.mutate()}
          >
            {deleteReadMutation.isPending ? (
              <ActivityIndicator size={14} color="#9f273b" />
            ) : (
              <>
                <Ionicons name="trash-bin-outline" size={14} color={readNotificationsCount ? '#9f273b' : '#c9c0c0'} />
                <Text style={[styles.clearReadText, readNotificationsCount === 0 && styles.clearReadTextDisabled]}>
                  Xoá đã đọc
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      {isInitialLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#9f273b" />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderNotification}
          contentContainerStyle={notifications.length ? styles.list : styles.emptyList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => notificationsQuery.refetch()}
              colors={['#9f273b']}
              tintColor="#9f273b"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Ionicons name="notifications-outline" size={34} color="#9f273b" />
              </View>
              <Text style={styles.emptyTitle}>{emptyText}</Text>
              {notificationsQuery.isError && (
                <TouchableOpacity style={styles.retryBtn} onPress={() => notificationsQuery.refetch()}>
                  <Text style={styles.retryText}>THỬ LẠI</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListFooterComponent={
            notifications.length && hasNextPage ? (
              <TouchableOpacity style={styles.loadMoreBtn} onPress={() => setPage((current) => current + 1)}>
                <Text style={styles.loadMoreText}>XEM THÊM</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },
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
  headerTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: '#333' },
  headerSpacer: { width: 40, height: 40 },
  markAllBtn: {
    minWidth: 72,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 9,
    borderRadius: 17,
    backgroundColor: '#fff5f6',
  },
  markAllText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 11,
    color: '#9f273b',
  },
  markAllTextDisabled: { color: '#c9c0c0' },
  smartBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterList: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 8,
  },
  filterChip: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#ead9dc',
    backgroundColor: '#fffafa',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#9f273b',
    borderColor: '#9f273b',
  },
  filterChipText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 12,
    color: '#9f273b',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  clearReadBtn: {
    height: 34,
    paddingHorizontal: 11,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#ead9dc',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  clearReadBtnDisabled: {
    opacity: 0.72,
  },
  clearReadText: {
    fontFamily: 'Oswald_500Medium',
    fontSize: 11,
    color: '#9f273b',
  },
  clearReadTextDisabled: {
    color: '#c9c0c0',
  },
  list: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 28 },
  emptyList: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0eeee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardUnread: {
    borderColor: '#ebd5a3',
    backgroundColor: '#fffdf6',
    shadowColor: '#ebd5a3',
    shadowOpacity: 0.16,
    shadowRadius: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { flex: 1, fontFamily: 'Oswald_500Medium', fontSize: 15, color: '#333', letterSpacing: 0.2 },
  titleUnread: { color: '#9f273b' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#9f273b', marginTop: 7, marginLeft: 8 },
  body: { marginTop: 6, fontFamily: 'Oswald_400Regular', fontSize: 13, color: '#6f6666', lineHeight: 20, letterSpacing: 0.2 },
  cardFooter: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: { fontFamily: 'Oswald_400Regular', fontSize: 11, color: '#a59b9b', letterSpacing: 0.2 },
  deleteBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 10, fontFamily: 'Oswald_500Medium', color: '#9f273b', fontSize: 13 },
  emptyWrap: { alignItems: 'center' },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff5f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: { fontFamily: 'Oswald_400Regular', color: '#776d6d', fontSize: 14, textAlign: 'center', letterSpacing: 0.2 },
  retryBtn: { marginTop: 16, backgroundColor: '#9f273b', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontFamily: 'Oswald_600SemiBold', color: '#fff', fontSize: 12, letterSpacing: 1 },
  loadMoreBtn: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#e7ce7d',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 4,
  },
  loadMoreText: { fontFamily: 'Oswald_600SemiBold', fontSize: 12, color: '#9f273b', letterSpacing: 1 },
});
