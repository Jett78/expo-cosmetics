import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import { Text } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';

import { useAppTheme } from '../../src/hooks/useAppTheme';
import { products, Product } from '../../src/data/products';
import { popularSearches, recentSearches } from '../../src/data/search';
import { spacing, radius, typography, shadows } from '../../src/design-system';

export default function SearchScreen() {
  const { colors } = useAppTheme();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const filteredProducts = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [debouncedQuery]);

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
    ({ item }: { item: Product }) => (
      <Link href={`/product/${item.id}`} asChild>
        <TouchableOpacity style={StyleSheet.flatten([styles.productCard, { backgroundColor: colors.surface }])}>
          <Image
            source={item.image}
            style={styles.productImage}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.productInfo}>
            <Text style={[styles.productBrand, { color: colors.textSecondary }]}>
              {item.brand}
            </Text>
            <Text
              style={[styles.productName, { color: colors.textPrimary }]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: colors.textPrimary }]}>
                {item.currency} {item.salePrice ?? item.price}
              </Text>
              {item.salePrice && (
                <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                  {item.currency} {item.price}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    ),
    [colors]
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

      {showSuggestions ? (
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
  productCard: {
    width: '48%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  productInfo: {
    padding: spacing.md,
  },
  productBrand: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xxs,
  },
  productName: {
    ...typography.bodyStrong,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  price: {
    ...typography.priceSmall,
  },
  originalPrice: {
    ...typography.caption,
    textDecorationLine: 'line-through',
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
