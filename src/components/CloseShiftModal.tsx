import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Shift, closeShift } from '../api/shifts';
import { logout } from '../api/auth';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { cn } from '../lib/utils';

interface Props {
  open: boolean;
  shift: Shift;
  onLogout: () => void;
  onCancel: () => void;
}

type View = 'close' | 'summary';

const n = (v: number | string | null | undefined) => Number(v ?? 0);
const fmt = (v: number) => v.toLocaleString('ru-RU', { minimumFractionDigits: 0 });

export const CloseShiftModal = ({ open, shift, onLogout, onCancel }: Props) => {
  const [view,        setView]        = useState<View>('close');
  const [floatInput,  setFloatInput]  = useState('');
  const [notes,       setNotes]       = useState('');
  const [closedShift, setClosedShift] = useState<Shift | null>(null);
  const [isPending,   setIsPending]   = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleClose = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const closed = await closeShift(shift.id, Number(floatInput.replace(/\s/g, '')) || 0, notes);
      setClosedShift(closed);
      setView('summary');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setIsPending(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      onLogout();
    }
  };

  const s = closedShift ?? shift;
  const opening  = n(s.openingFloat);
  const cash     = n(s.cashSales);
  const card     = n(s.cardSales);
  const total    = n(s.totalSales);
  const closing  = n(s.closingFloat);
  const expected = opening + cash;
  const diff     = closing - expected;
  const hasDiff  = Math.abs(diff) > 0.01;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && view === 'close' && onCancel()}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[380px] border-none ring-0 shadow-2xl p-0 gap-0 overflow-hidden rounded-2xl"
      >
        {/* Header */}
        <div className="bg-[#0A0A0A] px-5 py-4 flex items-center justify-between">
          <DialogHeader>
            <DialogTitle className="text-white text-sm font-bold">
              {view === 'close' ? 'Smenani yopish' : 'Smena hisoboti'}
            </DialogTitle>
          </DialogHeader>
          {view === 'close' && (
            <button
              onClick={onCancel}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <Icon icon="solar:close-bold" className="text-sm" />
            </button>
          )}
        </div>

        {/* ── CLOSE FORM ── */}
        {view === 'close' && (
          <form onSubmit={handleClose} className="p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Kassadagi naqd pul (so'm)
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:border-black focus-within:ring-2 focus-within:ring-black/5 transition-all">
                <span className="pl-3 pr-2 text-sm font-bold text-gray-400 select-none shrink-0">UZS</span>
                <div className="w-px h-4 bg-gray-200 shrink-0" />
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={floatInput}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setFloatInput(digits ? Number(digits).toLocaleString('ru-RU') : '');
                  }}
                  placeholder="0"
                  className="flex-1 h-10 px-2.5 bg-transparent text-sm font-medium outline-none placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Izoh (ixtiyoriy)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Kechki smena..."
                className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all placeholder:text-gray-300"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onCancel}
                className="flex-1 h-10 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
                Bekor qilish
              </button>
              <button type="submit" disabled={isPending}
                className="flex-1 h-10 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                {isPending
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : 'Yopish'}
              </button>
            </div>
          </form>
        )}

        {/* ── SUMMARY ── */}
        {view === 'summary' && (
          <div className="p-5 flex flex-col gap-4">

            {/* Cash reconciliation */}
            <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Kassa hisobi</p>
              <Row label="Boshlang'ich kassa" value={fmt(opening)} />
              <Row label="Naqd savdo" value={`+${fmt(cash)}`} valueClass="text-emerald-600" />
              <div className="h-px bg-gray-200" />
              <Row label="Kutilgan kassa" value={fmt(expected)} bold />
              <Row label="Haqiqiy kassa" value={fmt(closing)} bold />
              <div className={cn(
                'flex items-center justify-between rounded-xl px-3 py-2 mt-1',
                hasDiff ? 'bg-red-50' : 'bg-emerald-50'
              )}>
                <span className={cn('text-xs font-bold', hasDiff ? 'text-red-600' : 'text-emerald-600')}>
                  Farq {hasDiff ? '⚠️' : '✅'}
                </span>
                <span className={cn('text-sm font-black tabular-nums', hasDiff ? 'text-red-600' : 'text-emerald-600')}>
                  {diff > 0 ? '+' : ''}{fmt(diff)}
                </span>
              </div>
            </div>

            {/* Sales summary */}
            <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Savdo xulosasi</p>
              <Row label="Karta savdo"    value={fmt(card)} />
              <Row label="Jami savdo"     value={fmt(total)} bold />
              <Row label="Buyurtmalar"    value={String(s.orderCount)} />
              <div className="h-px bg-gray-200" />
              <Row label="Ochilgan"  value={new Date(s.openedAt).toLocaleString('uz-UZ')} />
              {s.closedAt && <Row label="Yopilgan" value={new Date(s.closedAt).toLocaleString('uz-UZ')} />}
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full h-11 rounded-2xl bg-black text-white text-sm font-bold hover:bg-gray-800 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {isLoggingOut
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Icon icon="solar:logout-bold" className="text-base" />Tizimdan chiqish</>}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Row = ({ label, value, bold, valueClass }: {
  label: string;
  value: string;
  bold?: boolean;
  valueClass?: string;
}) => (
  <div className="flex items-center justify-between">
    <span className={cn('text-xs text-gray-500', bold && 'font-bold text-gray-800')}>{label}</span>
    <span className={cn('text-xs font-bold tabular-nums text-gray-800', bold && 'text-sm', valueClass)}>{value}</span>
  </div>
);
