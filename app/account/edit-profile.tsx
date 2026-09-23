import { Ionicons } from '@expo/vector-icons';
import { Text } from '@rneui/themed';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Formik } from 'formik';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { resolveAvatarUrl } from '../../src/services/auth/api';
import { useUpdateProfileMutation, useUserDetails } from '../../src/services/auth/hooks';
import { uploadImages } from '../../src/services/upload/api';

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name must be 60 characters or less')
    .required('Name is required'),
});

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function ProfileSkeleton() {
  const { colors } = useAppTheme();

  return (
    <View>
      <View style={[styles.heroCard, { backgroundColor: colors.surface }]}>
        <Skeleton width={96} height={96} borderRadius={48} />
        <Skeleton width='45%' height={20} borderRadius={6} style={styles.skeletonName} />
        <Skeleton width='60%' height={14} borderRadius={4} />
        <Skeleton width={88} height={26} borderRadius={13} style={styles.skeletonChip} />
      </View>

      <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
        <Skeleton width='30%' height={11} borderRadius={4} />
        <Skeleton width='100%' height={48} borderRadius={12} style={styles.skeletonField} />
        <Skeleton width='30%' height={11} borderRadius={4} />
        <Skeleton width='100%' height={48} borderRadius={12} style={styles.skeletonField} />
      </View>
    </View>
  );
}

