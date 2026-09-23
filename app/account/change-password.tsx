import { Ionicons } from '@expo/vector-icons';
import { Text } from '@rneui/themed';
import { router } from 'expo-router';
import { Formik } from 'formik';
import React from 'react';
import {
  ActivityIndicator,
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

import { Skeleton } from '../../src/components/Skeleton';
import { useCommerce } from '../../src/context/CommerceContext';
import { radius, spacing, typography } from '../../src/design-system';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useChangePasswordMutation, useUserDetails } from '../../src/services/auth/hooks';

const validationSchema = yup.object().shape({
  oldPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords do not match')
    .required('Please confirm your new password'),
});

type FieldName = 'oldPassword' | 'newPassword' | 'confirmPassword';

const FIELD_CONFIG: Record<
  FieldName,
  {
    label: string;
    placeholder: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
  }
> = {
  oldPassword: {
    label: 'CURRENT PASSWORD',
    placeholder: 'Enter current password',
    icon: 'lock-closed-outline',
  },
  newPassword: {
    label: 'NEW PASSWORD',
    placeholder: 'Enter new password',
    icon: 'key-outline',
  },
  confirmPassword: {
    label: 'CONFIRM NEW PASSWORD',
    placeholder: 'Re-enter new password',
    icon: 'shield-checkmark-outline',
  },
};

