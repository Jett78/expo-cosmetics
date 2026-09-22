import { apiGet } from '../../lib/api-client';
import type { ApiCartResponse } from '../../types/api-cart';

export async function fetchCart(token: string): Promise<ApiCartResponse> {
  return apiGet<ApiCartResponse>('/cart/fetch-user-cart', undefined, token);
}
