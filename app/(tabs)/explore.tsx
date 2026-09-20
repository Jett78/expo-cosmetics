import { ActivityIndicator, Dimensions, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';

import { useAppTheme } from '../../src/hooks/useAppTheme';
import { spacing, radius, typography } from '../../src/design-system';
import { useCategories } from '../../src/services/category/hooks';
import { useBrands } from '../../src/services/brand/hooks';
import {
  useProducts,
  useFeaturedProducts,
  useBestSellers,
  useInfiniteProducts,
} from '../../src/services/product/hooks';
import ProductCard from '../../src/components/ProductCard/Card';
import BrandCard from '../../src/components/brands/BrandCard';
import {
  ProductCardSkeleton,
  CategorySkeleton,
  BrandSkeleton,
} from '../../src/components/Skeleton';
import type { ApiProduct } from '../../src/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.xl * 2 - spacing.md) / 2;

export default function ExploreScreen() {
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ brandId?: string; sortBy?: string }>();
  const brandId = params.brandId;
  const sortBy = params.sortBy;

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const { data: featuredProducts, isLoading: featuredLoading } = useFeaturedProducts();
  const { data: bestSellers, isLoading: bestSellersLoading } = useBestSellers();
  const { data: hotDealsData, isLoading: hotDealsLoading } = useProducts({
    page: 1,
    sortBy: 'offer',
    brandId: brandId || undefined,
  });

  const {
    data: infiniteData,
    isLoading: infiniteLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteProducts({
    sortBy: sortBy || 'newest',
    brandId: brandId || undefined,
  });

  const featuredProductsList = featuredProducts ?? [];
  const bestSellersList = bestSellers ?? [];
  const hotDealsList = (hotDealsData?.products ?? []).slice(0, 10);
  const infiniteProducts = infiniteData?.products ?? [];

  const filteredBrandName = brandId
    ? (brands ?? []).find((b) => b.id === brandId)?.name ?? null
    : null;

  const isBrandFilter = !!brandId;
  const isSortFilter = !!sortBy;
  const isFiltered = isBrandFilter || isSortFilter;

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderFilteredHeader = () => (
    <View>
      {brandId && (
        <View style={styles.section}>
          <Link href="/(tabs)/explore" asChild>
            <Pressable
              style={StyleSheet.flatten([
                styles.backBtnInner,
                { backgroundColor: colors.surfaceMuted },
              ])}
            >
              <Ionicons name="arrow-back" size={18} color={colors.textPrimary} />
              <Text style={[styles.backText, { color: colors.textPrimary }]}>
                All Brands
              </Text>
            </Pressable>
          </Link>
        </View>
      )}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {sortBy === 'offer' ? 'Hot Deals' : 'Products'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderFilteredProduct = useCallback(
    ({ item }: { item: ApiProduct }) => (
      <View style={styles.filteredCardItem}>
        <ProductCard product={item} width={CARD_WIDTH} />
      </View>
    ),
    []
  );

  const renderFilteredFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  };

  const renderFilteredEmpty = () => {
    if (infiniteLoading) {
      return (
        <View style={styles.skeletonGrid}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.skeletonCardItem}>
              <ProductCardSkeleton width={CARD_WIDTH} />
            </View>
          ))}
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No products found
        </Text>
      </View>
    );
  };

  if (isFiltered) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {filteredBrandName ?? (sortBy === 'offer' ? 'Hot Deals' : 'Explore')}
          </Text>
        </View>

        <Link href="/(tabs)/search" asChild>
          <Pressable
            style={StyleSheet.flatten([
              styles.searchBar,
              { backgroundColor: colors.surfaceMuted, borderColor: colors.borderSubtle },
            ])}
          >
            <Ionicons name="search-outline" size={20} color={colors.textMuted} />
            <Text style={[styles.searchPlaceholder, { color: colors.textMuted }]}>
              Search products, brands...
            </Text>
          </Pressable>
        </Link>

        <FlatList
          data={infiniteProducts}
          numColumns={2}
          columnWrapperStyle={styles.filteredRow}
          contentContainerStyle={styles.filteredContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderFilteredHeader}
          renderItem={renderFilteredProduct}
          keyExtractor={(item) => item.id}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFilteredFooter}
          ListEmptyComponent={renderFilteredEmpty}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {filteredBrandName ?? (sortBy === 'offer' ? 'Hot Deals' : 'Explore')}
        </Text>
      </View>

      <Link href="/(tabs)/search" asChild>
        <Pressable
          style={StyleSheet.flatten([
            styles.searchBar,
            { backgroundColor: colors.surfaceMuted, borderColor: colors.borderSubtle },
          ])}
        >
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <Text style={[styles.searchPlaceholder, { color: colors.textMuted }]}>
            Search products, brands...
          </Text>
        </Pressable>
      </Link>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Categories
          </Text>
          {categoriesLoading ? (
            <View style={styles.categoryGrid}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.categoryGridItem}>
                  <CategorySkeleton />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.categoryGrid}>
              {(categories ?? []).map((item) => (
                <Link key={item.id} href={`/category/${item.slug}`} asChild>
                  <Pressable style={styles.categoryGridItem}>
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        style={styles.categoryImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.categoryImage,
                          { backgroundColor: colors.surfaceMuted },
                        ]}
                      />
                    )}
                    <Text
                      style={[styles.categoryName, { color: colors.textPrimary }]}
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                </Link>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Shop by Brand
          </Text>
          {brandsLoading ? (
            <View style={styles.brandGrid}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.brandGridItem}>
                  <BrandSkeleton />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.brandGrid}>
              {(brands ?? []).map((item) => (
                <View key={item.id} style={styles.brandGridItem}>
                  <BrandCard brand={item} />
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Hot Deals
            </Text>
          </View>
          {hotDealsLoading ? (
            <FlatList
              data={[1, 2, 3]}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productList}
              renderItem={() => <ProductCardSkeleton width={155} />}
              keyExtractor={(item) => String(item)}
            />
          ) : (
            <FlatList
              data={hotDealsList}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productList}
              renderItem={({ item }) => (
                <ProductCard product={item} width={155} />
              )}
              keyExtractor={(item) => item.id}
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Best Sellers
            </Text>
          </View>
          {bestSellersLoading ? (
            <FlatList
              data={[1, 2, 3]}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productList}
              renderItem={() => <ProductCardSkeleton width={155} />}
              keyExtractor={(item) => String(item)}
            />
          ) : (
            <FlatList
              data={bestSellersList}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productList}
              renderItem={({ item }) => (
                <ProductCard product={item} width={155} />
              )}
              keyExtractor={(item) => item.id}
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Featured Products
            </Text>
          </View>
          {featuredLoading ? (
            <FlatList
              data={[1, 2, 3]}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productList}
              renderItem={() => <ProductCardSkeleton width={155} />}
              keyExtractor={(item) => String(item)}
            />
          ) : (
            <FlatList
              data={featuredProductsList}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productList}
              renderItem={({ item }) => (
                <ProductCard product={item} width={155} />
              )}
              keyExtractor={(item) => item.id}
            />
          )}
        </View>
      </ScrollView>
    </View>
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
  headerTitle: {
    ...typography.h1,
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
  searchPlaceholder: {
    ...typography.body,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    marginTop: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    fontWeight: '800',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  categoryGridItem: {
    width: '47%',
  },
  categoryImage: {
    width: '100%',
    height: 120,
    borderRadius: radius.lg,
  },
  categoryName: {
    ...typography.caption,
    fontWeight: '800',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  brandGridItem: {
    width: '47%',
    alignItems: 'center',
  },
  backBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    gap: spacing.sm,
  },
  backText: {
    ...typography.bodyStrong,
  },
  productList: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  filteredContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  filteredRow: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  filteredCardItem: {
    flex: 1,
    maxWidth: CARD_WIDTH,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  skeletonCardItem: {
    width: CARD_WIDTH,
  },
  loadingMore: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: spacing['4xl'],
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
  },
});
