import { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  Pressable,
  StyleSheet,
  Modal,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../src/hooks/useAppTheme';
import { spacing, radius, typography } from '../../src/design-system';
import { useCategories } from '../../src/services/category/hooks';
import { useInfiniteProducts } from '../../src/services/product/hooks';
import type { ApiCategory, ApiProduct } from '../../src/types';
import ProductCard from '../../src/components/ProductCard/Card';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2;

const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest' },
  { id: 'popular', name: 'Most Popular' },
  { id: 'price-asc', name: 'Price: Low to High' },
  { id: 'price-desc', name: 'Price: High to Low' },
  { id: 'rating', name: 'Best Rated' },
];

function findCategoryBySlug(categories: ApiCategory[], slug: string): ApiCategory | null {
  for (const cat of categories) {
    if (cat.slug === slug) return cat;
    const found = findCategoryBySlug(cat.subcategories, slug);
    if (found) return found;
  }
  return null;
}

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors } = useAppTheme();

  const { data: allCategories, isLoading: categoriesLoading } = useCategories();

  const category = useMemo(
    () => (allCategories ? findCategoryBySlug(allCategories, slug ?? '') : null),
    [allCategories, slug],
  );

  const subcategories = category?.subcategories ?? [];
  const hasSubcategories = subcategories.length > 0;

  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [showSortSheet, setShowSortSheet] = useState(false);

  const activeCategoryId = useMemo(() => {
    if (selectedSubId) return selectedSubId;
    return category?.id;
  }, [selectedSubId, category]);

  const {
    data: infiniteData,
    isLoading: productsLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteProducts({
    sortBy,
    categoryId: activeCategoryId,
  });

  const allProducts = infiniteData?.products ?? [];

  const categoryName = useMemo(() => {
    if (category) return category.name;
    if (!slug) return 'All Products';
    return slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }, [category, slug]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderProductCard = useCallback(
    ({ item }: { item: ApiProduct }) => <ProductCard product={item} width={CARD_WIDTH} />,
    [],
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={56} color={colors.borderStrong} />
      <Text style={[typography.h3, { color: colors.textPrimary, marginTop: spacing.xl }]}>
        No products found
      </Text>
      <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }]}>
        Try adjusting your filters or browse other categories.
      </Text>
      <Pressable
        onPress={handleRefresh}
        style={[styles.clearBtn, { backgroundColor: colors.accent, marginTop: spacing.xl }]}
      >
        <Text style={[typography.button, { color: colors.textInverse }]}>Clear Filters</Text>
      </Pressable>
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  };

  if (categoriesLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

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

      {/* Subcategory Tabs */}
      {hasSubcategories && (
        <View style={[styles.tabsContainer, { borderBottomColor: colors.borderSubtle }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            <Pressable
              onPress={() => setSelectedSubId(null)}
              style={[
                styles.tab,
                {
                  backgroundColor: selectedSubId === null ? colors.accent : colors.surfaceMuted,
                  borderColor: selectedSubId === null ? colors.accent : colors.borderStrong,
                },
              ]}
            >
              <Text
                style={[
                  typography.captionLarge,
                  {
                    color: selectedSubId === null ? colors.textInverse : colors.textPrimary,
                    fontWeight: selectedSubId === null ? '600' : '400',
                  },
                ]}
              >
                All
              </Text>
            </Pressable>
            {subcategories.map((sub) => (
              <Pressable
                key={sub.id}
                onPress={() => setSelectedSubId(sub.id)}
                style={[
                  styles.tab,
                  {
                    backgroundColor: selectedSubId === sub.id ? colors.accent : colors.surfaceMuted,
                    borderColor: selectedSubId === sub.id ? colors.accent : colors.borderStrong,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.captionLarge,
                    {
                      color: selectedSubId === sub.id ? colors.textInverse : colors.textPrimary,
                      fontWeight: selectedSubId === sub.id ? '600' : '400',
                    },
                  ]}
                >
                  {sub.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Sort Bar */}
      <View style={[styles.sortBar, { borderBottomColor: colors.borderSubtle }]}>
        <View style={styles.countRow} />
        <Pressable
          onPress={() => setShowSortSheet(true)}
          style={[styles.sortBtn, { backgroundColor: colors.surfaceMuted, borderColor: colors.borderStrong }]}
        >
          <Ionicons name="swap-vertical" size={16} color={colors.textPrimary} />
          <Text style={[typography.captionLarge, { color: colors.textPrimary, marginLeft: spacing.xs }]}>
            Sort
          </Text>
        </Pressable>
      </View>

      {/* Product Grid */}
      {productsLoading && allProducts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={allProducts}
          renderItem={renderProductCard}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={handleRefresh} tintColor={colors.accent} colors={[colors.accent]} />
          }
          ListFooterComponent={renderFooter}
        />
      )}

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
              {SORT_OPTIONS.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => {
                    setSortBy(option.id);
                    setShowSortSheet(false);
                  }}
                  style={[
                    styles.sortOptionRow,
                    {
                      backgroundColor: sortBy === option.id ? colors.accentLight : 'transparent',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  tabsContainer: {
    borderBottomWidth: 1,
  },
  tabsScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  countRow: {},
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  gridContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  row: {
    gap: spacing.md,
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
  sortOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
});
