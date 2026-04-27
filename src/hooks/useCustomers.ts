import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCustomers,
  getCustomerById,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
  CreateCustomerDto,
  UpdateCustomerDto,
} from '../api/customers';

export const useCustomers = (search?: string, page = 1, limit = 50) =>
  useQuery({
    queryKey: ['customers', { search, page, limit }],
    queryFn: () => getCustomers({ search: search || undefined, page, limit }),
    placeholderData: (prev) => prev, // keep previous data while fetching new page/search
  });

export const useCustomerById = (id: string) =>
  useQuery({
    queryKey: ['customers', id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });

export const useCustomerByPhone = (phone: string) =>
  useQuery({
    queryKey: ['customers', 'phone', phone],
    queryFn: () => getCustomerByPhone(phone),
    enabled: phone.length >= 7, // don't query until meaningful length
  });

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCustomerDto) => createCustomer(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
};

export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCustomerDto }) => updateCustomer(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
};
