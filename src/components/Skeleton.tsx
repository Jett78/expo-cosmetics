import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
};

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const { colors } = useAppTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surfaceMuted,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ProductCardSkeleton({ width = 155 }: { width?: number }) {
  return (
    <View style={{ width }}>
      <Skeleton width={width} height={180} borderRadius={12} />
      <Skeleton width={width * 0.5} height={12} borderRadius={4} style={{ marginTop: 8 }} />
      <Skeleton width={width * 0.8} height={14} borderRadius={4} style={{ marginTop: 6 }} />
      <Skeleton width={width * 0.4} height={14} borderRadius={4} style={{ marginTop: 4 }} />
    </View>
  );
}

export function CategorySkeleton() {
  return (
    <View style={{ width: 100 }}>
      <Skeleton width={100} height={90} borderRadius={16} />
      <Skeleton width={60} height={12} borderRadius={4} style={{ marginTop: 8, alignSelf: 'center' }} />
    </View>
  );
}

export function BannerSkeleton({ height = 200 }: { height?: number }) {
  return <Skeleton width="100%" height={height} borderRadius={16} />;
}

export function BlogCardSkeleton() {
  return (
    <View>
      <Skeleton width="100%" height={160} borderRadius={12} />
      <Skeleton width="60%" height={12} borderRadius={4} style={{ marginTop: 8 }} />
      <Skeleton width="80%" height={14} borderRadius={4} style={{ marginTop: 6 }} />
    </View>
  );
}

export function BrandSkeleton() {
  return (
    <View style={{ width: 80, alignItems: 'center' }}>
      <Skeleton width={80} height={80} borderRadius={40} />
      <Skeleton width={50} height={10} borderRadius={4} style={{ marginTop: 6 }} />
    </View>
  );
}

const styles = StyleSheet.create({});
