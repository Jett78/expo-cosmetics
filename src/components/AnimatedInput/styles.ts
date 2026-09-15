import { Platform, StyleSheet } from 'react-native';
import { shadows, spacing, typography } from '../../design-system';

export const styles = (
  paddingVertical: number = 0,
  borderWidth: number = 1,
  borderRadius: number = 12,
  borderColor: string = 'transparent',
  marginBottom: number = 12,
  backgroundColor?: string,
  textColor?: string
) =>
  StyleSheet.create({
    textInput: {
      paddingVertical: paddingVertical,
      justifyContent: 'center',
      borderWidth: borderWidth,
      borderRadius: borderRadius,
      borderColor: borderColor,
      backgroundColor,
      marginBottom: marginBottom,
      ...shadows.sm,
    },
    textInputStyle: {
      ...typography.body,
      color: textColor,
      paddingHorizontal: spacing.md,
      paddingBottom: Platform.OS === 'ios' ? 8.3 / 2 : 0,
      paddingVertical: Platform.OS === 'ios' ? 8.3 / 2 : 0,
      textAlignVertical: 'center',
      width: '100%',
    },
    textInputLabelWrapper: {
      position: 'absolute',
      left: spacing.md,
      zIndex: 10,
      bottom: 0,
      top: 0,
      justifyContent: 'center',
    },
    icon: {
      position: 'absolute',
      right: spacing.md,
    },
    errorText: {
      marginTop: spacing.xxs,
      textAlign: 'center',
    },
  });
