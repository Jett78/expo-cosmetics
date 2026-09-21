import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, runOnJS } from 'react-native-reanimated';
import { Text } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '../../hooks/useAppTheme';
import { spacing, radius, typography, motion } from '../../design-system';
import { useCategories } from '../../services/category/hooks';
import { useBrands } from '../../services/brand/hooks';
import { useShopFilter } from '../../context/ShopFilterContext';
import type { ApiCategory, ApiBrand } from '../../types';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const RATING_ROWS = [5, 4, 3, 2, 1];

export default function FilterBottomSheet({ visible, onClose }: Props) {
  const { colors } = useAppTheme();
  const { filters, applyFilters } = useShopFilter();

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: brands, isLoading: brandsLoading } = useBrands();

  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(filters.categoryId);
  const [pendingBrandId, setPendingBrandId] = useState<string | null>(filters.brandId);
  const [pendingMinPrice, setPendingMinPrice] = useState(filters.minPrice);
  const [pendingMaxPrice, setPendingMaxPrice] = useState(filters.maxPrice);
  const [pendingRating, setPendingRating] = useState<number | null>(filters.rating);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  const progress = useSharedValue(0);

  const hide = useCallback(() => setMounted(false), []);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withDelay(50, withTiming(1, { duration: 350 }));
    } else {
      progress.value = withTiming(0, { duration: 280 }, () => {
        runOnJS(hide)();
      });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.5,
    pointerEvents: progress.value > 0 ? 'auto' : 'none',
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 400 }],
  }));

  const handleApply = useCallback(() => {
    applyFilters({
      ...filters,
      categoryId: pendingCategoryId,
      brandId: pendingBrandId,
      minPrice: pendingMinPrice,
      maxPrice: pendingMaxPrice,
      rating: pendingRating,
    });
    onClose();
  }, [filters, pendingCategoryId, pendingBrandId, pendingMinPrice, pendingMaxPrice, pendingRating, applyFilters, onClose]);

  const handleReset = useCallback(() => {
    setPendingCategoryId(null);
    setPendingBrandId(null);
    setPendingMinPrice('');
    setPendingMaxPrice('');
    setPendingRating(null);
  }, []);

  const pendingCount = useMemo(() => {
    let c = 0;
    if (pendingCategoryId) c++;
    if (pendingBrandId) c++;
    if (pendingMinPrice) c++;
    if (pendingMaxPrice) c++;
    if (pendingRating) c++;
    return c;
  }, [pendingCategoryId, pendingBrandId, pendingMinPrice, pendingMaxPrice, pendingRating]);

  const renderCategoryItem = (cat: ApiCategory) => {
    const isSelected = pendingCategoryId === cat.id;
    const isExpanded = expandedCategoryId === cat.id;
    const hasSubs = cat.subcategories && cat.subcategories.length > 0;

    return (
      <View key={cat.id}>
        <Pressable
          onPress={() => setPendingCategoryId(isSelected ? null : cat.id)}
          style={[
            styles.radioRow,
            { backgroundColor: isSelected ? colors.accent : 'transparent' },
          ]}
        >
          <View style={styles.radioLeft}>
            <View
              style={[
                styles.radio,
                { borderColor: isSelected ? colors.accent : colors.borderStrong },
                isSelected && { backgroundColor: colors.accent },
              ]}
            >
              {isSelected && <View style={styles.radioInner} />}
            </View>
            <Text
              style={[
                typography.body,
                {
                  color: isSelected ? colors.textInverse : colors.textPrimary,
                  fontWeight: isSelected ? '600' : '400',
                },
              ]}
            >
              {cat.name}
            </Text>
          </View>
          {hasSubs && (
            <Pressable onPress={() => setExpandedCategoryId(isExpanded ? null : cat.id)}>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          )}
        </Pressable>
        {hasSubs && isExpanded && (
          <View style={styles.subcategoryList}>
            {cat.subcategories.map((sub) => {
              const isSubSelected = pendingCategoryId === sub.id;
              return (
                <Pressable
                  key={sub.id}
                  onPress={() => setPendingCategoryId(isSubSelected ? null : sub.id)}
                  style={[
                    styles.radioRow,
                    styles.subcategoryRow,
                    { backgroundColor: isSubSelected ? colors.accent : 'transparent' },
                  ]}
                >
                  <View style={styles.radioLeft}>
                    <View
                      style={[
                        styles.radio,
                        styles.radioSmall,
                        { borderColor: isSubSelected ? colors.accent : colors.borderStrong },
                        isSubSelected && { backgroundColor: colors.accent },
                      ]}
                    >
                      {isSubSelected && <View style={styles.radioInnerSmall} />}
                    </View>
                    <Text
                      style={[
                        typography.body,
                        {
                          color: isSubSelected ? colors.textInverse : colors.textSecondary,
                          fontSize: 13,
                        },
                      ]}
                    >
                      {sub.name}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderBrandItem = (brand: ApiBrand) => {
    const isSelected = pendingBrandId === brand.id;
    return (
      <Pressable
        key={brand.id}
        onPress={() => setPendingBrandId(isSelected ? null : brand.id)}
        style={[
          styles.radioRow,
          { backgroundColor: isSelected ? colors.accent : 'transparent' },
        ]}
      >
        <View style={styles.radioLeft}>
          <View
            style={[
              styles.radio,
              { borderColor: isSelected ? colors.accent : colors.borderStrong },
              isSelected && { backgroundColor: colors.accent },
            ]}
          >
            {isSelected && <View style={styles.radioInner} />}
          </View>
          <Text
            style={[
              typography.body,
              {
                color: isSelected ? colors.textInverse : colors.textPrimary,
                fontWeight: isSelected ? '600' : '400',
              },
            ]}
          >
            {brand.name}
          </Text>
        </View>
      </Pressable>
    );
  };

  if (!mounted) return null;

  return (
    <View style={styles.root} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[styles.overlayBackdrop, backdropStyle]} />
      <Pressable style={styles.overlayTap} onPress={onClose} />
      <Animated.View style={[styles.sheet, { backgroundColor: colors.surface }, sheetStyle]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>Filters</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollInner}
        >
          {/* Price Range */}
          <View style={styles.section}>
            <Text style={[typography.h4, { color: colors.textPrimary, marginBottom: spacing.md }]}>
              Price
            </Text>
            <View style={styles.priceRow}>
              <TextInput
                style={[
                  styles.priceInput,
                  {
                    color: colors.textPrimary,
                    borderColor: colors.borderStrong,
                    backgroundColor: colors.surfaceMuted,
                  },
                ]}
                placeholder="Min"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={pendingMinPrice}
                onChangeText={setPendingMinPrice}
              />
              <Text style={[typography.body, { color: colors.textMuted, marginHorizontal: spacing.sm }]}>
                —
              </Text>
              <TextInput
                style={[
                  styles.priceInput,
                  {
                    color: colors.textPrimary,
                    borderColor: colors.borderStrong,
                    backgroundColor: colors.surfaceMuted,
                  },
                ]}
                placeholder="Max"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={pendingMaxPrice}
                onChangeText={setPendingMaxPrice}
              />
              <Text style={[typography.body, { color: colors.textMuted, marginLeft: spacing.xs }]}>
                Rs.
              </Text>
            </View>
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={[typography.h4, { color: colors.textPrimary, marginBottom: spacing.md }]}>
              Category
            </Text>
            {categoriesLoading ? (
              <ActivityIndicator size="small" color={colors.accent} style={{ paddingVertical: spacing.xl }} />
            ) : (
              (categories ?? []).map(renderCategoryItem)
            )}
          </View>

          {/* Brands */}
          <View style={styles.section}>
            <Text style={[typography.h4, { color: colors.textPrimary, marginBottom: spacing.md }]}>
              Brands
            </Text>
            {brandsLoading ? (
              <ActivityIndicator size="small" color={colors.accent} style={{ paddingVertical: spacing.xl }} />
            ) : (
              (brands ?? []).map(renderBrandItem)
            )}
          </View>

          {/* Ratings */}
          <View style={styles.section}>
            <Text style={[typography.h4, { color: colors.textPrimary, marginBottom: spacing.md }]}>
              Rating
            </Text>
            {RATING_ROWS.map((stars) => {
              const isSelected = pendingRating === stars;
              return (
                <Pressable
                  key={stars}
                  onPress={() => setPendingRating(isSelected ? null : stars)}
                  style={[
                    styles.radioRow,
                    { backgroundColor: isSelected ? colors.accent : 'transparent' },
                  ]}
                >
                  <View style={styles.radioLeft}>
                    <View
                      style={[
                        styles.radio,
                        { borderColor: isSelected ? colors.accent : colors.borderStrong },
                        isSelected && { backgroundColor: colors.accent },
                      ]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.starsRow}>
                      {Array.from({ length: stars }).map((_, i) => (
                        <Ionicons key={i} name="star" size={18} color="#F59E0B" />
                      ))}
                      <Text style={[typography.caption, { color: isSelected ? colors.textInverse : colors.textSecondary, marginLeft: spacing.xs }]}>
                        {stars}+ & up
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.borderSubtle }]}>
          <Pressable
            onPress={handleReset}
            style={[styles.resetBtn, { borderColor: colors.borderStrong }]}
          >
            <Text style={[typography.button, { color: colors.textPrimary }]}>
              Reset {pendingCount > 0 ? `(${pendingCount})` : ''}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleApply}
            style={[styles.applyBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={[typography.button, { color: colors.textInverse }]}>Apply</Text>
          </Pressable>
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
    height: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: spacing.xl,
    paddingBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    ...typography.body,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  radioLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  radioSmall: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  radioInnerSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  subcategoryList: {
    paddingLeft: spacing['2xl'],
  },
  subcategoryRow: {
    paddingVertical: spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
