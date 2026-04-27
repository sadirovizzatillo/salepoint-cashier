import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Debt, DebtsResponse } from '../api/debts';
import { PaginationBar } from './ui/pagination-bar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

const fmt = (v: number) =>
  v.toLocaleString('ru-RU', { minimumFractionDigits: 0 });

const STATUS_MAP: Record<Debt['status'], { label: string; className: string }> = {
  pending: { label: 'Kutilmoqda', className: 'bg-amber-50 text-amber-600 border-amber-100' },
  partial: { label: 'Qisman',     className: 'bg-blue-50 text-blue-600 border-blue-100' },
  paid:    { label: "To'langan",  className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
};

interface Props {
  debts: Debt[];
  isLoading: boolean;
  meta?: DebtsResponse['meta'];
  page?: number;
  onPageChange?: (page: number) => void;
}

export const Debts = ({ debts, isLoading, meta, page = 1, onPageChange }: Props) => {
  const navigate = useNavigate();
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: debts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 41,
    overscan: 5,
  });

  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1;

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
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
                <TableHead className="px-4 py-2.5 font-bold text-gray-400 uppercase text-[10px] tracking-wider">Mijoz</TableHead>
                <TableHead className="px-4 py-2.5 font-bold text-gray-400 uppercase text-[10px] tracking-wider hidden md:table-cell">Buyurtma</TableHead>
                <TableHead className="px-4 py-2.5 font-bold text-gray-400 uppercase text-[10px] tracking-wider">Jami qarz</TableHead>
                <TableHead className="px-4 py-2.5 font-bold text-gray-400 uppercase text-[10px] tracking-wider hidden sm:table-cell">Qoldi</TableHead>
                <TableHead className="px-4 py-2.5 font-bold text-gray-400 uppercase text-[10px] tracking-wider hidden lg:table-cell">Sana</TableHead>
                <TableHead className="px-4 py-2.5 font-bold text-gray-400 uppercase text-[10px] tracking-wider text-right">Holat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debts.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="py-16 text-center text-gray-400 text-sm font-medium">
                    Qarzlar topilmadi
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
                    const debt = debts[virtualRow.index];
                    const status = STATUS_MAP[debt.status];
                    return (
                      <TableRow
                        key={debt.id}
                        className="hover:bg-gray-50/50 transition-colors cursor-pointer border-gray-50"
                        onClick={() => navigate(`/debts/${debt.id}`)}
                      >
                        <TableCell className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-black text-white rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                              {debt.customer.name[0].toUpperCase()}
                            </div>
                            <span className="font-semibold text-xs">{debt.customer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-2.5 font-mono text-xs text-gray-400 hidden md:table-cell">
                          {debt.order?.orderNumber}
                        </TableCell>
                        <TableCell className="px-4 py-2.5 font-bold text-xs text-red-500">
                          {fmt(debt.totalDebt)} UZS
                        </TableCell>
                        <TableCell className="px-4 py-2.5 font-bold text-xs hidden sm:table-cell">
                          {fmt(debt.remainingAmount)} UZS
                        </TableCell>
                        <TableCell className="px-4 py-2.5 text-xs text-gray-400 hidden lg:table-cell">
                          {new Date(debt.createdAt).toLocaleDateString('uz-UZ')}
                        </TableCell>
                        <TableCell className="px-4 py-2.5 text-right">
                          <Badge variant="outline" className={cn('font-bold text-[10px] px-2 py-0.5', status.className)}>
                            {status.label}
                          </Badge>
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
          totalPages={totalPages}
          total={meta.total}
          limit={meta.limit}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};
