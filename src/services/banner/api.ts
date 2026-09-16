import { apiGet } from '../../lib/api-client';
import type { BannersApiResponse } from '../../types/banner';

export async function fetchActiveBanners(limit = 10): Promise<BannersApiResponse> {
  return apiGet<BannersApiResponse>('/banner/fetch-all-active-banner', { limit });
}
