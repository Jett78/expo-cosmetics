import { QueryClient } from '@tanstack/react-query';
import { fetchCategories, fetchFeaturedCategories, fetchFeaturedSubCategories } from '../category/api';
import { fetchFeaturedProducts, fetchBestSellers, fetchActiveProducts } from '../product/api';
import { fetchActiveBanners } from '../banner/api';
import { fetchAllBrands, fetchFeaturedBrands } from '../brand/api';
import { fetchTestimonials } from '../testimonial/api';
import { fetchBlogs } from '../blog/api';
import { ApiError } from '../../lib/api-client';

const STALE_TIME = 2 * 60 * 1000;
const FEATURED_STALE_TIME = 5 * 60 * 1000;

const retryOnServerError = (failureCount: number, error: Error) => {
  if (error instanceof ApiError && error.statusCode < 500) return false;
  return failureCount < 2;
};

export async function prefetchHomepageData(queryClient: QueryClient) {
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ['categories'],
      queryFn: fetchCategories,
      staleTime: FEATURED_STALE_TIME,
    }),
    queryClient.prefetchQuery({
      queryKey: ['categories', 'featured'],
      queryFn: fetchFeaturedCategories,
      staleTime: FEATURED_STALE_TIME,
      retry: retryOnServerError,
    }),
    queryClient.prefetchQuery({
      queryKey: ['categories', 'featuredSub'],
      queryFn: fetchFeaturedSubCategories,
      staleTime: FEATURED_STALE_TIME,
      retry: retryOnServerError,
    }),
    queryClient.prefetchQuery({
      queryKey: ['products', 'featured'],
      queryFn: fetchFeaturedProducts,
      staleTime: STALE_TIME,
    }),
    queryClient.prefetchQuery({
      queryKey: ['products', 'bestSellers'],
      queryFn: fetchBestSellers,
      staleTime: STALE_TIME,
    }),
    queryClient.prefetchQuery({
      queryKey: ['products', 'active'],
      queryFn: fetchActiveProducts,
      staleTime: STALE_TIME,
    }),
    queryClient.prefetchQuery({
      queryKey: ['banners', 10],
      queryFn: () => fetchActiveBanners(10),
      staleTime: STALE_TIME,
    }),
    queryClient.prefetchQuery({
      queryKey: ['brands'],
      queryFn: fetchAllBrands,
      staleTime: FEATURED_STALE_TIME,
    }),
    queryClient.prefetchQuery({
      queryKey: ['brands', 'featured'],
      queryFn: fetchFeaturedBrands,
      staleTime: FEATURED_STALE_TIME,
      retry: retryOnServerError,
    }),
    queryClient.prefetchQuery({
      queryKey: ['testimonials', 10],
      queryFn: () => fetchTestimonials(10),
      staleTime: 5 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ['blogs', 10],
      queryFn: () => fetchBlogs(10),
      staleTime: 5 * 60 * 1000,
    }),
  ]);
}
