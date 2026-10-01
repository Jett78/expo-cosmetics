import { Ionicons } from '@expo/vector-icons';
import { Text } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

import { radius, spacing, typography } from '../../src/design-system';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useResendOtpMutation, useVerifyEmailOtpMutation } from '../../src/services/auth/hooks';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === 'string' ? params.email : undefined;

  const verifyMutation = useVerifyEmailOtpMutation();
  const resendMutation = useResendOtpMutation();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [timer, setTimer] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (!email) {
      router.replace('/(auth)/register');
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

  const handleVerify = () => {
    if (!email) return;
    if (code.length !== OTP_LENGTH) {
      setError('Please enter the 6-digit code.');
      return;
    }

    setError('');
    verifyMutation.mutate(
      { email, otp: code },
      {
        onSuccess: () => {
          router.replace({
            pathname: '/(auth)/login',
            params: { email, verified: '1' },
          });
        },
        onError: (err: any) => {
          setError(err?.message ?? 'Invalid or expired OTP. Please try again.');
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
          <Text style={styles.headerTitle}>Verify Your Email</Text>
          <Text style={styles.headerSubtitle}>Enter the 6-digit code we sent to your email</Text>
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
          <View style={styles.body}>
            <View style={[styles.iconCircle, { backgroundColor: '#FDEBF3' }]}>
              <Ionicons name='mail-open-outline' size={30} color={colors.accent} />
            </View>

            <Text style={[styles.sentTo, { color: colors.textSecondary }]}>
              We sent a verification code to
            </Text>
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

            {error ? (
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.verifyButton, { backgroundColor: colors.accent }]}
              onPress={handleVerify}
              disabled={verifyMutation.isPending}
              activeOpacity={0.85}
            >
              <Text style={styles.verifyText}>
                {verifyMutation.isPending ? 'Verifying...' : 'Verify Email'}
              </Text>
            </TouchableOpacity>

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
                      color:
                        timer > 0 || resendMutation.isPending ? colors.textMuted : colors.accent,
                    },
                  ]}
                >
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.changeEmailBtn}
              activeOpacity={0.7}
              onPress={() => router.replace('/(auth)/register')}
            >
              <Text style={[styles.changeEmailText, { color: colors.textSecondary }]}>
                Use a different email
              </Text>
            </TouchableOpacity>
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
  body: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  sentTo: {
    ...typography.body,
  },
  emailText: {
    ...typography.bodyStrong,
    fontSize: 15,
    marginBottom: spacing.lg,
  },
  otpRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
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
  errorText: {
    ...typography.caption,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  verifyButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg + 2,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  verifyText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 15,
    letterSpacing: 0.8,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
  resendText: {
    ...typography.body,
  },
  resendLink: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
  changeEmailBtn: {
    marginTop: spacing.xl,
    paddingVertical: spacing.xs,
  },
  changeEmailText: {
    ...typography.caption,
    textDecorationLine: 'underline',
  },
});
