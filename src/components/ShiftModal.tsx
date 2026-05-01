import type React from 'react';
import { useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'motion/react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import { getOrOpenShift } from '../api/shifts';
import { useStore } from '../store';
import { toast } from 'sonner';

interface Props {
  onShiftOpened: () => void;
}

type Field = 'float' | 'notes';

export const ShiftModal = ({ onShiftOpened }: Props) => {
  const setShiftId     = useStore((state) => state.setShiftId);
  const setActiveShift = useStore((state) => state.setActiveShift);
  const [float, setFloat] = useState('');
  const [notes, setNotes] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [activeField, setActiveField] = useState<Field | null>(null);
  const [layoutName, setLayoutName]   = useState<'default' | 'shift'>('default');
  const keyboardRef                   = useRef<any>(null);
  const keyboardWrapperRef            = useRef<HTMLDivElement>(null);

  const formatFloat = (digits: string) =>
    digits ? Number(digits).toLocaleString('ru-RU') : '';

  const handleFloatInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    const formatted = formatFloat(digits);
    setFloat(formatted);
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
      setFloat(formatFloat(digits));
    } else if (activeField === 'notes') {
      setNotes(input);
    }
  };

  const handleKeyboardKeyPress = (button: string) => {
    if (button === '{shift}' || button === '{lock}') {
      setLayoutName((prev) => (prev === 'default' ? 'shift' : 'default'));
    } else if (button === '{clear}') {
      setFloat('');
      keyboardRef.current?.setInput('', 'float');
    }
  };

  const handleFocus = (field: Field) => {
    setActiveField(field);
    const seed = field === 'float' ? float.replace(/\D/g, '') : notes;
    keyboardRef.current?.setInput(seed, field);
  };

  const handleBlur = (e: React.FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    if (next && keyboardWrapperRef.current?.contains(next)) return;
    setActiveField(null);
  };

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
            <div className={[
              'flex items-center border rounded-xl bg-gray-50 transition-all',
              activeField === 'float'
                ? 'border-black ring-2 ring-black/5'
                : 'border-gray-200 focus-within:border-black focus-within:ring-2 focus-within:ring-black/5',
            ].join(' ')}>
              <span className="pl-3 pr-2 text-sm font-bold text-gray-400 select-none shrink-0">UZS</span>
              <div className="w-px h-4 bg-gray-200 shrink-0" />
              <input
                type="text"
                inputMode="numeric"
                value={float}
                onFocus={() => handleFocus('float')}
                onBlur={handleBlur}
                onChange={(e) => handleFloatInput(e.target.value)}
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
              onFocus={() => handleFocus('notes')}
              onBlur={handleBlur}
              onChange={(e) => handleNotesInput(e.target.value)}
              placeholder="Ertalabki smena..."
              className={[
                'h-10 px-3 bg-gray-50 border rounded-xl text-sm font-medium outline-none transition-all placeholder:text-gray-300',
                activeField === 'notes'
                  ? 'border-black ring-2 ring-black/5'
                  : 'border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5',
              ].join(' ')}
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

      <AnimatePresence>
        {activeField && (
          <motion.div
            ref={keyboardWrapperRef}
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 right-0 bottom-0 z-[110] bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-12px_40px_-8px_rgba(0,0,0,0.25)] px-3 sm:px-6 pt-3 pb-4 shift-keyboard"
          >
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between px-1 mb-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <Icon
                    icon={activeField === 'float' ? 'solar:hashtag-square-bold-duotone' : 'solar:keyboard-bold-duotone'}
                    className="text-sm text-gray-500"
                  />
                  {activeField === 'float' ? 'Raqam kiritish' : 'Matn kiritish'}
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
                  '{bksp}': '⌫',
                  '{shift}': '⇧',
                  '{space}': 'space',
                  '{clear}': 'C',
                }}
                buttonTheme={
                  activeField === 'float'
                    ? [
                        { class: 'hg-numeric-key', buttons: '0 1 2 3 4 5 6 7 8 9' },
                        { class: 'hg-action-key', buttons: '{bksp} {clear}' },
                      ]
                    : [{ class: 'hg-action-key', buttons: '{bksp} {shift} {space}' }]
                }
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
