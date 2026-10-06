import { apiGet, apiPatch, apiPost, apiPut } from '../../lib/api-client';
import type {
  CreateShippingAddressPayload,
  CreateShippingAddressResponse,
  DeleteShippingAddressResponse,
  FetchShippingAddressesResponse,
  UpdateShippingAddressPayload,
  UpdateShippingAddressResponse,
} from '../../types/shipping-address';

export async function fetchShippingAddresses(
  token: string
): Promise<FetchShippingAddressesResponse> {
  return apiGet<FetchShippingAddressesResponse>(
    '/shipping-address/fetch-all-shipping-addresses',
    undefined,
    token
  );
}

export async function createShippingAddress(
  token: string,
  payload: CreateShippingAddressPayload
): Promise<CreateShippingAddressResponse> {
  return apiPost<CreateShippingAddressResponse>(
    '/shipping-address/create-shipping-address',
    payload,
    token
  );
}

export async function updateShippingAddress(
  token: string,
  addressId: string,
  payload: UpdateShippingAddressPayload
): Promise<UpdateShippingAddressResponse> {
  return apiPut<UpdateShippingAddressResponse>(
    `/shipping-address/update-shipping-address/${addressId}`,
    payload,
    token
  );
}

export async function deleteShippingAddress(
  token: string,
  addressId: string
): Promise<DeleteShippingAddressResponse> {
  return apiPatch<DeleteShippingAddressResponse>(
    `/shipping-address/delete-shipping-address/${addressId}`,
    {},
    token
  );
}
