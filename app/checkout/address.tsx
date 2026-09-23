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
import {
  useCreateShippingAddress,
  useDeleteShippingAddress,
  useShippingAddresses,
} from '../../src/services/shipping-address/hooks';
import type { ShippingAddress } from '../../src/types/shipping-address';

const validationSchema = yup.object().shape({
  fullName: yup
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  phone: yup
    .string()
    .trim()
    .matches(/^[0-9]{7,15}$/, 'Enter a valid phone number')
    .required('Phone is required'),
  street: yup.string().trim().required('Street is required'),
  city: yup.string().trim().required('City is required'),
  state: yup.string().trim().required('State is required'),
  zipCode: yup.string().trim().required('ZIP code is required'),
  country: yup.string().trim().required('Country is required'),
});

const initialValues = {
  fullName: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'Nepal',
};

type FormFieldName = keyof typeof initialValues;

type FormField = {
  name: FormFieldName;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  placeholder: string;
  autoCapitalize: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType: 'default' | 'phone-pad' | 'number-pad';
};

const formFields: FormField[] = [
  {
    name: 'fullName',
    label: 'FULL NAME',
    icon: 'person-outline',
    placeholder: 'Receiver full name',
    autoCapitalize: 'words',
    keyboardType: 'default',
  },
  {
    name: 'phone',
    label: 'PHONE',
    icon: 'call-outline',
    placeholder: '98XXXXXXXX',
    autoCapitalize: 'none',
    keyboardType: 'phone-pad',
  },
  {
    name: 'street',
    label: 'STREET',
    icon: 'home-outline',
    placeholder: 'House no, street, tole',
    autoCapitalize: 'words',
    keyboardType: 'default',
  },
  {
    name: 'city',
    label: 'CITY / DISTRICT',
    icon: 'business-outline',
    placeholder: 'e.g. BHAKTAPUR',
    autoCapitalize: 'characters',
    keyboardType: 'default',
  },
  {
    name: 'state',
    label: 'STATE / PROVINCE',
    icon: 'map-outline',
    placeholder: 'e.g. BAGMATI PROVINCE',
    autoCapitalize: 'characters',
    keyboardType: 'default',
  },
  {
    name: 'zipCode',
    label: 'ZIP CODE',
    icon: 'mail-outline',
    placeholder: 'e.g. 1111',
    autoCapitalize: 'none',
    keyboardType: 'number-pad',
  },
  {
    name: 'country',
    label: 'COUNTRY',
    icon: 'globe-outline',
    placeholder: 'Nepal',
    autoCapitalize: 'words',
    keyboardType: 'default',
  },
];

function AddressSkeleton() {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.addressCard, { backgroundColor: colors.surface }]}>
      <Skeleton width='45%' height={16} borderRadius={5} />
      <Skeleton width='70%' height={13} borderRadius={4} style={styles.skeletonGap} />
      <Skeleton width='85%' height={13} borderRadius={4} style={styles.skeletonGap} />
    </View>
  );
}

