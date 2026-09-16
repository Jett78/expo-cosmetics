export type ApiReview = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type ApiReviewWithUser = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  date: string;
};

export type ReviewsApiResponse = ApiReviewWithUser[] | ApiReviewWithUser;

export type AddReviewPayload = {
  comment: string;
  rating: number;
  productId: string;
};

export type AddReviewApiResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  wishlist?: {
    isActive: boolean;
  };
};
