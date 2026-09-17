export type ApiTestimonial = {
  id: string;
  name: string;
  message: string;
  avatar: string;
  designation: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  avatarLink: Record<string, string>;
};

export type TestimonialsApiResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  testimonials: {
    testimonials: ApiTestimonial[];
    meta: {
      currentPage: number;
      totalPages: number;
      totalTestimonials: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
};
