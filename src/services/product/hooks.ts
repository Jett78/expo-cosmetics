import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
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

export function useInfiniteProducts(params: { sortBy?: string; brandId?: string; categoryId?: string }) {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => searchProducts({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      if (allPages.length < lastPage.products.totalPages) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    select: (data) => {
      const products = data.pages.flatMap((p) => p.products.filteredProducts);
      const lastPage = data.pages[data.pages.length - 1];
      const totalPages = lastPage?.products.totalPages ?? 0;
      const totalItems = lastPage?.products.totalItems ?? products.length;
      return { products, totalPages, totalItems };
    },
  });
}
