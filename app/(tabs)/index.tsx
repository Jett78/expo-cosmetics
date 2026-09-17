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
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Image source={require('../../assets/la-cos.png')} style={styles.logo} contentFit="contain" />
        <View style={styles.headerIcons}>
          <Link href="/(tabs)/search" asChild>
            <Pressable hitSlop={12} style={StyleSheet.flatten([styles.iconBtn, { backgroundColor: colors.surfaceMuted }])}>
              <Ionicons name="search-outline" size={20} color={colors.textPrimary} />
            </Pressable>
          </Link>
          <Link href="/(tabs)/wishlist" asChild>
            <Pressable hitSlop={12} style={StyleSheet.flatten([styles.iconBtn, { backgroundColor: colors.surfaceMuted }])}>
              <Ionicons name="heart-outline" size={20} color={colors.textPrimary} />
              {wishlistCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                  <Text style={styles.badgeText}>{wishlistCount}</Text>
                </View>
              )}
            </Pressable>
          </Link>
          <Link href="/cart" asChild>
            <Pressable hitSlop={12} style={StyleSheet.flatten([styles.iconBtn, { backgroundColor: colors.surfaceMuted }])}>
              <Ionicons name="cart-outline" size={20} color={colors.textPrimary} />
              {cartCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </Pressable>
          </Link>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.section, { marginBottom: spacing.lg }]}>
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
                  <Text style={[styles.categoryName, { color: colors.textPrimary }]} numberOfLines={2}>{item.name}</Text>
                </Pressable>
              </Link>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>

        <HeroBanner banners={heroBanners} />

       

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Featured Collection</Text>
            <Link href="/(tabs)/explore" asChild>
              <Pressable>
                <Text style={[styles.viewAll, { color: colors.accent }]}>View All</Text>
              </Pressable>
            </Link>
          </View>
          <FlatList
            data={featuredProductsList}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
            renderItem={({ item }) => <ProductCard product={item} width={155} />}
            keyExtractor={(item) => item.id}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Best Sellers</Text>
            <Link href="/(tabs)/explore" asChild>
              <Pressable>
                <Text style={[styles.viewAll, { color: colors.accent }]}>View All</Text>
              </Pressable>
            </Link>
          </View>
          <FlatList
            data={bestSellersList}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
            renderItem={({ item }) => <ProductCard product={item} width={155} />}
            keyExtractor={(item) => item.id}
          />
        </View>

        <BrandSection brands={brands ?? []} />
        <MidBanner banners={midBanners} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>New Arrivals</Text>
            <Link href="/(tabs)/explore" asChild>
              <Pressable>
                <Text style={[styles.viewAll, { color: colors.accent }]}>View All</Text>
              </Pressable>
            </Link>
          </View>
          <FlatList
            data={newArrivalsList}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
            renderItem={({ item }) => <ProductCard product={item} width={155} />}
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
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
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAll: {
    ...typography.bodyStrong,
    fontWeight: '600',
  },
  categoryList: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  categoryCard: {
    width: 100,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: 90,
    borderRadius: radius.lg,
  },
  categoryName: {
    ...typography.caption,
    fontWeight: '800',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  productList: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
