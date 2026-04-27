import { useRef, useState } from 'react';

/** +998973364647 → +998-(97)-336-46-47 */
function formatPhone(raw: string | null): string {
  if (!raw) return '—';
  const d = raw.replace(/\D/g, '');
  if (d.length < 12) return raw; // unexpected format, show as-is
  const cc = d.slice(0, 3);   // 998
  const op = d.slice(3, 5);   // 97
  const p1 = d.slice(5, 8);   // 336
  const p2 = d.slice(8, 10);  // 46
  const p3 = d.slice(10, 12); // 47
  return `+${cc}-(${op})-${p1}-${p2}-${p3}`;
}
import { Icon } from '@iconify/react';
import { Customer } from '../types';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { CustomerFormModal } from './CustomerFormModal';
import { PaginationBar } from './ui/pagination-bar';

interface CustomersProps {
  customers: Customer[];
  isLoading: boolean;
  total?: number;
  page?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
}

export const Customers = ({ customers, isLoading, total, page = 1, limit = 50, onPageChange }: CustomersProps) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState<Customer | null>(null);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit   = (c: Customer) => { setEditing(c); setModalOpen(true); };

  const rowVirtualizer = useVirtualizer({
    count: customers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 41,
    overscan: 5,
  });

  return (
    <div className="flex-1 min-h-0 p-3 lg:p-4 flex flex-col gap-3 overflow-hidden">

      {/* Toolbar */}
      <div className="flex items-center justify-between shrink-0">
        <p className="text-xs text-gray-400 font-medium">
          {isLoading ? '...' : `${total ?? customers.length} ta mijoz`}
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 h-8 px-3 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 active:scale-95 transition-all"
        >
          <Icon icon="solar:add-circle-bold" className="text-sm" />
          Yangi mijoz
        </button>
      </div>

      {/* Table */}
      <div
        ref={parentRef}
        className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-auto no-scrollbar"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full py-20">
            <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 gap-3 text-center">
            <Icon icon="solar:users-group-rounded-bold-duotone" className="text-4xl text-gray-200" />
            <p className="text-sm text-gray-400 font-medium">Mijozlar topilmadi</p>
            <button
              onClick={openCreate}
              className="text-xs font-bold text-black underline underline-offset-2"
            >
              Yangi mijoz qo'shish
            </button>
          </div>
        ) : (
          <Table containerClassName="overflow-visible">
            <TableHeader className="sticky top-0 bg-white z-20 shadow-sm">
              <TableRow className="hover:bg-transparent border-gray-50">
                <TableHead className="px-4 py-2.5 font-bold text-gray-400 uppercase text-[10px] tracking-wider hidden md:table-cell">ID</TableHead>
                <TableHead className="px-4 py-2.5 font-bold text-gray-400 uppercase text-[10px] tracking-wider">Mijoz</TableHead>
                <TableHead className="px-4 py-2.5 font-bold text-gray-400 uppercase text-[10px] tracking-wider">Telefon</TableHead>
                <TableHead className="px-4 py-2.5 w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowVirtualizer.getVirtualItems().length > 0 && rowVirtualizer.getVirtualItems()[0].start > 0 && (
                <TableRow className="hover:bg-transparent border-none">
                  <TableCell style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }} colSpan={7} />
                </TableRow>
              )}
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const cust = customers[virtualRow.index];
                return (
                  <TableRow
                    key={cust.id}
                    onClick={() => openEdit(cust)}
                    className="hover:bg-gray-50/50 transition-colors border-gray-50 cursor-pointer group"
                  >
                    <TableCell className="px-4 py-2.5 font-mono text-xs text-gray-400 hidden md:table-cell">
                      {cust.id.slice(0, 8)}…
                    </TableCell>
                    <TableCell className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-black text-white rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-xs">{cust.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-gray-500">{formatPhone(cust.phone)}</TableCell>
                    <TableCell className="px-4 py-2.5 text-right">
                      <Icon
                        icon="solar:pen-bold"
                        className="text-sm text-gray-300 group-hover:text-gray-500 transition-colors"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {rowVirtualizer.getVirtualItems().length > 0 && (rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end) > 0 && (
                <TableRow className="hover:bg-transparent border-none">
                  <TableCell style={{ height: `${rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end}px` }} colSpan={7} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {total !== undefined && onPageChange && (
        <PaginationBar
          page={page}
          totalPages={Math.ceil(total / limit)}
          total={total}
          limit={limit}
          onPageChange={onPageChange}
        />
      )}

      <CustomerFormModal
        open={modalOpen}
        customer={editing}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};
