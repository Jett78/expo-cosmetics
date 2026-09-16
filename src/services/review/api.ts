import { apiGet, apiPost } from '../../lib/api-client';
import type { ReviewsApiResponse, AddReviewPayload, AddReviewApiResponse } from '../../types';

export function fetchReviewsByProductId(productId: string): Promise<ReviewsApiResponse> {
  return apiGet<ReviewsApiResponse>(`/review/fetch-review-by-productId/${productId}`);
}

export function addReview(
  payload: AddReviewPayload,
  token: string,
): Promise<AddReviewApiResponse> {
  return apiPost<AddReviewApiResponse>('/review/add-review', payload, token);
}
