import { createFetcher, BASE_URL } from './client';
import { Customer } from '../types';

const customerFetch = createFetcher(BASE_URL);

export interface PaginatedCustomers {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateCustomerDto {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export const getCustomers = (params?: { page?: number; limit?: number; search?: string }) => {
  const query = new URLSearchParams();
  if (params?.page)   query.set('page',   String(params.page));
  if (params?.limit)  query.set('limit',  String(params.limit));
  if (params?.search) query.set('search', params.search);
  const qs = query.toString();
  return customerFetch<PaginatedCustomers>(`/customers${qs ? `?${qs}` : ''}`);
};

export const getCustomerById = (id: string) =>
  customerFetch<Customer>(`/customers/${id}`);

export const getCustomerByPhone = (phone: string) =>
  customerFetch<Customer | null>(`/customers/phone/${encodeURIComponent(phone)}`);

export const createCustomer = (dto: CreateCustomerDto) =>
  customerFetch<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(dto),
  });

export const updateCustomer = (id: string, dto: UpdateCustomerDto) =>
  customerFetch<Customer>(`/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
