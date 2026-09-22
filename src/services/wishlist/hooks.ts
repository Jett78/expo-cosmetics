import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWishlist, toggleWishlist } from './api';

const WISHLIST_STALE_TIME = 2 * 60 * 1000;

export function useWishlist(token: string | null) {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => fetchWishlist(token as string),
    enabled: Boolean(token),
    staleTime: WISHLIST_STALE_TIME,
    select: (data) => data.wishlists,
  });
}

export function useToggleWishlist(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => toggleWishlist(productId, token as string),
    enabled: Boolean(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}
