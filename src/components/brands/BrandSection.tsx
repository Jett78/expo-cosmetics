import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';

import { spacing, typography } from '../../design-system';
import type { ApiBrand } from '../../types/brand';
import BrandCard from './BrandCard';

type BrandSectionProps = {
  brands: ApiBrand[];
};

export default function BrandSection({ brands }: BrandSectionProps) {
  const displayBrands = brands.slice(0, 10);
  if (displayBrands.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop by Brand</Text>
      </View>
      <View style={styles.grid}>
        {displayBrands.map((item) => (
          <View key={item.id} style={styles.cell}>
            <BrandCard brand={item} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cell: {
    width: '47%',
    alignItems: 'center',
  },
});
