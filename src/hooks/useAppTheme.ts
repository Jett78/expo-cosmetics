import { type ThemeMode, designTokens, getThemeColors } from '../design-system';

export const useAppTheme = (modeOverride?: ThemeMode) => {
  const mode = modeOverride ?? 'light';

  return {
    colors: getThemeColors(mode),
    mode,
    tokens: designTokens,
  };
};
