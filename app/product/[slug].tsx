import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@rneui/themed';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useCommerce } from '../../src/context/CommerceContext';
import { useProductBySlug, useProducts, useBestSellers, useFeaturedProducts } from '../../src/services/product/hooks';
import ReviewSection from '../../src/components/ReviewSection';
import ProductCard from '../../src/components/ProductCard/Card';
import AddToCartBottomSheet from '../../src/components/AddToCartBottomSheet';
import { spacing, radius, typography } from '../../src/design-system';
import type {  ApiAttribute } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 1.1;

type GroupedAttributeItem = {
  id: string;
  value: string;
  unit: string;
  inStock: boolean;
};

function extractAttrValue(attr: ApiAttribute): string {
  return (
    attr.valueString ||
    (attr.valueInt != null ? String(attr.valueInt) : '') ||
    (attr.valueDecimal != null ? String(attr.valueDecimal) : '') ||
    (typeof attr.valueBool === 'boolean' ? (attr.valueBool ? 'Available' : 'Not Available') : '') ||
    ''
  );
}

function getAttributeGroups(attributes: ApiAttribute[]) {
  const groups: Record<string, GroupedAttributeItem[]> = {};
  for (const attr of attributes) {
    const name = attr.attributeDefinition?.name;
    if (!name) continue;
    const unit = attr.attributeDefinition?.unit || '';
    const value = extractAttrValue(attr);
    const inStock = !!(attr.stockAndPrice && attr.stockAndPrice.stock > 0);
    if (!groups[name]) groups[name] = [];
    groups[name].push({ id: attr.id, value, unit, inStock });
  }
  for (const name of Object.keys(groups)) {
    groups[name].sort((a, b) => Number(b.inStock) - Number(a.inStock));
  }
  return groups;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '\n')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isOfferCurrentlyActive(variant: { isOfferedPriceActive?: boolean; offeredPrice?: string | number | null; offerStartDate?: string | null; offerEndDate?: string | null } | null | undefined): boolean {
  if (!variant) return false;
  const now = new Date();
  const offerPrice = Number(variant.offeredPrice ?? 0);
  return (
    !!variant.isOfferedPriceActive &&
    offerPrice > 0 &&
    new Date(variant.offerStartDate ?? 0) <= now &&
    new Date(variant.offerEndDate ?? 0) >= now
  );
}

