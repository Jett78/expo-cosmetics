export type ApiBlogCategory = {
  id: string;
  title: string;
  slug: string;
  isActive: boolean;
};

export type ApiBlog = {
  id: string;
  title: string;
  slug: string;
  image: string;
  description: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  category: ApiBlogCategory;
  imageLink: Record<string, string>;
};

export type BlogSeoMeta = {
  id: string;
  model: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  metaRobots: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BlogBySlugApiResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  blog: ApiBlog & {
    seoMeta: BlogSeoMeta | null;
  };
  imageLink: Record<string, string>;
};

export type BlogsApiResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    blogs: ApiBlog[];
    meta: {
      currentPage: number;
      totalPages: number;
      totalBlogs: number;
      limit: number;
    };
  };
};
