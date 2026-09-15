import { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  Pressable,
  StyleSheet,
  Modal,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@rneui/themed';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useCommerce } from '../../src/context/CommerceContext';
import { products } from '../../src/data';
import { sortOptions, filterOptions } from '../../src/data/search';
import { spacing, radius, typography, shadows } from '../../src/design-system';
import type { Product } from '../../src/data/products';

type Filters = {
  priceRanges: string[];
  minRating: number;
};

const defaultFilters: Filters = {
  priceRanges: [],
  minRating: 0,
};

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors } = useAppTheme();
  const { isFavorite, toggleFavorite } = useCommerce();

  const [sortBy, setSortBy] = useState('recommended');
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(defaultFilters);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const categoryName = useMemo(() => {
    if (!slug) return 'All Products';
    return slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }, [slug]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (!slug) return true;
      return (
        p.categoryId === slug ||
        p.category.toLowerCase() === slug.toLowerCase()
      );
    });

    // Price filter
    if (appliedFilters.priceRanges.length > 0) {
      result = result.filter((p) => {
        const price = p.salePrice ?? p.price;
        return appliedFilters.priceRanges.some((rangeId) => {
          const range = filterOptions.priceRanges.find((r) => r.id === rangeId);
          if (!range) return false;
          return price >= range.min && price < range.max;
        });
      });
    }

    // Rating filter
    if (appliedFilters.minRating > 0) {
      result = result.filter((p) => p.rating >= appliedFilters.minRating);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result = [...result].reverse();
        break;
      case 'price-asc':
        result = [...result].sort(
          (a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price)
        );
        break;
      case 'price-desc':
        result = [...result].sort(
          (a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price)
        );
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        result = [...result].sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        break;
    }

    return result;
  }, [slug, sortBy, appliedFilters]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setSortBy('recommended');
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const togglePriceRange = (id: string) => {
    setFilters((prev) => ({
      ...prev,
      priceRanges: prev.priceRanges.includes(id)
        ? prev.priceRanges.filter((r) => r !== id)
        : [...prev.priceRanges, id],
    }));
  };

  const toggleRating = (value: number) => {
    setFilters((prev) => ({
      ...prev,
      minRating: prev.minRating === value ? 0 : value,
    }));
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
    setShowFilterSheet(false);
  };

  const renderProductCard = useCallback(
    ({ item }: { item: typeof products[0] }) => {
      const effectivePrice = item.salePrice ?? item.price;
      const hasDiscount = item.salePrice != null && item.salePrice < item.price;

      return (
        <Pressable
          onPress={() => router.push(`/product/${item.id}`)}
          style={[styles.productCard, { backgroundColor: colors.surface }]}
        >
          <View style={styles.imageContainer}>
            <Image
              source={item.image}
              style={styles.productImage}
              contentFit="contain"
              transition={200}
            />
            <Pressable
              onPress={() => toggleFavorite(item as Product)}
              style={[styles.heartBtn, { backgroundColor: 'rgba(255,255,255,0.8)' }]}
              accessibilityLabel={isFavorite(item.id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Ionicons
                name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorite(item.id) ? colors.danger : colors.textPrimary}
              />
            </Pressable>
            {hasDiscount && (
              <View style={[styles.discountTag, { backgroundColor: colors.danger }]}>
                <Text style={[typography.caption, { color: colors.textInverse }]}>
                  -{Math.round(((item.price - item.salePrice!) / item.price) * 100)}%
                </Text>
              </View>
            )}
          </View>
          <View style={styles.cardInfo}>
            <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.brand}
            </Text>
            <Text style={[typography.bodyStrong, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.priceRow}>
              <Text style={[typography.priceSmall, { color: colors.textPrimary }]}>
                {item.currency} {effectivePrice.toLocaleString()}
              </Text>
              {hasDiscount && (
                <Text
                  style={[
                    typography.caption,
                    {
                      color: colors.textSecondary,
                      textDecorationLine: 'line-through',
                      marginLeft: spacing.sm,
                    },
                  ]}
                >
                  {item.currency} {item.price.toLocaleString()}
                </Text>
              )}
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, isFavorite, toggleFavorite]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={56} color={colors.borderStrong} />
      <Text style={[typography.h3, { color: colors.textPrimary, marginTop: spacing.xl }]}>
        No products found
      </Text>
      <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }]}>
        Try adjusting your filters or browse all products.
      </Text>
      <Pressable
        onPress={handleRefresh}
        style={[styles.clearBtn, { backgroundColor: colors.accent, marginTop: spacing.xl }]}
      >
        <Text style={[typography.button, { color: colors.textInverse }]}>Clear Filters</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceMuted }]}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[typography.h3, { color: colors.textPrimary }]} numberOfLines={1}>
            {categoryName}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Bar */}
      <View style={[styles.filterBar, { borderBottomColor: colors.borderSubtle }]}>
        <Pressable
          onPress={() => {
            setFilters(appliedFilters);
            setShowFilterSheet(true);
          }}
          style={[
            styles.filterBtn,
            {
              backgroundColor:
                appliedFilters.priceRanges.length > 0 || appliedFilters.minRating > 0
                  ? colors.accent
                  : colors.surfaceMuted,
              borderColor: colors.borderStrong,
            },
          ]}
        >
          <Ionicons
            name="options-outline"
            size={16}
            color={
              appliedFilters.priceRanges.length > 0 || appliedFilters.minRating > 0
                ? colors.textInverse
                : colors.textPrimary
            }
          />
          <Text
            style={[
              typography.captionLarge,
              {
                color:
                  appliedFilters.priceRanges.length > 0 || appliedFilters.minRating > 0
                    ? colors.textInverse
                    : colors.textPrimary,
                marginLeft: spacing.xs,
              },
            ]}
          >
            Filters
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setShowSortSheet(true)}
          style={[styles.filterBtn, { backgroundColor: colors.surfaceMuted, borderColor: colors.borderStrong }]}
        >
          <Ionicons name="swap-vertical" size={16} color={colors.textPrimary} />
          <Text style={[typography.captionLarge, { color: colors.textPrimary, marginLeft: spacing.xs }]}>
            Sort
          </Text>
        </Pressable>
      </View>

      {/* Product Count */}
      <View style={styles.countRow}>
        <Text style={[typography.captionLarge, { color: colors.textSecondary }]}>
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </Text>
      </View>

      {/* Product Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductCard}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} />
        }
      />

      {/* Filter Bottom Sheet */}
      <Modal visible={showFilterSheet} transparent animationType="fade" onRequestClose={() => setShowFilterSheet(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowFilterSheet(false)}>
          <Pressable
            style={[styles.bottomSheet, { backgroundColor: colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <Text style={[typography.h3, { color: colors.textPrimary }]}>Filters</Text>
              <Pressable onPress={() => setShowFilterSheet(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.sheetContent}>
              {/* Price Ranges */}
              <Text style={[typography.bodyStrong, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                Price
              </Text>
              {filterOptions.priceRanges.map((range) => (
                <Pressable
                  key={range.id}
                  onPress={() => togglePriceRange(range.id)}
                  style={styles.filterOptionRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: filters.priceRanges.includes(range.id)
                          ? colors.accent
                          : 'transparent',
                        borderColor: filters.priceRanges.includes(range.id)
                          ? colors.accent
                          : colors.borderStrong,
                      },
                    ]}
                  >
                    {filters.priceRanges.includes(range.id) && (
                      <Ionicons name="checkmark" size={14} color={colors.textInverse} />
                    )}
                  </View>
                  <Text style={[typography.body, { color: colors.textPrimary }]}>{range.label}</Text>
                </Pressable>
              ))}

              {/* Rating Filter */}
              <Text
                style={[
                  typography.bodyStrong,
                  { color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.md },
                ]}
              >
                Rating
              </Text>
              {filterOptions.ratings.map((rating) => (
                <Pressable
                  key={rating.id}
                  onPress={() => toggleRating(rating.value)}
                  style={styles.filterOptionRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: filters.minRating === rating.value
                          ? colors.accent
                          : 'transparent',
                        borderColor: filters.minRating === rating.value
                          ? colors.accent
                          : colors.borderStrong,
                      },
                    ]}
                  >
                    {filters.minRating === rating.value && (
                      <Ionicons name="checkmark" size={14} color={colors.textInverse} />
                    )}
                  </View>
                  <Text style={[typography.body, { color: colors.textPrimary }]}>{rating.label}</Text>
                </Pressable>
              ))}
            </View>

            {/* Sheet Footer */}
            <View style={[styles.sheetFooter, { borderTopColor: colors.borderSubtle }]}>
              <Pressable
                onPress={() => {
                  setFilters(defaultFilters);
                }}
                style={[styles.sheetCancelBtn, { borderColor: colors.borderStrong }]}
              >
                <Text style={[typography.button, { color: colors.textPrimary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={applyFilters}
                style={[styles.sheetApplyBtn, { backgroundColor: colors.accent }]}
              >
                <Text style={[typography.button, { color: colors.textInverse }]}>Apply</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Sort Bottom Sheet */}
      <Modal visible={showSortSheet} transparent animationType="fade" onRequestClose={() => setShowSortSheet(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowSortSheet(false)}>
          <Pressable
            style={[styles.bottomSheet, { backgroundColor: colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHeader}>
              <Text style={[typography.h3, { color: colors.textPrimary }]}>Sort By</Text>
              <Pressable onPress={() => setShowSortSheet(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.sheetContent}>
              {sortOptions.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => {
                    setSortBy(option.id);
                    setShowSortSheet(false);
                  }}
                  style={[
                    styles.sortOptionRow,
                    {
                      backgroundColor:
                        sortBy === option.id ? colors.accentLight : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.body,
                      {
                        color: sortBy === option.id ? colors.accent : colors.textPrimary,
                        fontWeight: sortBy === option.id ? '600' : '400',
                      },
                    ]}
                  >
                    {option.name}
                  </Text>
                  {sortBy === option.id && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                  )}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  countRow: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  gridContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  row: {
    gap: spacing.md,
  },
  productCard: {
    flex: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
    maxWidth: '48%',
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: '#F8F5F3',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountTag: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
  },
  cardInfo: {
    padding: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['5xl'],
    minHeight: 300,
  },
  clearBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  sheetContent: {
    padding: spacing.xl,
  },
  filterOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.xs,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  sheetFooter: {
    flexDirection: 'row',
    padding: spacing.xl,
    gap: spacing.md,
    borderTopWidth: 1,
  },
  sheetCancelBtn: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
  },
  sheetApplyBtn: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
});
