import { apiGet } from '../../lib/api-client';
import type { ApiBrand } from '../../types/brand';

type BrandsApiResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    brands: ApiBrand[];
  };
};

export async function fetchAllBrands(): Promise<BrandsApiResponse> {
  return apiGet<BrandsApiResponse>('/brand/fetch-all-brands');
}
