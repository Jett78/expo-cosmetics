import { useState, useEffect, useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { Text } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '../../hooks/useAppTheme';
import { spacing, radius, typography, motion } from '../../design-system';
import { useShopFilter } from '../../context/ShopFilterContext';

const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest' },
  { id: 'oldest', name: 'Oldest' },
  { id: 'price_low_to_high', name: 'Price: Low to High' },
  { id: 'price_high_to_low', name: 'Price: High to Low' },
  { id: 'alphabetical', name: 'Alphabetical' },
  { id: 'offer', name: 'Hot Deals' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function SortDropdown({ visible, onClose }: Props) {
  const { colors } = useAppTheme();
  const { filters, setSortBy } = useShopFilter();

  const [mounted, setMounted] = useState(false);
  const progress = useSharedValue(0);

  const hide = useCallback(() => setMounted(false), []);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withDelay(50, withTiming(1, { duration: 300 }));
    } else {
      progress.value = withTiming(0, { duration: 250 }, () => {
        runOnJS(hide)();
      });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.5,
    pointerEvents: progress.value > 0 ? 'auto' : 'none',
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 300 }],
  }));

  const handleSelect = (sortBy: string) => {
    setSortBy(sortBy);
    onClose();
  };

  if (!mounted) return null;

  return (
    <View style={styles.root} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[styles.overlayBackdrop, backdropStyle]} />
      <Pressable style={styles.overlayTap} onPress={onClose} />
      <Animated.View style={[styles.sheet, { backgroundColor: colors.surface }, sheetStyle]}>
        <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>Sort By</Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.content}>
          {SORT_OPTIONS.map((option) => {
            const isActive = filters.sortBy === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => handleSelect(option.id)}
                style={[
                  styles.optionRow,
                  { backgroundColor: isActive ? colors.accent : 'transparent' },
                ]}
              >
                <Text
                  style={[
                    typography.body,
                    {
                      color: isActive ? colors.textInverse : colors.textPrimary,
                      fontWeight: isActive ? '600' : '400',
                    },
                  ]}
                >
                  {option.name}
                </Text>
                {isActive && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.textInverse} />
                )}
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}

const ABS_FILL = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };

const styles = StyleSheet.create({
  root: {
    ...ABS_FILL,
    zIndex: 999,
  },
  overlayBackdrop: {
    ...ABS_FILL,
    backgroundColor: '#000',
  },
  overlayTap: {
    ...ABS_FILL,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    height: '45%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  content: {
    padding: spacing.xl,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
});
