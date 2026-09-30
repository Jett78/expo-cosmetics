import { useQuery } from '@tanstack/react-query';
import { ApiError } from '../../lib/api-client';
import { fetchCategories, fetchFeaturedCategories, fetchFeaturedSubCategories } from './api';

const CATEGORY_STALE_TIME = 5 * 60 * 1000; // 5 minutes

const retryOnServerError = (failureCount: number, error: Error) => {
  if (error instanceof ApiError && error.statusCode < 500) return false;
  return failureCount < 2;
};

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: CATEGORY_STALE_TIME,
    select: (data) => data.categories.categories,
  });
}

export function useFeaturedCategories() {
  return useQuery({
    queryKey: ['categories', 'featured'],
    queryFn: fetchFeaturedCategories,
    staleTime: CATEGORY_STALE_TIME,
    retry: retryOnServerError,
    select: (data) => data.categories.categories,
  });
}

export function useFeaturedSubCategories() {
  return useQuery({
    queryKey: ['categories', 'featuredSub'],
    queryFn: fetchFeaturedSubCategories,
    staleTime: CATEGORY_STALE_TIME,
    retry: retryOnServerError,
    select: (data) => data.categories.categories,
  });
}
