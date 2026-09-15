import { useState, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  Pressable,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@rneui/themed';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useCommerce } from '../../src/context/CommerceContext';
import { products, reviews } from '../../src/data';
import type { Product } from '../../src/data/products';
import { spacing, radius, typography, shadows } from '../../src/design-system';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 1.1;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, tokens } = useAppTheme();
  const { addToCart, isFavorite, toggleFavorite } = useCommerce();

  const product = products.find((p) => p.id === id);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedShade, setSelectedShade] = useState<string | null>(
    product?.shades?.[0]?.id ?? null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product?.sizes?.[0]?.id ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [showDescription, setShowDescription] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);

  const [addedToCart, setAddedToCart] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  if (!product) {
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

  const productReviews = reviews.filter((r) => r.productId === product.id);
  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 6);

  const effectivePrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice != null && product.salePrice < product.price;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedShade ?? undefined, selectedSize ?? undefined);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const incrementQuantity = () => setQuantity((q) => Math.min(q + 1, 10));
  const decrementQuantity = () => setQuantity((q) => Math.max(q - 1, 1));

  const renderImage = useCallback(
    ({ item }: { item: number }) => (
      <View style={{ width: SCREEN_WIDTH, height: IMAGE_HEIGHT }}>
        <Image
          source={item}
          style={styles.productImage}
          contentFit="contain"
          transition={300}
        />
      </View>
    ),
    []
  );

  const renderCollapsibleSection = (
    title: string,
    content: string | undefined,
    isOpen: boolean,
    onToggle: () => void
  ) => {
    if (!content) return null;
    return (
      <View style={[styles.section, { borderBottomColor: colors.borderSubtle }]}>
        <Pressable onPress={onToggle} style={styles.sectionHeader}>
          <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>{title}</Text>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </Pressable>
        {isOpen && (
          <Text style={[styles.sectionContent, { color: colors.textMuted, marginTop: spacing.md }]}>
            {content}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <FlatList
            ref={flatListRef}
            data={product.images}
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

          {/* Pagination Dots */}
          {product.images.length > 1 && (
            <View style={styles.pagination}>
              {product.images.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i === activeImageIndex ? colors.accent : colors.borderStrong,
                      width: i === activeImageIndex ? 20 : 6,
                    },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.7)' }]}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>

          {/* Wishlist Button */}
          <Pressable
            onPress={() => toggleFavorite(product)}
            style={[styles.wishlistButton, { backgroundColor: 'rgba(255,255,255,0.7)' }]}
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
        <View style={styles.infoContainer}>
          <Text style={[typography.captionLarge, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
            {product.brand}
          </Text>
          <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
            {product.name}
          </Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(product.rating) ? 'star' : 'star-outline'}
                  size={16}
                  color="#E8A952"
                />
              ))}
            </View>
            <Text style={[typography.captionLarge, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
              {product.rating} ({product.reviewCount} reviews)
            </Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={[typography.priceLarge, { color: colors.textPrimary }]}>
              {product.currency} {effectivePrice.toLocaleString()}
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
                  {product.currency} {product.price.toLocaleString()}
                </Text>
                <View style={[styles.discountBadge, { backgroundColor: colors.danger }]}>
                  <Text style={[typography.caption, { color: colors.textInverse }]}>
                    -{Math.round(((product.price - product.salePrice!) / product.price) * 100)}%
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Shade Selector */}
          {product.shades && product.shades.length > 0 && (
            <View style={styles.variantSection}>
              <Text style={[typography.bodyStrong, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                Shade — {product.shades.find((s) => s.id === selectedShade)?.name}
              </Text>
              <FlatList
                data={product.shades}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(s) => s.id}
                renderItem={({ item: shade }) => (
                  <Pressable
                    onPress={() => setSelectedShade(shade.id)}
                    style={[
                      styles.shadeCircle,
                      {
                        backgroundColor: shade.hex,
                        borderColor: selectedShade === shade.id ? colors.textPrimary : 'transparent',
                        borderWidth: selectedShade === shade.id ? 2.5 : 0,
                      },
                    ]}
                    accessibilityLabel={`Select shade ${shade.name}`}
                  />
                )}
              />
            </View>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <View style={styles.variantSection}>
              <Text style={[typography.bodyStrong, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                Size
              </Text>
              <View style={styles.sizeRow}>
                {product.sizes.map((size) => (
                  <Pressable
                    key={size.id}
                    onPress={() => setSelectedSize(size.id)}
                    style={[
                      styles.sizePill,
                      {
                        backgroundColor:
                          selectedSize === size.id ? colors.accent : colors.surfaceMuted,
                        borderColor:
                          selectedSize === size.id ? colors.accent : colors.borderStrong,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.captionLarge,
                        {
                          color: selectedSize === size.id ? colors.textInverse : colors.textPrimary,
                        },
                      ]}
                    >
                      {size.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.variantSection}>
            <Text style={[typography.bodyStrong, { color: colors.textPrimary, marginBottom: spacing.md }]}>
              Quantity
            </Text>
            <View style={styles.quantityRow}>
              <Pressable
                onPress={decrementQuantity}
                style={[styles.quantityBtn, { backgroundColor: colors.surfaceMuted }]}
                accessibilityLabel="Decrease quantity"
              >
                <Ionicons name="remove" size={18} color={colors.textPrimary} />
              </Pressable>
              <Text style={[typography.bodyStrong, { color: colors.textPrimary, marginHorizontal: spacing.xl }]}>
                {quantity}
              </Text>
              <Pressable
                onPress={incrementQuantity}
                style={[styles.quantityBtn, { backgroundColor: colors.surfaceMuted }]}
                accessibilityLabel="Increase quantity"
              >
                <Ionicons name="add" size={18} color={colors.textPrimary} />
              </Pressable>
            </View>
          </View>

          {/* Collapsible Sections */}
          {renderCollapsibleSection(
            'Description',
            product.description,
            showDescription,
            () => setShowDescription(!showDescription)
          )}
          {renderCollapsibleSection(
            'Ingredients',
            product.ingredients,
            showIngredients,
            () => setShowIngredients(!showIngredients)
          )}
          {renderCollapsibleSection(
            'How to Use',
            product.howToUse,
            showHowToUse,
            () => setShowHowToUse(!showHowToUse)
          )}

          {/* Reviews Section */}
          <View style={[styles.reviewsSection, { borderTopColor: colors.borderSubtle }]}>
            <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
              Reviews
            </Text>

            {/* Rating Summary */}
            <View style={styles.ratingSummary}>
              <View style={styles.ratingAvg}>
                <Text style={[typography.display, { color: colors.textPrimary }]}>{product.rating}</Text>
                <View style={styles.starsSmall}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= Math.round(product.rating) ? 'star' : 'star-outline'}
                      size={14}
                      color="#E8A952"
                    />
                  ))}
                </View>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {product.reviewCount} reviews
                </Text>
              </View>

              {/* Star Distribution */}
              <View style={styles.distribution}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = productReviews.filter((r) => r.rating === star).length;
                  const pct = productReviews.length > 0 ? (count / productReviews.length) * 100 : 0;
                  return (
                    <View key={star} style={styles.distRow}>
                      <Text style={[typography.caption, { color: colors.textSecondary, width: 16 }]}>
                        {star}
                      </Text>
                      <Ionicons name="star" size={12} color="#E8A952" />
                      <View style={[styles.distBar, { backgroundColor: colors.surfaceMuted }]}>
                        <View
                          style={[
                            styles.distFill,
                            { backgroundColor: colors.accent, width: `${pct}%` },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Review Cards */}
            {productReviews.length > 0 ? (
              productReviews.map((review) => (
                <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.surface }]}>
                  <View style={styles.reviewHeader}>
                    <View>
                      <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>
                        {review.author}
                      </Text>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        {review.date}
                      </Text>
                    </View>
                    <View style={styles.starsSmall}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= review.rating ? 'star' : 'star-outline'}
                          size={12}
                          color="#E8A952"
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={[typography.bodyStrong, { color: colors.textPrimary, marginTop: spacing.sm }]}>
                    {review.title}
                  </Text>
                  <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.xs }]}>
                    {review.comment}
                  </Text>
                  <View style={styles.helpfulRow}>
                    <Ionicons name="thumbs-up-outline" size={14} color={colors.textSecondary} />
                    <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: spacing.xs }]}>
                      {review.helpful} found this helpful
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.xl }]}>
                No reviews yet
              </Text>
            )}
          </View>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
                You May Also Like
              </Text>
              <FlatList
                data={relatedProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(p) => p.id}
                contentContainerStyle={{ gap: spacing.md }}
                renderItem={({ item: rp }) => (
                  <Pressable
                    onPress={() => router.push(`/product/${rp.id}`)}
                    style={[styles.relatedCard, { backgroundColor: colors.surface }]}
                  >
                    <Image
                      source={rp.image}
                      style={styles.relatedImage}
                      contentFit="contain"
                      transition={200}
                    />
                    <View style={styles.relatedInfo}>
                      <Text
                        style={[typography.caption, { color: colors.textSecondary }]}
                        numberOfLines={1}
                      >
                        {rp.brand}
                      </Text>
                      <Text
                        style={[typography.bodyStrong, { color: colors.textPrimary }]}
                        numberOfLines={1}
                      >
                        {rp.name}
                      </Text>
                      <Text style={[typography.priceSmall, { color: colors.textPrimary }]}>
                        {rp.currency} {(rp.salePrice ?? rp.price).toLocaleString()}
                      </Text>
                    </View>
                  </Pressable>
                )}
              />
            </View>
          )}
        </View>

        {/* Spacer for sticky bottom bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBarContainer}>
        <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.borderSubtle }]}>
          <View style={styles.bottomPrice}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Price</Text>
            <Text style={[typography.priceLarge, { color: colors.textPrimary }]}>
              {product.currency} {(effectivePrice * quantity).toLocaleString()}
            </Text>
          </View>
          <Pressable
            onPress={handleAddToCart}
            style={[styles.addToCartBtn, { backgroundColor: addedToCart ? '#4CAF50' : colors.accent }]}
            accessibilityLabel="Add to bag"
          >
            <Ionicons name={addedToCart ? 'checkmark-circle-outline' : 'bag-handle-outline'} size={20} color={colors.textInverse} />
            <Text style={[typography.button, { color: colors.textInverse, marginLeft: spacing.sm }]}>
              {addedToCart ? 'Added!' : 'Add to Bag'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
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
    bottom: spacing.lg,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  wishlistButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  infoContainer: {
    padding: spacing.xl,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  starsSmall: {
    flexDirection: 'row',
    gap: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  discountBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    marginLeft: spacing.md,
  },
  variantSection: {
    marginBottom: spacing.xl,
  },
  shadeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: spacing.md,
  },
  sizeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sizePill: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionContent: {
    lineHeight: 22,
  },
  reviewsSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
  },
  ratingSummary: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  ratingAvg: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  distribution: {
    flex: 1,
    gap: spacing.sm,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  distBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  distFill: {
    height: '100%',
    borderRadius: 3,
  },
  reviewCard: {
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  helpfulRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  relatedSection: {
    marginTop: spacing.xl,
  },
  relatedCard: {
    width: 160,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  relatedImage: {
    width: '100%',
    height: 160,
  },
  relatedInfo: {
    padding: spacing.md,
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
    ...shadows.lg,
  },
  bottomPrice: {
    flex: 1,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
  },
});
