import { Icon } from '@iconify/react';
import { cn } from '../../lib/utils';

interface Props {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const PaginationBar = ({ page, totalPages, total, limit, onPageChange, className }: Props) => {
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  return (
    <div className={cn('flex items-center justify-between shrink-0 px-1', className)}>
      <p className="text-xs text-gray-400 font-medium">
        {from}–{to} / {total}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-100 bg-white text-gray-400 hover:text-black hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Icon icon="solar:arrow-left-linear" className="text-sm" />
        </button>

        <div className="flex items-center gap-0.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) =>
              item === 'ellipsis' ? (
                <span key={`e${idx}`} className="w-7 h-7 flex items-center justify-center text-xs text-gray-300">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => onPageChange(item)}
                  className={cn(
                    'w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all',
                    item === page
                      ? 'bg-black text-white'
                      : 'text-gray-400 hover:text-black hover:bg-gray-50',
                  )}
                >
                  {item}
                </button>
              )
            )}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-100 bg-white text-gray-400 hover:text-black hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Icon icon="solar:arrow-right-linear" className="text-sm" />
        </button>
      </div>
    </div>
  );
};
