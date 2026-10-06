import { Ionicons } from '@expo/vector-icons';
import { Text } from '@rneui/themed';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { router } from 'expo-router';

import { radius, spacing, typography } from '../design-system';
import { useAppTheme } from '../hooks/useAppTheme';

type Props = {
  visible: boolean;
  onClose: () => void;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
};

export default function AddToCartBottomSheet({
  visible,
  onClose,
  productName,
  productImage,
  quantity,
  price,
}: Props) {
  const { colors } = useAppTheme();

  const [mounted, setMounted] = useState(false);
  const progress = useSharedValue(0);

  const finishHide = useCallback(() => setMounted(false), []);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withDelay(50, withTiming(1, { duration: 300 }));

      const timer = setTimeout(() => {
        onClose();
      }, 6000);

      return () => clearTimeout(timer);
    } else {
      progress.value = withTiming(0, { duration: 250 }, () => {
        runOnJS(finishHide)();
      });
    }
  }, [visible, progress, finishHide, onClose]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.4,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 400 }],
  }));

  const handleViewBag = () => {
    onClose();
    router.push('/cart');
  };

  const handleCheckout = () => {
    onClose();
    router.push('/checkout/address');
  };

  const handleContinue = () => {
    onClose();
  };

  if (!mounted) return null;

  return (
    <Modal transparent visible onRequestClose={onClose} animationType="none">
      <Animated.View style={[styles.backdrop, backdropStyle]} />
      <Pressable style={styles.backdropTap} onPress={onClose} />
      <View style={styles.sheetHost} pointerEvents="box-none">
        <Animated.View style={[styles.sheet, { backgroundColor: colors.surface }, sheetStyle]}>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </Pressable>

          <View style={styles.content}>
            <View style={[styles.successIconCircle, { backgroundColor: colors.accent }]}>
              <Ionicons name="checkmark" size={32} color={colors.textInverse} />
            </View>

            <Text style={[typography.h3, { color: colors.textPrimary, textAlign: 'center' }]}>
              Added to Bag!
            </Text>

            <View style={styles.productInfo}>
              <Image
                source={{ uri: productImage }}
                style={[styles.productImage, { backgroundColor: colors.surfaceMuted }]}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.productDetails}>
                <Text
                  style={[typography.bodyStrong, { color: colors.textPrimary }]}
                  numberOfLines={2}
                >
                  {productName}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                  Qty: {quantity}
                </Text>
                <Text style={[typography.priceSmall, { color: colors.textPrimary, marginTop: spacing.xs }]}>
                  Rs. {(price * quantity).toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable
                onPress={handleCheckout}
                style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
              >
                <Ionicons name="card-outline" size={20} color={colors.textInverse} />
                <Text style={[typography.button, { color: colors.textInverse, marginLeft: spacing.sm }]}>
                  Checkout Now
                </Text>
              </Pressable>

              <Pressable
                onPress={handleViewBag}
                style={[styles.secondaryBtn, { borderColor: colors.accent, backgroundColor: colors.surface }]}
              >
                <Ionicons name="bag-outline" size={20} color={colors.accent} />
                <Text style={[typography.button, { color: colors.accent, marginLeft: spacing.sm }]}>
                  View Bag
                </Text>
              </Pressable>

              <Pressable
                onPress={handleContinue}
                style={styles.tertiaryBtn}
              >
                <Text style={[typography.body, { color: colors.textSecondary }]}>
                  Continue Shopping
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const ABS_FILL = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };

const styles = StyleSheet.create({
  backdrop: {
    ...ABS_FILL,
    backgroundColor: '#000',
  },
  backdropTap: {
    ...ABS_FILL,
  },
  sheetHost: {
    ...ABS_FILL,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing['2xl'],
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  productInfo: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  actions: {
    gap: spacing.md,
  },
  primaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
  },
  secondaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  tertiaryBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
});
