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
import { Text } from '@rneui/themed';
import { Link } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';

import AnimatedTextInput from '../../src/components/AnimatedInput';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { radius, spacing, typography } from '../../src/design-system';

const forgotSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

export default function ForgotPasswordScreen() {
  const { colors } = useAppTheme();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.brand, { color: colors.textPrimary }]}>GLOW</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Reset Password</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Enter your email and we'll send you a link to reset your password
        </Text>

        <Formik
          initialValues={{ email: '' }}
          validationSchema={forgotSchema}
          onSubmit={(values) => {
            Alert.alert('Reset Link Sent', `A password reset link has been sent to ${values.email}.`);
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <AnimatedTextInput
                placeholder="Email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                isError={touched.email && Boolean(errors.email)}
                errorText={errors.email}
                textInputProps={{
                  keyboardType: 'email-address',
                  autoCapitalize: 'none',
                  autoCorrect: false,
                }}
              />

              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.accent }]}
                activeOpacity={0.8}
                onPress={() => handleSubmit()}
              >
                <Text style={styles.buttonText}>Send Reset Link</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        <Link href="/login" asChild>
          <TouchableOpacity style={styles.backLink}>
            <Text style={{ color: colors.accent, ...typography.bodyStrong }}>Back to Sign In</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['4xl'],
  },
  brand: {
    fontSize: typography.display.fontSize,
    fontWeight: typography.display.fontWeight,
    letterSpacing: typography.display.letterSpacing,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing['3xl'],
    lineHeight: 22,
  },
  form: {
    gap: spacing.md,
  },
  button: {
    height: 56,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  buttonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  backLink: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
});
