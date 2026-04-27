import { useState } from 'react';
import { Icon } from '@iconify/react';
import { getOrOpenShift } from '../api/shifts';
import { useStore } from '../store';
import { toast } from 'sonner';

interface Props {
  onShiftOpened: () => void;
}

export const ShiftModal = ({ onShiftOpened }: Props) => {
  const setShiftId     = useStore((state) => state.setShiftId);
  const setActiveShift = useStore((state) => state.setActiveShift);
  const [float, setFloat] = useState('');
  const [notes, setNotes] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const shift = await getOrOpenShift(Number(float.replace(/\s/g, '')) || 0, notes);
      setShiftId(shift.id);
      setActiveShift(shift);
      toast.success('Smena ochildi');
      onShiftOpened();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setIsPending(false);
    }
  };

  return (
    /* Full-screen blocking overlay — no close button */
    <div className="fixed inset-0 z-[100] bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="bg-[#0A0A0A] px-6 py-6 text-center">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon icon="solar:calendar-add-bold-duotone" className="text-white text-2xl" />
          </div>
          <h2 className="text-white text-lg font-black">Smenani ochish</h2>
          <p className="text-white/40 text-xs mt-1">
            Davom etish uchun smenani oching
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleOpen} className="p-6 flex flex-col gap-4">

          {/* Opening float */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Boshlang'ich kassa (so'm)
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:border-black focus-within:ring-2 focus-within:ring-black/5 transition-all">
              <span className="pl-3 pr-2 text-sm font-bold text-gray-400 select-none shrink-0">UZS</span>
              <div className="w-px h-4 bg-gray-200 shrink-0" />
              <input
                type="text"
                inputMode="numeric"
                value={float}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  setFloat(digits ? Number(digits).toLocaleString('ru-RU') : '');
                }}
                placeholder="500 000"
                className="flex-1 h-10 px-2.5 bg-transparent text-sm font-medium outline-none placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Izoh (ixtiyoriy)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ertalabki smena..."
              className="h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all placeholder:text-gray-300"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-12 rounded-2xl bg-black text-white text-sm font-bold hover:bg-gray-800 disabled:opacity-40 transition-all flex items-center justify-center gap-2 mt-1"
          >
            {isPending
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <>
                  <Icon icon="solar:play-bold" className="text-base" />
                  Smenani boshlash
                </>
            }
          </button>
        </form>
      </div>
    </div>
  );
};
