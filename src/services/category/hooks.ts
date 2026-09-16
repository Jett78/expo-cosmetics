import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from './api';

const CATEGORY_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: CATEGORY_STALE_TIME,
    select: (data) => data.categories.categories,
  });
}
