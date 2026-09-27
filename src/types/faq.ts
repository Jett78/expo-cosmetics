export type Faq = {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type ApiFaqListResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  faqs: Faq[];
};
