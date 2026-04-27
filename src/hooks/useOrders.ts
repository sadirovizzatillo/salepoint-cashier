import { useQuery } from '@tanstack/react-query';
import { listOrders, getOrder } from '../api/orders';

export interface OrdersFilter {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  from?: string;
  to?: string;
}

export const useOrders = (filters: OrdersFilter = {}) =>
  useQuery({
    queryKey: ['orders', filters],
    queryFn: () => listOrders({ limit: 5, ...filters }),
    staleTime: 1000 * 30, // 30s — orders change frequently
  });

export const useOrder = (id: string | null) =>
  useQuery({
    queryKey: ['orders', 'detail', id],
    queryFn: () => getOrder(id!),
    enabled: id !== null,
    staleTime: 1000 * 30,
  });
