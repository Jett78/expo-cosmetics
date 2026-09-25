import React, { useCallback, useMemo, useState } from 'react';
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
} from 'react-native';
import { Text } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useActiveProducts } from '../../src/services/product/hooks';
import { useRecentSearches } from '../../src/hooks/useRecentSearches';
import { popularSearches } from '../../src/data/search';
import { spacing, radius, typography } from '../../src/design-system';
import type { ApiProduct } from '../../src/types';
import ProductCard from '../../src/components/ProductCard/Card';
import { withTabScreenTransition } from '../../src/components/TabScreenTransition';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2;

function SearchScreen() {
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ query?: string; brandId?: string }>();
  const { data: allProducts, isLoading, isRefetching, refetch } = useActiveProducts();
  const { recentSearches, addSearch, removeSearch, clearAll } = useRecentSearches();

  const getInitialQuery = useCallback(() => {
    if (params.query) return params.query;
    if (params.brandId && allProducts) {
      const product = allProducts.find((p) => p.brand?.id === params.brandId);
      return product?.brand?.name ?? '';
    }
    return '';
  }, [params.query, params.brandId, allProducts]);

  const [query, setQuery] = useState(getInitialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(getInitialQuery);
  const [isFocused, setIsFocused] = useState(false);

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

  const filteredProducts = useMemo(() => {
    if (!debouncedQuery.trim() || !allProducts) return [];
    const q = debouncedQuery.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand?.name?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.name?.toLowerCase().includes(q))
    );
  }, [debouncedQuery, allProducts]);

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
      <View style={styles.header}>
        <Text h3 style={[styles.title, { color: colors.textPrimary }]}>
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
          autoFocus
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
        <FlatList
          key="products"
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productListContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderProduct}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          ListEmptyComponent={
            hasQuery && !hasResults ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={56} color={colors.borderStrong} />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                  No results found
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Try a different search term or browse popular searches
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

export default withTabScreenTransition(SearchScreen, 'bottom');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.md,
  },
  title: {
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
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
});
