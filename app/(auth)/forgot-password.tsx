import { Ionicons } from '@expo/vector-icons';
import { Text } from '@rneui/themed';
import { Link, useRouter } from 'expo-router';
import { Formik } from 'formik';
import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as yup from 'yup';
import { apiPost } from '../../src/lib/api-client';

import AnimatedTextInput from '../../src/components/AnimatedInput';
import AppButton from '../../src/components/common/AppButton';
import { radius, spacing, typography } from '../../src/design-system';
import { useAppTheme } from '../../src/hooks/useAppTheme';

const validationSchema = yup.object().shape({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
});

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [sent, setSent] = React.useState(false);

  const handleSend = (values: { email: string }) => {
    apiPost('/auth/forgot-password', values)
      .then(() => {
        setSent(true);
      })
      .catch((error: any) => {
        Alert.alert('Error', error?.message ?? 'Something went wrong. Please try again.');
      });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name='arrow-back' size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Forgot Password?</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          {sent ? (
            <View style={styles.successContainer}>
              <View style={[styles.successIcon, { backgroundColor: colors.accentLight }]}>
                <Ionicons name='mail-open-outline' size={48} color={colors.accent} />
              </View>
              <Text style={[styles.successTitle, { color: colors.textPrimary }]}>
                Check Your Email
              </Text>
              <Text style={[styles.successText, { color: colors.textSecondary }]}>
                We've sent a password reset link to your email address.
              </Text>
              <AppButton
                title='Back to Sign In'
                onPress={() => router.replace('/(auth)/login')}
                containerStyle={styles.successButton}
              />
            </View>
          ) : (
            <Formik
              initialValues={{ email: '' }}
              validationSchema={validationSchema}
              onSubmit={handleSend}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View style={styles.form}>
                  <AnimatedTextInput
                    placeholder='Email'
                    value={values.email}
                    textInputProps={{
                      keyboardType: 'email-address',
                      autoCapitalize: 'none',
                    }}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    isError={touched.email && !!errors.email}
                    errorText={errors.email}
                  />

                  <View style={styles.buttonSpacer} />

                  <AppButton title='Send Reset Link' onPress={() => handleSubmit()} />
                </View>
              )}
            </Formik>
          )}

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Remember your password?{' '}
            </Text>
            <Link href='/(auth)/login' asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={[styles.footerLink, { color: colors.accent }]}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing['3xl'],
  },
  title: {
    ...typography.display,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    lineHeight: 22,
  },
  form: {
    gap: spacing.xs,
  },
  buttonSpacer: {
    marginTop: spacing.lg,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    ...typography.h1,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successText: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  successButton: {
    marginTop: spacing['2xl'],
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing['3xl'],
  },
  footerText: {
    ...typography.body,
  },
  footerLink: {
    ...typography.bodyStrong,
  },
});
