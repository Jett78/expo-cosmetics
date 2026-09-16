import { useMemo } from 'react';
import { View, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useActiveProducts } from '../../src/services/product/hooks';
import { spacing, radius, typography } from '../../src/design-system';
import ProductCard from '../../src/components/ProductCard/Card';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function deslugify(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function BrandScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors } = useAppTheme();

  const { data: allProducts, isLoading } = useActiveProducts();

  const brandName = useMemo(() => {
    if (!slug) return '';
    return deslugify(slug as string);
  }, [slug]);

  const brandProducts = useMemo(() => {
    if (!allProducts || !brandName) return [];
    return allProducts.filter(
      (p) => slugify(p.brand?.name ?? '') === slug
    );
  }, [allProducts, slug, brandName]);

  const brandTagline = useMemo(() => {
    if (brandProducts.length === 0) return '';
    const brand = brandProducts[0]?.brand;
    return brand?.name ?? '';
  }, [brandProducts]);

  const renderProduct = ({ item }: { item: any }) => <ProductCard product={item} />;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderSubtle }]}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {brandName || 'Brand'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {brandProducts.length > 0 && (
        <View style={[styles.brandBanner, { backgroundColor: colors.surface }]}>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  brandCount: { ...typography.caption },
  productGrid: { gap: spacing.md },
  scrollContent: { padding: spacing.xl, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { ...typography.h3, marginTop: spacing.lg },
});
