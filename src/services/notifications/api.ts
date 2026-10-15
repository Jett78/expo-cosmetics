import { apiDelete, apiPost } from '../../lib/api-client';
import type { RegisterDevicePayload, RegisterDeviceResponse } from './types';

export async function registerDeviceToken(
  payload: RegisterDevicePayload,
  authToken: string
): Promise<RegisterDeviceResponse> {
  return apiPost<RegisterDeviceResponse>('/notification/register-device', payload, authToken);
}

export async function unregisterDeviceToken(
  token: string,
  authToken: string
): Promise<RegisterDeviceResponse> {
  return apiDelete<RegisterDeviceResponse>(
    `/notification/unregister-device/${encodeURIComponent(token)}`,
    authToken
  );
}
