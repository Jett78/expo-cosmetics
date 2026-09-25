import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateOrderPayload } from '../../types/order';
import { createOrder, fetchOrderById, fetchUserOrders } from './api';

const ORDERS_STALE_TIME = 2 * 60 * 1000;

export function useOrders(token: string | null) {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchUserOrders(token as string),
    enabled: Boolean(token),
    staleTime: ORDERS_STALE_TIME,
    select: (data) =>
      [...data.order].sort(
        (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
      ),
  });
}

export function useOrderById(orderId: string, token: string | null) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderById(orderId, token as string),
    enabled: Boolean(token) && Boolean(orderId),
    staleTime: ORDERS_STALE_TIME,
    select: (data) => data.order,
  });
}

export function useCreateOrder(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(token as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
