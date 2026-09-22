import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '@rneui/themed';
import { router } from 'expo-router';

import { useCommerce } from '../src/context/CommerceContext';
import { useAppTheme } from '../src/hooks/useAppTheme';
import { radius, spacing, typography } from '../src/design-system';

export default function CheckoutScreen() {
  const { cartItems, serverCartItems, isAuthenticated, getCartTotal, checkout, checkoutComplete } = useCommerce();
  const { colors } = useAppTheme();
  const [orderPlaced, setOrderPlaced] = useState(checkoutComplete);

  const activeItems = isAuthenticated ? serverCartItems : cartItems;

  const getItemPrice = (item: { product: { price: number; salePrice?: number; offeredPrice?: number; isOfferedPriceActive?: boolean } } & { quantity: number }) => {
    const p = item.product;
    const effectivePrice = p.isOfferedPriceActive && p.offeredPrice ? p.offeredPrice : (p.salePrice ?? p.price);
    return effectivePrice * item.quantity;
  };

  const subtotal = isAuthenticated
    ? serverCartItems.reduce((total, item) => total + getItemPrice(item), 0)
    : getCartTotal();

  const delivery = subtotal > 0 ? 5 : 0;
  const total = subtotal + delivery;

  const handlePlaceOrder = () => {
    checkout();
    setOrderPlaced(true);
  };

  if (orderPlaced || checkoutComplete) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <View style={[styles.checkCircle, { backgroundColor: colors.success }]}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Order Placed!</Text>
          <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
            Thank you for your purchase. Your order has been confirmed.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.accent }]}
            activeOpacity={0.8}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.buttonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.textPrimary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Checkout</Text>
        <View style={styles.backButton} />
      </View>

      <FlatList
        data={activeItems as any[]}
        keyExtractor={(_, index) => String(index)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Order Summary</Text>
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Your cart is empty.</Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.itemRow, { borderBottomColor: colors.borderSubtle }]}>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: colors.textPrimary }]} numberOfLines={1}>
                {item.product.name}
              </Text>
              <Text style={{ color: colors.textSecondary, ...typography.caption }}>
                Qty: {item.quantity}
              </Text>
            </View>
            <Text style={[styles.itemPrice, { color: colors.textPrimary }]}>
              Rs. {getItemPrice(item).toLocaleString()}
            </Text>
          </View>
        )}
        ListFooterComponent={
          activeItems.length > 0 ? (
            <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
              <View style={styles.summaryRow}>
                <Text style={{ color: colors.textSecondary, ...typography.body }}>Subtotal</Text>
                <Text style={{ color: colors.textPrimary, ...typography.bodyStrong }}>
                  Rs. {subtotal.toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={{ color: colors.textSecondary, ...typography.body }}>Delivery</Text>
                <Text style={{ color: colors.textPrimary, ...typography.bodyStrong }}>
                  Rs. {delivery.toLocaleString()}
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
              <View style={styles.summaryRow}>
                <Text style={{ color: colors.textPrimary, ...typography.bodyStrong }}>Total</Text>
                <Text style={{ color: colors.textPrimary, ...typography.priceLarge }}>
                  Rs. {total.toLocaleString()}
                </Text>
              </View>
            </View>
          ) : null
        }
      />

      {activeItems.length > 0 && (
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.borderSubtle }]}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.accent }]}
            activeOpacity={0.8}
            onPress={handlePlaceOrder}
          >
            <Text style={styles.buttonText}>Place Order — Rs. {total.toLocaleString()}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
    paddingTop: spacing['4xl'],
    paddingBottom: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 60,
  },
  backText: {
    ...typography.body,
  },
  headerTitle: {
    ...typography.h2,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  sectionTitle: {
    ...typography.h3,
    marginTop: spacing['2xl'],
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing['3xl'],
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  itemName: {
    ...typography.body,
  },
  itemPrice: {
    ...typography.bodyStrong,
  },
  summaryCard: {
    borderRadius: radius.lg,
    padding: spacing['2xl'],
    marginTop: spacing['2xl'],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.sm,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  button: {
    height: 56,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  checkmark: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  successTitle: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  successMessage: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing['3xl'],
    lineHeight: 22,
  },
});
