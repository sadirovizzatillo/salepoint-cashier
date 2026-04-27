import { useQuery } from '@tanstack/react-query';
import { getProducts, getProductByBarcode } from '../api/products';

/** Load all active products once — filter locally for speed */
export const useProducts = () =>
  useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts({ active: true, limit: 100 }),
    staleTime: 0, // always fetch fresh — prices update when manager receives stock
  });

export const useProductByBarcode = (barcode: string) =>
  useQuery({
    queryKey: ['products', 'barcode', barcode],
    queryFn: () => getProductByBarcode(barcode),
    enabled: barcode.length > 3,
  });
