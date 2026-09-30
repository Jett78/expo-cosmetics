import { apiGet } from '../../lib/api-client';
import type { CategoriesApiResponse, FeaturedCategoriesApiResponse } from '../../types';

export function fetchCategories(): Promise<CategoriesApiResponse> {
  return apiGet<CategoriesApiResponse>('/category/fetch-all-active-categories');
}

export function fetchFeaturedCategories(): Promise<FeaturedCategoriesApiResponse> {
  return apiGet<FeaturedCategoriesApiResponse>('/category/fetch-featured-categories');
}

export function fetchFeaturedSubCategories(): Promise<FeaturedCategoriesApiResponse> {
  return apiGet<FeaturedCategoriesApiResponse>('/category/fetch-featured-sub-categories');
}
