import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';
import { Link } from 'expo-router';

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
        <Link href="/(tabs)/explore" asChild>
          <Pressable>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        </Link>
      </View>
      <FlatList
        data={displayBrands}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <BrandCard brand={item} />
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    fontWeight: '800',
  },
  viewAll: {
    ...typography.bodyStrong,
    color: '#F84EA0',
    fontWeight: '600',
  },
  grid: {
    gap: spacing.md,
  },
  row: {
    gap: spacing.md,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
});
