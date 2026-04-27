import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { logout } from '../api/auth';
import { getActiveShift, Shift } from '../api/shifts';
import { CloseShiftModal } from './CloseShiftModal';

const NAV_ITEMS = [
  { to: "/",          icon: "solar:shop-bold-duotone",                        label: "Kassa" },
  { to: "/history",   icon: "solar:history-bold-duotone",                     label: "Sotuvlar tarixi" },
  { to: "/customers", icon: "solar:users-group-rounded-bold-duotone",         label: "Mijozlar" },
  { to: "/debts",     icon: "solar:bill-list-bold-duotone",                   label: "Qarzdorlik ro'yxati" },
];

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar = ({ onLogout }: SidebarProps) => {
  const setIsSidebarOpen = useStore((state) => state.setIsSidebarOpen);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeShift,  setActiveShift]  = useState<Shift | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const shift = await getActiveShift();
      if (shift) {
        setActiveShift(shift);
        setShowCloseModal(true);
      } else {
        await logout();
        onLogout();
      }
    } catch {
      await logout();
      onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
    <aside className="w-72 h-full bg-[#0A0A0A] text-white flex flex-col p-4 gap-6 shadow-2xl shadow-black/40">

      {/* Header */}
      <div className="flex items-center justify-between px-1 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/10 shrink-0">
            <Icon icon="solar:lightbulb-bold-duotone" className="text-black text-lg" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight leading-none text-white">Prime</h1>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">Lighting</p>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all"
        >
          <Icon icon="solar:close-bold" className="text-lg" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 h-11 rounded-xl text-sm font-bold transition-all duration-200 group",
                isActive
                  ? "bg-white text-black shadow-xl shadow-white/5"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  icon={item.icon}
                  className={cn(
                    "text-xl transition-colors shrink-0",
                    isActive ? "text-black" : "text-gray-600 group-hover:text-white"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex flex-col gap-3 shrink-0">
        <div className="h-px bg-white/5" />
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-3 px-4 h-11 rounded-xl text-sm font-bold text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-all group w-full disabled:opacity-50"
        >
          {isLoggingOut
            ? <div className="w-5 h-5 border-2 border-gray-600/30 border-t-gray-400 rounded-full animate-spin shrink-0" />
            : <Icon icon="solar:logout-bold-duotone" className="text-xl text-gray-600 group-hover:text-red-400 shrink-0" />
          }
          Chiqish
        </button>
      </div>
    </aside>

    {activeShift && (
      <CloseShiftModal
        open={showCloseModal}
        shift={activeShift}
        onLogout={() => { setShowCloseModal(false); onLogout(); }}
        onCancel={() => { setShowCloseModal(false); setActiveShift(null); }}
      />
    )}
    </>
  );
};
