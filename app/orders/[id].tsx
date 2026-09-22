import { Ionicons } from '@expo/vector-icons';
import { Text } from '@rneui/themed';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton } from '../../src/components/Skeleton';
import { useCommerce } from '../../src/context/CommerceContext';
import { radius, spacing, typography } from '../../src/design-system';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useOrderById } from '../../src/services/order/hooks';
import type { ApiOrder, ApiOrderItem, OrderStatus } from '../../src/types/order';

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
  CONFIRMED: {
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.10)',
    label: 'Confirmed',
    icon: 'checkmark-circle-outline',
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
};

const TIMELINE_STEPS: {
  key: OrderStatus;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}[] = [
  { key: 'PENDING', label: 'Placed', icon: 'receipt-outline' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: 'checkmark-circle-outline' },
  { key: 'SHIPPED', label: 'Shipped', icon: 'car-outline' },
  { key: 'DELIVERED', label: 'Delivered', icon: 'checkmark-done-circle-outline' },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELLED: -1,
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function DetailSkeleton() {
  const { colors } = useAppTheme();
  return (
    <ScrollView contentContainerStyle={styles.skeletonContent} showsVerticalScrollIndicator={false}>
      <Skeleton width='100%' height={140} borderRadius={20} />
      <View style={[styles.skeletonCard, { backgroundColor: colors.surface }]}>
        <Skeleton width='50%' height={16} borderRadius={4} />
        <Skeleton width='100%' height={14} borderRadius={4} style={{ marginTop: 12 }} />
        <Skeleton width='100%' height={14} borderRadius={4} style={{ marginTop: 10 }} />
        <Skeleton width='100%' height={14} borderRadius={4} style={{ marginTop: 10 }} />
      </View>
      <View style={[styles.skeletonCard, { backgroundColor: colors.surface }]}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Skeleton width={64} height={64} borderRadius={12} />
          <View style={{ flex: 1 }}>
            <Skeleton width='80%' height={14} borderRadius={4} />
            <Skeleton width='50%' height={12} borderRadius={4} style={{ marginTop: 8 }} />
            <Skeleton width='35%' height={14} borderRadius={4} style={{ marginTop: 8 }} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function OrderTimeline({ status }: { status: OrderStatus }) {
  const { colors } = useAppTheme();
  const current = STATUS_ORDER[status];
  const isCancelled = status === 'CANCELLED';

  return (
    <View style={styles.timeline}>
      {TIMELINE_STEPS.map((step, index) => {
        const idx = STATUS_ORDER[step.key];
        const done = !isCancelled && idx <= current;
        const active = step.key === status;
        const last = index === TIMELINE_STEPS.length - 1;

        return (
          <View key={step.key} style={styles.timelineRow}>
            <View style={styles.timelineLeft}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: done ? colors.accent : colors.surfaceMuted,
                    borderColor: done ? colors.accent : colors.borderStrong,
                  },
                ]}
              >
                {done ? (
                  <Ionicons
                    name={active ? step.icon : 'checkmark'}
                    size={active ? 14 : 10}
                    color='#fff'
                  />
                ) : null}
              </View>
              {!last && (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor:
                        done && !last && STATUS_ORDER[TIMELINE_STEPS[index + 1].key] <= current
                          ? colors.accent
                          : colors.borderSubtle,
                    },
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                styles.timelineLabel,
                {
                  color: done ? colors.textPrimary : colors.textMuted,
                  fontWeight: active ? '700' : '400',
                },
              ]}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
      {isCancelled && (
        <View style={styles.timelineRow}>
          <View style={styles.timelineLeft}>
            <View
              style={[styles.dot, { backgroundColor: colors.danger, borderColor: colors.danger }]}
            >
              <Ionicons name='close' size={10} color='#fff' />
            </View>
          </View>
          <Text style={[styles.timelineLabel, { color: colors.danger, fontWeight: '700' }]}>
            Cancelled
          </Text>
        </View>
      )}
    </View>
  );
}

function OrderItem({ item }: { item: ApiOrderItem }) {
  const { colors } = useAppTheme();

  const imageUrl =
    item.attributes[0]?.productAttributeValue?.imageUrlLink?.['480'] ||
    item.attributes[0]?.productAttributeValue?.imageUrl ||
    item.product.featureImageLink?.['480'] ||
    item.product.featureImageLink?.original;

  const stockAndPrice = item.attributes[0]?.productAttributeValue?.stockAndPrice;
  const displayPrice =
    item.isOfferActive && stockAndPrice?.offeredPrice
      ? Number(stockAndPrice.offeredPrice)
      : Number(item.price);
  const originalPrice = stockAndPrice?.price ? Number(stockAndPrice.price) : null;
  const itemTotal = displayPrice * item.quantity;

  return (
    <View style={[styles.itemCard, { backgroundColor: colors.background }]}>
      <View style={[styles.itemImage, { backgroundColor: colors.surfaceMuted }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.itemImageFile} resizeMode='cover' />
        ) : (
          <Ionicons name='image-outline' size={24} color={colors.textMuted} />
        )}
        {item.isOfferActive && (
          <View style={styles.offerDot}>
            <Text style={styles.offerDotText}>%</Text>
          </View>
        )}
      </View>

      <View style={styles.itemBody}>
        <Text style={[styles.itemName, { color: colors.textPrimary }]} numberOfLines={2}>
          {item.product.name}
        </Text>

        {item.attributes.length > 0 && (
          <View style={styles.attrRow}>
            {item.attributes.map((attr) => {
              const defName = attr.productAttributeValue?.attributeDefinition?.name;
              const isColor = defName?.toLowerCase() === 'color';
              const colorVal = attr.productAttributeValue?.valueString;
              const shadeName = attr.productAttributeValue?.name;
              const unit = attr.productAttributeValue?.attributeDefinition?.unit ?? '';

              const val =
                attr.productAttributeValue?.valueString ??
                attr.productAttributeValue?.valueInt?.toString() ??
                attr.productAttributeValue?.valueDecimal?.toString() ??
                (typeof attr.productAttributeValue?.valueBool === 'boolean'
                  ? attr.productAttributeValue.valueBool
                    ? 'Yes'
                    : 'No'
                  : undefined) ??
                '';

              if (isColor && colorVal) {
                return (
                  <View key={attr.id} style={styles.attrChip}>
                    <View style={[styles.swatch, { backgroundColor: colorVal }]} />
                    {shadeName && (
                      <Text style={[styles.attrText, { color: colors.textSecondary }]}>
                        {shadeName}
                      </Text>
                    )}
                  </View>
                );
              }
              if (val) {
                return (
                  <View key={attr.id} style={styles.attrChip}>
                    <Text style={[styles.attrText, { color: colors.textMuted }]}>
                      {defName}: {val}
                      {unit ? ` ${unit}` : ''}
                    </Text>
                  </View>
                );
              }
              return null;
            })}
          </View>
        )}

        <View style={styles.itemBottom}>
          {item.isOfferActive && originalPrice && originalPrice !== displayPrice ? (
            <View style={styles.priceOffer}>
              <Text style={[styles.itemPrice, { color: colors.danger }]}>
                Rs. {displayPrice.toLocaleString()}
              </Text>
              <Text style={[styles.itemPriceOld, { color: colors.textMuted }]}>
                Rs. {originalPrice.toLocaleString()}
              </Text>
            </View>
          ) : (
            <Text style={[styles.itemPrice, { color: colors.textPrimary }]}>
              Rs. {displayPrice.toLocaleString()}
            </Text>
          )}
          <Text style={[styles.itemQty, { color: colors.textMuted }]}>×{item.quantity}</Text>
          <Text style={[styles.itemTotal, { color: colors.textPrimary }]}>
            Rs. {itemTotal.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

function Section({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useAppTheme>['colors'];
}) {
  return (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
      {children}
    </View>
  );
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { token } = useCommerce();
  const { data: order, isLoading, isError, refetch } = useOrderById(id ?? '', token);

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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Order Details</Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <DetailSkeleton />
      ) : isError || !order ? (
        <View style={styles.centerContent}>
          <View style={[styles.errorIcon, { backgroundColor: 'rgba(239, 68, 68, 0.08)' }]}>
            <Ionicons name='cloud-offline-outline' size={36} color={colors.danger} />
          </View>
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>Order not found</Text>
          <Text style={[styles.errorSubtitle, { color: colors.textMuted }]}>
            We couldn't load this order.
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
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Status */}
          <View style={[styles.hero, { backgroundColor: STATUS_CONFIG[order.status].color }]}>
            <View style={styles.heroIcon}>
              <Ionicons name={STATUS_CONFIG[order.status].icon} size={32} color='#fff' />
            </View>
            <Text style={styles.heroStatus}>{STATUS_CONFIG[order.status].label}</Text>
            <Text style={styles.heroOrderId}>#{order.id.slice(-5).toUpperCase()}</Text>
            <Text style={styles.heroDate}>
              {formatDate(order.placedAt)} at {formatTime(order.placedAt)}
            </Text>
          </View>

          {/* Timeline */}
          <Section title='Status' colors={colors}>
            <OrderTimeline status={order.status} />
          </Section>

          {/* Items */}
          <Section title={`Items (${order.items.length})`} colors={colors}>
            {order.items.map((item) => (
              <OrderItem key={item.id} item={item} />
            ))}
          </Section>

          {/* Price Summary */}
          <Section title='Summary' colors={colors}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                Rs. {(order.totalAmount - order.deliveryPrice).toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Delivery</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                Rs. {order.deliveryPrice.toLocaleString()}
              </Text>
            </View>
            <View
              style={[
                styles.summaryRow,
                styles.summaryTotal,
                { borderTopColor: colors.borderSubtle },
              ]}
            >
              <Text style={[styles.summaryTotalLabel, { color: colors.textPrimary }]}>Total</Text>
              <Text style={[styles.summaryTotalValue, { color: colors.accent }]}>
                Rs. {order.totalAmount.toLocaleString()}
              </Text>
            </View>
          </Section>

          {/* Shipping Address */}
          <Section title='Shipping Address' colors={colors}>
            <View style={styles.addressRow}>
              <View style={[styles.addressIcon, { backgroundColor: 'rgba(59, 130, 246, 0.08)' }]}>
                <Ionicons name='location-outline' size={18} color='#3B82F6' />
              </View>
              <View style={styles.addressText}>
                <Text style={[styles.addressName, { color: colors.textPrimary }]}>
                  {order.shippingAddress.fullName}
                </Text>
                <Text style={[styles.addressLine, { color: colors.textSecondary }]}>
                  {order.shippingAddress.street}, {order.shippingAddress.city}
                </Text>
                <Text style={[styles.addressLine, { color: colors.textSecondary }]}>
                  {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </Text>
                <Text style={[styles.addressLine, { color: colors.textSecondary }]}>
                  {order.shippingAddress.country}
                </Text>
                <Text style={[styles.addressPhone, { color: colors.textSecondary }]}>
                  {order.shippingAddress.phone}
                </Text>
              </View>
            </View>
          </Section>

          {order.billingAddressId !== order.shippingAddressId && (
            <Section title='Billing Address' colors={colors}>
              <View style={styles.addressRow}>
                <View style={[styles.addressIcon, { backgroundColor: 'rgba(139, 92, 246, 0.08)' }]}>
                  <Ionicons name='card-outline' size={18} color='#8B5CF6' />
                </View>
                <View style={styles.addressText}>
                  <Text style={[styles.addressName, { color: colors.textPrimary }]}>
                    {order.billingAddress.fullName}
                  </Text>
                  <Text style={[styles.addressLine, { color: colors.textSecondary }]}>
                    {order.billingAddress.street}, {order.billingAddress.city}
                  </Text>
                  <Text style={[styles.addressLine, { color: colors.textSecondary }]}>
                    {order.billingAddress.state} {order.billingAddress.zipCode}
                  </Text>
                  <Text style={[styles.addressLine, { color: colors.textSecondary }]}>
                    {order.billingAddress.country}
                  </Text>
                </View>
              </View>
            </Section>
          )}

          {/* Payment */}
          <Section title='Payment' colors={colors}>
            <View style={styles.payRow}>
              <View style={[styles.payIcon, { backgroundColor: 'rgba(34, 197, 94, 0.08)' }]}>
                <Ionicons name='wallet-outline' size={18} color='#22C55E' />
              </View>
              <View style={styles.payInfo}>
                <Text style={[styles.payMethod, { color: colors.textPrimary }]}>
                  {order.shippingMethod}
                </Text>
                <View
                  style={[
                    styles.payBadge,
                    {
                      backgroundColor: order.isPaid
                        ? 'rgba(34, 197, 94, 0.10)'
                        : 'rgba(192, 138, 62, 0.10)',
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: order.isPaid ? '#22C55E' : '#C08A3E',
                      ...typography.label,
                    }}
                  >
                    {order.isPaid ? 'Paid' : 'Unpaid'}
                  </Text>
                </View>
              </View>
            </View>
          </Section>

          {/* Notes */}
          {order.notes && (
            <Section title='Notes' colors={colors}>
              <Text style={[styles.notesText, { color: colors.textSecondary }]}>{order.notes}</Text>
            </Section>
          )}

          <View style={{ height: spacing['4xl'] }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  headerTitle: { ...typography.h3 },
  scrollContent: { paddingBottom: spacing['4xl'] },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },

  /* Hero */
  hero: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    borderRadius: radius['2xl'],
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroStatus: {
    ...typography.h2,
    color: '#fff',
    marginBottom: spacing.xs,
  },
  heroOrderId: {
    ...typography.bodyStrong,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  heroDate: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },

  /* Skeleton */
  skeletonContent: { padding: spacing.lg, gap: spacing.lg },
  skeletonCard: { padding: spacing.xl, borderRadius: radius.xl },

  /* Timeline */
  timeline: { paddingTop: spacing.xs },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start' },
  timelineLeft: { alignItems: 'center', width: 28 },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  line: { width: 2, height: 24, marginTop: 2 },
  timelineLabel: {
    ...typography.body,
    paddingLeft: spacing.md,
    paddingBottom: spacing.lg,
  },

  /* Item Card */
  itemCard: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    gap: spacing.lg,
  },
  itemImage: {
    width: 68,
    height: 68,
    borderRadius: radius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImageFile: { width: '100%', height: '100%' },
  offerDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerDotText: { ...typography.label, color: '#fff', fontSize: 10 },
  itemBody: { flex: 1 },
  itemName: { ...typography.bodyStrong, lineHeight: 19, marginBottom: 4 },
  attrRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  attrChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  attrText: { ...typography.caption, fontSize: 11 },
  itemBottom: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  itemPrice: { ...typography.bodyStrong, fontSize: 14 },
  priceOffer: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  itemPriceOld: { ...typography.caption, textDecorationLine: 'line-through', fontSize: 11 },
  itemQty: { ...typography.caption, fontSize: 11 },
  itemTotal: { ...typography.priceSmall, marginLeft: 'auto' },

  /* Section */
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
  },
  sectionTitle: { ...typography.h4, marginBottom: spacing.lg },

  /* Summary */
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryTotal: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.sm,
    paddingTop: spacing.lg,
  },
  summaryLabel: { ...typography.body },
  summaryValue: { ...typography.bodyStrong },
  summaryTotalLabel: { ...typography.bodyStrong },
  summaryTotalValue: { ...typography.priceLarge },

  /* Address */
  addressRow: { flexDirection: 'row', gap: spacing.lg },
  addressIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressText: { flex: 1 },
  addressName: { ...typography.bodyStrong, marginBottom: 2 },
  addressLine: { ...typography.body, lineHeight: 20, fontSize: 14 },
  addressPhone: { ...typography.body, marginTop: spacing.xs, fontSize: 14 },

  /* Payment */
  payRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  payIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  payMethod: { ...typography.bodyStrong },
  payBadge: { paddingHorizontal: spacing.md, paddingVertical: 3, borderRadius: radius.pill },

  /* Notes */
  notesText: { ...typography.body, lineHeight: 21 },

  /* Error */
  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  errorTitle: { ...typography.h3, marginBottom: spacing.xs },
  errorSubtitle: { ...typography.body, textAlign: 'center', marginBottom: spacing.xl },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  retryBtnText: { ...typography.button, color: '#FFFFFF' },
});
