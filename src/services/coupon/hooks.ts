import { useMutation } from '@tanstack/react-query';

import { validateCoupon } from './api';

export function useValidateCoupon(token: string | null) {
  return useMutation({
    mutationFn: (code: string) => validateCoupon(token as string, code),
  });
}
