import React, { useMemo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@rneui/themed';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useCommerce } from '../../context/CommerceContext';
import { spacing, radius, typography, shadows } from '../../design-system';
import type { ApiProduct, ApiAttribute, ApiStockAndPrice } from '../../types';

type ProductCardProps = {
  product: ApiProduct;
  width?: number;
  showWishlist?: boolean;
  showCategory?: boolean;
};

function isNewProduct(createdAt: string): boolean {
  const now = new Date();
  const productDate = new Date(createdAt);
  const daysDiff = (Number(now) - Number(productDate)) / (1000 * 60 * 60 * 24);
  return daysDiff <= 7;
}

function findValidAttribute(attributes: ApiAttribute[]): ApiAttribute | null {
  return (
    attributes.find(
      (attr) =>
        attr?.stockAndPrice &&
        Number(attr.stockAndPrice.price) > 0 &&
        attr.stockAndPrice.stock > 0,
    ) ??
    attributes.find(
      (attr) => attr?.stockAndPrice && Number(attr.stockAndPrice.price) > 0,
    ) ??
    null
  );
}

function isOfferActive(sp: ApiStockAndPrice | null | undefined): boolean {
  if (!sp) return false;
  const now = new Date();
  const offerPrice = Number(sp.offeredPrice ?? 0);
  return (
    !!sp.isOfferedPriceActive &&
    offerPrice > 0 &&
    new Date(sp.offerStartDate ?? 0) <= now &&
    new Date(sp.offerEndDate ?? 0) >= now
  );
}

function getPriceFromAttribute(attr: ApiAttribute | null): { price: number; offeredPrice: number; hasOffer: boolean } {
  if (!attr?.stockAndPrice) return { price: 0, offeredPrice: 0, hasOffer: false };
  const sp = attr.stockAndPrice;
  const price = Number(sp.price);
  const offeredPrice = Number(sp.offeredPrice ?? 0);
  const hasOffer = isOfferActive(sp);
  return { price, offeredPrice, hasOffer };
}

export default function ProductCard({ product, width, showWishlist = true, showCategory = true }: ProductCardProps) {
  const { colors } = useAppTheme();
  const { isFavorite, toggleFavorite } = useCommerce();

  const validAttribute = useMemo(() => findValidAttribute(product.attributes), [product.attributes]);

  const isNew = useMemo(() => isNewProduct(product.createdAt), [product.createdAt]);

  const isOutOfStock = useMemo(
    () => !validAttribute?.stockAndPrice?.stock || validAttribute.stockAndPrice.stock <= 0,
    [validAttribute],
  );

  const pricing = useMemo(() => getPriceFromAttribute(validAttribute), [validAttribute]);

  const displayPrice = useMemo(() => {
    if (pricing.hasOffer && pricing.offeredPrice > 0) return pricing.offeredPrice;
    if (pricing.price > 0) return pricing.price;
    // Fallback to product-level price
    if (product.isOfferedPriceActive && product.offeredPrice > 0) return product.offeredPrice;
    return product.price;
  }, [pricing, product]);

  const originalPrice = useMemo(() => {
    if (pricing.price > 0) return pricing.price;
    return product.price;
  }, [pricing, product]);

  const hasDiscount = useMemo(
    () => displayPrice > 0 && displayPrice < originalPrice,
    [displayPrice, originalPrice],
  );

  const discountPercent = useMemo(
    () => (hasDiscount ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0),
    [hasDiscount, originalPrice, displayPrice],
  );

  const handlePress = () => router.push(`/product/${product.slug}`);

  const handleWishlistPress = (e: any) => {
    e.stopPropagation?.();
    toggleFavorite({
      id: product.id,
      name: product.name,
      price: product.price,
      image: { uri: product.featureImageLink?.['480'] ?? product.featureImage },
      brand: product.brand?.name ?? '',
      category: product.category?.name ?? '',
      categoryId: product.categoryId,
    } as any);
  };

  const imageUri = product.featureImageLink?.['768'] ?? product.featureImageLink?.['480'] ?? product.featureImage;

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.card,
        { backgroundColor: colors.surface, width: width },
        shadows.sm,
      ]}
    >
      {/* Image Area */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="contain"
          transition={200}
        />

        {/* New Badge */}
        {isNew && (
          <View style={[styles.badge, { backgroundColor: colors.success }]}>
            <Text style={[typography.caption, { color: colors.textInverse, fontWeight: '700' }]}>NEW</Text>
          </View>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <View style={[styles.discountTag, { backgroundColor: colors.danger }]}>
            <Text style={[typography.caption, { color: colors.textInverse, fontWeight: '700' }]}>
              -{discountPercent}%
            </Text>
          </View>
        )}

        {/* Wishlist Button */}
        {showWishlist && (
          <Pressable
            onPress={handleWishlistPress}
            style={[styles.wishlistBtn, { backgroundColor: 'rgba(255,255,255,0.85)' }]}
            accessibilityLabel={isFavorite(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Ionicons
              name={isFavorite(product.id) ? 'heart' : 'heart-outline'}
              size={16}
              color={isFavorite(product.id) ? colors.danger : colors.textPrimary}
            />
          </Pressable>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={[typography.bodyStrong, { color: '#FFFFFF' }]}>Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Info Area */}
      <View style={styles.info}>
        {showCategory && product.category?.name && (
          <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
            {product.category.name}
          </Text>
        )}

        {product.brand?.name && (
          <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6 }]} numberOfLines={1}>
            {product.brand.name}
          </Text>
        )}

        <Text style={[typography.bodyStrong, { color: colors.textPrimary }]} numberOfLines={1}>
          {product.name}
        </Text>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#E8A952" />
          <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 2 }]}>
            {product.avgRating}
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 2 }]}>
            ({product.reviews.length})
          </Text>
        </View>

        {/* Price */}
        <View style={styles.priceRow}>
          {hasDiscount ? (
            <>
              <Text style={[typography.priceSmall, { color: colors.textPrimary }]}>
                Rs. {displayPrice.toLocaleString()}
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textMuted, textDecorationLine: 'line-through', marginLeft: spacing.sm },
                ]}
              >
                Rs. {originalPrice.toLocaleString()}
              </Text>
            </>
          ) : (
            <Text style={[typography.priceSmall, { color: colors.textPrimary }]}>
              Rs. {displayPrice.toLocaleString()}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: '#F8F5F3',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
  },
  discountTag: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
  },
  wishlistBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: spacing.md,
    gap: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});
