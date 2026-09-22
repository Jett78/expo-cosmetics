import { Ionicons } from '@expo/vector-icons';
import { Text } from '@rneui/themed';
import { Link, router } from 'expo-router';
import { Dimensions, FlatList, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

import ProductCard from '../../src/components/ProductCard/Card';
import { useCommerce } from '../../src/context/CommerceContext';
import { radius, spacing, typography } from '../../src/design-system';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import type { ApiProduct } from '../../src/types/product';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.xl * 2 - spacing.md) / 2;

export default function WishlistScreen() {
  const { colors } = useAppTheme();
  const { favoriteProducts, isAuthenticated, serverWishlistItems } = useCommerce();

  const serverCount = serverWishlistItems.length;
  const localCount = favoriteProducts.length;
  const isEmpty = isAuthenticated ? serverCount === 0 : localCount === 0;

  // Map server wishlist items to ApiProduct format for ProductCard
  const serverProducts = serverWishlistItems.map((item) => item.product as unknown as ApiProduct);

  const displayProducts = isAuthenticated
    ? serverProducts
    : (favoriteProducts as unknown as ApiProduct[]);

  if (isEmpty) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.surfaceMuted }]}
            activeOpacity={0.6}
          >
            <Ionicons name='chevron-back' size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Wishlist</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceMuted }]}>
            <Ionicons name='heart-outline' size={44} color={colors.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            No saved products yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Tap the heart icon on any product to save it here
          </Text>
          <Link href='/(tabs)/shop' asChild>
            <Pressable
              style={StyleSheet.flatten([styles.emptyButton, { backgroundColor: colors.accent }])}
            >
              <Ionicons name='bag-outline' size={16} color='#fff' />
              <Text style={styles.emptyButtonText}>Start Shopping</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceMuted }]}
          activeOpacity={0.6}
        >
          <Ionicons name='chevron-back' size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Wishlist</Text>
        <Text style={[styles.headerCount, { color: colors.textMuted }]}>
          {displayProducts.length} {displayProducts.length === 1 ? 'item' : 'items'}
        </Text>
      </View>
      <FlatList
        data={displayProducts}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => <ProductCard product={item} width={CARD_WIDTH} showWishlist />}
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
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTitle: {
    ...typography.h1,
  },
  headerCount: {
    ...typography.body,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  row: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 21,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  emptyButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
