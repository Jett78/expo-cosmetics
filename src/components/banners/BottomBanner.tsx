import { Pressable, StyleSheet, View } from 'react-native';
import { ImageBackground } from 'expo-image';
import { useRouter } from 'expo-router';

import { spacing, radius } from '../../design-system';
import type { ApiBanner } from '../../types/banner';
import { resolveBannerLink } from '../../utils/resolveBannerLink';

type BottomBannerProps = {
  banners: ApiBanner[];
};

export default function BottomBanner({ banners }: BottomBannerProps) {
  const router = useRouter();

  if (banners.length === 0) return null;

  return (
    <View style={styles.container}>
      {banners.map((banner) => {
        const { route, params } = resolveBannerLink(banner.buttonLink);
        return (
          <Pressable
            key={banner.id}
            onPress={() => router.push({ pathname: route, params })}
          >
            <ImageBackground
              source={{ uri: banner.imageLink.original }}
              style={styles.bannerImage}
              contentFit="fill"
              imageStyle={styles.bannerImageRadius}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing['2xl'],
    marginHorizontal: spacing.xl,
    gap: spacing.md,
  },
  bannerImage: {
    width: '100%',
    height: 160,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  bannerImageRadius: {
    borderRadius: radius.lg,
  },
});
