import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@rneui/themed';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CommerceProvider } from '../src/context/CommerceContext';
import { lightColors } from '../src/design-system';
import QueryProvider from '../src/providers/QueryProvider';
import { useMemo } from 'react';

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
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <CommerceProvider>
          <AppThemeProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: lightColors.background },
              }}
            />
            <StatusBar style="auto" />
          </AppThemeProvider>
        </CommerceProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
