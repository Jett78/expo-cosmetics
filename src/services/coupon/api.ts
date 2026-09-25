import { apiPost } from '../../lib/api-client';
import type { ValidateCouponResponse } from '../../types/coupon';

export async function validateCoupon(token: string, code: string): Promise<ValidateCouponResponse> {
  return apiPost<ValidateCouponResponse>('/coupon/validate-coupon', { code }, token);
}
