import { useIsFocused, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useAppTheme } from '../hooks/useAppTheme';

/** Route group that owns the tab screens (`app/(tabs)`). */
const TAB_GROUP_SEGMENT = '(tabs)';
const ANIMATION_DURATION = 320;

/** Edge the screen enters from when it becomes the active tab. */
export type TabScreenDirection = 'left' | 'right' | 'bottom';

type TabScreenTransitionProps = {
  children: React.ReactNode;
  direction?: TabScreenDirection;
};

/**
 * Wraps a tab screen so it slides in from the given edge whenever it becomes
 * the active tab.
 *
 * Bottom tabs detach the outgoing scene instantly, so the incoming scene is the
 * only one that can animate. When this screen loses focus to a route outside of
 * the tabs group (e.g. a pushed product page) it stays parked in place, which
 * keeps the underlying content stable during the push/pop transition.
 */
export default function TabScreenTransition({
  children,
  direction = 'bottom',
}: TabScreenTransitionProps) {
  const { colors } = useAppTheme();
  const isFocused = useIsFocused();
  const segments = useSegments();
  const { width, height } = useWindowDimensions();
  const progress = useSharedValue(1);

  const isCoveredByStackRoute = segments.length > 0 && segments[0] !== TAB_GROUP_SEGMENT;

  useEffect(() => {
    if (isFocused) {
      progress.value = withTiming(0, {
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
      });
    } else if (!isCoveredByStackRoute) {
      // Hidden behind another tab: park off-screen so the next visit animates in.
      progress.value = 1;
    }
  }, [isFocused, isCoveredByStackRoute]);

  const animatedStyle = useAnimatedStyle(() => {
    if (direction === 'left') {
      return { transform: [{ translateX: -progress.value * width }] };
    }
    if (direction === 'right') {
      return { transform: [{ translateX: progress.value * width }] };
    }
    return { transform: [{ translateY: progress.value * height }] };
  });

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.fill, animatedStyle]}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});

/** Wraps a screen export so its root is animated by `TabScreenTransition`. */
export function withTabScreenTransition<P extends object>(
  Component: React.ComponentType<P>,
  direction?: TabScreenDirection
) {
  const Wrapped = (props: P) => (
    <TabScreenTransition direction={direction}>
      <Component {...props} />
    </TabScreenTransition>
  );

  Wrapped.displayName = `withTabScreenTransition(${Component.displayName ?? 'Screen'})`;
  return Wrapped;
}
