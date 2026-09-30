export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
  subcategories: ApiCategory[];
  imageLink: string | null;
};

export type CategoriesApiResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  categories: {
    success: boolean;
    page: number;
    totalPages: number;
    totalItems: number;
    categories: ApiCategory[];
  };
};

export type FeaturedCategoriesApiResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  categories: {
    success: boolean;
    totalItems: number;
    categories: ApiCategory[];
  };
};
