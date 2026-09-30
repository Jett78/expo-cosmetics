import { useQuery } from '@tanstack/react-query';
import { ApiError } from '../../lib/api-client';
import { fetchAllBrands, fetchFeaturedBrands } from './api';

const BRAND_STALE_TIME = 5 * 60 * 1000;

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: fetchAllBrands,
    staleTime: BRAND_STALE_TIME,
    select: (data) => data.data.brands,
  });
}

export function useFeaturedBrands() {
  return useQuery({
    queryKey: ['brands', 'featured'],
    queryFn: fetchFeaturedBrands,
    staleTime: BRAND_STALE_TIME,
    retry: (failureCount: number, error: Error) => {
      if (error instanceof ApiError && error.statusCode < 500) return false;
      return failureCount < 2;
    },
    select: (data) => data.brands.brands,
  });
}
