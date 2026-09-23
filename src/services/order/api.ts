import { apiGet, apiPost } from '../../lib/api-client';
import type {
  ApiOrderDetailResponse,
  ApiOrdersResponse,
  CreateOrderPayload,
  CreateOrderResponse,
} from '../../types/order';

export async function fetchUserOrders(token: string): Promise<ApiOrdersResponse> {
  return apiGet<ApiOrdersResponse>('/order/fetch-user-order', undefined, token);
}

export async function fetchOrderById(
  orderId: string,
  token: string
): Promise<ApiOrderDetailResponse> {
  return apiGet<ApiOrderDetailResponse>(`/order/fetch-order-by-id/${orderId}`, undefined, token);
}

export async function createOrder(
  token: string,
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> {
  return apiPost<CreateOrderResponse>('/order/create-order', payload, token);
}
