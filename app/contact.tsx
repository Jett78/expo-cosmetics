import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Formik } from 'formik';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as yup from 'yup';

import { Skeleton } from '../src/components/Skeleton';
import { radius, spacing, typography } from '../src/design-system';
import { useAppTheme } from '../src/hooks/useAppTheme';
import { useCreateContact } from '../src/services/contact/hooks';
import { useSiteSetting } from '../src/services/site-setting/hooks';
import type { SiteSetting } from '../src/types/site-setting';

type ContactFormValues = {
  name: string;
  email: string;
  phone: string;
  address: string;
  message: string;
};

const initialValues: ContactFormValues = {
  name: '',
  email: '',
  phone: '',
  address: '',
  message: '',
};

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name must be 60 characters or less')
    .required('Name is required'),
  email: yup.string().trim().email('Enter a valid email').required('Email is required'),
  phone: yup
    .string()
    .trim()
    .matches(/^[0-9+\-() ]{7,15}$/, 'Enter a valid phone number')
    .required('Phone is required'),
  address: yup.string().trim().max(120, 'Address must be 120 characters or less'),
  message: yup
    .string()
    .trim()
    .min(5, 'Message must be at least 5 characters')
    .max(1000, 'Message must be 1000 characters or less')
    .required('Message is required'),
});

type ContactRowData = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  onPress?: () => void;
};

function buildContactRows(
  setting: SiteSetting | undefined,
  openUrl: (url: string) => void
): ContactRowData[] {
  const rows: ContactRowData[] = [];

  if (setting?.address) {
    const address = setting.address;
    rows.push({
      icon: 'location-outline',
      label: 'Address',
      value: address,
      onPress: () => openUrl(`https://maps.google.com/?q=${encodeURIComponent(address)}`),
    });
  }

  if (setting?.phoneNumber) {
    const phone = setting.phoneNumber;
    rows.push({
      icon: 'call-outline',
      label: 'Phone',
      value: phone,
      onPress: () => openUrl(`tel:${phone.replace(/\s/g, '')}`),
    });
  }

  if (setting?.contactEmail) {
    const email = setting.contactEmail;
    rows.push({
      icon: 'mail-outline',
      label: 'Email',
      value: email,
      onPress: () => openUrl(`mailto:${email}`),
    });
  }

  if (setting?.whatsappNumber) {
    const digits = setting.whatsappNumber.replace(/\D/g, '');
    const international = digits.length === 10 ? `977${digits}` : digits;
    rows.push({
      icon: 'logo-whatsapp',
      label: 'WhatsApp',
      value: setting.whatsappNumber,
      onPress: () => openUrl(`https://wa.me/${international}`),
    });
  }

  return rows;
}

