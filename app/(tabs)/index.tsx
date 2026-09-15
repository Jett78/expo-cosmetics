import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';
import { Image, ImageBackground } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useCommerce } from '../../src/context/CommerceContext';
import { spacing, radius, typography, shadows } from '../../src/design-system';
import { heroBanners } from '../../src/data/banners';
import { categories } from '../../src/data/categories';
import { products } from '../../src/data/products';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const { getCartItemCount, favoriteProducts } = useCommerce();
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerRef = useRef<FlatList>(null);
  const cartCount = getCartItemCount();
  const wishlistCount = favoriteProducts.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner((prev) => {
        const next = (prev + 1) % heroBanners.length;
        bannerRef.current?.scrollToOffset({ offset: next * SCREEN_WIDTH, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const featuredProducts = products.filter((p) => p.isFeatured);
  const bestSellers = products.filter((p) => p.isBestSeller);
  const newArrivals = products.filter((p) => p.isNew);

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

        <View style={styles.bannerSection}>
          <FlatList
            ref={bannerRef}
            data={heroBanners}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveBanner(index);
            }}
            renderItem={({ item }) => (
              <ImageBackground
                source={item.image}
                style={[styles.bannerImage, { width: SCREEN_WIDTH }]}
                imageStyle={styles.bannerImageStyle}
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.55)']}
                  style={styles.bannerGradient}
                >
                  <View style={styles.bannerContent}>
                    <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                    <Text style={styles.bannerTitle}>{item.title}</Text>
                    <Pressable
                      style={[styles.bannerButton, { backgroundColor: item.accentColor }]}
                    >
                      <Text style={styles.bannerButtonText}>{item.buttonText}</Text>
                    </Pressable>
                  </View>
                </LinearGradient>
              </ImageBackground>
            )}
            keyExtractor={(item) => item.id}
          />
          <View style={styles.bannerDots}>
            {heroBanners.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeBanner && { backgroundColor: colors.accent, width: 20 }]}
              />
            ))}
          </View>
        </View>

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
                  <Image source={item.image} style={styles.categoryImage} contentFit="cover" />
                  <View style={[styles.categoryOverlay, { backgroundColor: colors.overlayMedium }]}>
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
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Featured Collection</Text>
            <Link href="/(tabs)/explore" asChild>
              <Pressable>
                <Text style={[styles.seeAll, { color: colors.accent }]}>See All</Text>
              </Pressable>
            </Link>
          </View>
          <FlatList
            data={featuredProducts}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Best Sellers</Text>
            <Link href="/(tabs)/explore" asChild>
              <Pressable>
                <Text style={[styles.seeAll, { color: colors.accent }]}>See All</Text>
              </Pressable>
            </Link>
          </View>
          <FlatList
            data={bestSellers}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.productGrid}
            contentContainerStyle={styles.gridContent}
            renderItem={({ item }) => (
              <Link href={`/product/${item.id}`} asChild>
                <Pressable style={StyleSheet.flatten([styles.gridCard, { backgroundColor: colors.surface }])}>
                  <Image source={item.image} style={styles.gridCardImage} contentFit="contain" />
                  <View style={styles.gridCardInfo}>
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
                  <Pressable style={styles.gridHeartIcon}>
                    <Ionicons name="heart-outline" size={18} color={colors.textSecondary} />
                  </Pressable>
                </Pressable>
              </Link>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>New Arrivals</Text>
            <Link href="/(tabs)/explore" asChild>
              <Pressable>
                <Text style={[styles.seeAll, { color: colors.accent }]}>See All</Text>
              </Pressable>
            </Link>
          </View>
          <FlatList
            data={newArrivals}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.productGrid}
            contentContainerStyle={styles.gridContent}
            renderItem={({ item }) => (
              <Link href={`/product/${item.id}`} asChild>
                <Pressable style={StyleSheet.flatten([styles.gridCard, { backgroundColor: colors.surface }])}>
                  <Image source={item.image} style={styles.gridCardImage} contentFit="contain" />
                  <View style={styles.gridCardInfo}>
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
                  <Pressable style={styles.gridHeartIcon}>
                    <Ionicons name="heart-outline" size={18} color={colors.textSecondary} />
                  </Pressable>
                </Pressable>
              </Link>
            )}
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
  bannerSection: {
    marginBottom: spacing.xl,
  },
  bannerImage: {
    height: 260,
    justifyContent: 'flex-end',
  },
  bannerImageStyle: {
    borderRadius: 0,
  },
  bannerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.xl,
  },
  bannerContent: {
    gap: spacing.xs,
  },
  bannerSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  bannerTitle: {
    ...typography.h1,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  bannerButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  bannerButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  section: {
    marginTop: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
  },
  seeAll: {
    ...typography.bodyStrong,
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
  categoryCount: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  productList: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  productCard: {
    width: 180,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  productImage: {
    width: '100%',
    height: 180,
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
  productGrid: {
    gap: spacing.md,
  },
  gridContent: {
    gap: spacing.md,
  },
  gridCard: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  gridCardImage: {
    width: '100%',
    height: 160,
  },
  gridCardInfo: {
    padding: spacing.md,
  },
  gridHeartIcon: {
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
  bottomSpacer: {
    height: spacing.xl,
  },
});
