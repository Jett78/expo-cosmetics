import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../src/hooks/useAppTheme';
import { spacing, radius, typography } from '../../src/design-system';

export default function OrderSuccessScreen() {
  const { colors } = useAppTheme();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();

  const handleViewOrders = () => {
    if (orderId) {
      router.replace(`/orders/${orderId}`);
    } else {
      router.replace('/orders');
    }
  };

  const handleContinueShopping = () => {
    router.replace('/(tabs)/shop');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: colors.success }]}>
          <Ionicons name="bicycle" size={56} color="#FFFFFF" />
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Order Placed Successfully!
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your order has been confirmed and is being processed. We'll deliver it to you soon.
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
            onPress={handleViewOrders}
            activeOpacity={0.85}
          >
            <Ionicons name="receipt-outline" size={18} color={colors.textInverse} />
            <Text style={[styles.primaryBtnText, { color: colors.textInverse }]}>
              View Orders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}
            onPress={handleContinueShopping}
            activeOpacity={0.85}
          >
            <Ionicons name="storefront-outline" size={18} color={colors.textPrimary} />
            <Text style={[styles.secondaryBtnText, { color: colors.textPrimary }]}>
              Continue Shopping
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {
    ...typography.h2,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing['4xl'],
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
  },
  primaryBtnText: {
    ...typography.button,
    fontSize: 15,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  secondaryBtnText: {
    ...typography.button,
    fontSize: 15,
  },
});
