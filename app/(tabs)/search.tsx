import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Keyboard,
  ActivityIndicator,
  Pressable,
  Dimensions,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Text } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useInfiniteProducts } from '../../src/services/product/hooks';
import { useRecentSearches } from '../../src/hooks/useRecentSearches';
import { popularSearches } from '../../src/data/search';
import { spacing, radius, typography } from '../../src/design-system';
import type { ApiProduct } from '../../src/types';
import ProductCard from '../../src/components/ProductCard/Card';
import { withTabScreenTransition } from '../../src/components/TabScreenTransition';
import FilterBottomSheet from '../../src/components/Filter/FilterBottomSheet';
import SortDropdown from '../../src/components/Filter/SortDropdown';
import { useShopFilter, ShopFilterProvider } from '../../src/context/ShopFilterContext';
import { useCategories } from '../../src/services/category/hooks';
import { useBrands } from '../../src/services/brand/hooks';
import { useTabBarVisibility } from '../../src/context/TabBarVisibilityContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2;

function SearchScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ query?: string; brandId?: string }>();
  const { recentSearches, addSearch, removeSearch, clearAll } = useRecentSearches();
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

  const getInitialQuery = useCallback(() => {
    if (params.query) return params.query;
    return '';
  }, [params.query]);

  const [query, setQuery] = useState(getInitialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(getInitialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showSortSheet, setShowSortSheet] = useState(false);

  React.useEffect(() => {
    const newQuery = getInitialQuery();
    if (newQuery) {
      setQuery(newQuery);
      setDebouncedQuery(newQuery);
    }
  }, [getInitialQuery]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setTabBarHidden(showFilterSheet || showSortSheet);
  }, [showFilterSheet, showSortSheet, setTabBarHidden]);

  const {
    data: infiniteData,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useInfiniteProducts({
    query: debouncedQuery.trim() || undefined,
    brandId: params.brandId || filters.brandId || undefined,
    categoryId: filters.categoryId || undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    rating: filters.rating || undefined,
    sortBy: filters.sortBy,
  });

  const filteredProducts = infiniteData?.products ?? [];

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (trimmed) {
      addSearch(trimmed);
      setDebouncedQuery(trimmed);
      Keyboard.dismiss();
    }
  }, [query, addSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  const handleChipPress = useCallback((term: string) => {
    setQuery(term);
    setDebouncedQuery(term);
    addSearch(term);
    Keyboard.dismiss();
  }, [addSearch]);

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

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderProduct = useCallback(
    ({ item }: { item: ApiProduct }) => <ProductCard product={item} showWishlist={false} width={CARD_WIDTH} />,
    []
  );

  const renderRecentChip = useCallback(
    (term: string, index: number) => (
      <TouchableOpacity
        key={`${term}-${index}`}
        onPress={() => handleChipPress(term)}
        onLongPress={() => removeSearch(term)}
        style={[styles.chip, { backgroundColor: colors.surfaceMuted }]}
      >
        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
        <Text style={[styles.chipText, { color: colors.textPrimary }]}>{term}</Text>
        <Pressable onPress={() => removeSearch(term)} hitSlop={6}>
          <Ionicons name="close" size={14} color={colors.textSecondary} />
        </Pressable>
      </TouchableOpacity>
    ),
    [colors, handleChipPress, removeSearch]
  );

  const renderPopularChip = useCallback(
    (term: string, index: number) => (
      <TouchableOpacity
        key={`${term}-${index}`}
        onPress={() => handleChipPress(term)}
        style={[styles.chip, { backgroundColor: colors.surfaceMuted }]}
      >
        <Ionicons name="trending-up-outline" size={14} color={colors.accent} />
        <Text style={[styles.chipText, { color: colors.textPrimary }]}>{term}</Text>
      </TouchableOpacity>
    ),
    [colors, handleChipPress]
  );

  const showSuggestions = !debouncedQuery.trim();
  const hasResults = filteredProducts.length > 0;
  const hasQuery = debouncedQuery.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, paddingTop: insets.top + spacing.sm, borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceMuted }]}
          activeOpacity={0.6}
        >
          <Ionicons name='chevron-back' size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Search
        </Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.surfaceMuted }]}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search products, brands..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={handleSearch}
          onSubmitEditing={handleSubmit}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : showSuggestions ? (
        <FlatList
          key="suggestions"
          data={[1]}
          keyExtractor={() => 'suggestions'}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsContent}
          renderItem={() => (
            <View>
              {recentSearches.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                      Recent Searches
                    </Text>
                    <TouchableOpacity onPress={clearAll}>
                      <Text style={[styles.clearAll, { color: colors.accent }]}>Clear all</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.chipsContainer}>
                    {recentSearches.map((term, i) => renderRecentChip(term, i))}
                  </View>
                </View>
              )}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  Popular Searches
                </Text>
                <View style={styles.chipsContainer}>
                  {popularSearches.map((term, i) => renderPopularChip(term, i))}
                </View>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={{ flex: 1 }}>
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
          </View>

          <FlatList
            key="products"
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            contentContainerStyle={styles.productListContent}
            showsVerticalScrollIndicator={false}
            renderItem={renderProduct}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => {
                  refetch();
                }}
                tintColor={colors.accent}
                colors={[colors.accent]}
              />
            }
            ListHeaderComponent={
              activeChips.length > 0 ? (
                <View style={styles.activeChipsContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeChipsScroll}>
                    {activeChips.map((chip) => (
                      <Pressable
                        key={chip.id}
                        onPress={chip.onRemove}
                        style={[styles.activeChip, { backgroundColor: colors.accentLight, borderColor: colors.accent }]}
                      >
                        <Text style={[typography.caption, { color: colors.textInverse }]}>{chip.label}</Text>
                        <Ionicons name="close-circle" size={16} color={colors.textInverse} />
                      </Pressable>
                    ))}
                    {activeChips.length > 1 && (
                      <Pressable onPress={resetFilters} style={[styles.activeChip, { borderColor: colors.borderStrong }]}>
                        <Text style={[typography.caption, { color: colors.danger }]}>Clear All</Text>
                      </Pressable>
                    )}
                  </ScrollView>
                </View>
              ) : undefined
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color={colors.accent} />
                </View>
              ) : undefined
            }
            ListEmptyComponent={
              hasQuery && !hasResults ? (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={56} color={colors.borderStrong} />
                  <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                    No results found
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    Try a different search term or adjust your filters
                  </Text>
                  {hasActiveFilters && (
                    <Pressable
                      onPress={resetFilters}
                      style={[styles.clearFiltersBtn, { backgroundColor: colors.accent }]}
                    >
                      <Text style={[typography.button, { color: colors.textInverse }]}>Clear Filters</Text>
                    </Pressable>
                  )}
                </View>
              ) : undefined
            }
          />
        </View>
      )}

      <FilterBottomSheet visible={showFilterSheet} onClose={() => setShowFilterSheet(false)} />
      <SortDropdown visible={showSortSheet} onClose={() => setShowSortSheet(false)} />
    </View>
  );
}

function SearchScreenWithProvider() {
  return (
    <ShopFilterProvider>
      <SearchScreen />
    </ShopFilterProvider>
  );
}

export default withTabScreenTransition(SearchScreenWithProvider, 'bottom');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...typography.h3,
    fontWeight: '700',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    paddingVertical: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.captionLarge,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  clearAll: {
    ...typography.captionLarge,
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    gap: spacing.xs,
  },
  chipText: {
    ...typography.body,
    fontSize: 14,
  },
  productListContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  productRow: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing['5xl'],
    paddingHorizontal: spacing['3xl'],
  },
  emptyTitle: {
    ...typography.h3,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    textAlign: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  activeChipsContainer: {
    marginBottom: spacing.md,
  },
  activeChipsScroll: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  loadingMore: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  clearFiltersBtn: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
});
