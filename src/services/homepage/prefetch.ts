import { QueryClient } from '@tanstack/react-query';
import { fetchCategories } from '../category/api';
import { fetchFeaturedProducts, fetchBestSellers, fetchActiveProducts } from '../product/api';
import { fetchActiveBanners } from '../banner/api';
import { fetchAllBrands } from '../brand/api';
import { fetchTestimonials } from '../testimonial/api';
import { fetchBlogs } from '../blog/api';

const STALE_TIME = 2 * 60 * 1000;

export async function prefetchHomepageData(queryClient: QueryClient) {
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ['categories'],
      queryFn: fetchCategories,
      staleTime: 5 * 60 * 1000,
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
      staleTime: 5 * 60 * 1000,
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
