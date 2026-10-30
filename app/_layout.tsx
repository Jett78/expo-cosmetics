import { Manrope_200ExtraLight } from '@expo-google-fonts/manrope/200ExtraLight';
import { Manrope_300Light } from '@expo-google-fonts/manrope/300Light';
import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { Manrope_800ExtraBold } from '@expo-google-fonts/manrope/800ExtraBold';
import { useFonts } from '@expo-google-fonts/manrope/useFonts';
import { ThemeProvider } from '@rneui/themed';
import { BlurTargetView, type BlurViewProps } from 'expo-blur';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type RefObject,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginModal from '../src/components/LoginModal';
import PopupBannerModal from '../src/components/banners/PopupBannerModal';
import { AppLoadingProvider } from '../src/context/AppLoadingContext';
import { CommerceProvider } from '../src/context/CommerceContext';
import { useCommerce } from '../src/context/CommerceContext';
import { TabBarVisibilityProvider } from '../src/context/TabBarVisibilityContext';
import { lightColors } from '../src/design-system';
import QueryProvider from '../src/providers/QueryProvider';
import { useActiveBanners } from '../src/services/banner/hooks';
import { useNotificationNavigation, useNotifications } from '../src/services/notifications';
import type { NotificationData } from '../src/services/notifications';
import type { ApiBanner } from '../src/types/banner';

export const unstable_settings = {
  anchor: 'index',
};

function LoginModalWrapper() {
  const { loginModalVisible, hideLoginModal } = useCommerce();

  return <LoginModal visible={loginModalVisible} onClose={hideLoginModal} />;
}

let popupShownThisSession = false;

const POPUP_FIRST_DELAY_MS = 2000;
const POPUP_SWAP_DELAY_MS = 300;
const POPUP_COOLDOWN_MS = 12 * 60 * 60 * 1000;
const POPUP_LAST_SHOWN_KEY = 'popup_banner_last_shown_at';

function PopupBannerWrapper({ blurTarget }: { blurTarget: BlurViewProps['blurTarget'] }) {
  const { data: banners, isLoading } = useActiveBanners(10, 'POPUP');
  const [currentBanner, setCurrentBanner] = useState<ApiBanner | null>(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queueRef = useRef<ApiBanner[]>([]);
  const queueIndexRef = useRef(0);
  const startedRef = useRef(false);
  const mountedRef = useRef(true);

  const popupBanners = useMemo(
    () => (banners ?? []).filter((b) => b.type === 'POPUP'),
    [banners]
  );

  const showNextPopup = useCallback(() => {
    const next = queueRef.current[queueIndexRef.current];

    if (!next) {
      setCurrentBanner(null);
      setVisible(false);
      return;
    }

    queueIndexRef.current += 1;
    setCurrentBanner(next);
    setVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(showNextPopup, POPUP_SWAP_DELAY_MS);
  }, [showNextPopup]);

  useEffect(() => {
    if (startedRef.current || isLoading || popupBanners.length === 0 || popupShownThisSession) {
      return;
    }

    startedRef.current = true;

    const schedulePopup = async () => {
      try {
        const lastShownAt = Number(await AsyncStorage.getItem(POPUP_LAST_SHOWN_KEY));
        if (lastShownAt && Date.now() - lastShownAt < POPUP_COOLDOWN_MS) {
          return;
        }
      } catch {
        // storage unavailable – show anyway
      }

      if (!mountedRef.current) return;

      popupShownThisSession = true;
      timerRef.current = setTimeout(() => {
        queueRef.current = popupBanners;
        queueIndexRef.current = 0;
        AsyncStorage.setItem(POPUP_LAST_SHOWN_KEY, String(Date.now())).catch(() => {});
        showNextPopup();
      }, POPUP_FIRST_DELAY_MS);
    };

    schedulePopup();
  }, [isLoading, popupBanners, showNextPopup]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <PopupBannerModal
      visible={visible}
      banner={currentBanner}
      onClose={handleClose}
      blurTarget={blurTarget}
    />
  );
}

function NotificationSetup() {
  const router = useRouter();

  useNotifications();

  useNotificationNavigation((data: NotificationData) => {
    const orderId = typeof data.orderId === 'string' ? data.orderId : undefined;
    const deepLink = typeof data.deepLink === 'string' ? data.deepLink : undefined;

    if (deepLink) {
      router.push(deepLink as never);
      return;
    }

    if (orderId) {
      router.push(`/orders/${orderId}`);
    }
  });

  return null;
}

function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = 'light' as const;
  const colors = lightColors;

  const theme = useMemo(
    () => ({
      mode: mode as 'light' | 'dark',
      colors: {
        primary: colors.accent,
        secondary: colors.textSecondary,
        white: colors.surface,
        black: colors.textPrimary,
        grey0: colors.surfaceMuted,
        grey1: colors.surfaceMuted,
        grey2: colors.surfaceMuted,
        grey3: colors.surfaceMuted,
        grey4: colors.surfaceMuted,
        grey5: colors.surfaceMuted,
        greyOutline: colors.borderSubtle,
        searchBg: colors.surfaceMuted,
        success: colors.success,
        warning: colors.warning,
        error: colors.danger,
        disabled: colors.surfaceMuted,
        divider: colors.borderSubtle,
      },
    }),
    [mode, colors]
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_200ExtraLight,
    Manrope_300Light,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const blurTargetRef = useRef<ComponentRef<typeof BlurTargetView>>(null);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <BlurTargetView ref={blurTargetRef} style={{ flex: 1 }}>
        <QueryProvider>
          <AppLoadingProvider>
            <CommerceProvider>
              <TabBarVisibilityProvider>
                <AppThemeProvider>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: lightColors.background },
                    }}
                  >
                    <Stack.Screen
                      name='product/[slug]'
                      options={{ animation: 'slide_from_right' }}
                    />
                  </Stack>
                  <StatusBar style='dark' />
                  <LoginModalWrapper />
                  <PopupBannerWrapper blurTarget={blurTargetRef} />
                  <NotificationSetup />
                </AppThemeProvider>
              </TabBarVisibilityProvider>
            </CommerceProvider>
          </AppLoadingProvider>
        </QueryProvider>
      </BlurTargetView>
    </SafeAreaProvider>
  );
}
