import { useQuery } from '@tanstack/react-query';
import { fetchCart } from './api';

const CART_STALE_TIME = 2 * 60 * 1000;

export function useCart(token: string | null) {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => fetchCart(token!),
    enabled: Boolean(token),
    staleTime: CART_STALE_TIME,
    select: (data) => data.cart,
  });
}
