import { useQuery } from '@tanstack/react-query';
import { fetchSiteSetting } from './api';

const SITE_SETTING_STALE_TIME = 10 * 60 * 1000;

export function useSiteSetting() {
  return useQuery({
    queryKey: ['site-setting'],
    queryFn: fetchSiteSetting,
    staleTime: SITE_SETTING_STALE_TIME,
    select: (data) => data.setting,
  });
}
