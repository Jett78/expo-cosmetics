import { QueryClient } from '@tanstack/react-query';
import { fetchCategories } from '../category/api';
import { fetchActiveProducts } from '../product/api';
import { fetchActiveBanners } from '../banner/api';
import { searchProducts } from '../product/api';
import { ApiError } from '../../lib/api-client';

const CRITICAL_STALE_TIME = 10 * 60 * 1000;

const retryOnServerError = (failureCount: number, error: Error) => {
  if (error instanceof ApiError && error.statusCode < 500) return false;
  return failureCount < 2;
};

export async function prefetchHomepageData(queryClient: QueryClient) {
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ['categories'],
      queryFn: fetchCategories,
      staleTime: CRITICAL_STALE_TIME,
      retry: retryOnServerError,
    }),
    queryClient.prefetchQuery({
      queryKey: ['banners', 10],
      queryFn: () => fetchActiveBanners(10),
      staleTime: CRITICAL_STALE_TIME,
      retry: retryOnServerError,
    }),
    queryClient.prefetchQuery({
      queryKey: ['products', 'active'],
      queryFn: fetchActiveProducts,
      staleTime: CRITICAL_STALE_TIME,
      retry: retryOnServerError,
    }),
    queryClient.prefetchQuery({
      queryKey: ['products', { page: 1, sortBy: 'offer' }],
      queryFn: () => searchProducts({ page: 1, sortBy: 'offer' }),
      staleTime: CRITICAL_STALE_TIME,
      retry: retryOnServerError,
    }),
  ]);
}
