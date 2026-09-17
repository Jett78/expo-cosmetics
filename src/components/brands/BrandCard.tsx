import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';

import { spacing, radius } from '../../design-system';
import type { ApiBrand } from '../../types/brand';

type BrandCardProps = {
  brand: ApiBrand;
};

export default function BrandCard({ brand }: BrandCardProps) {
  return (
    <Link href={`/(tabs)/explore?brandId=${brand.id}`} asChild>
      <Pressable style={styles.container}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: brand.imageLink.original }}
            style={styles.image}
            contentFit="contain"
          />
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  imageWrapper: {
    width: '100%',
    height: 80,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 56,
    height: 56,
  },
});
