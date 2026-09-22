import { useMutation, useQuery } from '@tanstack/react-query';
import { addToCart, fetchCart, deleteCartItem } from './api';
import type { AddToCartRequest } from '../../types/api-cart';

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

export function useAddToCart(token: string | null) {
  return useMutation({
    mutationFn: (payload: AddToCartRequest) => addToCart(token as string, payload),
  });
}

export function useDeleteCartItem(token: string | null) {
  return useMutation({
    mutationFn: (cartItemId: string) => deleteCartItem(token as string, cartItemId),
  });
}
