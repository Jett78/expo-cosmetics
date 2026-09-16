import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { spacing, radius } from '../../design-system';
import type { ApiBanner } from '../../types/banner';
import { resolveBannerLink } from '../../utils/resolveBannerLink';

type MidBannerProps = {
  banner: ApiBanner;
};

export default function MidBanner({ banner }: MidBannerProps) {
  const router = useRouter();
  const { route, params } = resolveBannerLink(banner.buttonLink);

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.push({ pathname: route, params })}>
        <Image
          source={{ uri: banner.imageLink.original }}
          style={styles.image}
          contentFit="cover"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.xl,
    marginTop: spacing['2xl'],
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
  },
});
