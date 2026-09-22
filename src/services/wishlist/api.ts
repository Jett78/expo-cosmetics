import { apiGet, apiPost } from '../../lib/api-client';
import type { ApiWishlistResponse } from '../../types/api-cart';

export async function fetchWishlist(token: string): Promise<ApiWishlistResponse> {
  return apiGet<ApiWishlistResponse>('/wishlist/fetch-all-wishlist', undefined, token);
}

export type ToggleWishlistResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  wishlist: {
    id: string;
    userId: string;
    productId: string;
    isActive: boolean;
  };
};

export async function toggleWishlist(
  productId: string,
  token: string
): Promise<ToggleWishlistResponse> {
  return apiPost<ToggleWishlistResponse>('/wishlist/add-wishlist', { productId }, token);
}
