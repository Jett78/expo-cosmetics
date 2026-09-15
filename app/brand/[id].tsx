import { useMemo } from 'react';
import { View, FlatList, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@rneui/themed';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useCommerce } from '../../src/context/CommerceContext';
import { products } from '../../src/data';
import { brands } from '../../src/data/brands';
import { spacing, radius, typography, shadows } from '../../src/design-system';
import type { Product } from '../../src/data/products';

export default function BrandScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { isFavorite, toggleFavorite } = useCommerce();

  const brand = useMemo(() => brands.find((b) => b.id === id), [id]);

  const brandProducts = useMemo(() => {
    if (!brand) return [];
    return products.filter(
      (p) => p.brand.toLowerCase() === brand.name.toLowerCase()
    );
  }, [brand]);

  const renderProduct = ({ item }: { item: Product }) => (
    <Pressable
      style={StyleSheet.flatten([styles.productCard, { backgroundColor: colors.surface }])}
      onPress={() => router.push(`/product/${item.id}`)}
    >
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
        style={styles.heartIcon}
        onPress={() => toggleFavorite(item)}
      >
        <Ionicons
          name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
          size={18}
          color={isFavorite(item.id) ? colors.danger : colors.textSecondary}
        />
      </Pressable>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderSubtle }]}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {brand?.name ?? 'Brand'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {brand && (
        <View style={[styles.brandBanner, { backgroundColor: colors.surface }]}>
          <Text style={[styles.brandTagline, { color: colors.textSecondary }]}>{brand.tagline}</Text>
          <Text style={[styles.brandCount, { color: colors.textMuted }]}>
            {brandProducts.length} {brandProducts.length === 1 ? 'product' : 'products'}
          </Text>
        </View>
      )}

      <FlatList
        data={brandProducts}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.productGrid}
        contentContainerStyle={styles.scrollContent}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="bag-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No products found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { ...typography.h3 },
  brandBanner: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  brandTagline: { ...typography.body, marginBottom: spacing.xs },
  brandCount: { ...typography.caption },
  productGrid: { gap: spacing.md },
  scrollContent: { padding: spacing.xl, paddingBottom: 100 },
  productCard: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  productImage: { width: '100%', height: 160 },
  productInfo: { padding: spacing.md },
  productBrand: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xxs,
  },
  productName: { ...typography.bodyStrong, marginBottom: spacing.xs },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  price: { ...typography.priceSmall },
  salePrice: { ...typography.priceSmall },
  originalPrice: { ...typography.caption, textDecorationLine: 'line-through' },
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
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { ...typography.h3, marginTop: spacing.lg },
});
