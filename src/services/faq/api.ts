import { apiGet } from '../../lib/api-client';
import type { ApiFaqListResponse } from '../../types/faq';

export async function fetchFaqs(): Promise<ApiFaqListResponse> {
  return apiGet<ApiFaqListResponse>('/faq/fetch-all-faq');
}
