import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Text } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

import { useAppTheme } from '../../src/hooks/useAppTheme';
import { spacing, radius, typography } from '../../src/design-system';
import { useTabBarVisibility } from '../../src/context/TabBarVisibilityContext';
import { useShopFilter, ShopFilterProvider } from '../../src/context/ShopFilterContext';
import { useInfiniteProducts } from '../../src/services/product/hooks';
import { useCategories } from '../../src/services/category/hooks';
import { useBrands } from '../../src/services/brand/hooks';
import ProductCard from '../../src/components/ProductCard/Card';
import FilterBottomSheet from '../../src/components/Filter/FilterBottomSheet';
import SortDropdown from '../../src/components/Filter/SortDropdown';
import { ProductCardSkeleton } from '../../src/components/Skeleton';
import type { ApiProduct } from '../../src/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.xl * 2 - spacing.md) / 2;

function ShopContent() {
  const { colors } = useAppTheme();
  const { setTabBarHidden } = useTabBarVisibility();
  const {
    filters,
    setCategoryId,
    setBrandId,
    setRating,
    setMinPrice,
    setMaxPrice,
    resetFilters,
    activeFilterCount,
    hasActiveFilters,
  } = useShopFilter();

  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showSortSheet, setShowSortSheet] = useState(false);

  useEffect(() => {
    setTabBarHidden(showFilterSheet || showSortSheet);
  }, [showFilterSheet, showSortSheet, setTabBarHidden]);

  const {
    data: infiniteData,
    isLoading: productsLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteProducts({
    sortBy: filters.sortBy,
    categoryId: filters.categoryId ?? undefined,
    brandId: filters.brandId ?? undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    rating: filters.rating ?? undefined,
  });

  const allProducts = infiniteData?.products ?? [];

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const findCategoryName = useCallback(
    (id: string): string => {
      if (!categories) return '';
      const search = (cats: typeof categories): string | null => {
        for (const cat of cats) {
          if (cat.id === id) return cat.name;
          const found = search(cat.subcategories);
          if (found) return found;
        }
        return null;
      };
      return search(categories) ?? '';
    },
    [categories],
  );

  const findBrandName = useCallback(
    (id: string): string => {
      if (!brands) return '';
      return brands.find((b) => b.id === id)?.name ?? '';
    },
    [brands],
  );

  const activeChips = useMemo(() => {
    const chips: { id: string; label: string; onRemove: () => void }[] = [];

    if (filters.categoryId) {
      chips.push({
        id: 'category',
        label: findCategoryName(filters.categoryId),
        onRemove: () => setCategoryId(null),
      });
    }
    if (filters.brandId) {
      chips.push({
        id: 'brand',
        label: findBrandName(filters.brandId),
        onRemove: () => setBrandId(null),
      });
    }
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice || '0';
      const max = filters.maxPrice || '∞';
      chips.push({
        id: 'price',
        label: `Rs. ${min} - ${max}`,
        onRemove: () => {
          setMinPrice('');
          setMaxPrice('');
        },
      });
    }
    if (filters.rating) {
      chips.push({
        id: 'rating',
        label: `${filters.rating}+ stars`,
        onRemove: () => setRating(null),
      });
    }

    return chips;
  }, [filters, findCategoryName, findBrandName, setCategoryId, setBrandId, setMinPrice, setMaxPrice, setRating]);

  const renderProductCard = useCallback(
    ({ item }: { item: ApiProduct }) => <ProductCard product={item} width={CARD_WIDTH} />,
    [],
  );

  const renderHeader = () => (
    <View>
      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <View style={styles.chipsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {activeChips.map((chip) => (
              <Pressable
                key={chip.id}
                onPress={chip.onRemove}
                style={[styles.chip, { backgroundColor: colors.accentLight, borderColor: colors.accent }]}
              >
                <Text style={[typography.caption, { color: colors.accent }]}>{chip.label}</Text>
                <Ionicons name="close-circle" size={16} color={colors.accent} />
              </Pressable>
            ))}
            {activeChips.length > 1 && (
              <Pressable onPress={resetFilters} style={[styles.chip, { borderColor: colors.borderStrong }]}>
                <Text style={[typography.caption, { color: colors.danger }]}>Clear All</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (productsLoading) {
      return (
        <View style={styles.skeletonGrid}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <ProductCardSkeleton width={CARD_WIDTH} />
            </View>
          ))}
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={56} color={colors.borderStrong} />
        <Text style={[typography.h3, { color: colors.textPrimary, marginTop: spacing.xl }]}>
          No products found
        </Text>
        <Text
          style={[
            typography.body,
            { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },
          ]}
        >
          Try adjusting your filters or browse other categories.
        </Text>
        {hasActiveFilters && (
          <Pressable
            onPress={resetFilters}
            style={[styles.clearBtn, { backgroundColor: colors.accent, marginTop: spacing.xl }]}
          >
            <Text style={[typography.button, { color: colors.textInverse }]}>Clear Filters</Text>
          </Pressable>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.textPrimary }]}>Shop</Text>
      </View>

      {/* Search Bar */}
      <Link href="/(tabs)/search" asChild>
        <Pressable
          style={StyleSheet.flatten([
            styles.searchBar,
            { backgroundColor: colors.surfaceMuted, borderColor: colors.borderSubtle },
          ])}
        >
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <Text style={[typography.body, { color: colors.textMuted }]}>
            Search products, brands...
          </Text>
        </Pressable>
      </Link>

      {/* Filter & Sort Bar */}
      <View style={[styles.filterBar, { borderBottomColor: colors.borderSubtle }]}>
        <Pressable
          onPress={() => setShowFilterSheet(true)}
          style={[
            styles.filterBtn,
            { backgroundColor: hasActiveFilters ? colors.accent : colors.surfaceMuted, borderColor: hasActiveFilters ? colors.accent : colors.borderStrong },
          ]}
        >
          <Ionicons
            name="options-outline"
            size={16}
            color={hasActiveFilters ? colors.textInverse : colors.textPrimary}
          />
          <Text
            style={[
              typography.captionLarge,
              { color: hasActiveFilters ? colors.textInverse : colors.textPrimary, fontWeight: '600' },
            ]}
          >
            Filter
          </Text>
          {activeFilterCount > 0 && (
            <View style={[styles.badge, { backgroundColor: hasActiveFilters ? colors.textInverse : colors.accent }]}>
              <Text
                style={[
                  typography.caption,
                  { color: hasActiveFilters ? colors.accent : colors.textInverse, fontSize: 10 },
                ]}
              >
                {activeFilterCount}
              </Text>
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={() => setShowSortSheet(true)}
          style={[styles.filterBtn, { backgroundColor: colors.surfaceMuted, borderColor: colors.borderStrong }]}
        >
          <Ionicons name="swap-vertical" size={16} color={colors.textPrimary} />
          <Text style={[typography.captionLarge, { color: colors.textPrimary, fontWeight: '600' }]}>
            Sort
          </Text>
        </Pressable>

        <View style={styles.resultCount}>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {allProducts.length} products
          </Text>
        </View>
      </View>

      {/* Product Grid */}
      <FlatList
        data={allProducts}
        renderItem={renderProductCard}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={handleRefresh} tintColor={colors.accent} colors={[colors.accent]} />
        }
      />

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet visible={showFilterSheet} onClose={() => setShowFilterSheet(false)} />

      {/* Sort Dropdown */}
      <SortDropdown visible={showSortSheet} onClose={() => setShowSortSheet(false)} />
    </View>
  );
}

export default function ShopScreen() {
  return (
    <ShopFilterProvider>
      <ShopContent />
    </ShopFilterProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['5xl'],
    paddingBottom: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: spacing.sm,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    gap: spacing.xs,
  },
  badge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xxs,
  },
  resultCount: {
    flex: 1,
    alignItems: 'flex-end',
  },
  chipsContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  chipsScroll: {
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    gap: spacing.xs,
  },
  gridContent: {
    padding: spacing.xl,
    paddingTop: spacing.sm,
  },
  row: {
    gap: spacing.md,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  skeletonCard: {
    width: CARD_WIDTH,
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
  loadingMore: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});
