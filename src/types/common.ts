export type ProductSearchParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
};
