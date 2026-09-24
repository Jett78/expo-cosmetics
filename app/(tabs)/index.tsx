import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@rneui/themed";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { useAppTheme } from "../../src/hooks/useAppTheme";
import { useCommerce } from "../../src/context/CommerceContext";
import { spacing, radius, typography } from "../../src/design-system";
import { useCategories } from "../../src/services/category/hooks";
import {
  useFeaturedProducts,
  useBestSellers,
  useActiveProducts,
  useProducts,
} from "../../src/services/product/hooks";
import { useActiveBanners } from "../../src/services/banner/hooks";
import { useBrands } from "../../src/services/brand/hooks";
import { useTestimonials } from "../../src/services/testimonial/hooks";
import { useBlogs } from "../../src/services/blog/hooks";
import ProductCard from "../../src/components/ProductCard/Card";
import HeroBanner from "../../src/components/banners/HeroBanner";
import MidBanner from "../../src/components/banners/MidBanner";
import BottomBanner from "../../src/components/banners/BottomBanner";
import BrandSection from "../../src/components/brands/BrandSection";
import TestimonialSlider from "../../src/components/testimonials/TestimonialSlider";
import BlogCard from "../../src/components/blogs/BlogCard";
import {
  ProductCardSkeleton,
  CategorySkeleton,
  BannerSkeleton,
  BlogCardSkeleton,
  BrandSkeleton,
  Skeleton,
} from "../../src/components/Skeleton";

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const { getCartItemCount, favoriteProducts, isAuthenticated, serverCartItemCount, serverWishlistItemCount, refreshCart, refreshWishlist } = useCommerce();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const cartCount = isAuthenticated ? serverCartItemCount : getCartItemCount();
  const wishlistCount = isAuthenticated ? serverWishlistItemCount : favoriteProducts.length;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["banners"] }),
        queryClient.invalidateQueries({ queryKey: ["brands"] }),
        queryClient.invalidateQueries({ queryKey: ["testimonials"] }),
        queryClient.invalidateQueries({ queryKey: ["blogs"] }),
        Promise.resolve(refreshCart()),
        Promise.resolve(refreshWishlist()),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: featuredProducts, isLoading: featuredLoading } = useFeaturedProducts();
  const { data: bestSellers, isLoading: bestSellersLoading } = useBestSellers();
  const { data: newArrivals, isLoading: newArrivalsLoading } = useActiveProducts();
  const { data: allBanners, isLoading: bannersLoading } = useActiveBanners(10);
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const { data: testimonials, isLoading: testimonialsLoading } = useTestimonials(10);
  const { data: blogs, isLoading: blogsLoading } = useBlogs(10);
  const { data: hotDealsData, isLoading: hotDealsLoading } = useProducts({ page: 1, sortBy: "offer" });

  const heroBanners = (allBanners ?? []).filter((b) => b.type === "HERO");
  const midBanners = (allBanners ?? []).filter((b) => b.type === "MID");
  const bottomBanners = (allBanners ?? []).filter((b) => b.type === "BOTTOM");

  const featuredProductsList = featuredProducts ?? [];
  const bestSellersList = bestSellers ?? [];
  const newArrivalsList = newArrivals ?? [];
  const hotDealsList = (hotDealsData?.products ?? []).slice(0, 10);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Image
          source={require("../../assets/la-cos.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <View style={styles.headerIcons}>
          <Link href="/(tabs)/search" asChild>
            <Pressable
              hitSlop={12}
              style={StyleSheet.flatten([
                styles.iconBtn,
                { backgroundColor: colors.surfaceMuted },
              ])}
            >
              <Ionicons
                name="search-outline"
                size={20}
                color={colors.textPrimary}
              />
            </Pressable>
          </Link>
          <Link href="/(tabs)/wishlist" asChild>
            <Pressable
              hitSlop={12}
              style={StyleSheet.flatten([
                styles.iconBtn,
                { backgroundColor: colors.surfaceMuted },
              ])}
            >
              <Ionicons
                name="heart-outline"
                size={20}
                color={colors.textPrimary}
              />
              {wishlistCount > 0 && (
                <View
                  style={[styles.badge, { backgroundColor: colors.danger }]}
                >
                  <Text style={styles.badgeText}>{wishlistCount}</Text>
                </View>
              )}
            </Pressable>
          </Link>
          <Link href="/cart" asChild>
            <Pressable
              hitSlop={12}
              style={StyleSheet.flatten([
                styles.iconBtn,
                { backgroundColor: colors.surfaceMuted },
              ])}
            >
              <Ionicons
                name="cart-outline"
                size={20}
                color={colors.textPrimary}
              />
              {cartCount > 0 && (
                <View
                  style={[styles.badge, { backgroundColor: colors.accent }]}
                >
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </Pressable>
          </Link>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} colors={[colors.accent]} />
        }
      >
        <View style={[styles.section, { marginBottom: spacing.lg }]}>
          {categoriesLoading ? (
            <FlatList
              data={[1, 2, 3, 4, 5]}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              renderItem={() => <CategorySkeleton />}
              keyExtractor={(item) => String(item)}
            />
          ) : (
            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => (
                <Link href={`/category/${item.slug}`} asChild>
                  <Pressable style={styles.categoryCard}>
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
              )}
              keyExtractor={(item) => item.id}
            />
          )}
        </View>

        {bannersLoading ? (
          <View style={styles.section}>
            <BannerSkeleton height={200} />
          </View>
        ) : (
          <HeroBanner banners={heroBanners} />
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              New Arrivals
            </Text>
            <Link href="/(tabs)/shop" asChild>
              <Pressable>
                <Text style={[styles.viewAll, { color: colors.accent }]}>
                  View All
                </Text>
              </Pressable>
            </Link>
          </View>
          {newArrivalsLoading ? (
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
              data={newArrivalsList}
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
              Hot Deals
            </Text>
            <Link href="/(tabs)/shop?sortBy=offer" asChild>
              <Pressable>
                <Text style={[styles.viewAll, { color: colors.accent }]}>
                  View All
                </Text>
              </Pressable>
            </Link>
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
              Featured Collection
            </Text>
            <Link href="/(tabs)/shop" asChild>
              <Pressable>
                <Text style={[styles.viewAll, { color: colors.accent }]}>
                  View All
                </Text>
              </Pressable>
            </Link>
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

     

        {bannersLoading ? (
          <View style={styles.section}>
            <BannerSkeleton height={120} />
          </View>
        ) : (
          <MidBanner banners={midBanners} />
        )}

        {brandsLoading ? (
          <View style={styles.section}>
            <View style={styles.brandSkeletonRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <BrandSkeleton key={i} />
              ))}
            </View>
          </View>
        ) : (
          <BrandSection brands={brands ?? []} />
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Best Sellers
            </Text>
            <Link href="/(tabs)/shop" asChild>
              <Pressable>
                <Text style={[styles.viewAll, { color: colors.accent }]}>
                  View All
                </Text>
              </Pressable>
            </Link>
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

        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Latest Blogs
            </Text>
            <Pressable>
              <Text style={[styles.viewAll, { color: colors.accent }]}>
                View All
              </Text>
            </Pressable>
          </View>
          {blogsLoading ? (
            <View style={styles.blogGrid}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.blogItem}>
                  <BlogCardSkeleton />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.blogGrid}>
              {(blogs ?? []).slice(0, 3).map((blog) => (
                <View key={blog.id} style={styles.blogItem}>
                  <BlogCard blog={blog} />
                </View>
              ))}
            </View>
          )}
        </View> */}

        {bannersLoading ? (
          <View style={styles.section}>
            <BannerSkeleton height={120} />
          </View>
        ) : (
          <BottomBanner banners={bottomBanners} />
        )}

        {/* <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            What Our Customers Say
          </Text>
        </View>
        {testimonialsLoading ? (
          <View style={styles.section}>
            <Skeleton width="100%" height={100} borderRadius={12} />
          </View>
        ) : (
          <TestimonialSlider testimonials={testimonials ?? []} />
        )}
        <View style={styles.bottomSpacer} /> */}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  section: {
    marginTop: spacing["2xl"],
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    fontWeight: "800",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  viewAll: {
    ...typography.bodyStrong,
    fontWeight: "600",
  },
  categoryList: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  categoryCard: {
    width: 100,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  categoryImage: {
    width: "100%",
    height: 90,
    borderRadius: radius.lg,
  },
  categoryName: {
    ...typography.caption,
    fontWeight: "800",
    marginTop: spacing.sm,
    textAlign: "center",
  },
  productList: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  blogGrid: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  blogItem: {
    width: "100%",
  },
  bottomSpacer: {
    height: spacing.xl,
  },
  brandSkeletonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: spacing.md,
  },
});
