import { apiPost } from '../../lib/api-client';
import type { ApiContactResponse, CreateContactPayload } from '../../types/contact';

export async function createContact(payload: CreateContactPayload): Promise<ApiContactResponse> {
  return apiPost<ApiContactResponse>('/contact/add-contact', payload);
}
