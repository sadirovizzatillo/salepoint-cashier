import { createFetcher, BASE_URL } from './client';

const fetch = createFetcher(BASE_URL);

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: string;
  quantity: number;
  taxRate: string;
  lineTotal: string;
}

export interface OrderCashier {
  id: string;
  name: string;
  email?: string;
}

export interface OrderCustomer {
  id: string;
  name: string;
  phone?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'paid' | 'refunded' | 'cancelled';
  subtotal: string;
  taxAmount: string;
  discountType: 'percent' | 'fixed' | null;
  discountValue: string | null;
  discountAmount: string;
  total: string;
  paidByCash: string;
  paidByCard: string;
  notPaid: string;
  cashierId: string;
  customerId: string | null;
  shiftId: string | null;
  notes: string | null;
  items: OrderItem[];
  cashier?: OrderCashier;
  customer?: OrderCustomer | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  items: { productId: string; quantity: number }[];
  paidByCash?: number;
  paidByCard?: number;
  customerId?: string;
  shiftId?: string;
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  notes?: string;
}

export interface OrdersResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const createOrder = async (payload: CreateOrderPayload, printCheck = false): Promise<Order> => {
  const res = await fetch<any>(printCheck ? '/orders?isPrintCheck=true' : '/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  // Unwrap { success, data, timestamp } envelope
  return res?.data ?? res;
};

export const reprintOrder = (id: string) =>
  fetch<void>(`/orders/${id}/print`, { method: 'POST' });

export const listOrders = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  cashierId?: string;
  from?: string;
  to?: string;
  search?: string;
}) => {
  const q = new URLSearchParams();
  if (params?.page)      q.set('page',      String(params.page));
  if (params?.limit)     q.set('limit',     String(params.limit));
  if (params?.status)    q.set('status',    params.status);
  if (params?.cashierId) q.set('cashierId', params.cashierId);
  if (params?.from)      q.set('from',      params.from);
  if (params?.to)        q.set('to',        params.to);
  if (params?.search)    q.set('search',    params.search);
  return fetch<OrdersResponse>(`/orders?${q}`);
};

export const getOrder = async (id: string): Promise<Order> => {
  const res = await fetch<any>(`/orders/${id}`);
  // Unwrap { success, data, timestamp } envelope
  return res?.data ?? res;
};

export const cancelOrder = (id: string) =>
  fetch<Order>(`/orders/${id}/cancel`, { method: 'PATCH' });

export const markOrderPaid = (id: string) =>
  fetch<Order>(`/orders/${id}/mark-paid`, { method: 'PATCH' });

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: string;
  taxRate: string;
  lineTotal: string;
}

export interface ReceiptDto {
  orderNumber: string;
  date: string;
  cashier: string;
  customer: string | null;
  items: ReceiptItem[];
  subtotal: string;
  taxAmount: string;
  discountAmount: string;
  total: string;
  paidByCash: string;
  paidByCard: string;
  notPaid: string;
  change: string;
  status: 'confirmed' | 'paid';
}

export const getOrderReceipt = (id: string) =>
  fetch<ReceiptDto>(`/orders/${id}/receipt`);
