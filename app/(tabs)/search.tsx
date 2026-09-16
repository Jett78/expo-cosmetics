import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useActiveProducts } from '../../src/services/product/hooks';
import { popularSearches, recentSearches } from '../../src/data/search';
import { spacing, radius, typography } from '../../src/design-system';
import type { ApiProduct } from '../../src/types';
import ProductCard from '../../src/components/ProductCard/Card';

export default function SearchScreen() {
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ query?: string; brandId?: string }>();
  const { data: allProducts, isLoading } = useActiveProducts();

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

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  const handleChipPress = useCallback((term: string) => {
    setQuery(term);
    setDebouncedQuery(term);
    Keyboard.dismiss();
  }, []);

  const renderProduct = useCallback(
    ({ item }: { item: ApiProduct }) => <ProductCard product={item} showWishlist={false} />,
    []
  );

  const renderChip = useCallback(
    (term: string, index: number) => (
      <TouchableOpacity
        key={`${term}-${index}`}
        onPress={() => handleChipPress(term)}
        style={[styles.chip, { backgroundColor: colors.surfaceMuted }]}
      >
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
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Recent Searches
                  </Text>
                  <View style={styles.chipsContainer}>
                    {recentSearches.map((term, i) => renderChip(term, i))}
                  </View>
                </View>
              )}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  Popular Searches
                </Text>
                <View style={styles.chipsContainer}>
                  {popularSearches.map((term, i) => renderChip(term, i))}
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
  sectionTitle: {
    ...typography.captionLarge,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
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
    justifyContent: 'space-between',
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
