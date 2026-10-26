import { apiGet } from '../../lib/api-client';
import type { ApiBanner, BannersApiResponse } from '../../types/banner';

export async function fetchActiveBanners(
  limit = 10,
  type?: ApiBanner['type']
): Promise<BannersApiResponse> {
  return apiGet<BannersApiResponse>('/banner/fetch-all-active-banner', { limit, type });
}
