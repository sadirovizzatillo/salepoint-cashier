import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { useDebts } from '../hooks/useDebts';
import { Debts } from '../components/Debts';
import type { DebtsFilter } from '../api/debts';

type StatusFilter = 'all' | 'pending' | 'partial' | 'paid';

const STATUS_LABELS: Record<StatusFilter, string> = {
  all:     'Barchasi',
  pending: 'Kutilmoqda',
  partial: 'Qisman',
  paid:    "To'langan",
};

export const DebtsPage = () => {
  const shiftId = useStore((state) => state.shiftId);
  const [currentShiftOnly, setCurrentShiftOnly] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);

  // reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [currentShiftOnly, statusFilter]);

  const filters: DebtsFilter = {
    ...(currentShiftOnly && shiftId ? { shiftId } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    page,
  };

  const { data, isLoading } = useDebts(filters);

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 p-3 lg:p-4 gap-3">

      {/* Toolbar */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap">

        {/* Status pills */}
        <div className="flex gap-1.5 flex-wrap flex-1">
          {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-gray-400 hover:text-black border border-gray-100'
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Shift toggle */}
        {shiftId && (
          <button
            onClick={() => setCurrentShiftOnly((v) => !v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
              currentShiftOnly
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }`}
          >
            {currentShiftOnly ? 'Joriy smena' : 'Barcha smena'}
          </button>
        )}
      </div>

      <Debts debts={data?.data ?? []} meta={data?.meta} page={page} onPageChange={setPage} isLoading={isLoading} />
    </div>
  );
};
