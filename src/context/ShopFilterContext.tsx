import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type ShopFilters = {
  sortBy: string;
  categoryId: string | null;
  brandId: string | null;
  minPrice: string;
  maxPrice: string;
  rating: number | null;
};

type ShopFilterContextValue = {
  filters: ShopFilters;
  setSortBy: (sortBy: string) => void;
  setCategoryId: (id: string | null) => void;
  setBrandId: (id: string | null) => void;
  setMinPrice: (val: string) => void;
  setMaxPrice: (val: string) => void;
  setRating: (rating: number | null) => void;
  applyFilters: (pending: ShopFilters) => void;
  resetFilters: () => void;
  activeFilterCount: number;
  hasActiveFilters: boolean;
};

const DEFAULT_FILTERS: ShopFilters = {
  sortBy: 'newest',
  categoryId: null,
  brandId: null,
  minPrice: '',
  maxPrice: '',
  rating: null,
};

const ShopFilterContext = createContext<ShopFilterContextValue | null>(null);

export function ShopFilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<ShopFilters>(DEFAULT_FILTERS);

  const setSortBy = useCallback((sortBy: string) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const setCategoryId = useCallback((categoryId: string | null) => {
    setFilters((prev) => ({ ...prev, categoryId }));
  }, []);

  const setBrandId = useCallback((brandId: string | null) => {
    setFilters((prev) => ({ ...prev, brandId }));
  }, []);

  const setMinPrice = useCallback((minPrice: string) => {
    setFilters((prev) => ({ ...prev, minPrice }));
  }, []);

  const setMaxPrice = useCallback((maxPrice: string) => {
    setFilters((prev) => ({ ...prev, maxPrice }));
  }, []);

  const setRating = useCallback((rating: number | null) => {
    setFilters((prev) => ({ ...prev, rating }));
  }, []);

  const applyFilters = useCallback((pending: ShopFilters) => {
    setFilters(pending);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categoryId) count++;
    if (filters.brandId) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.rating) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  const value = useMemo<ShopFilterContextValue>(
    () => ({
      filters,
      setSortBy,
      setCategoryId,
      setBrandId,
      setMinPrice,
      setMaxPrice,
      setRating,
      applyFilters,
      resetFilters,
      activeFilterCount,
      hasActiveFilters,
    }),
    [filters, setSortBy, setCategoryId, setBrandId, setMinPrice, setMaxPrice, setRating, applyFilters, resetFilters, activeFilterCount, hasActiveFilters],
  );

  return <ShopFilterContext.Provider value={value}>{children}</ShopFilterContext.Provider>;
}

export function useShopFilter(): ShopFilterContextValue {
  const ctx = useContext(ShopFilterContext);
  if (!ctx) throw new Error('useShopFilter must be used within ShopFilterProvider');
  return ctx;
}
