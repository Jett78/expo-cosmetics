import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@rneui/themed';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from '@expo-google-fonts/manrope/useFonts';
import { Manrope_200ExtraLight } from '@expo-google-fonts/manrope/200ExtraLight';
import { Manrope_300Light } from '@expo-google-fonts/manrope/300Light';
import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { Manrope_800ExtraBold } from '@expo-google-fonts/manrope/800ExtraBold';

import { CommerceProvider } from '../src/context/CommerceContext';
import { AppLoadingProvider } from '../src/context/AppLoadingContext';
import { TabBarVisibilityProvider } from '../src/context/TabBarVisibilityContext';
import { lightColors } from '../src/design-system';
import QueryProvider from '../src/providers/QueryProvider';
import { useMemo } from 'react';
import LoginModal from '../src/components/LoginModal';
import { useCommerce } from '../src/context/CommerceContext';

function LoginModalWrapper() {
  const { loginModalVisible, hideLoginModal } = useCommerce();

  return <LoginModal visible={loginModalVisible} onClose={hideLoginModal} />;
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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
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
                />
                <StatusBar style="auto" />
                <LoginModalWrapper />
              </AppThemeProvider>
            </TabBarVisibilityProvider>
          </CommerceProvider>
        </AppLoadingProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
