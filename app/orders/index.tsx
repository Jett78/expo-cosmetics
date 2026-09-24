import { Ionicons } from '@expo/vector-icons';
import { Text } from '@rneui/themed';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton } from '../../src/components/Skeleton';
import { useCommerce } from '../../src/context/CommerceContext';
import { radius, spacing, typography } from '../../src/design-system';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useOrders } from '../../src/services/order/hooks';
import type { ApiOrder, OrderStatus } from '../../src/types/order';

const STATUS_CONFIG: Record<
  OrderStatus,
  { color: string; bg: string; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }
> = {
  PENDING: {
    color: '#C08A3E',
    bg: 'rgba(192, 138, 62, 0.10)',
    label: 'Pending',
    icon: 'time-outline',
  },
  PROCESSING: {
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.10)',
    label: 'Processing',
    icon: 'sync-outline',
  },
  SHIPPED: {
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.10)',
    label: 'Shipped',
    icon: 'car-outline',
  },
  DELIVERED: {
    color: '#22C55E',
    bg: 'rgba(34, 197, 94, 0.10)',
    label: 'Delivered',
    icon: 'checkmark-done-circle-outline',
  },
  CANCELLED: {
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.10)',
    label: 'Cancelled',
    icon: 'close-circle-outline',
  },
  REFUNDED: {
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.10)',
    label: 'Refunded',
    icon: 'cash-outline',
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function OrderCardSkeleton() {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.cardTopRow}>
        <Skeleton width={72} height={14} borderRadius={4} />
        <Skeleton width={64} height={24} borderRadius={12} />
      </View>
      <View style={styles.cardMiddle}>
        <View style={styles.thumbStack}>
          <Skeleton width={48} height={48} borderRadius={12} />
          <Skeleton width={48} height={48} borderRadius={12} />
        </View>
        <View style={{ flex: 1 }}>
          <Skeleton width='65%' height={13} borderRadius={4} />
          <Skeleton width='45%' height={11} borderRadius={4} style={{ marginTop: 6 }} />
          <Skeleton width='30%' height={13} borderRadius={4} style={{ marginTop: 8 }} />
        </View>
      </View>
    </View>
  );
}

function OrderCard({ order }: { order: ApiOrder }) {
  const { colors } = useAppTheme();
  const status = STATUS_CONFIG[order.status];
  const items = order.items.slice(0, 3);
  const remaining = order.items.length - 3;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderLeftColor: status.color }]}
      activeOpacity={0.65}
      onPress={() => router.push(`/orders/${order.id}`)}
    >
      <View style={styles.cardTopRow}>
        <View>
          <Text style={[styles.orderId, { color: colors.textMuted }]}>
            #{order.id.slice(-5).toUpperCase()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Ionicons name={status.icon} size={12} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.cardMiddle}>
        <View style={styles.thumbStack}>
          {items.map((item, index) => {
            const img =
              item.attributes[0]?.productAttributeValue?.imageUrlLink?.['480'] ||
              item.attributes[0]?.productAttributeValue?.imageUrl ||
              item.product.featureImageLink?.['480'];
            return (
              <View
                key={item.id}
                style={[
                  styles.thumb,
                  { backgroundColor: colors.surfaceMuted, borderColor: colors.surface },
                  index > 0 && styles.thumbOverlap,
                ]}
              >
                {img ? (
                  <Image source={{ uri: img }} style={styles.thumbImg} resizeMode='cover' />
                ) : (
                  <Ionicons name='image-outline' size={18} color={colors.textMuted} />
                )}
              </View>
            );
          })}
          {remaining > 0 && (
            <View
              style={[styles.thumb, styles.thumbOverlap, { backgroundColor: colors.surfaceMuted }]}
            >
              <Text style={[styles.thumbMore, { color: colors.textPrimary }]}>+{remaining}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardInfo}>
          <Text style={[styles.itemNames, { color: colors.textPrimary }]} numberOfLines={1}>
            {order.items.map((i) => i.product.name).join(', ')}
          </Text>
          <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
            {'  ·  '}
            {formatDate(order.placedAt)}
          </Text>
          <Text style={[styles.totalAmount, { color: colors.textPrimary }]}>
            Rs. {order.totalAmount.toLocaleString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function OrdersScreen() {
  const { colors } = useAppTheme();
  const { token } = useCommerce();
  const { data: orders, isLoading, isError, isRefetching, refetch } = useOrders(token);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceMuted }]}
          activeOpacity={0.6}
        >
          <Ionicons name='chevron-back' size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>My Orders</Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(item) => String(item)}
          renderItem={() => <OrderCardSkeleton />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : isError ? (
        <View style={styles.centerContent}>
          <View style={[styles.errorIcon, { backgroundColor: 'rgba(239, 68, 68, 0.08)' }]}>
            <Ionicons name='cloud-offline-outline' size={36} color={colors.danger} />
          </View>
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
            Couldn't load orders
          </Text>
          <Text style={[styles.errorSubtitle, { color: colors.textMuted }]}>
            Check your connection and try again.
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.accent }]}
            activeOpacity={0.8}
            onPress={() => refetch()}
          >
            <Ionicons name='refresh' size={16} color='#fff' />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !orders || orders.length === 0 ? (
        <View style={styles.centerContent}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceMuted }]}>
            <Ionicons name='bag-handle-outline' size={40} color={colors.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No orders yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Your order history will show up here once you make a purchase.
          </Text>
          <TouchableOpacity
            style={[styles.shopBtn, { backgroundColor: colors.accent }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/shop')}
          >
            <Ionicons name='bag-outline' size={16} color='#fff' />
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },

  /* Card */
  card: {
    borderRadius: radius.xl,
    borderLeftWidth: 3,
    padding: spacing.xl,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  orderId: {
    ...typography.captionLarge,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    gap: 4,
  },
  statusText: {
    ...typography.label,
    fontSize: 11,
    textTransform: 'capitalize',
  },
  cardMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  thumbStack: {
    flexDirection: 'row',
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  thumbOverlap: {
    marginLeft: -10,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  thumbMore: {
    ...typography.bodyStrong,
    fontSize: 12,
  },
  cardInfo: {
    flex: 1,
  },
  itemNames: {
    ...typography.bodyStrong,
    lineHeight: 18,
    marginBottom: 2,
  },
  itemMeta: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  totalAmount: {
    ...typography.price,
  },

  /* Empty / Error */
  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  errorTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  errorSubtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  retryBtnText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 21,
  },
  shopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  shopBtnText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
