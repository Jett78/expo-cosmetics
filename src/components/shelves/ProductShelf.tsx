import { Text } from '@rneui/themed';
import { Link } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { spacing, typography } from '../../design-system';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useShelfProducts } from '../../services/product/hooks';
import ProductCard from '../ProductCard/Card';
import { ProductCardSkeleton } from '../Skeleton';

type ProductShelfProps = {
  title: string;
  subtitle?: string;
  categoryId?: string;
  brandId?: string;
  viewAllHref: string;
};

export default function ProductShelf({
  title,
  subtitle,
  categoryId,
  brandId,
  viewAllHref,
}: ProductShelfProps) {
  const { colors } = useAppTheme();
  const { data: products, isLoading } = useShelfProducts({ categoryId, brandId });

  const list = products ?? [];

  if (!isLoading && list.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleBlock}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          ) : null}
        </View>
        <Link href={viewAllHref} asChild>
          <Pressable>
            <Text style={[styles.viewAll, { color: colors.accent }]}>View All</Text>
          </Pressable>
        </Link>
      </View>
      {isLoading ? (
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
          data={list}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productList}
          renderItem={({ item }) => <ProductCard product={item} width={155} />}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleBlock: {
    flex: 1,
    paddingRight: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    fontWeight: '800',
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  viewAll: {
    ...typography.bodyStrong,
    fontWeight: '600',
  },
  productList: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
});
