export type CreateContactPayload = {
  name: string;
  email: string;
  phone: string;
  address?: string;
  message: string;
};

export type ApiContactResponse = {
  success: boolean;
  statusCode: number;
  message: string;
};
