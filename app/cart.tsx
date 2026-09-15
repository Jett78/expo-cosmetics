import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCommerce } from '../src/context/CommerceContext';
import { useAppTheme } from '../src/hooks/useAppTheme';
import { spacing, radius, typography, shadows } from '../src/design-system';

export default function CartScreen() {
  const { colors } = useAppTheme();
  const { cartItems, clearCart, getCartTotal } = useCommerce();

  const isEmpty = cartItems.length === 0;
  const total = getCartTotal();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <Text h3 style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Shopping Bag
        </Text>
        {!isEmpty && (
          <Text style={[styles.headerCount, { color: colors.textSecondary }]}>
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </Text>
        )}
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceMuted }]}>
            <Ionicons name="bag-outline" size={56} color={colors.textSecondary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            Your bag is empty
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Looks like you haven't added anything yet
          </Text>
          <Link href="/" asChild>
            <TouchableOpacity
              style={StyleSheet.flatten([styles.exploreButton, { backgroundColor: colors.accent }])}
              activeOpacity={0.8}
            >
              <Text style={[styles.exploreButtonText, { color: colors.textInverse }]}>
                Explore
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {cartItems.map((item) => (
              <View
                key={item.product.id}
                style={[styles.cartItem, { borderBottomColor: colors.borderSubtle }]}
              >
                <Link href={`/product/${item.product.id}`} asChild>
                  <TouchableOpacity style={styles.cartItemLeft}>
                    <Image
                      source={item.product.image}
                      style={[styles.cartItemImage, { backgroundColor: colors.surfaceMuted }]}
                      contentFit="cover"
                      transition={200}
                    />
                    <View style={styles.cartItemDetails}>
                      <Text
                        style={[styles.cartItemName, { color: colors.textPrimary }]}
                        numberOfLines={2}
                      >
                        {item.product.name}
                      </Text>
                      <Text style={[styles.cartItemPrice, { color: colors.textPrimary }]}>
                        Rs. {(item.product.salePrice ?? item.product.price).toLocaleString()}
                      </Text>
                      <Text style={[styles.cartItemQty, { color: colors.textSecondary }]}>
                        Qty: {item.quantity}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Link>
              </View>
            ))}
          </ScrollView>

          <View style={[styles.summaryContainer, { backgroundColor: colors.surface, borderTopColor: colors.borderSubtle }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Subtotal
              </Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                Rs. {total.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Delivery
              </Text>
              <Text style={[styles.freeDelivery, { color: colors.success }]}>
                Free
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>
                Total
              </Text>
              <Text style={[styles.totalValue, { color: colors.textPrimary }]}>
                Rs. {total.toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.checkoutButton, { backgroundColor: colors.accent }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.checkoutButtonText, { color: colors.textInverse }]}>
                Proceed to Checkout
              </Text>
            </TouchableOpacity>

            <Link href="/" asChild>
              <TouchableOpacity
                style={StyleSheet.flatten([styles.continueButton, { borderColor: colors.borderStrong }])}
                activeOpacity={0.7}
              >
                <Text style={[styles.continueButtonText, { color: colors.textPrimary }]}>
                  Continue Shopping
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontWeight: '700',
  },
  headerCount: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cartItemLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: spacing.md,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
  },
  cartItemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  cartItemName: {
    ...typography.bodyStrong,
    marginBottom: spacing.xs,
  },
  cartItemPrice: {
    ...typography.priceSmall,
    marginBottom: spacing.xxs,
  },
  cartItemQty: {
    ...typography.caption,
  },
  summaryContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.body,
  },
  summaryValue: {
    ...typography.bodyStrong,
  },
  freeDelivery: {
    ...typography.bodyStrong,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.md,
  },
  totalLabel: {
    ...typography.h4,
  },
  totalValue: {
    ...typography.price,
  },
  checkoutButton: {
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  checkoutButtonText: {
    ...typography.button,
    fontSize: 15,
  },
  continueButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  continueButtonText: {
    ...typography.button,
    fontSize: 15,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
    paddingBottom: spacing['5xl'],
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  emptyTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  exploreButton: {
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    ...shadows.md,
  },
  exploreButtonText: {
    ...typography.button,
  },
});
