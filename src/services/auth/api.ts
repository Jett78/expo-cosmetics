import { apiPost } from '../../lib/api-client';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  success: boolean;
  statusCode: string;
  message: string;
  data: AuthUser & {
    token: string;
  };
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type GoogleAuthPayload = {
  idToken: string;
};

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/login', payload);
}

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/register', payload);
}

export async function googleAuth(payload: GoogleAuthPayload): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/google', payload);
}
