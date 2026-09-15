import { Link, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';

import { lightColors, spacing, radius, typography } from '../src/design-system';

export default function NotFoundScreen() {
  const { path } = useLocalSearchParams<{ path: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page not found</Text>
      <Text style={styles.subtitle}>
        {path ? `The path "${path}" doesn't exist.` : "This screen doesn't exist."}
      </Text>
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Go to Home</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightColors.background,
    padding: spacing['2xl'],
  },
  title: {
    ...typography.h1,
    color: lightColors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: lightColors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  link: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: lightColors.accent,
    borderRadius: radius.full,
  },
  linkText: {
    ...typography.button,
    color: lightColors.textInverse,
  },
});