function SignInPrompt() {
  const { colors } = useAppTheme();

  return (
    <View style={styles.centerContent}>
      <View style={[styles.stateIcon, { backgroundColor: colors.accentLight }]}>
        <Ionicons name='person-outline' size={40} color={colors.accent} />
      </View>
      <Text style={[styles.stateTitle, { color: colors.textPrimary }]}>Sign in required</Text>
      <Text style={[styles.stateSubtitle, { color: colors.textMuted }]}>
        Please sign in to view and edit your profile.
      </Text>
      <TouchableOpacity
        style={[styles.retryBtn, { backgroundColor: colors.accent }]}
        activeOpacity={0.8}
        onPress={() => router.replace('/(auth)/login')}
      >
        <Text style={styles.retryBtnText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

type PickedImage = {
  uri: string;
  name: string;
  type: string;
};

export default function EditProfileScreen() {
  const { colors } = useAppTheme();
  const { token, user, updateUser, authLoaded } = useCommerce();
  const { data: profile, isPending, isError, refetch } = useUserDetails(token);
  const updateMutation = useUpdateProfileMutation(token);
  const [focusedField, setFocusedField] = React.useState<string | null>(null);
  const [pickedImage, setPickedImage] = React.useState<PickedImage | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const isSaving = isUploading || updateMutation.isPending;
  const profileAvatar = resolveAvatarUrl(profile?.avatar, profile?.avatarLink);
  const avatarSource = pickedImage?.uri ?? profileAvatar ?? user?.avatar ?? null;

  React.useEffect(() => {
    if (!profile) return;
    const resolved = resolveAvatarUrl(profile.avatar, profile.avatarLink);
    if (resolved !== user?.avatar || profile.name !== user?.name || profile.email !== user?.email) {
      updateUser(profile.name, profile.email, resolved);
    }
  }, [profile, user?.avatar, user?.name, user?.email, updateUser]);

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'Please allow photo library access to change your avatar.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const manipulated = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 800 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );

      setPickedImage({
        uri: manipulated.uri,
        name: `avatar_${Date.now()}.jpg`,
        type: 'image/jpeg',
      });
    } catch {
      Alert.alert('Image selection failed', 'Please try another image.');
    }
  };

  const handleSave = async (values: { name: string }) => {
    let avatarUrl: string | null | undefined;

    if (pickedImage) {
      try {
        setIsUploading(true);
        const uploadResponse = await uploadImages([pickedImage], 'uploads/avatar', token as string);
        avatarUrl = uploadResponse.data?.[0]?.urls?.original ?? null;
        if (!avatarUrl) {
          throw new Error('Upload did not return an image URL.');
        }
      } catch (error: any) {
        Alert.alert(
          'Upload Failed',
          error?.message ?? "We couldn't upload your photo. Please try again."
        );
        return;
      } finally {
        setIsUploading(false);
      }
    }

    updateMutation.mutate(
      {
        name: values.name.trim(),
        ...(avatarUrl !== undefined ? { avatar: avatarUrl } : {}),
      },
      {
        onSuccess: (response) => {
          updateUser(
            response.data.name,
            response.data.email,
            resolveAvatarUrl(response.data.avatar, response.data.avatarLink)
          );
          setPickedImage(null);
          Alert.alert('Profile Updated', 'Your changes have been saved.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        },
        onError: (error: any) => {
          Alert.alert('Update Failed', error?.message ?? 'Something went wrong. Please try again.');
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
      <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Edit Profile</Text>
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
          <ProfileSkeleton />
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
            Couldn't load your profile
          </Text>
          <Text style={[styles.stateSubtitle, { color: colors.textMuted }]}>
            Check your connection and try again.
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.accent }]}
            activeOpacity={0.8}
            onPress={() => refetch()}
          >
            <Ionicons name='refresh' size={16} color='#fff' />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const roleLabel = profile.role?.[0]?.name
    ? profile.role[0].name.charAt(0) + profile.role[0].name.slice(1).toLowerCase()
    : null;

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
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePickImage}
              disabled={isSaving}
              style={styles.avatarPress}
              accessibilityLabel='Change profile photo'
            >
              <View style={[styles.avatarRing, { borderColor: colors.accent }]}>
                {avatarSource ? (
                  <Image source={{ uri: avatarSource }} style={styles.avatarImage} />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: colors.accentLight }]}>
                    <Text style={[styles.avatarText, { color: colors.accent }]}>
                      {getInitials(profile.name)}
                    </Text>
                  </View>
                )}
              </View>
              <View style={[styles.cameraBadge, { backgroundColor: colors.accent }]}>
                <Ionicons name='camera' size={15} color='#FFFFFF' />
              </View>
            </TouchableOpacity>

            <Text style={[styles.changePhotoHint, { color: colors.textMuted }]}>
              Tap photo to change
            </Text>

            <Text style={[styles.heroName, { color: colors.textPrimary }]} numberOfLines={1}>
              {profile.name}
            </Text>
            <Text style={[styles.heroEmail, { color: colors.textSecondary }]} numberOfLines={1}>
              {profile.email}
            </Text>

            {roleLabel ? (
              <View style={[styles.roleChip, { backgroundColor: colors.accent }]}>
                <Ionicons name='sparkles-outline' size={11} color={colors.textInverse} />
                <Text style={[styles.roleChipText, { color: colors.textInverse }]}>
                  {roleLabel}
                </Text>
              </View>
            ) : null}
          </View>

          <Formik
            enableReinitialize
            initialValues={{ name: profile.name }}
            validationSchema={validationSchema}
            onSubmit={handleSave}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    FULL NAME
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        borderBottomColor:
                          focusedField === 'name'
                            ? colors.accent
                            : touched.name && errors.name
                              ? colors.danger
                              : colors.borderStrong,
                      },
                    ]}
                  >
                    <Ionicons
                      name='person-outline'
                      size={18}
                      color={focusedField === 'name' ? colors.accent : colors.textSecondary}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      placeholder='Your full name'
                      placeholderTextColor={colors.textMuted}
                      value={values.name}
                      onChangeText={handleChange('name')}
                      onFocus={() => setFocusedField('name')}
                      onBlur={(e) => {
                        handleBlur('name')(e);
                        setFocusedField(null);
                      }}
                      autoCapitalize='words'
                      returnKeyType='done'
                    />
                  </View>
                  {touched.name && errors.name && (
                    <Text style={[styles.errorText, { color: colors.danger }]}>{errors.name}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>EMAIL</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      styles.disabledWrapper,
                      { borderBottomColor: colors.borderStrong },
                    ]}
                  >
                    <Ionicons name='lock-closed-outline' size={18} color={colors.textSecondary} />
                    <TextInput
                      style={[styles.input, styles.disabledInput, { color: colors.textMuted }]}
                      value={profile.email}
                      editable={false}
                      selectTextOnFocus={false}
                      autoCapitalize='none'
                    />
                  </View>
                  <Text style={[styles.helperText, { color: colors.textMuted }]}>
                    Email can't be changed here
                  </Text>
                </View>

                <View style={styles.buttonSpacer} />

                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: colors.accent }]}
                  onPress={() => handleSubmit()}
                  disabled={isSaving}
                  activeOpacity={0.85}
                  accessibilityLabel='Save profile changes'
                >
                  {isSaving ? (
                    <ActivityIndicator size='small' color='#FFFFFF' />
                  ) : (
                    <>
                      <Ionicons name='checkmark' size={18} color='#FFFFFF' />
                      <Text style={styles.saveButtonText}>
                        {pickedImage ? 'Upload & Save' : 'Save Changes'}
                      </Text>
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
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    padding: 4,
  },
  avatarPress: {
    marginBottom: spacing.sm,
  },
  avatar: {
    flex: 1,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(45, 37, 32, 0.04)',
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  changePhotoHint: {
    ...typography.caption,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  avatarText: {
    ...typography.h1,
    fontSize: 32,
    lineHeight: 38,
  },
  heroName: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  heroEmail: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  roleChipText: {
    ...typography.caption,
    fontWeight: '700',
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
  disabledWrapper: {
    opacity: 0.85,
  },
  input: {
    flex: 1,
    ...typography.body,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    fontSize: 15,
  },
  disabledInput: {
    opacity: 0.9,
  },
  errorText: {
    ...typography.caption,
    paddingLeft: spacing.xs,
    marginTop: spacing.xxs,
  },
  helperText: {
    ...typography.caption,
    paddingLeft: spacing.xs,
    marginTop: spacing.xxs,
  },
  buttonSpacer: {
    marginTop: spacing.sm,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg + 2,
    borderRadius: radius.pill,
  },
  saveButtonText: {
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
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  retryBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    textTransform: 'none',
  },
  skeletonName: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  skeletonChip: {
    marginTop: spacing.md,
  },
  skeletonField: {
    marginBottom: spacing.lg,
  },
});
