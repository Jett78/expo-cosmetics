export type ShippingAddress = {
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

export type CreateShippingAddressPayload = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

export type FetchShippingAddressesResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  addresses: ShippingAddress[];
};

export type CreateShippingAddressResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: ShippingAddress;
};

export type DeleteShippingAddressResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: null;
};
