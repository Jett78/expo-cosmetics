import { useQuery } from '@tanstack/react-query';
import { fetchActiveBanners } from './api';

const BANNER_STALE_TIME = 2 * 60 * 1000;

export function useActiveBanners(limit = 10) {
  return useQuery({
    queryKey: ['banners', limit],
    queryFn: () => fetchActiveBanners(limit),
    staleTime: BANNER_STALE_TIME,
    select: (data) => data.banners.banners,
  });
}
