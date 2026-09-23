import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateShippingAddressPayload } from '../../types/shipping-address';
import { createShippingAddress, deleteShippingAddress, fetchShippingAddresses } from './api';

const SHIPPING_ADDRESS_STALE_TIME = 60 * 1000;

export function useShippingAddresses(token: string | null) {
  return useQuery({
    queryKey: ['shipping-addresses'],
    queryFn: () => fetchShippingAddresses(token as string),
    enabled: Boolean(token),
    staleTime: SHIPPING_ADDRESS_STALE_TIME,
    select: (data) => data.addresses,
  });
}

export function useCreateShippingAddress(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateShippingAddressPayload) =>
      createShippingAddress(token as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-addresses'] });
    },
  });
}

export function useDeleteShippingAddress(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => deleteShippingAddress(token as string, addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-addresses'] });
    },
  });
}
