export type ApiBrandProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  featureImage: string;
  price: number;
  offeredPrice: number;
  isOfferedPriceActive: boolean;
  isActive: boolean;
  isFeatured: boolean;
  brandId: string;
  categoryId: string;
  featureImageLink: Record<string, string>;
};

export type ApiBrand = {
  id: string;
  name: string;
  image: string;
  imageLink: Record<string, string>;
  products?: ApiBrandProduct[];
};
