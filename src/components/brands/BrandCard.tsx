import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';
import { Image } from 'expo-image';
import { Link } from 'expo-router';

import { spacing, radius, typography } from '../../design-system';
import type { ApiBrand } from '../../types/brand';

type BrandCardProps = {
  brand: ApiBrand;
};

export default function BrandCard({ brand }: BrandCardProps) {
  return (
    <Link href={`/brand/${brand.name.toLowerCase().replace(/\s+/g, '-')}`} asChild>
      <Pressable style={styles.container}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: brand.imageLink.original }}
            style={styles.image}
            contentFit="contain"
          />
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {brand.name}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
    gap: spacing.sm,
  },
  imageWrapper: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: '#F8F5F2',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 48,
    height: 48,
  },
  name: {
    ...typography.caption,
    fontSize: 12,
    textAlign: 'center',
  },
});
