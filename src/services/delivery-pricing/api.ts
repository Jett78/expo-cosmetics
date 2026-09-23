import { apiGet } from '../../lib/api-client';
import type { FetchDeliveryPricingResponse } from '../../types/delivery-pricing';

export async function fetchDeliveryPricing(): Promise<FetchDeliveryPricingResponse> {
  return apiGet<FetchDeliveryPricingResponse>(
    '/delivery-pricing/fetch-all-active-delivery-pricing'
  );
}
