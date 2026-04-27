import { useQuery } from '@tanstack/react-query';
import { listDebts, getDebt, DebtsFilter } from '../api/debts';

export const useDebts = (filters: DebtsFilter = {}) =>
  useQuery({
    queryKey: ['debts', filters],
    queryFn: () => listDebts({ limit: 50, ...filters }),
    staleTime: 0,
  });

export const useDebt = (id: string | null) =>
  useQuery({
    queryKey: ['debts', id],
    queryFn: () => getDebt(id!),
    enabled: id !== null,
    staleTime: 0,
  });
