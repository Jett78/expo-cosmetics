import { Ionicons } from '@expo/vector-icons';
import { Text } from '@rneui/themed';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton } from '../../src/components/Skeleton';
import { useCommerce } from '../../src/context/CommerceContext';
import { radius, spacing, typography } from '../../src/design-system';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { API_BASE_URL } from '../../src/lib/config';
import { useCart } from '../../src/services/cart/hooks';
import { useValidateCoupon } from '../../src/services/coupon/hooks';
import { useDeliveryPricing } from '../../src/services/delivery-pricing/hooks';
import { useCreateOrder } from '../../src/services/order/hooks';
import type { ApiCartItem, ApiImageLink } from '../../src/types/api-cart';
import type { Coupon } from '../../src/types/coupon';
import type { CreateOrderItemInput } from '../../src/types/order';

const FONEPAY_QR = require('../../assets/payment/fonepay-qr.jpeg');

const VALLEY_CITIES = ['KATHMANDU', 'LALITPUR', 'BHAKTAPUR'];
const WHATSAPP_NUMBER = '9779808208989';
const DELIVERY_DATE = '2025-01-01 12:00:00';

const resolveImageUrl = (link?: ApiImageLink, fallback?: string) => {
  if (link?.['480']) return link['480'];
  if (link?.original) return link.original;
  if (fallback?.startsWith('http')) return fallback;
  if (fallback) return `${API_BASE_URL.replace('/v1', '')}/${fallback}`;
  return undefined;
};

const getItemImage = (item: ApiCartItem) => {
  const pav = item.attributes[0]?.productAttributeValue;
  return (
    resolveImageUrl(pav?.imageUrlLink, pav?.imageUrl ?? undefined) ??
    resolveImageUrl(item.product.featureImageLink, item.product.featureImage)
  );
};

const isOfferWindowActive = (
  sp: {
    offeredPrice?: number | null;
    isOfferedPriceActive?: boolean;
    offerStartDate?: string | null;
    offerEndDate?: string | null;
  } | null
) => {
  if (!sp) return false;
  const { offeredPrice, isOfferedPriceActive, offerStartDate, offerEndDate } = sp;
  if (!offeredPrice || offeredPrice <= 0 || !isOfferedPriceActive) return false;
  if (!offerStartDate || !offerEndDate) return false;
  const now = Date.now();
  return new Date(offerStartDate).getTime() <= now && new Date(offerEndDate).getTime() >= now;
};

const getStockAndPrice = (item: ApiCartItem) =>
  item.attributes[0]?.productAttributeValue?.stockAndPrice ?? null;

const getItemUnitPrice = (item: ApiCartItem) => {
  const sp = getStockAndPrice(item);
  if (sp && isOfferWindowActive(sp)) return sp.offeredPrice as number;
  return Number(sp?.price ?? item.product.price);
};

const getItemPayloadPrice = (item: ApiCartItem) => {
  const sp = getStockAndPrice(item);
  if (sp && isOfferWindowActive(sp)) return sp.offeredPrice as number;
  return Number(sp?.price ?? item.product.price);
};

const isItemOfferActive = (item: ApiCartItem) => isOfferWindowActive(getStockAndPrice(item));

const getAttributeValue = (item: ApiCartItem) => {
  const pav = item.attributes[0]?.productAttributeValue;
  if (!pav) return '';
  const { valueString, valueInt, valueDecimal, valueBool, valueDate } = pav;
  return (
    valueString ??
    (valueInt !== null ? String(valueInt) : undefined) ??
    (valueDecimal !== null ? String(valueDecimal) : undefined) ??
    (typeof valueBool === 'boolean' ? (valueBool ? 'Available' : 'Not Available') : undefined) ??
    (valueDate ? new Date(valueDate).toISOString().slice(0, 10) : '') ??
    ''
  );
};

function SignInPrompt() {
  const { colors } = useAppTheme();

  return (
    <View style={styles.centerContent}>
      <View style={[styles.stateIcon, { backgroundColor: colors.accentLight }]}>
        <Ionicons name='lock-closed-outline' size={40} color={colors.accent} />
      </View>
      <Text style={[styles.stateTitle, { color: colors.textPrimary }]}>Sign in required</Text>
      <Text style={[styles.stateSubtitle, { color: colors.textMuted }]}>
        Please sign in to place your order.
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

function SummarySkeleton() {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.summaryItem, { backgroundColor: colors.surface }]}>
      <Skeleton width={80} height={80} borderRadius={radius.md} />
      <View style={styles.summaryItemInfo}>
        <Skeleton width='85%' height={14} borderRadius={4} />
        <Skeleton width='40%' height={12} borderRadius={4} style={styles.skeletonGap} />
        <Skeleton width='55%' height={12} borderRadius={4} style={styles.skeletonGap} />
      </View>
    </View>
  );
}

