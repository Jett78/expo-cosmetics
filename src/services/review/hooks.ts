import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AddReviewPayload, ApiReviewWithUser } from '../../types';
import { addReview, fetchReviewsByProductId } from './api';

const REVIEW_STALE_TIME = 1 * 60 * 1000; // 1 minute

export function useReviews(productId: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => fetchReviewsByProductId(productId),
    staleTime: REVIEW_STALE_TIME,
    enabled: !!productId,
    select: (data): ApiReviewWithUser[] => {
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && 'id' in data) return [data as ApiReviewWithUser];
      return [];
    },
  });
}

export function useAddReview(productId: string, token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddReviewPayload) => addReview(payload, token as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
}
