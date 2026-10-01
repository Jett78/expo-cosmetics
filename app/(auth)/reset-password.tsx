import { Ionicons } from '@expo/vector-icons';
import { Text } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Formik } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
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
import { useForgotPasswordMutation, useResetPasswordMutation } from '../../src/services/auth/hooks';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

const validationSchema = yup.object().shape({
  newPassword: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your new password'),
});

type FormValues = { newPassword: string; confirmPassword: string };

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === 'string' ? params.email : undefined;

  const resetMutation = useResetPasswordMutation();
  const resendMutation = useForgotPasswordMutation();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [timer, setTimer] = useState(RESEND_COOLDOWN);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'newPassword' | 'confirmPassword' | null>(null);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (!email) {
      router.replace('/(auth)/forgot-password');
    }
  }, [email, router]);

  useEffect(() => {
    if (timer <= 0) return;
    const countdown = setTimeout(() => setTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(countdown);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, '');
    if (!digit && value !== '') return;

    setError('');
    const next = [...otp];

    if (digit.length > 1) {
      const pasted = digit.slice(-OTP_LENGTH).split('');
      for (let i = 0; i < OTP_LENGTH; i++) {
        next[i] = pasted[i] ?? '';
      }
      setOtp(next);
      const lastFilled = Math.min(pasted.length, OTP_LENGTH) - 1;
      inputRefs.current[Math.min(lastFilled + 1, OTP_LENGTH - 1)]?.focus();
      return;
    }

    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key !== 'Backspace' || otp[index] !== '') return;
    if (index > 0) {
      const prev = [...otp];
      prev[index - 1] = '';
      setOtp(prev);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const code = otp.join('');

  const handleReset = (values: FormValues) => {
    if (!email) return;
    if (code.length !== OTP_LENGTH) {
      setError('Please enter the 6-digit code.');
      return;
    }

    setError('');
    resetMutation.mutate(
      { email, otp: code, newPassword: values.newPassword },
      {
        onSuccess: () => {
          router.replace({
            pathname: '/(auth)/login',
            params: { reset: '1', email },
          });
        },
        onError: (err: any) => {
          setError(err?.message ?? 'Invalid or expired code. Please try again.');
        },
      }
    );
  };

  const handleResend = () => {
    if (!email || timer > 0 || resendMutation.isPending) return;
    resendMutation.mutate(email, {
      onSuccess: () => {
        setTimer(RESEND_COOLDOWN);
        setOtp(Array(OTP_LENGTH).fill(''));
        setError('');
        inputRefs.current[0]?.focus();
        Alert.alert('Code Sent', `A new 6-digit code has been sent to ${email}`);
      },
      onError: (err: any) => {
        Alert.alert('Resend Failed', err?.message ?? 'Please try again');
      },
    });
  };

  const getInputBorderColor = (
    field: 'newPassword' | 'confirmPassword',
    touched: boolean | undefined,
    errorText: string | undefined
  ) => {
    if (focusedField === field) return colors.accent;
    if (touched && errorText) return colors.danger;
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
          <Text style={styles.headerTitle}>Reset Password</Text>
          <Text style={styles.headerSubtitle}>
            Enter the code we sent to your email and choose a new password
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
          <Text style={[styles.sentTo, { color: colors.textSecondary }]}>Code sent to</Text>
          <Text style={[styles.emailText, { color: colors.textPrimary }]}>{email ?? ''}</Text>

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpBox,
                  {
                    color: colors.textPrimary,
                    borderColor: error
                      ? colors.danger
                      : focusedIndex === index
                        ? colors.accent
                        : colors.borderStrong,
                    backgroundColor: '#FFFFFF',
                  },
                ]}
                value={digit}
                onChangeText={(value) => handleChange(index, value)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                keyboardType='number-pad'
                maxLength={OTP_LENGTH}
                selectTextOnFocus
                caretHidden
              />
            ))}
          </View>

          <View style={styles.resendRow}>
            <Text style={[styles.resendText, { color: colors.textSecondary }]}>
              Didn't receive the code?{' '}
            </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={timer > 0 || resendMutation.isPending}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.resendLink,
                  {
                    color: timer > 0 || resendMutation.isPending ? colors.textMuted : colors.accent,
                  },
                ]}
              >
                {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}

          <Formik<FormValues>
            initialValues={{ newPassword: '', confirmPassword: '' }}
            validationSchema={validationSchema}
            onSubmit={handleReset}
          >
            {({
              handleChange: formikChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    NEW PASSWORD
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        borderBottomColor: getInputBorderColor(
                          'newPassword',
                          touched.newPassword,
                          errors.newPassword
                        ),
                      },
                    ]}
                  >
                    <Ionicons
                      name='lock-closed-outline'
                      size={18}
                      color={focusedField === 'newPassword' ? colors.accent : colors.textSecondary}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      placeholder='Min. 6 characters'
                      placeholderTextColor={colors.textMuted}
                      value={values.newPassword}
                      onChangeText={formikChange('newPassword')}
                      onFocus={() => setFocusedField('newPassword')}
                      onBlur={(e) => {
                        handleBlur('newPassword')(e);
                        setFocusedField(null);
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize='none'
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.newPassword && errors.newPassword && (
                    <Text style={[styles.fieldErrorText, { color: colors.danger }]}>
                      {errors.newPassword}
                    </Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    CONFIRM NEW PASSWORD
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        borderBottomColor: getInputBorderColor(
                          'confirmPassword',
                          touched.confirmPassword,
                          errors.confirmPassword
                        ),
                      },
                    ]}
                  >
                    <Ionicons
                      name='shield-checkmark-outline'
                      size={18}
                      color={
                        focusedField === 'confirmPassword' ? colors.accent : colors.textSecondary
                      }
                    />
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      placeholder='Re-enter your new password'
                      placeholderTextColor={colors.textMuted}
                      value={values.confirmPassword}
                      onChangeText={formikChange('confirmPassword')}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={(e) => {
                        handleBlur('confirmPassword')(e);
                        setFocusedField(null);
                      }}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize='none'
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text style={[styles.fieldErrorText, { color: colors.danger }]}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.resetButton, { backgroundColor: colors.accent }]}
                  onPress={() => handleSubmit()}
                  disabled={resetMutation.isPending}
                  activeOpacity={0.85}
                >
                  <Text style={styles.resetText}>
                    {resetMutation.isPending ? 'Resetting...' : 'Reset Password'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          <TouchableOpacity
            style={styles.changeEmailBtn}
            activeOpacity={0.7}
            onPress={() => router.replace('/(auth)/forgot-password')}
          >
            <Text style={[styles.changeEmailText, { color: colors.textSecondary }]}>
              Use a different email
            </Text>
          </TouchableOpacity>
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
    fontSize: 28,
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
  sentTo: {
    ...typography.body,
    textAlign: 'center',
  },
  emailText: {
    ...typography.bodyStrong,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  otpBox: {
    width: 46,
    height: 54,
    borderWidth: 1.5,
    borderRadius: radius.md,
    textAlign: 'center',
    ...typography.h2,
    fontSize: 22,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  resendText: {
    ...typography.body,
  },
  resendLink: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
  errorText: {
    ...typography.caption,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  form: {
    gap: spacing.lg,
    marginTop: spacing.lg,
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
  fieldErrorText: {
    ...typography.caption,
    paddingLeft: spacing.xs,
    marginTop: spacing.xxs,
  },
  resetButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg + 2,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  resetText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 15,
    letterSpacing: 0.8,
  },
  changeEmailBtn: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
    paddingVertical: spacing.xs,
  },
  changeEmailText: {
    ...typography.caption,
    textDecorationLine: 'underline',
  },
});
