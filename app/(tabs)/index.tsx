import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useCommerce } from '../../src/context/CommerceContext';
import { spacing, radius, typography } from '../../src/design-system';
import { useCategories } from '../../src/services/category/hooks';
import { useFeaturedProducts, useBestSellers, useActiveProducts } from '../../src/services/product/hooks';
import { useActiveBanners } from '../../src/services/banner/hooks';
import { useBrands } from '../../src/services/brand/hooks';
import ProductCard from '../../src/components/ProductCard/Card';
import HeroBanner from '../../src/components/banners/HeroBanner';
import MidBanner from '../../src/components/banners/MidBanner';
import BrandSection from '../../src/components/brands/BrandSection';

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const { getCartItemCount, favoriteProducts } = useCommerce();
  const cartCount = getCartItemCount();
  const wishlistCount = favoriteProducts.length;

  const { data: categories } = useCategories();
  const { data: featuredProducts } = useFeaturedProducts();
  const { data: bestSellers } = useBestSellers();
  const { data: newArrivals } = useActiveProducts();
  const { data: allBanners } = useActiveBanners(10);
  const { data: brands } = useBrands();

  const heroBanners = (allBanners ?? []).filter((b) => b.type === 'HERO');
  const midBanners = (allBanners ?? []).filter((b) => b.type === 'MID');

  const featuredProductsList = featuredProducts ?? [];
  const bestSellersList = bestSellers ?? [];
  const newArrivalsList = newArrivals ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.brandName, { color: colors.textPrimary }]}>GLOW</Text>
          <View style={styles.headerIcons}>
            <Link href="/(tabs)/search" asChild>
              <Pressable hitSlop={12}>
                <Ionicons name="search-outline" size={24} color={colors.textPrimary} />
              </Pressable>
            </Link>
            <Link href="/(tabs)/wishlist" asChild>
              <Pressable hitSlop={12} style={styles.headerIconRight}>
                <Ionicons name="heart-outline" size={24} color={colors.textPrimary} />
                {wishlistCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                    <Text style={styles.badgeText}>{wishlistCount}</Text>
                  </View>
                )}
              </Pressable>
            </Link>
            <Link href="/cart" asChild>
              <Pressable hitSlop={12} style={styles.headerIconRight}>
                <Ionicons name="cart-outline" size={24} color={colors.textPrimary} />
                {cartCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                    <Text style={styles.badgeText}>{cartCount}</Text>
                  </View>
                )}
              </Pressable>
            </Link>
          </View>
        </View>

        <HeroBanner banners={heroBanners} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Shop by Category</Text>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <Link href={`/category/${item.slug}`} asChild>
                <Pressable style={styles.categoryCard}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.categoryImage} contentFit="cover" />
                  ) : (
                    <View style={[styles.categoryImage, { backgroundColor: colors.surfaceMuted }]} />
                  )}
                  <View style={[styles.categoryOverlay, { backgroundColor: colors.overlayMedium }]}>
                    <Text style={styles.categoryName}>{item.name}</Text>
                  </View>
                </Pressable>
              </Link>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>

        <BrandSection brands={brands ?? []} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Featured Collection</Text>
          <FlatList
            data={featuredProductsList}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
            renderItem={({ item }) => <ProductCard product={item} width={180} showWishlist={false} />}
            keyExtractor={(item) => item.id}
          />
        </View>

        <MidBanner banners={midBanners} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Best Sellers</Text>
          <FlatList
            data={bestSellersList}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
            renderItem={({ item }) => <ProductCard product={item} width={180} showWishlist={false} />}
            keyExtractor={(item) => item.id}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>New Arrivals</Text>
          <FlatList
            data={newArrivalsList}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
            renderItem={({ item }) => <ProductCard product={item} width={180} showWishlist={false} />}
            keyExtractor={(item) => item.id}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['5xl'],
    paddingBottom: spacing.lg,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  headerIconRight: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  section: {
    marginTop: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
  },
  categoryList: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  categoryCard: {
    width: 120,
    height: 160,
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
    padding: spacing.md,
  },
  categoryName: {
    ...typography.bodyStrong,
    color: '#FFFFFF',
    fontSize: 14,
  },
  productList: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
