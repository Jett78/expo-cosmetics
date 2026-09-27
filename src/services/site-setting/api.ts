import { apiGet } from '../../lib/api-client';
import type { ApiSiteSettingResponse } from '../../types/site-setting';

export async function fetchSiteSetting(): Promise<ApiSiteSettingResponse> {
  return apiGet<ApiSiteSettingResponse>('/site-setting/fetch-site-setting');
}
