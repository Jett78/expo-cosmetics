import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  changePassword,
  fetchUserDetails,
  googleAuth,
  loginUser,
  registerUser,
  updateUserDetails,
} from './api';
import type {
  ChangePasswordPayload,
  GoogleAuthPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  UserDetailsResponse,
} from './api';

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

export function useUserDetails(token: string | null) {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => fetchUserDetails(token as string),
    enabled: Boolean(token),
    staleTime: 2 * 60 * 1000,
    select: (response: UserDetailsResponse) => response.data,
  });
}

export function useUpdateProfileMutation(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateUserDetails(payload, token as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useChangePasswordMutation(token: string | null) {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload, token as string),
  });
}
