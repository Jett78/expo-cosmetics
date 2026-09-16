import { useQuery } from '@tanstack/react-query';
import { searchProducts, fetchFeaturedProducts, fetchBestSellers, fetchActiveProducts, fetchProductBySlug } from './api';
import type { ProductSearchParams } from '../../types';

const PRODUCT_STALE_TIME = 2 * 60 * 1000; // 2 minutes

export function useProducts(params: ProductSearchParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => searchProducts(params),
    staleTime: PRODUCT_STALE_TIME,
    select: (data) => ({
      products: data.products.filteredProducts,
      totalPages: data.products.totalPages,
    }),
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: fetchFeaturedProducts,
    staleTime: PRODUCT_STALE_TIME,
    select: (data) => data.data.products,
  });
}

export function useBestSellers() {
  return useQuery({
    queryKey: ['products', 'bestSellers'],
    queryFn: fetchBestSellers,
    staleTime: PRODUCT_STALE_TIME,
    select: (data) => data.products,
  });
}

export function useActiveProducts() {
  return useQuery({
    queryKey: ['products', 'active'],
    queryFn: fetchActiveProducts,
    staleTime: PRODUCT_STALE_TIME,
    select: (data) => data.data.products,
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug),
    staleTime: PRODUCT_STALE_TIME,
    enabled: !!slug,
    select: (data) => data.data,
  });
}
