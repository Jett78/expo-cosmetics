import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

import { useMemo } from 'react';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { spacing, radius, typography, shadows } from '../../src/design-system';
import { useCategories } from '../../src/services/category/hooks';
import { useProducts, useActiveProducts } from '../../src/services/product/hooks';
import ProductCard from '../../src/components/ProductCard/Card';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function ExploreScreen() {
  const { colors } = useAppTheme();
  const { data: categories } = useCategories();
  const { data: trendingData } = useProducts({ page: 1, sortBy: 'popular' });
  const { data: allProducts } = useActiveProducts();

  const trendingProducts = trendingData?.products ?? [];

  const uniqueBrands = useMemo(() => {
    if (!allProducts) return [];
    const brandMap = new Map<string, { id: string; name: string }>();
    for (const product of allProducts) {
      if (product.brand?.name && !brandMap.has(product.brand.name)) {
        brandMap.set(product.brand.name, {
          id: product.brand.id,
          name: product.brand.name,
        });
      }
    }
    return Array.from(brandMap.values());
  }, [allProducts]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Explore</Text>
      </View>

      <Link href="/(tabs)/search" asChild>
        <Pressable
          style={StyleSheet.flatten([styles.searchBar, { backgroundColor: colors.surfaceMuted, borderColor: colors.borderSubtle }])}
        >
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <Text style={[styles.searchPlaceholder, { color: colors.textMuted }]}>
            Search products, brands...
          </Text>
        </Pressable>
      </Link>

      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Categories</Text>
              <FlatList
                data={categories}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={styles.categoryGrid}
                contentContainerStyle={styles.gridContent}
                renderItem={({ item }) => (
                  <Link href={`/category/${item.slug}`} asChild>
                    <Pressable style={StyleSheet.flatten([styles.categoryCard, { backgroundColor: colors.surface }])}>
                      {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.categoryImage} contentFit="cover" />
                      ) : (
                        <View style={[styles.categoryImage, { backgroundColor: colors.surfaceMuted }]} />
                      )}
                      <View style={[styles.categoryOverlay, { backgroundColor: colors.overlayStrong }]}>
                        <Text style={styles.categoryName}>{item.name}</Text>
                      </View>
                    </Pressable>
                  </Link>
                )}
                keyExtractor={(item) => item.id}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Brands</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.brandList}
              >
                {uniqueBrands.map((item) => (
                  <Link key={item.id} href={`/brand/${slugify(item.name)}`} asChild>
                    <Pressable style={StyleSheet.flatten([styles.brandCard, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }])}>
                      <Text style={[styles.brandName, { color: colors.textPrimary }]}>{item.name}</Text>
                    </Pressable>
                  </Link>
                ))}
              </ScrollView>
            </View>
          </>
        }
        data={trendingProducts}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.productGrid}
        ListFooterComponent={
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Trending Now</Text>
            </View>
          </View>
        }
        ListFooterComponentStyle={styles.trendingHeader}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item.id}
      />
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
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
  },
  categoryGrid: {
    gap: spacing.md,
  },
  gridContent: {
    gap: spacing.md,
  },
  categoryCard: {
    flex: 1,
    height: 140,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  categoryName: {
    ...typography.h4,
    color: '#FFFFFF',
  },
  categoryCount: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xxs,
  },
  brandList: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  brandCard: {
    minWidth: 120,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    alignItems: 'center',
  },
  brandName: {
    ...typography.bodyStrong,
    marginBottom: spacing.xxs,
  },
  brandTagline: {
    ...typography.caption,
  },
  trendingHeader: {
    marginTop: spacing['2xl'],
  },
  productGrid: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
});
