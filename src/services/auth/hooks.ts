import { useMutation } from '@tanstack/react-query';
import { googleAuth, loginUser, registerUser } from './api';
import type { GoogleAuthPayload, LoginPayload, RegisterPayload } from './api';

export function useLoginMutation() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => loginUser(payload),
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),
  });
}

export function useGoogleAuthMutation() {
  return useMutation({
    mutationFn: (payload: GoogleAuthPayload) => googleAuth(payload),
  });
}
