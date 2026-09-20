import { apiGet } from '../../lib/api-client';
import type { ApiBrand } from '../../types/brand';

type BrandsApiResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    brands: ApiBrand[];
    meta: {
      currentPage: number;
      totalPages: number;
      totalBrands: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
};

export async function fetchAllBrands(): Promise<BrandsApiResponse> {
  return apiGet<BrandsApiResponse>('/brand/fetch-all-brands', { page: 1, limit: 100 });
}
