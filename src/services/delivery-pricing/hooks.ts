import { useQuery } from '@tanstack/react-query';

import { fetchDeliveryPricing } from './api';

const DELIVERY_PRICING_STALE_TIME = 5 * 60 * 1000;

export function useDeliveryPricing() {
  return useQuery({
    queryKey: ['delivery-pricing'],
    queryFn: fetchDeliveryPricing,
    staleTime: DELIVERY_PRICING_STALE_TIME,
    select: (data) => data.data ?? [],
  });
}
