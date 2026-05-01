import type React from 'react';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'motion/react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
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

type View  = 'close' | 'summary';
type Field = 'float' | 'notes';

const n = (v: number | string | null | undefined) => Number(v ?? 0);
const fmt = (v: number) => v.toLocaleString('ru-RU', { minimumFractionDigits: 0 });

export const CloseShiftModal = ({ open, shift, onLogout, onCancel }: Props) => {
  const [view,        setView]        = useState<View>('close');
  const [floatInput,  setFloatInput]  = useState('');
  const [notes,       setNotes]       = useState('');
  const [closedShift, setClosedShift] = useState<Shift | null>(null);
  const [isPending,   setIsPending]   = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [activeField, setActiveField] = useState<Field | null>(null);
  const [layoutName, setLayoutName]   = useState<'default' | 'shift'>('default');
  const keyboardRef                   = useRef<any>(null);
  const keyboardWrapperRef            = useRef<HTMLDivElement>(null);

  const formatFloat = (digits: string) =>
    digits ? Number(digits).toLocaleString('ru-RU') : '';

  const handleFloatInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    setFloatInput(formatFloat(digits));
    keyboardRef.current?.setInput(digits, 'float');
  };

  const handleNotesInput = (value: string) => {
    setNotes(value);
    keyboardRef.current?.setInput(value, 'notes');
  };

  const handleKeyboardChange = (input: string) => {
    if (activeField === 'float') {
      const digits = input.replace(/\D/g, '');
      if (digits !== input) keyboardRef.current?.setInput(digits, 'float');
      setFloatInput(formatFloat(digits));
    } else if (activeField === 'notes') {
      setNotes(input);
    }
  };

  const handleKeyboardKeyPress = (button: string) => {
    if (button === '{shift}' || button === '{lock}') {
      setLayoutName((prev) => (prev === 'default' ? 'shift' : 'default'));
    } else if (button === '{clear}') {
      setFloatInput('');
      keyboardRef.current?.setInput('', 'float');
    }
  };

  const handleFocus = (field: Field) => {
    setActiveField(field);
    const seed = field === 'float' ? floatInput.replace(/\D/g, '') : notes;
    keyboardRef.current?.setInput(seed, field);
  };

  const handleBlur = (e: React.FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    if (next && keyboardWrapperRef.current?.contains(next)) return;
    setActiveField(null);
  };

  const handleClose = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const closed = await closeShift(shift.id, Number(floatInput.replace(/\s/g, '')) || 0, notes);
      setClosedShift(closed);
      setActiveField(null);
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

  const numericLayout = {
    default: [
      '1 2 3',
      '4 5 6',
      '7 8 9',
      '{clear} 0 {bksp}',
    ],
  };

  const textLayout = {
    default: [
      '1 2 3 4 5 6 7 8 9 0',
      'q w e r t y u i o p',
      'a s d f g h j k l',
      '{shift} z x c v b n m {bksp}',
      '{space} . , -',
    ],
    shift: [
      '! @ # $ % ^ & * ( )',
      'Q W E R T Y U I O P',
      'A S D F G H J K L',
      '{shift} Z X C V B N M {bksp}',
      '{space} . , -',
    ],
  };

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
              <div className={cn(
                'flex items-center border rounded-xl bg-gray-50 transition-all',
                activeField === 'float'
                  ? 'border-black ring-2 ring-black/5'
                  : 'border-gray-200 focus-within:border-black focus-within:ring-2 focus-within:ring-black/5',
              )}>
                <span className="pl-3 pr-2 text-sm font-bold text-gray-400 select-none shrink-0">UZS</span>
                <div className="w-px h-4 bg-gray-200 shrink-0" />
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={floatInput}
                  onFocus={() => handleFocus('float')}
                  onBlur={handleBlur}
                  onChange={(e) => handleFloatInput(e.target.value)}
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
                onFocus={() => handleFocus('notes')}
                onBlur={handleBlur}
                onChange={(e) => handleNotesInput(e.target.value)}
                placeholder="Kechki smena..."
                className={cn(
                  'h-10 px-3 bg-gray-50 border rounded-xl text-sm font-medium outline-none transition-all placeholder:text-gray-300',
                  activeField === 'notes'
                    ? 'border-black ring-2 ring-black/5'
                    : 'border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5',
                )}
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

      {createPortal(
        <AnimatePresence>
          {open && view === 'close' && activeField && (
            <motion.div
              ref={keyboardWrapperRef}
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 right-0 bottom-0 z-[200] bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-12px_40px_-8px_rgba(0,0,0,0.25)] px-3 sm:px-6 pt-3 pb-4 shift-keyboard"
            >
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between px-1 mb-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <Icon
                      icon={activeField === 'float' ? 'solar:hashtag-square-bold-duotone' : 'solar:keyboard-bold-duotone'}
                      className="text-sm text-gray-500"
                    />
                    {activeField === 'float' ? 'Naqd pul kiritish' : 'Matn kiritish'}
                    {activeField === 'float' && floatInput && (
                      <span className="ml-1 px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 normal-case tracking-normal tabular-nums">
                        {floatInput} so'm
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveField(null)}
                    className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label="Klaviaturani yopish"
                  >
                    <Icon icon="solar:close-square-linear" className="text-base" />
                  </button>
                </div>
                <Keyboard
                  key={activeField}
                  keyboardRef={(r) => (keyboardRef.current = r)}
                  inputName={activeField}
                  layoutName={activeField === 'float' ? 'default' : layoutName}
                  onChange={handleKeyboardChange}
                  onKeyPress={handleKeyboardKeyPress}
                  layout={activeField === 'float' ? numericLayout : textLayout}
                  display={{
                    '{bksp}':  '⌫',
                    '{shift}': '⇧',
                    '{space}': 'space',
                    '{clear}': 'C',
                  }}
                  buttonTheme={
                    activeField === 'float'
                      ? [
                          { class: 'hg-numeric-key', buttons: '0 1 2 3 4 5 6 7 8 9' },
                          { class: 'hg-action-key',  buttons: '{bksp} {clear}' },
                        ]
                      : [{ class: 'hg-action-key', buttons: '{bksp} {shift} {space}' }]
                  }
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
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
