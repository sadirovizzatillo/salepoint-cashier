import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { useCustomers } from '../hooks/useCustomers';
import { Customers } from '../components/Customers';

export const CustomersPage = () => {
  const searchQuery = useStore((state) => state.searchQuery);
  const [page, setPage] = useState(1);

  // reset to page 1 when search changes
  useEffect(() => { setPage(1); }, [searchQuery]);

  const { data, isLoading } = useCustomers(searchQuery, page);

  return (
    <Customers
      customers={data?.data ?? []}
      total={data?.total}
      page={page}
      limit={data?.limit ?? 50}
      onPageChange={setPage}
      isLoading={isLoading}
    />
  );
};
