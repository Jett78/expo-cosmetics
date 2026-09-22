import { useQuery } from '@tanstack/react-query';
import { fetchOrderById, fetchUserOrders } from './api';

const ORDERS_STALE_TIME = 2 * 60 * 1000;

export function useOrders(token: string | null) {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchUserOrders(token as string),
    enabled: Boolean(token),
    staleTime: ORDERS_STALE_TIME,
    select: (data) => data.order,
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
