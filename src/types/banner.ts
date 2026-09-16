export type ApiBanner = {
  id: string;
  title: string;
  description: string;
  image: string;
  type: 'HERO' | 'MID' | 'BOTTOM';
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  imageLink: Record<string, string>;
};

export type BannersApiResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  banners: {
    banners: ApiBanner[];
    meta: {
      currentPage: number;
      totalPages: number;
      totalBanners: number;
      limit: number;
    };
  };
};
