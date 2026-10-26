import { useQuery } from '@tanstack/react-query';
import type { ApiBanner } from '../../types/banner';
import { fetchActiveBanners } from './api';

const BANNER_STALE_TIME = 2 * 60 * 1000;

export function useActiveBanners(limit = 10, type?: ApiBanner['type']) {
  return useQuery({
    queryKey: ['banners', limit, type],
    queryFn: () => fetchActiveBanners(limit, type),
    staleTime: BANNER_STALE_TIME,
    select: (data) => data.banners.banners,
  });
}
