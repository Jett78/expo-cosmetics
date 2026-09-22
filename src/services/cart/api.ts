import { apiDelete, apiPost, apiGet } from '../../lib/api-client';
import type { AddToCartRequest, AddToCartResponse, ApiCartResponse, DeleteCartItemResponse } from '../../types/api-cart';

export async function addToCart(
  token: string,
  payload: AddToCartRequest
): Promise<AddToCartResponse> {
  return apiPost<AddToCartResponse>('/cart/add-to-cart/create', payload, token);
}

export async function fetchCart(token: string): Promise<ApiCartResponse> {
  return apiGet<ApiCartResponse>('/cart/fetch-user-cart', undefined, token);
}

export async function deleteCartItem(
  token: string,
  cartItemId: string
): Promise<DeleteCartItemResponse> {
  return apiDelete<DeleteCartItemResponse>(`/cart/delete-cart-item/${cartItemId}`, token);
}
