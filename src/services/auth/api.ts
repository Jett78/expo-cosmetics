import { apiGet, apiPatch, apiPost } from '../../lib/api-client';

export type AvatarLinkMap = {
  original: string;
  '480'?: string;
  '768'?: string;
  '1024'?: string;
  '1280'?: string;
  '1600'?: string;
  '1920'?: string;
};

export type AvatarLink = AvatarLinkMap | string | null;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  avatarLink?: AvatarLink;
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

export type UserRole = {
  id: string;
  name: string;
};

export type UserDetailsResponse = {
  success: boolean;
  statusCode: string;
  message: string;
  data: {
    id: string;
    email: string;
    name: string;
    avatar?: string | null;
    avatarLink?: AvatarLink;
    role: UserRole[];
    token: string;
  };
};

export function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function resolveAvatarUrl(
  avatar?: string | null,
  avatarLink?: AvatarLink
): string | null {
  if (avatarLink && typeof avatarLink === 'object' && avatarLink.original) {
    if (isHttpUrl(avatarLink.original)) return avatarLink.original;
  }
  if (typeof avatarLink === 'string' && avatarLink && isHttpUrl(avatarLink)) {
    return avatarLink;
  }
  if (avatar && isHttpUrl(avatar)) return avatar;
  return null;
}

export type UpdateProfilePayload = {
  name: string;
  avatar?: string | null;
};

export type UpdateProfileResponse = {
  success: boolean;
  statusCode: string;
  message: string;
  data: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    avatarLink?: AvatarLink;
  };
};

export type ChangePasswordPayload = {
  id: string;
  oldPassword: string;
  newPassword: string;
};

export type ChangePasswordResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function fetchUserDetails(token: string): Promise<UserDetailsResponse> {
  return apiGet<UserDetailsResponse>('/auth/user-details', undefined, token);
}

export async function updateUserDetails(
  payload: UpdateProfilePayload,
  token: string
): Promise<UpdateProfileResponse> {
  return apiPatch<UpdateProfileResponse>('/auth/update-user-details', payload, token);
}

export async function changePassword(
  payload: ChangePasswordPayload,
  token: string
): Promise<ChangePasswordResponse> {
  return apiPatch<ChangePasswordResponse>('/auth/change-password', payload, token);
}
