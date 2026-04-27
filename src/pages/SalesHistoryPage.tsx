import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { useOrders } from '../hooks/useOrders';
import { SalesHistory } from '../components/SalesHistory';

export const SalesHistoryPage = () => {
  const searchQuery = useStore((state) => state.searchQuery);
  const [page, setPage] = useState(1);

  // reset to page 1 whenever search changes
  useEffect(() => { setPage(1); }, [searchQuery]);

  const { data, isLoading } = useOrders({ search: searchQuery || undefined, page });

  return (
    <SalesHistory
      orders={data?.data ?? []}
      meta={data?.meta}
      page={page}
      onPageChange={setPage}
      isLoading={isLoading}
    />
  );
};
