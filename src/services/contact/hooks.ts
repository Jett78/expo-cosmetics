import { useMutation } from '@tanstack/react-query';
import type { CreateContactPayload } from '../../types/contact';
import { createContact } from './api';

export function useCreateContact() {
  return useMutation({
    mutationFn: (payload: CreateContactPayload) => createContact(payload),
  });
}
