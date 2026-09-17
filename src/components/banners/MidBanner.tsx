import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ImageBackground } from 'expo-image';
import { useRouter } from 'expo-router';

import { spacing, radius } from '../../design-system';
import type { ApiBanner } from '../../types/banner';
import { resolveBannerLink } from '../../utils/resolveBannerLink';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAP = 12;
const ITEM_WIDTH = SCREEN_WIDTH - 32 - GAP;

type MidBannerProps = {
  banners: ApiBanner[];
};

export default function MidBanner({ banners }: MidBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        flatListRef.current?.scrollToOffset({ offset: next * (ITEM_WIDTH + GAP), animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + GAP}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (ITEM_WIDTH + GAP));
          setActiveIndex(index);
        }}
        renderItem={({ item }) => {
          const { route, params } = resolveBannerLink(item.buttonLink);
          return (
            <Pressable
              onPress={() => router.push({ pathname: route, params })}
              style={{ marginRight: GAP }}
            >
              <ImageBackground
                source={{ uri: item.imageLink.original }}
                style={[styles.bannerImage, { width: ITEM_WIDTH }]}
                contentFit="fill"
                imageStyle={styles.bannerImageRadius}
              />
            </Pressable>
          );
        }}
        keyExtractor={(item) => item.id}
      />
      {banners.length > 1 && (
        <View style={styles.dots}>
          {banners.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing['2xl'],
    marginHorizontal: spacing.xl,
  },
  bannerImage: {
    height: 180,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  bannerImageRadius: {
    borderRadius: radius.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#F84EA0',
  },
});
