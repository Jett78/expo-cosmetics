import { createTheme } from '@rneui/themed';
import { useMemo } from 'react';

import { darkColors, designTokens, lightColors } from '../design-system';
import { theme } from '../styles/Theme';

export const createAppTheme = (mode: 'light' | 'dark') => {
  const colors = mode === 'dark' ? darkColors : lightColors;

  return createTheme({
    ...theme,
    mode,
    components: {
      Text: {
        style: {
          color: colors.textPrimary,
        },
        h1Style: {
          ...designTokens.typography.h1,
          color: colors.textPrimary,
        },
        h2Style: {
          color: colors.textPrimary,
          fontWeight: '500',
        },
        h3Style: {
          ...designTokens.typography.caption,
          color: colors.textMuted,
          fontWeight: '400',
        },
        h4Style: {
          ...designTokens.typography.caption,
          color: colors.textSecondary,
        },
      },
      Button: {
        buttonStyle: {
          backgroundColor: colors.accent,
          borderRadius: designTokens.radius.pill,
          paddingVertical: designTokens.spacing.md,
        },
        containerStyle: {
          height: 48,
        },
        titleStyle: {
          ...designTokens.typography.button,
        },
      },
    },
  });
};

export const useAppThemeFactory = () => {
  const mode = 'light' as const;

  return useMemo(() => createAppTheme(mode), []);
};
