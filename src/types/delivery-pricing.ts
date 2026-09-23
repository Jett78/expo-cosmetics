export type DeliveryPricing = {
  id?: string;
  name: string;
  price: number;
};

export type FetchDeliveryPricingResponse = {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data: DeliveryPricing[];
};