export default function PaymentScreen() {
  const { colors } = useAppTheme();
  const { token, authLoaded, selectedShippingAddress, refreshCart, clearCart } = useCommerce();
  const {
    data: cart,
    isPending: cartLoading,
    isError: cartError,
    refetch: refetchCart,
  } = useCart(token);
  const {
    data: deliveryPricing,
    isPending: pricingLoading,
    isError: pricingError,
    refetch: refetchPricing,
  } = useDeliveryPricing();
  const createOrder = useCreateOrder(token);
  const validateCoupon = useValidateCoupon(token);

  const [paymentMethod, setPaymentMethod] = React.useState('');
  const [deliveryType, setDeliveryType] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [couponInput, setCouponInput] = React.useState('');
  const [appliedCoupon, setAppliedCoupon] = React.useState<Coupon | null>(null);
  const [couponError, setCouponError] = React.useState<string | null>(null);

  const address = selectedShippingAddress;
  const city = address?.city?.toUpperCase() ?? '';
  const isValleyCity = VALLEY_CITIES.includes(city);

  const pricingList = deliveryPricing ?? [];
  const insideringroadprice = pricingList.find((d) => d.name === 'insideringroad')?.price ?? 0;
  const outsideringroadprice = pricingList.find((d) => d.name === 'outsideringroad')?.price ?? 0;
  const outofvalleyprice = pricingList.find((d) => d.name === 'outsidevalley')?.price ?? 0;

  const cartItems = cart?.items ?? [];

  React.useEffect(() => {
    if (!address) return;
    if (isValleyCity) {
      setDeliveryType('');
    } else {
      setDeliveryType('Fixed');
      setPaymentMethod((prev) => (prev === 'Cash on Delivery' ? '' : prev));
    }
  }, [address, isValleyCity]);

  React.useEffect(() => {
    if (authLoaded && token && !address) {
      router.replace('/checkout/address');
    }
  }, [authLoaded, token, address]);

  const deliveryPrice: number | null = !isValleyCity
    ? outofvalleyprice
    : deliveryType === 'Inside Valley'
      ? insideringroadprice
      : deliveryType === 'Outside Valley'
        ? outsideringroadprice
        : null;

  const subtotal = cartItems.reduce((sum, item) => sum + getItemUnitPrice(item) * item.quantity, 0);
  const deliveryFee = Number(deliveryPrice ?? 0);

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountAmount) {
      discount = appliedCoupon.discountAmount;
    } else if (appliedCoupon.discountPercent) {
      discount = (subtotal * appliedCoupon.discountPercent) / 100;
    }
    discount = Math.min(Math.max(discount, 0), subtotal);
    discount = Math.round(discount * 100) / 100;
  }

  const total = subtotal - discount + deliveryFee;
  const anyOfferActive = cartItems.some(isItemOfferActive);

  const handleApplyCoupon = () => {
    const code = couponInput.trim();
    if (!code) {
      setCouponError('Enter a coupon code.');
      return;
    }
    setCouponError(null);
    validateCoupon.mutate(code, {
      onSuccess: (response) => {
        if (!response.success || !response.coupon) {
          setCouponError(response.message || 'Invalid coupon code.');
          return;
        }
        const coupon = response.coupon;
        if (coupon.couponCount <= 0) {
          setCouponError('Coupon usage limit has been reached.');
          return;
        }
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
          setCouponError('This coupon has expired.');
          return;
        }
        if (!coupon.discountAmount && !coupon.discountPercent) {
          setCouponError('Coupon does not contain any discount information.');
          return;
        }
        let calculated = 0;
        if (coupon.discountAmount) {
          calculated = coupon.discountAmount;
        } else if (coupon.discountPercent) {
          calculated = (subtotal * coupon.discountPercent) / 100;
        }
        if (calculated > subtotal) {
          setCouponError('Coupon discount cannot exceed subtotal.');
          return;
        }
        setAppliedCoupon(coupon);
        setCouponError(null);
        Alert.alert('Coupon applied', 'Your coupon has been applied successfully.');
      },
      onError: (error: any) => {
        setCouponError(error?.message ?? 'Invalid coupon code.');
      },
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
  };

  const handleWhatsApp = async () => {
    const message = `Hello! I would like to confirm my payment of Rs. ${total} for the products I have purchased`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('WhatsApp not available', 'Please open WhatsApp and message us manually.');
      }
    } catch {
      Alert.alert('Something went wrong', 'Could not open WhatsApp.');
    }
  };

  const handlePlaceOrder = () => {
    if (!paymentMethod) {
      Alert.alert('Payment method', 'Please select a payment method.');
      return;
    }
    if (isValleyCity && !deliveryType) {
      Alert.alert('Delivery location', 'Please select Inside Ring Road or Outside Ring Road.');
      return;
    }
    if (!cart || cartItems.length === 0) {
      Alert.alert('Empty cart', 'Your cart is empty.');
      return;
    }
    if (!address) {
      Alert.alert('Shipping address', 'Please select a shipping address first.');
      router.replace('/checkout/address');
      return;
    }

    const items: CreateOrderItemInput[] = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: getItemPayloadPrice(item),
      attributeIds: item.attributes.map((attr) => attr.productAttributeValue.id),
      isOfferActive: isItemOfferActive(item),
    }));

    createOrder.mutate(
      {
        shippingAddress: address.id,
        billingAddress: address.id,
        shippingMethod: paymentMethod.toUpperCase(),
        totalAmount: Number(total),
        deliveryDate: DELIVERY_DATE,
        deliveryPrice: Number(deliveryPrice) || 0,
        notes,
        items,
        cartId: cart.id,
        isOfferActive: anyOfferActive,
        ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
      },
      {
        onSuccess: (response) => {
          refreshCart();
          clearCart();
          Alert.alert('Order placed successfully!', 'Your order has been confirmed.', [
            {
              text: 'View Orders',
              onPress: () => {
                if (response.order?.id) {
                  router.replace(`/orders/${response.order.id}`);
                } else {
                  router.replace('/orders');
                }
              },
            },
          ]);
        },
        onError: (error: any) => {
          Alert.alert('Order Failed', error?.message ?? 'Something went wrong. Please try again.');
        },
      }
    );
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
      <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Payment</Text>
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

  if (!address) {
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

  if (cartError) {
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
            Couldn't load your cart
          </Text>
          <Text style={[styles.stateSubtitle, { color: colors.textMuted }]}>
            Check your connection and try again.
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.accent }]}
            activeOpacity={0.8}
            onPress={() => refetchCart()}
          >
            <Ionicons name='refresh' size={16} color='#fff' />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!cartLoading && cartItems.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        {header}
        <View style={styles.centerContent}>
          <View style={[styles.stateIcon, { backgroundColor: colors.accentLight }]}>
            <Ionicons name='bag-outline' size={40} color={colors.accent} />
          </View>
          <Text style={[styles.stateTitle, { color: colors.textPrimary }]}>Your cart is empty</Text>
          <Text style={[styles.stateSubtitle, { color: colors.textMuted }]}>
            Add some products to your bag before checking out.
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.accent }]}
            activeOpacity={0.8}
            onPress={() => router.replace('/(tabs)/shop')}
          >
            <Text style={styles.retryBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const summaryItems = cartLoading ? [0, 1] : cartItems;

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
          {/* Shipping address */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Shipping Address</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardTop}>
              <Text style={[styles.addressName, { color: colors.textPrimary }]}>
                {address.fullName}
              </Text>
              <Text style={[styles.addressPhone, { color: colors.textSecondary }]}>
                {address.phone}
              </Text>
            </View>
            <Text style={[styles.addressLine, { color: colors.textSecondary }]}>
              {address.street}
            </Text>
            <Text style={[styles.addressLine, { color: colors.textSecondary }]}>
              {address.city}, {address.state} {address.zipCode}
            </Text>
            <Text style={[styles.addressLine, { color: colors.textSecondary }]}>
              {address.country}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/checkout/address')}
              accessibilityLabel='Change shipping address'
            >
              <Text style={[styles.linkText, { color: colors.accent }]}>Change address</Text>
            </TouchableOpacity>
          </View>

          {/* Delivery location (valley cities only) */}
          {isValleyCity && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Delivery Location
              </Text>
              {pricingError ? (
                <TouchableOpacity
                  style={[styles.pricingError, { borderColor: colors.danger }]}
                  onPress={() => refetchPricing()}
                >
                  <Ionicons name='refresh' size={14} color={colors.danger} />
                  <Text style={[styles.pricingErrorText, { color: colors.danger }]}>
                    Couldn't load delivery pricing. Tap to retry.
                  </Text>
                </TouchableOpacity>
              ) : pricingLoading ? (
                <Skeleton height={64} borderRadius={radius.lg} />
              ) : (
                <View style={styles.optionRow}>
                  {(
                    [
                      {
                        value: 'Inside Valley',
                        label: 'Inside Ring Road',
                        price: insideringroadprice,
                      },
                      {
                        value: 'Outside Valley',
                        label: 'Outside Ring Road',
                        price: outsideringroadprice,
                      },
                    ] as const
                  ).map((option) => {
                    const selected = deliveryType === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.deliveryOption,
                          {
                            backgroundColor: selected ? colors.accent : colors.surface,
                            borderColor: selected ? colors.accent : colors.borderSubtle,
                          },
                        ]}
                        activeOpacity={0.75}
                        onPress={() => setDeliveryType(option.value)}
                        accessibilityLabel={`Select ${option.label}`}
                      >
                        <Text
                          style={[
                            styles.deliveryOptionLabel,
                            { color: selected ? colors.textInverse : colors.textPrimary },
                          ]}
                        >
                          {option.label}
                        </Text>
                        <Text
                          style={[
                            styles.deliveryOptionPrice,
                            { color: selected ? colors.textInverse : colors.textSecondary },
                          ]}
                        >
                          Rs. {option.price}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </>
          )}

          {/* Payment method */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Select Payment Option
          </Text>
          {!isValleyCity && (
            <View style={[styles.notice, { backgroundColor: 'rgba(239, 68, 68, 0.08)' }]}>
              <Ionicons name='alert-circle-outline' size={16} color={colors.danger} />
              <Text style={[styles.noticeText, { color: colors.danger }]}>
                For areas outside the valley, it's compulsory to make the payment first before the
                order is dispatched.
              </Text>
            </View>
          )}

          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                {
                  backgroundColor:
                    paymentMethod === 'Online Payment' ? colors.accent : colors.surface,
                  borderColor:
                    paymentMethod === 'Online Payment' ? colors.accent : colors.borderSubtle,
                },
              ]}
              activeOpacity={0.75}
              onPress={() => setPaymentMethod('Online Payment')}
              accessibilityLabel='Select online payment'
            >
              <Ionicons
                name='card-outline'
                size={28}
                color={
                  paymentMethod === 'Online Payment' ? colors.textInverse : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.paymentOptionLabel,
                  {
                    color:
                      paymentMethod === 'Online Payment' ? colors.textInverse : colors.textPrimary,
                  },
                ]}
              >
                Online Payment
              </Text>
            </TouchableOpacity>

            {isValleyCity && (
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  {
                    backgroundColor:
                      paymentMethod === 'Cash on Delivery' ? colors.accent : colors.surface,
                    borderColor:
                      paymentMethod === 'Cash on Delivery' ? colors.accent : colors.borderSubtle,
                  },
                ]}
                activeOpacity={0.75}
                onPress={() => setPaymentMethod('Cash on Delivery')}
                accessibilityLabel='Select cash on delivery'
              >
                <Ionicons
                  name='cash-outline'
                  size={28}
                  color={
                    paymentMethod === 'Cash on Delivery' ? colors.textInverse : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.paymentOptionLabel,
                    {
                      color:
                        paymentMethod === 'Cash on Delivery'
                          ? colors.textInverse
                          : colors.textPrimary,
                    },
                  ]}
                >
                  Cash on Delivery
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {paymentMethod === 'Online Payment' && (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Image
                source={FONEPAY_QR}
                style={styles.qrImage}
                resizeMode='contain'
                accessibilityLabel='Fonepay payment QR code'
              />
              <Text style={[styles.qrHint, { color: colors.textSecondary }]}>
                Scan this QR to pay, then send us the payment screenshot on WhatsApp.
              </Text>
              <TouchableOpacity
                style={[styles.whatsappBtn, { backgroundColor: '#25D366' }]}
                activeOpacity={0.85}
                onPress={handleWhatsApp}
                accessibilityLabel='Send payment screenshot via WhatsApp'
              >
                <Ionicons name='logo-whatsapp' size={22} color='#FFFFFF' />
                <Text style={styles.whatsappBtnText}>Send via WhatsApp</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Notes */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Note (Optional)</Text>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderSubtle,
                color: colors.textPrimary,
              },
            ]}
            placeholder='Any delivery instructions...'
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical='top'
          />

          {/* Coupon */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Apply Coupon</Text>
          <View style={[styles.couponRow, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[
                styles.couponInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderSubtle,
                  color: colors.textPrimary,
                },
              ]}
              placeholder='Enter coupon code'
              placeholderTextColor={colors.textMuted}
              autoCapitalize='characters'
              value={couponInput}
              onChangeText={(text) => {
                setCouponInput(text);
                if (couponError) setCouponError(null);
              }}
              editable={!appliedCoupon}
              accessibilityLabel='Coupon code'
            />
            {appliedCoupon ? (
              <TouchableOpacity
                style={[styles.couponActionBtn, { backgroundColor: colors.surfaceMuted }]}
                activeOpacity={0.8}
                onPress={handleRemoveCoupon}
                accessibilityLabel='Remove coupon'
              >
                <Text style={[styles.couponActionText, { color: colors.danger }]}>Remove</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.couponActionBtn, { backgroundColor: colors.accent }]}
                activeOpacity={0.8}
                onPress={handleApplyCoupon}
                disabled={validateCoupon.isPending}
                accessibilityLabel='Apply coupon'
              >
                {validateCoupon.isPending ? (
                  <ActivityIndicator size='small' color='#FFFFFF' />
                ) : (
                  <Text style={styles.couponActionText}>Apply</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
          {couponError ? (
            <Text style={[styles.couponError, { color: colors.danger }]}>{couponError}</Text>
          ) : null}
          {appliedCoupon ? (
            <Text style={[styles.couponApplied, { color: colors.success }]}>
              {appliedCoupon.code} applied
              {appliedCoupon.discountPercent ? ` (${appliedCoupon.discountPercent}%)` : ''}
            </Text>
          ) : null}

          {/* Order summary */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Order Summary</Text>
          {summaryItems.map((entry, index) => {
            const item = cartLoading ? null : (entry as ApiCartItem);
            if (!item) {
              return <SummarySkeleton key={`skeleton-${index}`} />;
            }
            const attributeName =
              item.attributes[0]?.productAttributeValue.attributeDefinition?.name;
            const attributeValue = getAttributeValue(item);
            const isColor = attributeName?.toLowerCase() === 'color';
            const imageUri = getItemImage(item);

            return (
              <View key={item.id} style={[styles.summaryItem, { backgroundColor: colors.surface }]}>
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.summaryImage}
                    contentFit='cover'
                  />
                ) : (
                  <View
                    style={[
                      styles.summaryImage,
                      styles.summaryImageFallback,
                      { backgroundColor: colors.surfaceMuted },
                    ]}
                  >
                    <Ionicons name='image-outline' size={24} color={colors.textMuted} />
                  </View>
                )}
                <View style={styles.summaryItemInfo}>
                  <Text
                    style={[styles.summaryItemName, { color: colors.textPrimary }]}
                    numberOfLines={2}
                  >
                    {item.product.name}
                  </Text>
                  <Text style={[styles.summaryItemMeta, { color: colors.textSecondary }]}>
                    Qty: {item.quantity}
                  </Text>
                  {attributeName && attributeValue ? (
                    isColor ? (
                      <View style={styles.attributeRow}>
                        <View
                          style={[
                            styles.colorSwatch,
                            { backgroundColor: attributeValue, borderColor: colors.borderStrong },
                          ]}
                        />
                        <Text style={[styles.summaryItemMeta, { color: colors.textSecondary }]}>
                          {attributeName}: {item.attributes[0]?.productAttributeValue.name}
                        </Text>
                      </View>
                    ) : (
                      <Text style={[styles.summaryItemMeta, { color: colors.textSecondary }]}>
                        {attributeName}: {attributeValue}
                      </Text>
                    )
                  ) : null}
                  <Text style={[styles.summaryItemPrice, { color: colors.accent }]}>
                    Rs. {(getItemUnitPrice(item) * item.quantity).toLocaleString()}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Totals */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.totalValue, { color: colors.textPrimary }]}>
                Rs. {subtotal.toLocaleString()}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Delivery Fee</Text>
              <Text style={[styles.totalValue, { color: colors.textPrimary }]}>
                {deliveryPrice === null
                  ? isValleyCity
                    ? 'Select location'
                    : pricingLoading
                      ? '—'
                      : `Rs. ${deliveryFee.toLocaleString()}`
                  : `Rs. ${deliveryFee.toLocaleString()}`}
              </Text>
            </View>
            {discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                  Discount
                  {appliedCoupon?.discountPercent ? ` (${appliedCoupon.discountPercent}%)` : ''}
                </Text>
                <Text style={[styles.totalValue, { color: colors.success }]}>
                  − Rs. {discount.toLocaleString()}
                </Text>
              </View>
            )}
            <View style={[styles.totalDivider, { backgroundColor: colors.borderSubtle }]} />
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabelStrong, { color: colors.textPrimary }]}>Total</Text>
              <Text style={[styles.totalValueStrong, { color: colors.accent }]}>
                Rs. {total.toLocaleString()}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { backgroundColor: colors.surface, borderTopColor: colors.borderSubtle },
          ]}
        >
          <TouchableOpacity
            style={[styles.placeOrderBtn, { backgroundColor: colors.accent }]}
            activeOpacity={0.85}
            disabled={createOrder.isPending}
            onPress={handlePlaceOrder}
            accessibilityLabel='Place order'
          >
            {createOrder.isPending ? (
              <ActivityIndicator size='small' color='#FFFFFF' />
            ) : (
              <>
                <Ionicons name='checkmark-circle-outline' size={20} color='#FFFFFF' />
                <Text style={styles.placeOrderBtnText}>
                  Place Order — Rs. {total.toLocaleString()}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  sectionTitle: {
    ...typography.h4,
    marginTop: spacing['2xl'],
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(45, 37, 32, 0.06)',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  addressName: {
    ...typography.bodyStrong,
    flex: 1,
  },
  addressPhone: {
    ...typography.captionLarge,
  },
  addressLine: {
    ...typography.captionLarge,
    lineHeight: 20,
  },
  linkText: {
    ...typography.bodyStrong,
    marginTop: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  deliveryOption: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  deliveryOptionLabel: {
    ...typography.bodyStrong,
    fontSize: 13,
  },
  deliveryOptionPrice: {
    ...typography.captionLarge,
  },
  paymentOption: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: spacing.sm,
  },
  paymentOptionLabel: {
    ...typography.bodyStrong,
    fontSize: 13,
    textAlign: 'center',
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  noticeText: {
    ...typography.caption,
    flex: 1,
    lineHeight: 17,
  },
  pricingError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  pricingErrorText: {
    ...typography.captionLarge,
    flex: 1,
  },
  qrImage: {
    width: 220,
    height: 220,
    alignSelf: 'center',
    marginBottom: spacing.md,
    borderRadius: radius.md,
  },
  qrHint: {
    ...typography.captionLarge,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.pill,
  },
  whatsappBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 15,
    textTransform: 'none',
  },
  notesInput: {
    minHeight: 100,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    ...typography.body,
  },
  couponRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(45, 37, 32, 0.06)',
    padding: spacing.sm,
    alignItems: 'center',
  },
  couponInput: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    ...typography.body,
    textTransform: 'uppercase',
  },
  couponActionBtn: {
    minWidth: 84,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  couponActionText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 14,
    textTransform: 'none',
  },
  couponError: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  couponApplied: {
    ...typography.captionLarge,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  summaryItem: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(45, 37, 32, 0.06)',
  },
  summaryImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
  },
  summaryImageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryItemInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
  summaryItemName: {
    ...typography.bodyStrong,
  },
  summaryItemMeta: {
    ...typography.caption,
    lineHeight: 17,
  },
  summaryItemPrice: {
    ...typography.priceSmall,
    marginTop: spacing.xs,
  },
  attributeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  colorSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: StyleSheet.hairlineWidth,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  totalLabel: {
    ...typography.body,
  },
  totalLabelStrong: {
    ...typography.bodyStrong,
  },
  totalValue: {
    ...typography.bodyStrong,
  },
  totalValueStrong: {
    ...typography.priceLarge,
  },
  totalDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 56,
    borderRadius: radius.lg,
  },
  placeOrderBtnText: {
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
    marginTop: spacing.xs,
  },
});
