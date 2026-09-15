import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

import { useAppTheme } from '../../src/hooks/useAppTheme';
import { spacing, radius, typography, shadows } from '../../src/design-system';
import { categories } from '../../src/data/categories';
import { brands } from '../../src/data/brands';
import { products } from '../../src/data/products';

export default function ExploreScreen() {
  const { colors } = useAppTheme();

  const trendingProducts = products.filter((p) => p.rating >= 4.6);

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
                      <Image source={item.image} style={styles.categoryImage} contentFit="cover" />
                      <View style={[styles.categoryOverlay, { backgroundColor: colors.overlayStrong }]}>
                        <Text style={styles.categoryName}>{item.name}</Text>
                        <Text style={styles.categoryCount}>{item.productCount} products</Text>
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
                {brands.map((item) => (
                  <Link key={item.id} href={`/brand/${item.id}`} asChild>
                    <Pressable style={StyleSheet.flatten([styles.brandCard, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }])}>
                      <Text style={[styles.brandName, { color: colors.textPrimary }]}>{item.name}</Text>
                      <Text style={[styles.brandTagline, { color: colors.textSecondary }]}>{item.tagline}</Text>
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
        renderItem={({ item }) => (
          <Link href={`/product/${item.id}`} asChild>
            <Pressable style={StyleSheet.flatten([styles.productCard, { backgroundColor: colors.surface }])}>
              <Image source={item.image} style={styles.productImage} contentFit="contain" />
              <View style={styles.productInfo}>
                <Text style={[styles.productBrand, { color: colors.textSecondary }]}>{item.brand}</Text>
                <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.priceRow}>
                  {item.salePrice ? (
                    <>
                      <Text style={[styles.salePrice, { color: colors.danger }]}>
                        {item.currency} {item.salePrice.toLocaleString()}
                      </Text>
                      <Text style={[styles.originalPrice, { color: colors.textMuted }]}>
                        {item.currency} {item.price.toLocaleString()}
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.price, { color: colors.textPrimary }]}>
                      {item.currency} {item.price.toLocaleString()}
                    </Text>
                  )}
                </View>
              </View>
              <Pressable style={styles.heartIcon}>
                <Ionicons name="heart-outline" size={18} color={colors.textSecondary} />
              </Pressable>
            </Pressable>
          </Link>
        )}
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
  productCard: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  productImage: {
    width: '100%',
    height: 160,
  },
  productInfo: {
    padding: spacing.md,
  },
  productBrand: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
  salePrice: {
    ...typography.priceSmall,
  },
  originalPrice: {
    ...typography.caption,
    textDecorationLine: 'line-through',
  },
  heartIcon: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
