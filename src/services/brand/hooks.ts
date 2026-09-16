import { useQuery } from '@tanstack/react-query';
import { fetchAllBrands } from './api';

const BRAND_STALE_TIME = 5 * 60 * 1000;

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: fetchAllBrands,
    staleTime: BRAND_STALE_TIME,
    select: (data) => data.data.brands,
  });
}
