export type ApiImageLink = Record<string, string>;

export type ApiBrand = {
  id: string;
  name: string;
  image: string;
  imageLink: ApiImageLink;
};

export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  parentId: string;
  isActive: boolean;
  createdAt: string;
  imageLink: ApiImageLink | null;
};

export type ApiProductForRelation = {
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
  media: unknown[];
  tags: { id: string; name: string }[];
  brand: ApiBrand;
  reviews: unknown[];
  attributes: unknown[];
  category: ApiCategory;
  user: { id: string; name: string; email: string };
  featureImageLink: ApiImageLink;
};

export type ApiWishlistItem = {
  id: string;
  userId: string;
  productId: string;
  isActive: boolean;
  product: ApiProductForRelation;
};

export type ApiWishlistResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  wishlists: ApiWishlistItem[];
};

export type ApiStockAndPrice = {
  id: string;
  productAttributeValueId: string;
  stock: number;
  price: string;
  offeredPrice: number | null;
  isOfferedPriceActive: boolean;
  offerStartDate: string | null;
  offerEndDate: string | null;
};

export type ApiAttributeValue = {
  id: string;
  productId: string | null;
  attributeDefinitionId: string;
  valueString: string | null;
  valueInt: number | null;
  valueDecimal: number | null;
  valueBool: boolean | null;
  valueDate: string | null;
  imageUrl: string | null;
  name: string | null;
  productAttributeId: string | null;
  attributeDefinition: {
    id: string;
    name: string;
    type: string;
    unit: string;
    categoryId: string;
  };
  stockAndPrice: ApiStockAndPrice | null;
  imageUrlLink?: ApiImageLink;
};

export type ApiCartItemAttribute = {
  id: string;
  cartItemId: string;
  productAttributeValueId: string;
  productAttributeValue: ApiAttributeValue;
};

export type ApiCartItem = {
  id: string;
  cartId: string;
  quantity: number;
  total: number;
  productId: string;
  isOfferActive: boolean;
  product: ApiProductForRelation;
  attributes: ApiCartItemAttribute[];
};

export type ApiCart = {
  id: string;
  userId: string;
  items: ApiCartItem[];
};

export type ApiCartResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  cart: ApiCart;
};
