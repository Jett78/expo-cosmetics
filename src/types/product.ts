import type { ApiCategory } from './category';
import type { ApiBrand } from './brand';
import type { ApiReview } from './review';

export type ApiMedia = {
  id: string;
  productId: string;
  mediaType: string;
  mediaUrl: string;
  mediaUrlLink: Record<string, string>;
};

export type ApiTag = {
  id: string;
  name: string;
};

export type ApiAttributeDefinition = {
  id: string;
  name: string;
  type: string;
  unit: string;
  categoryId: string;
};

export type ApiStockAndPrice = {
  id: string;
  productAttributeValueId: string;
  stock: number;
  price: string;
  offeredPrice: string | null;
  isOfferedPriceActive: boolean;
  offerStartDate: string | null;
  offerEndDate: string | null;
};

export type ApiAttribute = {
  id: string;
  productId: string;
  attributeDefinitionId: string;
  valueString: string | null;
  valueInt: number | null;
  valueDecimal: number | null;
  valueBool: boolean | null;
  valueDate: string | null;
  imageUrl: string | null;
  name: string | null;
  productAttributeId: string | null;
  attributeDefinition: ApiAttributeDefinition;
  stockAndPrice: ApiStockAndPrice;
  imageUrlLink: Record<string, string> | null;
};

export type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  featureImage: string;
  price: number;
  offeredPrice: number;
  isOfferedPriceActive: boolean;
  offerStartDate: string | null;
  offerEndDate: string | null;
  isActive: boolean;
  userId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
  seoMetaId: string | null;
  brandId: string;
  media: ApiMedia[];
  tags: ApiTag[];
  seoMeta: {
    id: string;
    model: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    metaRobots: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  brand: ApiBrand;
  reviews: ApiReview[];
  attributes: ApiAttribute[];
  category: ApiCategory;
  user: {
    id: string;
    name: string;
    email: string;
  };
  avgRating: number;
  featureImageLink: Record<string, string>;
};

export type ProductsApiResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  products: {
    totalPages: number;
    totalItems: number;
    filteredProducts: ApiProduct[];
  };
};

export type ProductListApiResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    success: boolean;
    page: number;
    totalPages: number;
    totalItems: number;
    products: ApiProduct[];
  };
};

export type BestSellerApiResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  products: ApiProduct[];
};

export type ProductBySlugApiResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: ApiProduct;
};
