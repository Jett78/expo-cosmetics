import { apiGet } from '../../lib/api-client';
import type { CategoriesApiResponse } from '../../types';

export function fetchCategories(): Promise<CategoriesApiResponse> {
  return apiGet<CategoriesApiResponse>('/category/fetch-all-active-categories');
}