function SignInPrompt() {
  const { colors } = useAppTheme();

  return (
    <View style={styles.centerContent}>
      <View style={[styles.stateIcon, { backgroundColor: colors.accentLight }]}>
        <Ionicons name='key-outline' size={40} color={colors.accent} />
      </View>
      <Text style={[styles.stateTitle, { color: colors.textPrimary }]}>Sign in required</Text>
      <Text style={[styles.stateSubtitle, { color: colors.textMuted }]}>
        Please sign in to change your password.
      </Text>
      <TouchableOpacity
        style={[styles.stateBtn, { backgroundColor: colors.accent }]}
        activeOpacity={0.8}
        onPress={() => router.replace('/(auth)/login')}
      >
        <Text style={styles.stateBtnText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ChangePasswordScreen() {
  const { colors } = useAppTheme();
  const { token, logout, authLoaded } = useCommerce();
  const { data: profile, isPending, isError, refetch } = useUserDetails(token);
  const changePasswordMutation = useChangePasswordMutation(token);
  const [focusedField, setFocusedField] = React.useState<FieldName | null>(null);
  const [visibleFields, setVisibleFields] = React.useState<Record<FieldName, boolean>>({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const toggleField = (field: FieldName) => {
    setVisibleFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (!profile?.id) {
      Alert.alert('Something went wrong', 'We could not verify your account. Please try again.');
      return;
    }

    changePasswordMutation.mutate(
      {
        id: profile.id,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          Alert.alert('Password Updated', 'Your password has been changed. Please sign in again.', [
            {
              text: 'OK',
              onPress: () => {
                logout();
                router.replace('/(auth)/login');
              },
            },
          ]);
        },
        onError: (error: any) => {
          Alert.alert('Change Failed', error?.message ?? 'Something went wrong. Please try again.');
        },
      }
    );
  };

  const header = (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.backBtn, { backgroundColor: colors.surfaceMuted }]}
        activeOpacity={0.6}
        accessibilityLabel='Go back'
      >
        <Ionicons name='chevron-back' size={20} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Change Password</Text>
      <View style={styles.backBtn} />
    </View>
  );

  if (!authLoaded) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        {header}
        <View style={styles.centerContent}>
          <ActivityIndicator size='large' color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!token) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        {header}
        <SignInPrompt />
      </SafeAreaView>
    );
  }

  if (isPending) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        {header}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.heroCard, { backgroundColor: colors.surface }]}>
            <Skeleton width={72} height={72} borderRadius={36} />
            <Skeleton width='55%' height={20} borderRadius={6} style={styles.skeletonTitle} />
            <Skeleton width='85%' height={14} borderRadius={4} style={styles.skeletonLine} />
            <Skeleton width={160} height={28} borderRadius={14} style={styles.skeletonChip} />
          </View>
          <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
            {[0, 1, 2].map((index) => (
              <View key={index} style={styles.skeletonFieldGroup}>
                <Skeleton width='40%' height={11} borderRadius={4} />
                <Skeleton width='100%' height={48} borderRadius={12} />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError || !profile) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        {header}
        <View style={styles.centerContent}>
          <View style={[styles.stateIcon, { backgroundColor: 'rgba(239, 68, 68, 0.08)' }]}>
            <Ionicons name='cloud-offline-outline' size={36} color={colors.danger} />
          </View>
          <Text style={[styles.stateTitle, { color: colors.textPrimary }]}>
            Couldn't load your account
          </Text>
          <Text style={[styles.stateSubtitle, { color: colors.textMuted }]}>
            Check your connection and try again.
          </Text>
          <TouchableOpacity
            style={[styles.stateBtn, { backgroundColor: colors.accent }]}
            activeOpacity={0.8}
            onPress={() => refetch()}
          >
            <Ionicons name='refresh' size={16} color='#fff' />
            <Text style={styles.stateBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {header}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          <View style={[styles.heroCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.heroIcon, { backgroundColor: colors.accentLight }]}>
              <Ionicons name='key-outline' size={34} color={colors.accent} />
            </View>
            <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
              Secure Your Account
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              Choose a strong password you haven't used here before.
            </Text>
            <View style={[styles.hintChip, { backgroundColor: colors.surfaceMuted }]}>
              <Ionicons name='information-circle-outline' size={14} color={colors.textMuted} />
              <Text style={[styles.hintText, { color: colors.textMuted }]}>
                Minimum 8 characters
              </Text>
            </View>
          </View>

          <Formik
            initialValues={{ oldPassword: '', newPassword: '', confirmPassword: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSave}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
                {(Object.keys(FIELD_CONFIG) as FieldName[]).map((field) => {
                  const config = FIELD_CONFIG[field];
                  const hasError = Boolean(touched[field] && errors[field]);
                  const isFocused = focusedField === field;

                  return (
                    <View key={field} style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                        {config.label}
                      </Text>
                      <View
                        style={[
                          styles.inputWrapper,
                          {
                            borderBottomColor: isFocused
                              ? colors.accent
                              : hasError
                                ? colors.danger
                                : colors.borderStrong,
                          },
                        ]}
                      >
                        <Ionicons
                          name={config.icon}
                          size={18}
                          color={isFocused ? colors.accent : colors.textSecondary}
                        />
                        <TextInput
                          style={[styles.input, { color: colors.textPrimary }]}
                          placeholder={config.placeholder}
                          placeholderTextColor={colors.textMuted}
                          value={values[field]}
                          onChangeText={handleChange(field)}
                          onFocus={() => setFocusedField(field)}
                          onBlur={(e) => {
                            handleBlur(field)(e);
                            setFocusedField(null);
                          }}
                          secureTextEntry={!visibleFields[field]}
                          autoCapitalize='none'
                          autoCorrect={false}
                        />
                        <TouchableOpacity
                          onPress={() => toggleField(field)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          accessibilityLabel={
                            visibleFields[field] ? 'Hide password' : 'Show password'
                          }
                        >
                          <Ionicons
                            name={visibleFields[field] ? 'eye-off-outline' : 'eye-outline'}
                            size={18}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                      {hasError && (
                        <Text style={[styles.errorText, { color: colors.danger }]}>
                          {errors[field]}
                        </Text>
                      )}
                    </View>
                  );
                })}

                <View style={styles.tipsRow}>
                  <Ionicons name='shield-checkmark-outline' size={14} color={colors.success} />
                  <Text style={[styles.tipsText, { color: colors.textMuted }]}>
                    You'll be signed out on this device after updating.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: colors.accent }]}
                  onPress={() => handleSubmit()}
                  disabled={changePasswordMutation.isPending}
                  activeOpacity={0.85}
                  accessibilityLabel='Update password'
                >
                  {changePasswordMutation.isPending ? (
                    <ActivityIndicator size='small' color='#FFFFFF' />
                  ) : (
                    <>
                      <Ionicons name='lock-closed-outline' size={17} color='#FFFFFF' />
                      <Text style={styles.submitButtonText}>Update Password</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(45, 37, 32, 0.06)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(45, 37, 32, 0.06)',
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  hintChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  hintText: {
    ...typography.caption,
  },
  formCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(45, 37, 32, 0.06)',
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
  tipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xxs,
  },
  tipsText: {
    ...typography.caption,
    flex: 1,
    lineHeight: 17,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg + 2,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  submitButtonText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 15,
    letterSpacing: 0.8,
    textTransform: 'none',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  stateIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  stateTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  stateSubtitle: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing['2xl'],
    paddingHorizontal: spacing.sm,
  },
  stateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  stateBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    textTransform: 'none',
  },
  skeletonTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  skeletonLine: {
    marginBottom: spacing.md,
  },
  skeletonChip: {
    marginTop: spacing.xs,
  },
  skeletonFieldGroup: {
    gap: spacing.xs,
  },
});
