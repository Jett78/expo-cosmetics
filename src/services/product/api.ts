import { apiGet } from '../../lib/api-client';
import type { ProductsApiResponse, ProductListApiResponse, BestSellerApiResponse, ProductBySlugApiResponse, ProductSearchParams } from '../../types';

export function searchProducts(
  params: ProductSearchParams,
): Promise<ProductsApiResponse> {
  return apiGet<ProductsApiResponse>('/product/search-product', {
    page: params.page ?? 1,
    sortBy: params.sortBy ?? 'newest',
    categoryId: params.categoryId,
    brandId: params.brandId,
  });
}

export function fetchFeaturedProducts(): Promise<ProductListApiResponse> {
  return apiGet<ProductListApiResponse>('/product/fetch-all-featured-products');
}

export function fetchBestSellers(): Promise<BestSellerApiResponse> {
  return apiGet<BestSellerApiResponse>('/product/fetch-best-seller');
}

export function fetchActiveProducts(): Promise<ProductListApiResponse> {
  return apiGet<ProductListApiResponse>('/product/fetch-all-active-products');
}

export function fetchProductBySlug(slug: string): Promise<ProductBySlugApiResponse> {
  return apiGet<ProductBySlugApiResponse>(`/product/fetch-product-by-slug/${slug}`);
}