export default function ContactScreen() {
  const { colors } = useAppTheme();
  const {
    data: setting,
    isLoading: settingLoading,
    isError: settingError,
    refetch: refetchSetting,
  } = useSiteSetting();
  const createContact = useCreateContact();

  const [focusedField, setFocusedField] = React.useState<keyof ContactFormValues | null>(null);
  const [mapLoaded, setMapLoaded] = React.useState(false);

  const openUrl = React.useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) throw new Error('unsupported');
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open', 'This action is not available on your device right now.');
    }
  }, []);

  const contactRows = React.useMemo(() => buildContactRows(setting, openUrl), [setting, openUrl]);

  const mapHtml = React.useMemo(() => {
    if (!setting?.googleMap) return null;
    return `<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><style>html,body{margin:0;padding:0;height:100%;width:100%;overflow:hidden;background:#f2f2f2;}iframe{width:100%;height:100%;border:0;display:block;}</style></head><body>${setting.googleMap}</body></html>`;
  }, [setting?.googleMap]);

  const handleSubmit = (values: ContactFormValues, { resetForm }: { resetForm: () => void }) => {
    createContact.mutate(
      {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        address: values.address.trim() || undefined,
        message: values.message.trim(),
      },
      {
        onSuccess: (response) => {
          Alert.alert(
            'Message sent',
            response?.message || 'Thank you for reaching out. We will get back to you soon.'
          );
          resetForm();
          setFocusedField(null);
        },
        onError: (error) => {
          Alert.alert('Something went wrong', error?.message ?? 'Please try again in a moment.');
        },
      }
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceMuted }]}
          activeOpacity={0.6}
          accessibilityLabel='Go back'
        >
          <Ionicons name='chevron-back' size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Contact Us</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          <View style={[styles.introCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.introTitle, { color: colors.textPrimary }]}>
              We'd love to hear from you
            </Text>
            <Text style={[styles.introSubtitle, { color: colors.textSecondary }]}>
              Reach our team directly or send us a message and we will get back to you as soon as
              possible.
            </Text>
          </View>

          {settingLoading ? (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              {[0, 1, 2].map((item) => (
                <View key={item} style={styles.skeletonRow}>
                  <Skeleton width={40} height={40} borderRadius={20} />
                  <View style={styles.skeletonText}>
                    <Skeleton width='35%' height={11} borderRadius={4} />
                    <Skeleton width='70%' height={14} borderRadius={4} style={{ marginTop: 6 }} />
                  </View>
                </View>
              ))}
            </View>
          ) : settingError ? (
            <View style={[styles.card, styles.errorCard, { backgroundColor: colors.surface }]}>
              <Ionicons name='cloud-offline-outline' size={26} color={colors.danger} />
              <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
                Couldn't load contact details
              </Text>
              <TouchableOpacity
                style={[styles.smallBtn, { backgroundColor: colors.accent }]}
                activeOpacity={0.8}
                onPress={() => refetchSetting()}
              >
                <Ionicons name='refresh' size={14} color='#FFFFFF' />
                <Text style={styles.smallBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>GET IN TOUCH</Text>
                {contactRows.map((row, index) => {
                  const isLast = index === contactRows.length - 1;
                  const rowStyle = !isLast && {
                    borderBottomColor: colors.borderSubtle,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  };
                  const content = (
                    <>
                      <View style={[styles.rowIcon, { backgroundColor: colors.accentLight }]}>
                        <Ionicons name={row.icon} size={18} color={colors.accent} />
                      </View>
                      <View style={styles.rowText}>
                        <Text style={[styles.rowLabel, { color: colors.textMuted }]}>
                          {row.label.toUpperCase()}
                        </Text>
                        <Text style={[styles.rowValue, { color: colors.textPrimary }]}>
                          {row.value}
                        </Text>
                      </View>
                      {row.onPress ? (
                        <Ionicons name='chevron-forward' size={16} color={colors.textSecondary} />
                      ) : null}
                    </>
                  );

                  return row.onPress ? (
                    <TouchableOpacity
                      key={row.label}
                      style={[styles.infoRow, rowStyle]}
                      activeOpacity={0.7}
                      onPress={row.onPress}
                      accessibilityLabel={`${row.label}: ${row.value}`}
                    >
                      {content}
                    </TouchableOpacity>
                  ) : (
                    <View key={row.label} style={[styles.infoRow, rowStyle]}>
                      {content}
                    </View>
                  );
                })}
              </View>

              <View style={[styles.mapCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>VISIT US</Text>
                <View style={[styles.mapWrap, { backgroundColor: colors.surfaceMuted }]}>
                  {mapHtml ? (
                    <>
                      {!mapLoaded ? (
                        <Skeleton
                          width='100%'
                          height={240}
                          borderRadius={0}
                          style={styles.mapSkeleton}
                        />
                      ) : null}
                      <WebView
                        source={{ html: mapHtml }}
                        originWhitelist={['*']}
                        javaScriptEnabled
                        domStorageEnabled
                        scrollEnabled={false}
                        onLoadEnd={() => setMapLoaded(true)}
                        style={[styles.mapWebView, { opacity: mapLoaded ? 1 : 0 }]}
                      />
                    </>
                  ) : (
                    <View style={styles.mapFallback}>
                      <Ionicons name='map-outline' size={30} color={colors.textMuted} />
                      <Text style={[styles.mapFallbackText, { color: colors.textMuted }]}>
                        Map is unavailable right now.
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.directionsBtn, { borderColor: colors.borderStrong }]}
                  activeOpacity={0.8}
                  onPress={() =>
                    openUrl(
                      `https://maps.google.com/?q=${encodeURIComponent(
                        setting?.address ?? setting?.siteName ?? 'L.A. Cosmetics Nepal'
                      )}`
                    )
                  }
                >
                  <Ionicons name='navigate-outline' size={16} color={colors.accent} />
                  <Text style={[styles.directionsText, { color: colors.accent }]}>
                    Get Directions
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SEND A MESSAGE</Text>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, setFieldValue, setFieldTouched, submitForm }) => (
                <View style={styles.form}>
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
                      onChangeText={(text) => setFieldValue('name', text)}
                      onBlur={() => {
                        setFieldTouched('name', true);
                        setFocusedField(null);
                      }}
                      onFocus={() => setFocusedField('name')}
                      autoCapitalize='words'
                    />
                  </View>
                  {touched.name && errors.name ? (
                    <Text style={[styles.errorText, { color: colors.danger }]}>{errors.name}</Text>
                  ) : null}

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
                      placeholder='you@example.com'
                      placeholderTextColor={colors.textMuted}
                      value={values.email}
                      onChangeText={(text) => setFieldValue('email', text)}
                      onBlur={() => {
                        setFieldTouched('email', true);
                        setFocusedField(null);
                      }}
                      onFocus={() => setFocusedField('email')}
                      keyboardType='email-address'
                      autoCapitalize='none'
                    />
                  </View>
                  {touched.email && errors.email ? (
                    <Text style={[styles.errorText, { color: colors.danger }]}>
                      {errors.email}
                    </Text>
                  ) : null}

                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>PHONE</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        borderBottomColor:
                          focusedField === 'phone'
                            ? colors.accent
                            : touched.phone && errors.phone
                              ? colors.danger
                              : colors.borderStrong,
                      },
                    ]}
                  >
                    <Ionicons
                      name='call-outline'
                      size={18}
                      color={focusedField === 'phone' ? colors.accent : colors.textSecondary}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      placeholder='98XXXXXXXX'
                      placeholderTextColor={colors.textMuted}
                      value={values.phone}
                      onChangeText={(text) => setFieldValue('phone', text)}
                      onBlur={() => {
                        setFieldTouched('phone', true);
                        setFocusedField(null);
                      }}
                      onFocus={() => setFocusedField('phone')}
                      keyboardType='phone-pad'
                    />
                  </View>
                  {touched.phone && errors.phone ? (
                    <Text style={[styles.errorText, { color: colors.danger }]}>
                      {errors.phone}
                    </Text>
                  ) : null}

                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    ADDRESS (OPTIONAL)
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        borderBottomColor:
                          focusedField === 'address'
                            ? colors.accent
                            : touched.address && errors.address
                              ? colors.danger
                              : colors.borderStrong,
                      },
                    ]}
                  >
                    <Ionicons
                      name='location-outline'
                      size={18}
                      color={focusedField === 'address' ? colors.accent : colors.textSecondary}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      placeholder='Your city or address'
                      placeholderTextColor={colors.textMuted}
                      value={values.address}
                      onChangeText={(text) => setFieldValue('address', text)}
                      onBlur={() => {
                        setFieldTouched('address', true);
                        setFocusedField(null);
                      }}
                      onFocus={() => setFocusedField('address')}
                    />
                  </View>
                  {touched.address && errors.address ? (
                    <Text style={[styles.errorText, { color: colors.danger }]}>
                      {errors.address}
                    </Text>
                  ) : null}

                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>MESSAGE</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      styles.multilineWrapper,
                      {
                        borderBottomColor:
                          focusedField === 'message'
                            ? colors.accent
                            : touched.message && errors.message
                              ? colors.danger
                              : colors.borderStrong,
                      },
                    ]}
                  >
                    <Ionicons
                      name='chatbubble-outline'
                      size={18}
                      color={focusedField === 'message' ? colors.accent : colors.textSecondary}
                      style={styles.multilineIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        styles.multilineInput,
                        { color: colors.textPrimary },
                      ]}
                      placeholder='How can we help you?'
                      placeholderTextColor={colors.textMuted}
                      value={values.message}
                      onChangeText={(text) => setFieldValue('message', text)}
                      onBlur={() => {
                        setFieldTouched('message', true);
                        setFocusedField(null);
                      }}
                      onFocus={() => setFocusedField('message')}
                      multiline
                      textAlignVertical='top'
                    />
                  </View>
                  {touched.message && errors.message ? (
                    <Text style={[styles.errorText, { color: colors.danger }]}>
                      {errors.message}
                    </Text>
                  ) : null}

                  <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: colors.accent }]}
                    activeOpacity={0.85}
                    onPress={() => submitForm()}
                    disabled={createContact.isPending}
                    accessibilityLabel='Send message'
                  >
                    {createContact.isPending ? (
                      <ActivityIndicator size='small' color='#FFFFFF' />
                    ) : (
                      <>
                        <Ionicons name='send-outline' size={17} color='#FFFFFF' />
                        <Text style={styles.submitText}>Send Message</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>
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
    paddingBottom: spacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },
  introCard: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(45, 37, 32, 0.06)',
    padding: spacing.xl,
  },
  introTitle: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  introSubtitle: {
    ...typography.body,
    lineHeight: 22,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(45, 37, 32, 0.06)',
    padding: spacing.xl,
  },
  mapCard: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(45, 37, 32, 0.06)',
    padding: spacing.xl,
  },
  sectionLabel: {
    ...typography.label,
    letterSpacing: 1.2,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    ...typography.caption,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 2,
  },
  rowValue: {
    ...typography.bodyStrong,
    fontSize: 14,
    lineHeight: 20,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  skeletonText: {
    flex: 1,
  },
  errorCard: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing['2xl'],
  },
  errorTitle: {
    ...typography.bodyStrong,
    textAlign: 'center',
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  smallBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 13,
    textTransform: 'none',
  },
  mapWrap: {
    height: 240,
    borderRadius: radius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapWebView: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  mapSkeleton: {
    ...StyleSheet.absoluteFillObject,
  },
  mapFallback: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  mapFallbackText: {
    ...typography.caption,
    textAlign: 'center',
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  directionsText: {
    ...typography.button,
    fontSize: 14,
    textTransform: 'none',
  },
  form: {
    gap: spacing.sm,
  },
  inputLabel: {
    ...typography.label,
    letterSpacing: 1.2,
    paddingLeft: spacing.xs,
    marginTop: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  multilineWrapper: {
    alignItems: 'flex-start',
    paddingTop: spacing.sm,
  },
  multilineIcon: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    ...typography.body,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 96,
    paddingTop: 0,
  },
  errorText: {
    ...typography.caption,
    paddingLeft: spacing.xs,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.lg + 2,
    borderRadius: radius.pill,
  },
  submitText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 15,
    letterSpacing: 0.8,
    textTransform: 'none',
  },
});
