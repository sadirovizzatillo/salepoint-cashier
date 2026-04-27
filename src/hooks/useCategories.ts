import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../api/categories';

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 10, // 10 min — categories rarely change
  });
