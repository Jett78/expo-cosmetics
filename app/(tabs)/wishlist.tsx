import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useCommerce } from '../../src/context/CommerceContext';
import { spacing, radius, typography, shadows } from '../../src/design-system';

export default function WishlistScreen() {
  const { colors } = useAppTheme();
  const { favoriteProducts, isFavorite, toggleFavorite } = useCommerce();

  if (favoriteProducts.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Wishlist</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceMuted }]}>
            <Ionicons name="heart-outline" size={48} color={colors.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No saved products yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Tap the heart icon on any product to save it here
          </Text>
          <Link href="/(tabs)" asChild>
            <Pressable style={StyleSheet.flatten([styles.emptyButton, { backgroundColor: colors.accent }])}>
              <Text style={styles.emptyButtonText}>Explore Products</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Wishlist</Text>
        <Text style={[styles.headerCount, { color: colors.textSecondary }]}>
          {favoriteProducts.length} {favoriteProducts.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      <FlatList
        data={favoriteProducts}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.productGrid}
        contentContainerStyle={styles.scrollContent}
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
              <Pressable
                style={styles.removeButton}
                onPress={() => toggleFavorite(item)}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={22} color={colors.danger} />
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
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
  },
  headerTitle: {
    ...typography.h1,
  },
  headerCount: {
    ...typography.body,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
    gap: spacing.md,
  },
  productGrid: {
    gap: spacing.md,
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
  removeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  emptyTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  emptyButton: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  emptyButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
