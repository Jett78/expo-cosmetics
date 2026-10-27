import { useEffect, useState, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { lightColors } from '../src/design-system';
import { queryClient } from '../src/providers/QueryProvider';
import { prefetchHomepageData } from '../src/services/homepage/prefetch';

export default function SplashLayout() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const navigationTriggered = useRef(false);

  const scale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: logoOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  useEffect(() => {
    SplashScreen.preventAutoHideAsync().then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;

    prefetchHomepageData(queryClient).then(() => setDataReady(true));

    logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [ready]);

  useEffect(() => {
    if (!dataReady || navigationTriggered.current) return;

    navigationTriggered.current = true;

    screenOpacity.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.cubic) });

    setTimeout(() => {
      SplashScreen.hideAsync().then(() => {
        router.replace('/(tabs)');
      });
    }, 300);
  }, [dataReady]);

  if (!ready) return null;

  return (
    <Animated.View style={[styles.container, { backgroundColor: lightColors.background }, containerStyle]}>
      <Animated.View style={animatedLogoStyle}>
        <Image
          source={require('../assets/la-cos.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 220,
    height: 90,
  },
});