function SignInPrompt() {
  const { colors } = useAppTheme();

  return (
    <View style={styles.centerContent}>
      <View style={[styles.stateIcon, { backgroundColor: colors.accentLight }]}>
        <Ionicons name='location-outline' size={40} color={colors.accent} />
      </View>
      <Text style={[styles.stateTitle, { color: colors.textPrimary }]}>Sign in required</Text>
      <Text style={[styles.stateSubtitle, { color: colors.textMuted }]}>
        Please sign in to manage your shipping addresses.
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

export default function ShippingAddressScreen() {
  const { colors } = useAppTheme();
  const { token, authLoaded, selectedShippingAddress, setSelectedShippingAddress } = useCommerce();
  const { data: addresses, isPending, isError, refetch } = useShippingAddresses(token);
  const createMutation = useCreateShippingAddress(token);
  const deleteMutation = useDeleteShippingAddress(token);

  const [showForm, setShowForm] = React.useState(false);
  const [focusedField, setFocusedField] = React.useState<string | null>(null);

  const list = addresses ?? [];
  const selectedId =
    selectedShippingAddress && list.some((a) => a.id === selectedShippingAddress.id)
      ? selectedShippingAddress.id
      : null;

  React.useEffect(() => {
    if (list.length === 0) {
      setSelectedShippingAddress(null);
      return;
    }
    if (!selectedId) {
      setSelectedShippingAddress(list[0]);
    }
  }, [list, selectedId, setSelectedShippingAddress]);

  const handleSelect = (address: ShippingAddress) => {
    setSelectedShippingAddress(address);
  };

  const handleDelete = (address: ShippingAddress) => {
    Alert.alert(
      'Delete address',
      `Remove ${address.fullName}'s address from your saved addresses?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(address.id, {
              onError: (error: any) => {
                Alert.alert(
                  'Delete Failed',
                  error?.message ?? 'Something went wrong. Please try again.'
                );
              },
            });
          },
        },
      ]
    );
  };

  const handleCreate = (values: typeof initialValues, resetForm: () => void) => {
    createMutation.mutate(values, {
      onSuccess: (response) => {
        resetForm();
        setShowForm(false);
        setSelectedShippingAddress(response.data);
        Alert.alert('Address Added', 'Your shipping address has been saved.');
      },
      onError: (error: any) => {
        Alert.alert('Save Failed', error?.message ?? 'Something went wrong. Please try again.');
      },
    });
  };

  const header = (
    <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.backBtn, { backgroundColor: colors.surfaceMuted }]}
        activeOpacity={0.6}
        accessibilityLabel='Go back'
      >
        <Ionicons name='chevron-back' size={20} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Shipping Details</Text>
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
          <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
            Choose where your order will be delivered
          </Text>

          {isPending ? (
            <>
              <AddressSkeleton />
              <AddressSkeleton />
            </>
          ) : isError ? (
            <View style={styles.centerContent}>
              <View style={[styles.stateIcon, { backgroundColor: 'rgba(239, 68, 68, 0.08)' }]}>
                <Ionicons name='cloud-offline-outline' size={36} color={colors.danger} />
              </View>
              <Text style={[styles.stateTitle, { color: colors.textPrimary }]}>
                Couldn't load your addresses
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
          ) : list.length === 0 && !showForm ? (
            <View style={styles.centerContent}>
              <View style={[styles.stateIcon, { backgroundColor: colors.accentLight }]}>
                <Ionicons name='location-outline' size={40} color={colors.accent} />
              </View>
              <Text style={[styles.stateTitle, { color: colors.textPrimary }]}>
                No addresses yet
              </Text>
              <Text style={[styles.stateSubtitle, { color: colors.textMuted }]}>
                Add a shipping address so we know where to deliver your order.
              </Text>
              <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: colors.accent }]}
                activeOpacity={0.8}
                onPress={() => setShowForm(true)}
              >
                <Ionicons name='add' size={18} color='#fff' />
                <Text style={styles.retryBtnText}>Add Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {list.map((address) => {
                const isSelected = address.id === selectedId;
                return (
                  <TouchableOpacity
                    key={address.id}
                    activeOpacity={0.75}
                    onPress={() => handleSelect(address)}
                    style={[
                      styles.addressCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isSelected ? colors.accent : colors.borderSubtle,
                        borderWidth: isSelected ? 1.5 : StyleSheet.hairlineWidth,
                      },
                    ]}
                    accessibilityLabel={`Select shipping address for ${address.fullName}`}
                  >
                    <View style={styles.cardTop}>
                      <View style={styles.radioRow}>
                        <View
                          style={[
                            styles.radio,
                            { borderColor: isSelected ? colors.accent : colors.borderStrong },
                          ]}
                        >
                          {isSelected ? (
                            <View style={[styles.radioDot, { backgroundColor: colors.accent }]} />
                          ) : null}
                        </View>
                        <Text style={[styles.cardName, { color: colors.textPrimary }]}>
                          {address.fullName}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDelete(address)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        disabled={deleteMutation.isPending}
                        accessibilityLabel='Delete address'
                      >
                        <Ionicons name='trash-outline' size={18} color={colors.danger} />
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.cardLine, { color: colors.textSecondary }]}>
                      {address.phone}
                    </Text>
                    <Text style={[styles.cardLine, { color: colors.textSecondary }]}>
                      {address.street}
                    </Text>
                    <Text style={[styles.cardLine, { color: colors.textSecondary }]}>
                      {address.city}, {address.state} {address.zipCode}
                    </Text>
                    <Text style={[styles.cardLine, { color: colors.textSecondary }]}>
                      {address.country}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {!showForm && (
                <TouchableOpacity
                  style={[styles.addNewBtn, { borderColor: colors.borderStrong }]}
                  activeOpacity={0.7}
                  onPress={() => setShowForm(true)}
                >
                  <Ionicons name='add-circle-outline' size={20} color={colors.accent} />
                  <Text style={[styles.addNewBtnText, { color: colors.textPrimary }]}>
                    Add New Address
                  </Text>
                </TouchableOpacity>
              )}

              {showForm && (
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={(values, { resetForm }) => handleCreate(values, resetForm)}
                >
                  {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
                      <View style={styles.formHeader}>
                        <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
                          New Address
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowForm(false)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          accessibilityLabel='Close form'
                        >
                          <Ionicons name='close' size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                      </View>

                      {formFields.map((field) => {
                        const hasError = Boolean(touched[field.name] && errors[field.name]);
                        return (
                          <View key={field.name} style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                              {field.label}
                            </Text>
                            <View
                              style={[
                                styles.inputWrapper,
                                {
                                  borderBottomColor: hasError
                                    ? colors.danger
                                    : focusedField === field.name
                                      ? colors.accent
                                      : colors.borderStrong,
                                },
                              ]}
                            >
                              <Ionicons
                                name={field.icon}
                                size={18}
                                color={
                                  focusedField === field.name ? colors.accent : colors.textSecondary
                                }
                              />
                              <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                placeholder={field.placeholder}
                                placeholderTextColor={colors.textMuted}
                                value={values[field.name]}
                                onChangeText={handleChange(field.name)}
                                onFocus={() => setFocusedField(field.name)}
                                onBlur={(e) => {
                                  handleBlur(field.name)(e);
                                  setFocusedField(null);
                                }}
                                autoCapitalize={field.autoCapitalize}
                                keyboardType={field.keyboardType}
                                returnKeyType='next'
                              />
                            </View>
                            {hasError && (
                              <Text style={[styles.errorText, { color: colors.danger }]}>
                                {errors[field.name]}
                              </Text>
                            )}
                          </View>
                        );
                      })}

                      <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: colors.accent }]}
                        onPress={() => handleSubmit()}
                        disabled={createMutation.isPending}
                        activeOpacity={0.85}
                        accessibilityLabel='Save address'
                      >
                        {createMutation.isPending ? (
                          <ActivityIndicator size='small' color='#FFFFFF' />
                        ) : (
                          <>
                            <Ionicons name='checkmark' size={18} color='#FFFFFF' />
                            <Text style={styles.saveBtnText}>Save Address</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </Formik>
              )}
            </>
          )}
        </ScrollView>

        {!isPending && !isError && list.length > 0 && (
          <View
            style={[
              styles.footer,
              { backgroundColor: colors.surface, borderTopColor: colors.borderSubtle },
            ]}
          >
            <TouchableOpacity
              style={[styles.continueBtn, { backgroundColor: colors.accent }]}
              activeOpacity={0.85}
              disabled={!selectedId}
              onPress={() => router.push('/checkout/payment')}
              accessibilityLabel='Continue to payment'
            >
              <Text style={styles.continueBtnText}>Continue to Payment</Text>
              <Ionicons name='arrow-forward' size={18} color='#FFFFFF' />
            </TouchableOpacity>
          </View>
        )}
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
    paddingTop: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  sectionHint: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  addressCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardName: {
    ...typography.bodyStrong,
    flex: 1,
  },
  cardLine: {
    ...typography.captionLarge,
    lineHeight: 20,
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: spacing.xs,
  },
  addNewBtnText: {
    ...typography.bodyStrong,
  },
  formCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginTop: spacing.md,
    gap: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(45, 37, 32, 0.06)',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formTitle: {
    ...typography.h3,
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
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg + 2,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  saveBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 15,
    letterSpacing: 0.8,
    textTransform: 'none',
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 56,
    borderRadius: radius.lg,
  },
  continueBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 15,
    textTransform: 'none',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['4xl'],
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
  skeletonGap: {
    marginTop: spacing.sm,
  },
});