export default function ProductDetailScreen() {
  const rawSlug = useLocalSearchParams().slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : (rawSlug as string ?? '');
  const { colors } = useAppTheme();
  const { addToCart, isFavorite, toggleFavorite } = useCommerce();

  const { data: product, isLoading, error } = useProductBySlug(slug);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<ApiAttribute['stockAndPrice'] | null>(null);
  const [selectedFeatureImage, setSelectedFeatureImage] = useState('');
  const [selectedFeatureImageLink, setSelectedFeatureImageLink] = useState<Record<string, string> | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showDescription, setShowDescription] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showCartSheet, setShowCartSheet] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const attributeGroups = useMemo(
    () => (product ? getAttributeGroups(product.attributes) : {}),
    [product],
  );

  const { data: relatedProducts } = useProducts({
    categoryId: product?.category?.id,
  });

  const { data: featuredProducts } = useFeaturedProducts();
  const { data: bestSellers } = useBestSellers();

  const relatedList = useMemo(
    () => (relatedProducts?.products ?? []).filter((p) => p.id !== product?.id).slice(0, 10),
    [relatedProducts, product],
  );

  const bestSellersList = useMemo(
    () => (bestSellers ?? []).filter((p) => p.id !== product?.id).slice(0, 10),
    [bestSellers, product],
  );

  const featuredList = useMemo(
    () => (featuredProducts ?? []).filter((p) => p.id !== product?.id).slice(0, 10),
    [featuredProducts, product],
  );

  // Initial attribute selection on mount
  useEffect(() => {
    if (!product || Object.keys(attributeGroups).length === 0) return;

    const newSelected: Record<string, string> = {};
    for (const [name, items] of Object.entries(attributeGroups)) {
      if (items.length > 0) {
        newSelected[name] = items[0].id;
      }
    }
    setSelectedAttributes(newSelected);

    const firstAttrId = Object.values(newSelected)[0];
    const firstAttr = product.attributes.find((a) => a.id === firstAttrId);
    const initialVariant =
      firstAttr?.stockAndPrice && Number(firstAttr.stockAndPrice.price) > 0
        ? firstAttr
        : product.attributes.find(
            (a) => a?.stockAndPrice && Number(a.stockAndPrice.price) > 0,
          );

    if (initialVariant) {
      setSelectedVariant(initialVariant.stockAndPrice || null);
      setSelectedFeatureImage(initialVariant.imageUrl || product.featureImage);
      setSelectedFeatureImageLink(initialVariant.imageUrlLink || product.featureImageLink);
    } else {
      setSelectedFeatureImage(product.featureImage);
      setSelectedFeatureImageLink(product.featureImageLink);
    }
  }, [product, attributeGroups]);

  // Available stock from selected variant
  const availableStock = useMemo(() => selectedVariant?.stock ?? 0, [selectedVariant]);

  // Current offer-active status from selected variant
  const variantOfferActive = useMemo(() => isOfferCurrentlyActive(selectedVariant as any), [selectedVariant]);

  // Price: prefer selected variant price, fallback to product-level
  const displayPrice = useMemo(() => {
    if (!product) return 0;
    const variantPrice = Number(selectedVariant?.price ?? 0);
    const variantOffered = Number(selectedVariant?.offeredPrice ?? 0);
    if (variantPrice > 0) {
      if (variantOfferActive && variantOffered > 0) {
        return variantOffered;
      }
      return variantPrice;
    }
    if (variantOfferActive && product.offeredPrice > 0) {
      return product.offeredPrice;
    }
    return product.price;
  }, [product, selectedVariant, variantOfferActive]);

  const originalPrice = useMemo(() => {
    if (!product) return 0;
    const variantPrice = Number(selectedVariant?.price ?? 0);
    if (variantPrice > 0) {
      return variantPrice;
    }
    return product.price;
  }, [product, selectedVariant]);

  const hasDiscount = useMemo(
    () => variantOfferActive && displayPrice < originalPrice,
    [variantOfferActive, displayPrice, originalPrice],
  );

  const imageUrls = useMemo(() => {
    if (!product) return [];
    // If a feature image was set from attribute selection, use it
    if (selectedFeatureImageLink) {
      const link768 = selectedFeatureImageLink['768'];
      const link480 = selectedFeatureImageLink['480'];
      if (link768 || link480) return [link768 || link480];
    }
    if (selectedFeatureImage) return [selectedFeatureImage];
    if (product.media && product.media.length > 0) {
      return product.media.map((m) => m.mediaUrlLink?.['768'] ?? m.mediaUrlLink?.['480'] ?? '');
    }
    return [product.featureImageLink?.['768'] ?? product.featureImageLink?.['480'] ?? ''];
  }, [product, selectedFeatureImage, selectedFeatureImageLink]);

  const handleAddToCart = () => {
    if (!product) return;

    const attributeIds = Object.values(selectedAttributes)
      .filter(Boolean)
      .map((attrId) => {
        const attr = product.attributes.find((a) => a.id === attrId);
        return attr?.stockAndPrice?.productAttributeValueId || attrId;
      })
      .filter(Boolean);

    addToCart({
      id: product.id,
      name: product.name,
      price: originalPrice,
      salePrice: displayPrice < originalPrice ? displayPrice : undefined,
      slug: product.slug,
      image: imageUrls[0] ?? '',
    }, quantity, attributeIds);

    setAddedToCart(true);
    setShowCartSheet(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const incrementQuantity = () =>
    setQuantity((q) => Math.min(q + 1, availableStock > 0 ? availableStock : 10));
  const decrementQuantity = () => setQuantity((q) => Math.max(q - 1, 1));

  const handleAttributeSelect = (groupName: string, attrId: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [groupName]: prev[groupName] === attrId ? '' : attrId,
    }));
    const attr = product?.attributes.find((a) => a.id === attrId);
    if (attr) {
      setSelectedVariant(attr.stockAndPrice || null);
      if (attr.imageUrl) setSelectedFeatureImage(attr.imageUrl);
      if (attr.imageUrlLink) setSelectedFeatureImageLink(attr.imageUrlLink);
      setQuantity(1);
    }
  };

  const renderImage = useCallback(
    ({ item }: { item: string }) => (
      <View style={{ width: SCREEN_WIDTH, height: IMAGE_HEIGHT }}>
        <Image
          source={{ uri: item }}
          style={styles.productImage}
          contentFit="contain"
          transition={300}
        />
      </View>
    ),
    [],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>
            Product not found
          </Text>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface }]}>
            <Text style={[typography.button, { color: colors.accent }]}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        <View style={[styles.imageContainer, { backgroundColor: colors.surfaceMuted }]}>
          <FlatList
            ref={flatListRef}
            data={imageUrls}
            renderItem={renderImage}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImageIndex(index);
            }}
            keyExtractor={(_, i) => String(i)}
          />

          {imageUrls.length > 1 && (
            <View style={styles.pagination}>
              {imageUrls.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: i === activeImageIndex ? colors.accent : colors.borderStrong,
                      width: i === activeImageIndex ? 20 : 6,
                    },
                  ]}
                />
              ))}
            </View>
          )}

          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
              pressed && { opacity: 0.7 },
            ]}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>

          <Pressable
            onPress={() =>
              toggleFavorite({
                id: product.id,
                name: product.name,
                price: product.price,
                image: { uri: imageUrls[0] },
                brand: product.brand?.name ?? '',
                category: product.category?.name ?? '',
                categoryId: product.categoryId,
              } as any)
            }
            style={({ pressed }) => [
              styles.wishlistButton,
              { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
              pressed && { opacity: 0.7 },
            ]}
            accessibilityLabel={isFavorite(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Ionicons
              name={isFavorite(product.id) ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite(product.id) ? colors.danger : colors.textPrimary}
            />
          </Pressable>
        </View>

        {/* Product Info */}
        <View style={[styles.infoContainer, { backgroundColor: colors.surface, borderTopColor: colors.borderSubtle }]}>
          {/* Category + Rating */}
          <View style={styles.metaRow}>
            {product.category?.name && (
              <View style={[styles.categoryBadge, { backgroundColor: colors.accent }]}>
                <Text style={[typography.label, { color: colors.textInverse }]}>
                  {product.category.name}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.ratingChip,
                { backgroundColor: colors.surfaceMuted, borderColor: colors.borderSubtle },
              ]}
            >
              <Ionicons name="star" size={12} color="#E8A952" />
              <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '700' }]}>
                {product.avgRating}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                ({product.reviews.length})
              </Text>
            </View>
          </View>

          {/* Brand */}
          {!!product.brand?.name && (
            <Text
              style={[
                typography.label,
                {
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  marginTop: spacing.lg,
                  marginBottom: spacing.xs,
                },
              ]}
            >
              {product.brand.name}
            </Text>
          )}

          {/* Product Name */}
          <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing.md }]}>
            {product.name}
          </Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text
              style={[
                typography.priceLarge,
                { color: colors.accent },
              ]}
            >
              Rs. {displayPrice.toLocaleString()}
            </Text>
            {hasDiscount && (
              <>
                <Text
                  style={[
                    typography.price,
                    {
                      color: colors.textSecondary,
                      textDecorationLine: 'line-through',
                      marginLeft: spacing.md,
                    },
                  ]}
                >
                  Rs. {originalPrice.toLocaleString()}
                </Text>
                <View style={[styles.discountBadge, { backgroundColor: colors.danger }]}>
                  <Text style={[typography.label, { color: colors.textInverse }]}>
                    -{Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}%
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Attribute Variants */}
          {Object.entries(attributeGroups).map(([groupName, items]) => {
            if (items.length <= 1) return null;
            const isColor = groupName.toLowerCase() === 'color';
            return (
              <View key={groupName} style={styles.variantSection}>
                {isColor ? (
                  // Color / Shade selector
                  <>
                    {!selectedAttributes[groupName] && (
                      <Text
                        style={[
                          typography.label,
                          { color: colors.textSecondary, textTransform: 'uppercase', marginBottom: spacing.md },
                        ]}
                      >
                        {groupName}
                      </Text>
                    )}
                    {selectedAttributes[groupName] && (
                      <View style={styles.shadeLabelRow}>
                        <Text style={[typography.label, { color: colors.textSecondary, textTransform: 'uppercase' }]}>
                          Shade
                        </Text>
                        <View style={[styles.shadeLabelPill, { backgroundColor: colors.surfaceMuted, borderColor: colors.borderSubtle }]}>
                          <View
                            style={[styles.shadeDot, {
                              backgroundColor: items.find((it) => it.id === selectedAttributes[groupName])?.value || '#ddd',
                            }]}
                          />
                          <Text style={[typography.captionLarge, { color: colors.textPrimary }]}>
                            {product.attributes.find((a) => a.id === selectedAttributes[groupName])?.name || ''}
                          </Text>
                        </View>
                      </View>
                    )}
                    <View style={styles.colorRow}>
                      {items.map(({ id, value }) => {
                        const isSelected = selectedAttributes[groupName] === id;
                        return (
                          <View
                            key={id}
                            style={[styles.colorRing, isSelected && { borderColor: colors.accent }]}
                          >
                            <Pressable
                              onPress={() => handleAttributeSelect(groupName, id)}
                              style={({ pressed }) => [
                                styles.colorCircle,
                                {
                                  backgroundColor: value,
                                  borderColor: isSelected ? colors.surface : colors.borderStrong,
                                },
                                pressed && { opacity: 0.7 },
                              ]}
                              accessibilityLabel={`Select shade ${value}`}
                              accessibilityState={{ selected: isSelected }}
                            />
                          </View>
                        );
                      })}
                    </View>
                  </>
                ) : (
                  // Text-based variant selector (size, finish, etc.)
                  <>
                    <Text
                      style={[
                        typography.label,
                        { color: colors.textSecondary, textTransform: 'uppercase', marginBottom: spacing.md },
                      ]}
                    >
                      {groupName}
                    </Text>
                    <View style={styles.sizeRow}>
                      {items.map(({ id, value, unit }) => {
                        const isSelected = selectedAttributes[groupName] === id;
                        return (
                          <Pressable
                            key={id}
                            onPress={() => handleAttributeSelect(groupName, id)}
                            style={({ pressed }) => [
                              styles.sizePill,
                              {
                                backgroundColor: isSelected ? colors.accent : colors.surfaceMuted,
                                borderColor: isSelected ? colors.accent : colors.borderStrong,
                              },
                              pressed && { opacity: 0.7 },
                            ]}
                            accessibilityState={{ selected: isSelected }}
                          >
                            <Text
                              style={[
                                typography.captionLarge,
                                { color: isSelected ? colors.textInverse : colors.textPrimary, fontWeight: isSelected ? '700' : '500' },
                              ]}
                            >
                              {value}{unit ? ` (${unit})` : ''}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                )}
              </View>
            );
          })}

          {/* Quantity + Add to Cart — only when in stock and active */}
          {availableStock > 0 && product.isActive && (
            <View style={styles.variantSection}>
              <View style={styles.sectionLabelRow}>
                <Text style={[typography.label, { color: colors.textSecondary, textTransform: 'uppercase' }]}>
                  Quantity
                </Text>
                <View
                  style={[
                    styles.stockChip,
                    { backgroundColor: colors.surfaceMuted, borderColor: colors.borderSubtle },
                  ]}
                >
                  <View style={[styles.stockDot, { backgroundColor: colors.success }]} />
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {availableStock} in stock
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.stepper,
                  { backgroundColor: colors.surfaceMuted, borderColor: colors.borderStrong },
                ]}
              >
                <Pressable
                  onPress={decrementQuantity}
                  style={({ pressed }) => [
                    styles.stepperBtn,
                    { backgroundColor: colors.success },
                    pressed && { opacity: 0.6 },
                  ]}
                  accessibilityLabel="Decrease quantity"
                >
                  <Ionicons name="remove" size={20} color={colors.textInverse} />
                </Pressable>
                <View style={[styles.stepperDivider, { backgroundColor: colors.borderSubtle }]} />
                <Text style={[typography.h3, styles.quantityValue, { color: colors.textPrimary }]}>
                  {quantity}
                </Text>
                <View style={[styles.stepperDivider, { backgroundColor: colors.borderSubtle }]} />
                <Pressable
                  onPress={incrementQuantity}
                  style={({ pressed }) => [
                    styles.stepperBtn,
                    { backgroundColor: colors.success },
                    pressed && { opacity: 0.6 },
                  ]}
                  accessibilityLabel="Increase quantity"
                >
                  <Ionicons name="add" size={20} color={colors.textInverse} />
                </Pressable>
              </View>
            </View>
          )}

          {/* Out of Stock */}
          {(!availableStock || availableStock <= 0) && (
            <View
              style={[
                styles.statusBanner,
                { backgroundColor: colors.surfaceMuted, borderColor: colors.borderSubtle },
              ]}
            >
              <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
              <Text style={[typography.bodyStrong, { color: colors.danger }]}>Out of Stock!</Text>
            </View>
          )}

          {/* Not Active */}
          {product.isActive === false && (
            <View
              style={[
                styles.statusBanner,
                { backgroundColor: colors.surfaceMuted, borderColor: colors.borderSubtle },
              ]}
            >
              <Ionicons name="time-outline" size={18} color={colors.danger} />
              <Text style={[typography.bodyStrong, { color: colors.danger }]}>
                Sorry, this product is not available now.
              </Text>
            </View>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text
                style={[
                  typography.label,
                  { color: colors.textSecondary, textTransform: 'uppercase', marginBottom: spacing.sm },
                ]}
              >
                Tags
              </Text>
              <View style={styles.tagsWrap}>
                {product.tags.map((tag, idx) => (
                  <View
                    key={tag.id ?? idx}
                    style={[styles.tagChip, { backgroundColor: '#473b34', borderColor: '#1A1512' }]}
                  >
                    <Text style={[typography.caption, { color: colors.textInverse }]}>{tag.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          <View style={[styles.section, { borderBottomColor: colors.borderSubtle }]}>
            <Pressable
              onPress={() => setShowDescription(!showDescription)}
              style={({ pressed }) => [styles.sectionHeader, pressed && { opacity: 0.6 }]}
            >
              <Text style={[typography.h4, { color: colors.textPrimary }]}>Description</Text>
              <View style={[styles.chevronChip, { backgroundColor: colors.surfaceMuted }]}>
                <Ionicons
                  name={showDescription ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.textSecondary}
                />
              </View>
            </Pressable>
            {showDescription && product.description && (
              <Text style={[styles.sectionContent, { color: colors.textMuted, marginTop: spacing.md }]}>
                {stripHtml(product.description)}
              </Text>
            )}
          </View>

          {/* Reviews */}
          <ReviewSection
            productId={product.id}
            avgRating={product.avgRating}
            embeddedReviews={product.reviews}
          />

          {/* Related Products */}
          {relatedList.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={[typography.h3, { color: colors.textPrimary, fontWeight: '800', marginBottom: spacing.lg }]}>
                You May Also Like
              </Text>
              <FlatList
                data={relatedList}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(p) => p.id}
                contentContainerStyle={{ gap: spacing.md }}
                renderItem={({ item: rp }) => (
                  <ProductCard product={rp} width={160} />
                )}
              />
            </View>
          )}

          {/* Best Sellers */}
          {bestSellersList.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={[typography.h3, { color: colors.textPrimary, fontWeight: '800', marginBottom: spacing.lg }]}>
                Best Sellers
              </Text>
              <FlatList
                data={bestSellersList}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(p) => p.id}
                contentContainerStyle={{ gap: spacing.md }}
                renderItem={({ item: bp }) => (
                  <ProductCard product={bp} width={160} />
                )}
              />
            </View>
          )}

          {/* Featured Collection */}
          {featuredList.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={[typography.h3, { color: colors.textPrimary, fontWeight: '800', marginBottom: spacing.lg }]}>
                Featured Collection
              </Text>
              <FlatList
                data={featuredList}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(p) => p.id}
                contentContainerStyle={{ gap: spacing.md }}
                renderItem={({ item: fp }) => (
                  <ProductCard product={fp} width={160} />
                )}
              />
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBarContainer}>
        <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.borderSubtle }]}>
          <View style={styles.bottomPrice}>
            <Text style={[typography.label, { color: colors.textSecondary, textTransform: 'uppercase' }]}>
              Price
            </Text>
            <Text
              style={[
                typography.priceLarge,
                { color: colors.accent, marginTop: spacing.xxs },
              ]}
            >
              Rs. {(displayPrice * quantity).toLocaleString()}
            </Text>
          </View>
          {availableStock > 0 && product.isActive ? (
            <Pressable
              onPress={handleAddToCart}
              style={({ pressed }) => [
                styles.addToCartBtn,
                { backgroundColor: addedToCart ? colors.success : colors.accent },
                pressed && { opacity: 0.85 },
              ]}
              accessibilityLabel="Add to bag"
            >
              <Ionicons
                name={addedToCart ? 'checkmark-circle-outline' : 'bag-handle-outline'}
                size={18}
                color={colors.textInverse}
              />
              <Text style={[typography.button, { color: colors.textInverse, fontSize: 14 }]}>
                {addedToCart ? 'Added!' : 'Add to Bag'}
              </Text>
            </Pressable>
          ) : (
            <View
              style={[
                styles.addToCartBtn,
                { backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.borderStrong },
              ]}
              accessibilityLabel="Out of stock"
            >
              <Ionicons name="close-circle-outline" size={18} color={colors.textMuted} />
              <Text style={[typography.button, { color: colors.textMuted, fontSize: 14 }]}>
                Out of Stock
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* Add to Cart Bottom Sheet */}
      <AddToCartBottomSheet
        visible={showCartSheet}
        onClose={() => setShowCartSheet(false)}
        productName={product?.name ?? ''}
        productImage={imageUrls[0] ?? ''}
        quantity={quantity}
        price={displayPrice}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  backBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: spacing['3xl'],
    left: 0,
    right: 0,
    gap: spacing.xs,
  },
  dot: {
    height: 6,
    borderRadius: radius.full,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    left: spacing.lg,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  wishlistButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    right: spacing.lg,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  infoContainer: {
    marginTop: -spacing['2xl'],
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    borderTopWidth: 1,
    paddingTop: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: spacing['2xl'],
  },
  discountBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    marginLeft: spacing.md,
  },
  variantSection: {
    marginBottom: spacing['2xl'],
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  stockChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  shadeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  shadeLabelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: spacing.sm,
  },
  shadeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
  },
  sizeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sizePill: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    minWidth: 56,
    alignItems: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperDivider: {
    width: 1,
    height: 22,
  },
  quantityValue: {
    minWidth: 48,
    textAlign: 'center',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing['2xl'],
  },
  tagsSection: {
    marginBottom: spacing.lg,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  section: {
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chevronChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContent: {
    lineHeight: 22,
  },
  relatedSection: {
    marginTop: spacing.xl,
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  bottomPrice: {
    flexShrink: 1,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
});
