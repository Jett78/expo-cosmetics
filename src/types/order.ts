import type { ApiImageLink } from './api-cart';

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 'FULFILLED' | 'CANCELLED';

export type DeliveryStatus = 'DELIVERED' | 'CANCELLED';

export type ApiOrderAddress = {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  userId: string;
  isActive: boolean;
};

export type ApiOrderAttributeValue = {
  id: string;
  productId: string;
  attributeDefinitionId: string;
  valueString: string | null;
  valueInt: number | null;
  valueDecimal: number | null;
  valueBool: boolean | null;
  valueDate: string | null;
  imageUrl: string | null;
  name: string | null;
  productAttributeId: string | null;
  attributeDefinition: {
    id: string;
    name: string;
    type: string;
    unit: string;
    categoryId: string;
  };
  stockAndPrice: {
    id: string;
    productAttributeValueId: string;
    stock: number;
    price: string;
    offeredPrice: number | null;
    isOfferedPriceActive: boolean;
    offerStartDate: string | null;
    offerEndDate: string | null;
  } | null;
  imageUrlLink?: ApiImageLink;
};

export type ApiOrderItemAttribute = {
  id: string;
  orderItemId: string;
  productAttributeValueId: string;
  productAttributeValue: ApiOrderAttributeValue;
};

export type ApiOrderProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  featureImage: string;
  price: number;
  offeredPrice: number;
  isOfferedPriceActive: boolean;
  offerStartDate: string | null;
  offerEndDate: string | null;
  isActive: boolean;
  userId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
  seoMetaId: string | null;
  brandId: string;
  media: {
    id: string;
    productId: string;
    mediaType: string;
    mediaUrl: string;
    mediaUrlLink: ApiImageLink;
  }[];
  featureImageLink: ApiImageLink;
};

export type ApiOrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: string;
  isOfferActive: boolean;
  attributes: ApiOrderItemAttribute[];
  product: ApiOrderProduct;
};

export type ApiOrderPayment = {
  id: string;
  orderId: string;
  method: string;
  status: PaymentStatus;
  amount: number;
  transactionId: string | null;
  createdAt: string;
} | null;

export type ApiOrder = {
  id: string;
  userId: string;
  status: OrderStatus;
  deliveryStatus?: DeliveryStatus | null;
  totalAmount: number;
  shippingAddressId: string;
  billingAddressId: string;
  placedAt: string;
  deliveryDate: string;
  notes: string | null;
  isPaid: boolean;
  isCancelled: boolean;
  shippingMethod: string;
  deliveryPrice: number;
  couponCode?: string | null;
  discountAmount?: number | null;
  items: ApiOrderItem[];
  shippingAddress: ApiOrderAddress;
  billingAddress: ApiOrderAddress;
  payment: ApiOrderPayment;
};

export function getPaymentStatus(order: ApiOrder): PaymentStatus | null {
  if (order.payment?.status) return order.payment.status;
  if (order.isPaid) return 'FULFILLED';
  if (order.isCancelled) return 'CANCELLED';
  return null;
}

export function getDeliveryStatus(order: ApiOrder): DeliveryStatus | null {
  if (order.deliveryStatus) return order.deliveryStatus;
  if (order.status === 'DELIVERED') return 'DELIVERED';
  if (order.status === 'CANCELLED' || order.isCancelled) return 'CANCELLED';
  return null;
}

export type ApiOrdersResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  order: ApiOrder[];
};

export type ApiOrderDetailResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  order: ApiOrder;
};

export type CreateOrderItemInput = {
  productId: string;
  quantity: number;
  price: number;
  attributeIds: string[];
  isOfferActive: boolean;
};

export type CreateOrderPayload = {
  shippingAddress: string;
  billingAddress: string;
  shippingMethod: string;
  totalAmount: number;
  deliveryDate: string;
  deliveryPrice: number;
  notes: string;
  items: CreateOrderItemInput[];
  cartId: string;
  isOfferActive: boolean;
  couponCode?: string;
};

export type CreateOrderResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  order?: ApiOrder;
};
