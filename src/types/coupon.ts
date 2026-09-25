export type Coupon = {
  id: string;
  code: string;
  expiryDate: string | null;
  couponCount: number;
  discountAmount: number | null;
  discountPercent: number | null;
  type: string | null;
  isActive: boolean;
};

export type ValidateCouponResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  coupon: Coupon;
};
