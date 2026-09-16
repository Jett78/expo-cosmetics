import { FlatList, StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';

import { spacing, typography } from '../../design-system';
import type { ApiBrand } from '../../types/brand';
import BrandCard from './BrandCard';

type BrandSectionProps = {
  brands: ApiBrand[];
};

export default function BrandSection({ brands }: BrandSectionProps) {
  if (brands.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Shop by Brand</Text>
      <FlatList
        data={brands}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <BrandCard brand={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.lg,
    paddingVertical: spacing.xs,
  },
});
