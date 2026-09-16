import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReviewsByProductId, addReview } from './api';
import type { ApiReviewWithUser, AddReviewPayload } from '../../types';

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

export function useAddReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddReviewPayload) => {
      // Token will be passed from the component
      return addReview(payload, '');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
}
