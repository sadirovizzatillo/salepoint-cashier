import { useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { Icon } from '@iconify/react';
import { Input } from './ui/input';

const fmt = (v: number) => v.toLocaleString('ru-RU', { minimumFractionDigits: 0 });

const ROUTE_LABELS: Record<string, string> = {
  '/':          'Kassa',
  '/history':   "Sotuvlar tarixi",
  '/customers': "Mijozlar",
  '/debts':     "Qarzdorlik ro'yxati",
};

export const Header = () => {
  const { pathname } = useLocation();
  const searchQuery      = useStore((state) => state.searchQuery);
  const setSearchQuery   = useStore((state) => state.setSearchQuery);
  const setIsSidebarOpen = useStore((state) => state.setIsSidebarOpen);
  const activeShift      = useStore((state) => state.activeShift);

  const cashBalance = activeShift
    ? Number(activeShift.openingFloat ?? 0) + Number(activeShift.cashSales ?? 0)
    : null;

  const totalSales = activeShift ? Number(activeShift.totalSales ?? 0) : null;

  return (
    <header className="h-14 px-4 flex items-center justify-between bg-white border-b border-gray-100 shrink-0 gap-4">
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icon icon="solar:hamburger-menu-bold-duotone" className="text-xl text-gray-700" />
        </button>
        <h1 className="text-sm font-bold tracking-tight text-gray-900">
          {ROUTE_LABELS[pathname] ?? 'Kassa'}
        </h1>
      </div>

      {/* Shift balance chips */}
      {cashBalance !== null && (
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5">
            <Icon icon="solar:wallet-money-bold-duotone" className="text-sm text-gray-400 shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Kassa</span>
              <span className="text-xs font-black tabular-nums text-gray-800">{fmt(cashBalance)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5">
            <Icon icon="solar:graph-up-bold-duotone" className="text-sm text-emerald-500 shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Savdo</span>
              <span className="text-xs font-black tabular-nums text-emerald-600">{fmt(totalSales!)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="relative w-44 sm:w-56 lg:w-64 xl:w-80">
        <Icon
          icon="solar:magnifer-linear"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base"
        />
        <Input
          type="text"
          placeholder="Qidirish..."
          className="w-full pl-9 pr-3 h-8 bg-gray-50 border-none rounded-lg focus-visible:ring-black font-medium text-xs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </header>
  );
};
