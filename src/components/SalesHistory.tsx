import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Order, OrdersResponse } from '../api/orders';
import { cn } from '../lib/utils';
import { PaginationBar } from './ui/pagination-bar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const fmt = (v: string | number) =>
  Number(v).toLocaleString('ru-RU', { minimumFractionDigits: 0 });

const STATUS_MAP: Record<Order['status'], { label: string; className: string }> = {
  paid:       { label: "To'langan",   className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  confirmed:  { label: 'Tasdiqlangan', className: 'bg-blue-50 text-blue-600 border-blue-100' },
  pending:    { label: 'Kutilmoqda',   className: 'bg-amber-50 text-amber-600 border-amber-100' },
  refunded:   { label: 'Qaytarildi',   className: 'bg-purple-50 text-purple-600 border-purple-100' },
  cancelled:  { label: 'Bekor',        className: 'bg-red-50 text-red-500 border-red-100' },
};

function paymentMethod(order: Order) {
  const cash = Number(order.paidByCash);
  const card = Number(order.paidByCard);
  if (cash > 0 && card > 0) return 'Aralash';
  if (card > 0) return 'Karta';
  if (cash > 0) return 'Naqd';
  return 'Nasiya';
}

interface Props {
  orders: Order[];
  isLoading: boolean;
  meta?: OrdersResponse['meta'];
  page?: number;
  onPageChange?: (page: number) => void;
}

export const SalesHistory = ({ orders, isLoading, meta, page = 1, onPageChange }: Props) => {
  const navigate = useNavigate();
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 41,
    overscan: 5,
  });

  return (
    <div className="flex-1 min-h-0 p-3 lg:p-4 flex flex-col gap-3 overflow-hidden">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
        </div>
      ) : (
        <div
          ref={parentRef}
          className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto no-scrollbar"
        >
          <Table containerClassName="overflow-visible">
            <TableHeader className="sticky top-0 bg-white z-20 shadow-sm">
              <TableRow className="hover:bg-transparent border-gray-50">
                <TableHead className="px-4 py-2.5 font-bold text-gray-400 uppercase text-[10px] tracking-wider">Raqam</TableHead>
                <TableHead className="px-4 py-2.5 font-bold text-gray-400 uppercase text-[10px] tracking-wider hidden md:table-cell">Sana</TableHead>
                <TableHead className="px-4 py-2.5 font-bold text-gray-400 uppercase text-[10px] tracking-wider">Summa</TableHead>
                <TableHead className="px-4 py-2.5 font-bold text-gray-400 uppercase text-[10px] tracking-wider hidden lg:table-cell">To'lov</TableHead>
                <TableHead className="px-4 py-2.5 font-bold text-gray-400 uppercase text-[10px] tracking-wider">Holat</TableHead>
                <TableHead className="px-4 py-2.5 font-bold text-gray-400 uppercase text-[10px] tracking-wider text-right">Amal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="py-16 text-center text-gray-400 text-sm font-medium">
                    Buyurtmalar topilmadi
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {rowVirtualizer.getVirtualItems().length > 0 && rowVirtualizer.getVirtualItems()[0].start > 0 && (
                    <TableRow className="hover:bg-transparent border-none">
                      <TableCell style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }} colSpan={6} />
                    </TableRow>
                  )}
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const order = orders[virtualRow.index];
                    const status = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
                    return (
                      <TableRow
                        key={order.id}
                        className="hover:bg-gray-50/50 transition-colors cursor-pointer border-gray-50"
                        onClick={() => navigate(`/history/${order.id}`)}
                      >
                        <TableCell className="px-4 py-2.5 font-mono text-xs text-gray-500">{order.orderNumber}</TableCell>
                        <TableCell className="px-4 py-2.5 text-xs text-gray-500 hidden md:table-cell">
                          {new Date(order.createdAt).toLocaleString('uz-UZ')}
                        </TableCell>
                        <TableCell className="px-4 py-2.5 font-bold text-xs">{fmt(order.total)} UZS</TableCell>
                        <TableCell className="px-4 py-2.5 hidden lg:table-cell">
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none font-bold text-[10px] px-2 py-0.5">
                            {paymentMethod(order)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-2.5">
                          <Badge variant="outline" className={cn('font-bold text-[10px] px-2 py-0.5', status.className)}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-2.5 text-right">
                          <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg text-gray-300 hover:text-black">
                            <Icon icon="solar:menu-dots-bold" className="text-sm" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {rowVirtualizer.getVirtualItems().length > 0 && (rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end) > 0 && (
                    <TableRow className="hover:bg-transparent border-none">
                      <TableCell style={{ height: `${rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end}px` }} colSpan={6} />
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {meta && onPageChange && (
        <PaginationBar
          page={page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};
