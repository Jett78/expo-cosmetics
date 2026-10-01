import { Ionicons } from '@expo/vector-icons';
import { Text } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { Formik } from 'formik';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as yup from 'yup';

import { radius, spacing, typography } from '../../src/design-system';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useForgotPasswordMutation } from '../../src/services/auth/hooks';

const validationSchema = yup.object().shape({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
});

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSend = (values: { email: string }) => {
    forgotPasswordMutation.mutate(values.email, {
      onSuccess: () => {
        router.replace({
          pathname: '/(auth)/reset-password',
          params: { email: values.email },
        });
      },
      onError: (error: any) => {
        Alert.alert('Error', error?.message ?? 'Something went wrong. Please try again.');
      },
    });
  };

  const getInputBorderColor = (
    value: string | undefined,
    error: string | undefined,
    touched: boolean | undefined
  ) => {
    if (focusedField === 'email') return colors.accent;
    if (touched && error) return colors.danger;
    return colors.borderStrong;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={['#F84EA0', '#D63585', '#8B2252']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Ionicons name='arrow-back' size={22} color='rgba(255,255,255,0.9)' />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Forgot Password?</Text>
          <Text style={styles.headerSubtitle}>
            Enter your email and we'll send you a 6-digit reset code
          </Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          <View style={[styles.iconCircle, { backgroundColor: '#FDEBF3' }]}>
            <Ionicons name='key-outline' size={30} color={colors.accent} />
          </View>

          <Formik
            initialValues={{ email: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSend}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>EMAIL</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        borderBottomColor: getInputBorderColor(
                          values.email,
                          errors.email,
                          touched.email
                        ),
                      },
                    ]}
                  >
                    <Ionicons
                      name='mail-outline'
                      size={18}
                      color={focusedField === 'email' ? colors.accent : colors.textSecondary}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      placeholder='your@email.com'
                      placeholderTextColor={colors.textMuted}
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onFocus={() => setFocusedField('email')}
                      onBlur={(e) => {
                        handleBlur('email')(e);
                        setFocusedField(null);
                      }}
                      keyboardType='email-address'
                      autoCapitalize='none'
                      autoCorrect={false}
                    />
                  </View>
                  {touched.email && errors.email && (
                    <Text style={[styles.errorText, { color: colors.danger }]}>{errors.email}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.sendButton, { backgroundColor: colors.accent }]}
                  onPress={() => handleSubmit()}
                  disabled={forgotPasswordMutation.isPending}
                  activeOpacity={0.85}
                >
                  <Text style={styles.sendText}>
                    {forgotPasswordMutation.isPending ? 'Sending Code...' : 'Send Reset Code'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>

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
    backgroundColor: '#FDF8F6',
  },
  flex: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: spacing.lg,
    paddingBottom: spacing['4xl'],
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: radius['3xl'],
    borderBottomRightRadius: radius['3xl'],
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    marginTop: spacing['2xl'],
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h1,
    color: '#FFFFFF',
    fontSize: 30,
    letterSpacing: -0.4,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['4xl'],
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing['2xl'],
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    ...typography.label,
    letterSpacing: 1.2,
    paddingLeft: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    fontSize: 15,
  },
  errorText: {
    ...typography.caption,
    paddingLeft: spacing.xs,
    marginTop: spacing.xxs,
  },
  sendButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg + 2,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  sendText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 15,
    letterSpacing: 0.8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing['3xl'],
  },
  footerText: {
    ...typography.body,
  },
  footerLink: {
    ...typography.bodyStrong,
    fontSize: 15,
  },
});
