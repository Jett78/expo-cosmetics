import { Ionicons } from '@expo/vector-icons';
import { Text } from '@rneui/themed';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';

import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
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

import SvgIcon from '../../src/components/SvgIcon';
import { useCommerce } from '../../src/context/CommerceContext';
import { radius, spacing, typography } from '../../src/design-system';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useGoogleAuthMutation, useLoginMutation } from '../../src/services/auth/hooks';
import { resolveAvatarUrl } from '../../src/services/auth/api';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';

const validationSchema = yup.object().shape({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { login } = useCommerce();
  const loginMutation = useLoginMutation();
  const googleAuthMutation = useGoogleAuthMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    redirectUri: makeRedirectUri({ scheme: 'la-cosmetics' }),
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      googleAuthMutation.mutate(
        { idToken: id_token },
        {
          onSuccess: (data) => {
            login(
              data.data.email,
              data.data.name,
              data.data.token,
              resolveAvatarUrl(data.data.avatar, data.data.avatarLink)
            );
            router.replace('/(tabs)');
          },
          onError: (error: any) => {
            Alert.alert('Google Sign In Failed', error?.message ?? 'Please try again');
          },
        }
      );
    }
  }, [response]);

  const handleLogin = (values: { email: string; password: string }) => {
    loginMutation.mutate(values, {
      onSuccess: (data) => {
        login(
          data.data.email,
          data.data.name,
          data.data.token,
          resolveAvatarUrl(data.data.avatar, data.data.avatarLink)
        );
        router.replace('/(tabs)');
      },
      onError: (error: any) => {
        Alert.alert('Login Failed', error?.message ?? 'Invalid email or password');
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
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>Sign in to continue shopping your favorites</Text>
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
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>EMAIL</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        borderBottomColor:
                          focusedField === 'email'
                            ? colors.accent
                            : touched.email && errors.email
                              ? colors.danger
                              : colors.borderStrong,
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

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>PASSWORD</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        borderBottomColor:
                          focusedField === 'password'
                            ? colors.accent
                            : touched.password && errors.password
                              ? colors.danger
                              : colors.borderStrong,
                      },
                    ]}
                  >
                    <Ionicons
                      name='lock-closed-outline'
                      size={18}
                      color={focusedField === 'password' ? colors.accent : colors.textSecondary}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      placeholder='Enter your password'
                      placeholderTextColor={colors.textMuted}
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onFocus={() => setFocusedField('password')}
                      onBlur={(e) => {
                        handleBlur('password')(e);
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
                  {touched.password && errors.password && (
                    <Text style={[styles.errorText, { color: colors.danger }]}>
                      {errors.password}
                    </Text>
                  )}
                </View>

                <Link href='/(auth)/forgot-password' asChild>
                  <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
                    <Text style={[styles.forgotText, { color: colors.accent }]}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </Link>

                <TouchableOpacity
                  style={[styles.signInButton, { backgroundColor: colors.accent }]}
                  onPress={() => handleSubmit()}
                  disabled={loginMutation.isPending}
                  activeOpacity={0.85}
                >
                  {loginMutation.isPending ? (
                    <Text style={styles.signInText}>Signing In...</Text>
                  ) : (
                    <Text style={styles.signInText}>Sign In</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          <View style={styles.orContainer}>
            <View style={[styles.orLine, { backgroundColor: colors.borderStrong }]} />
            <Text style={[styles.orText, { color: colors.textMuted }]}>or</Text>
            <View style={[styles.orLine, { backgroundColor: colors.borderStrong }]} />
          </View>

          <TouchableOpacity
            style={[styles.googleBtn, { borderColor: colors.borderStrong }]}
            onPress={() => promptAsync()}
            disabled={!request || googleAuthMutation.isPending}
            activeOpacity={0.7}
          >
            <SvgIcon name='google' width={20} height={20} />
            <Text style={[styles.googleBtnText, { color: colors.textPrimary }]}>
              {googleAuthMutation.isPending ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={[styles.bottomText, { color: colors.textSecondary }]}>New here? </Text>
            <Link href='/(auth)/register' asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={[styles.bottomLink, { color: colors.accent }]}>Create Account</Text>
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -spacing.xs,
  },
  forgotText: {
    ...typography.captionLarge,
    fontWeight: '600',
  },
  signInButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg + 2,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  signInText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 15,
    letterSpacing: 0.8,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing['2xl'],
    gap: spacing.md,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  orText: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1.2,
    backgroundColor: '#FFFFFF',
    gap: spacing.md,
  },
  googleBtnText: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing['3xl'],
    alignItems: 'center',
  },
  bottomText: {
    ...typography.body,
  },
  bottomLink: {
    ...typography.bodyStrong,
    fontSize: 15,
  },
});
