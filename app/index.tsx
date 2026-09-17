import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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

export default function SplashLayout() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

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

    // Phase 1: Fade in + scale up logo
    logoOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });

    // Phase 2: Fade out logo after 2s
    const fadeOutTimer = setTimeout(() => {
      logoOpacity.value = withTiming(0, { duration: 400, easing: Easing.in(Easing.cubic) });
    }, 2000);

    // Phase 3: Fade out screen after 2.5s
    const screenTimer = setTimeout(() => {
      screenOpacity.value = withTiming(0, { duration: 400, easing: Easing.in(Easing.cubic) });
    }, 2500);

    // Phase 4: Navigate after 3s
    const navigateTimer = setTimeout(() => {
      SplashScreen.hideAsync().then(() => {
        router.replace('/(tabs)');
      });
    }, 3000);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(screenTimer);
      clearTimeout(navigateTimer);
    };
  }, [ready]);

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
