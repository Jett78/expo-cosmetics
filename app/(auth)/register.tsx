import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '@rneui/themed';
import { Link, router } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';

import AnimatedTextInput from '../../src/components/AnimatedInput';
import { useCommerce } from '../../src/context/CommerceContext';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { radius, spacing, typography } from '../../src/design-system';

const registerSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export default function RegisterScreen() {
  const { register } = useCommerce();
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
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Create Account</Text>

        <Formik
          initialValues={{ name: '', email: '', password: '' }}
          validationSchema={registerSchema}
          onSubmit={(values) => {
            register(values.email, values.name);
            router.replace('/(tabs)');
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <AnimatedTextInput
                placeholder="Name"
                value={values.name}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                isError={touched.name && Boolean(errors.name)}
                errorText={errors.name}
                textInputProps={{
                  autoCapitalize: 'words',
                  autoCorrect: false,
                }}
              />

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

              <AnimatedTextInput
                placeholder="Password"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                isError={touched.password && Boolean(errors.password)}
                errorText={errors.password}
                textInputProps={{
                  secureTextEntry: true,
                }}
              />

              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.accent }]}
                activeOpacity={0.8}
                onPress={() => handleSubmit()}
              >
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        <Link href="/login" asChild>
          <TouchableOpacity style={styles.footer}>
            <Text style={{ color: colors.textSecondary, ...typography.body }}>
              Already have an account?{' '}
            </Text>
            <Text style={{ color: colors.accent, ...typography.bodyStrong }}>Sign In</Text>
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
  subtitle: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: spacing['3xl'],
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing['2xl'],
  },
});
